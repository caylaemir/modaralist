import "server-only";
import type { PrismaClient } from "@prisma/client";
import { db } from "@/lib/db";

/**
 * Sipariş PAID'e ulaşmadan iptal/fail olursa düşülen stoğu geri verir.
 * Idempotent: order.status zaten CANCELLED ise tekrar artırmaz (unsafe).
 * Bu yüzden çağıran taraf, çağrıdan ÖNCE order.status'u kontrol etmeli.
 */
export async function restoreStockForOrder(
  orderId: string,
  client: PrismaClient | Parameters<Parameters<typeof db.$transaction>[0]>[0] = db
): Promise<void> {
  const items = await client.orderItem.findMany({
    where: { orderId },
    select: { variantId: true, quantity: true },
  });
  for (const item of items) {
    await client.productVariant.update({
      where: { id: item.variantId },
      data: { stock: { increment: item.quantity } },
    });
  }
}
