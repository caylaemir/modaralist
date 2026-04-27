import "server-only";
import { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import type { SettingsMap } from "@/lib/settings";

export type LoyaltyConfig = {
  enabled: boolean;
  earnPerTL: number;
  redeemValue: number; // TL per puan
  minRedeem: number;
};

export function parseLoyaltyConfig(s: SettingsMap): LoyaltyConfig {
  return {
    enabled: s["loyalty.enabled"] === "true",
    earnPerTL: Math.max(0, Number(s["loyalty.earnPerTL"]) || 1),
    redeemValue: Math.max(0, Number(s["loyalty.redeemValue"]) || 0.05),
    minRedeem: Math.max(0, Math.floor(Number(s["loyalty.minRedeem"]) || 100)),
  };
}

/**
 * Sipariş başarılı olduğunda kullaniciya puan ekler.
 * - Order.subtotal x earnPerTL = kazanilan puan
 * - User.loyaltyPoints incrementlenir
 * - LoyaltyTransaction log yazilir (audit trail)
 *
 * Cagri yeri: payment callback'i 'CAPTURED' olduktan sonra.
 * Idempotent: ayni orderId icin EARN type entry varsa skip et.
 */
export async function awardOrderPoints(
  orderId: string,
  config: LoyaltyConfig
): Promise<{ awarded: number } | null> {
  if (!config.enabled) return null;

  const order = await db.order.findUnique({
    where: { id: orderId },
    select: { id: true, userId: true, subtotal: true, status: true },
  });
  if (!order || !order.userId) return null;
  if (order.status === "CANCELLED" || order.status === "REFUNDED") return null;

  const subtotalNum = Number(order.subtotal);
  const points = Math.floor(subtotalNum * config.earnPerTL);
  if (points <= 0) return null;

  // Idempotency: DB unique constraint @@unique([orderId, type]) sayesinde
  // concurrent callback iki kez ayni EARN insertinde P2002 hatasi alir.
  // findFirst + create race condition'a aciktiran old check'i replace eder.
  try {
    await db.$transaction([
      db.user.update({
        where: { id: order.userId },
        data: { loyaltyPoints: { increment: points } },
      }),
      db.loyaltyTransaction.create({
        data: {
          userId: order.userId,
          orderId,
          type: "EARN",
          points,
          reason: `Sipariş ${orderId.slice(0, 8)}`,
        },
      }),
    ]);
  } catch (err) {
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      // Bu order icin EARN zaten var — idempotent, sessizce skip
      return null;
    }
    throw err;
  }

  return { awarded: points };
}

/**
 * Checkout'ta puan kullanma — User.loyaltyPoints'ten dusup ledger'a yazar.
 * - Min puan kontrolu
 * - User'da yeterli puan olmali
 * - DB transaction ile atomic
 */
export async function redeemPoints(
  userId: string,
  pointsToRedeem: number,
  orderId: string,
  config: LoyaltyConfig
): Promise<{ discountTL: number } | null> {
  if (!config.enabled) return null;
  if (pointsToRedeem < config.minRedeem) return null;

  const discountTL = Math.round(pointsToRedeem * config.redeemValue * 100) / 100;

  // ATOMIC decrement: updateMany WHERE loyaltyPoints >= N — yetersiz bakiye
  // varsa updated=0 doner, transaction rollback yapariz. Concurrent iki
  // checkout coklu redeem yapsa ikincisi WHERE clause'undan dolayi gecmez.
  // unique([orderId, type]) ayrica ayni order'a iki redeem yazilmasini engeller.
  try {
    await db.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: userId, loyaltyPoints: { gte: pointsToRedeem } },
        data: { loyaltyPoints: { decrement: pointsToRedeem } },
      });
      if (updated.count === 0) {
        throw new Error("INSUFFICIENT_BALANCE");
      }
      await tx.loyaltyTransaction.create({
        data: {
          userId,
          orderId,
          type: "REDEEM",
          points: -pointsToRedeem,
          reason: `Sipariş ${orderId.slice(0, 8)} indirim`,
        },
      });
    });
  } catch (err) {
    if (err instanceof Error && err.message === "INSUFFICIENT_BALANCE") {
      return null;
    }
    if (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === "P2002"
    ) {
      // Bu order icin REDEEM zaten var — idempotent skip
      return null;
    }
    throw err;
  }

  return { discountTL };
}
