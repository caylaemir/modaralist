import "server-only";
import { db } from "@/lib/db";
import type { Coupon } from "@prisma/client";

export type CouponValidationResult =
  | {
      ok: true;
      coupon: {
        id: string;
        code: string;
        type: "PERCENT" | "FIXED" | "FREE_SHIPPING";
        value: number;
      };
      discountAmount: number; // TL — subtotal'dan dusulecek
      freeShipping: boolean;
    }
  | { ok: false; error: string };

/**
 * Kupon kodunu dogrular ve uygulanacak indirim tutarini doner.
 *
 * Kontroller:
 *  - Kod var mi, isActive mi
 *  - Tarih araliginda mi (startsAt / endsAt)
 *  - minSubtotal saglandi mi
 *  - maxUses asilmamis mi (toplam kullanim)
 *  - perUserLimit asilmamis mi (eger userId verildiyse)
 *
 * Hesaplama:
 *  - PERCENT:  subtotal * value / 100
 *  - FIXED:    value (subtotal'i asmaz)
 *  - FREE_SHIPPING: discountAmount=0, freeShipping=true
 */
export async function validateCoupon(input: {
  code: string;
  subtotal: number;
  userId?: string | null;
}): Promise<CouponValidationResult> {
  const code = input.code.trim().toUpperCase();
  if (!code) return { ok: false, error: "Kod giriniz" };

  const coupon = await db.coupon.findUnique({
    where: { code },
    include: { _count: { select: { usages: true } } },
  });
  if (!coupon) return { ok: false, error: "Geçersiz kod" };
  if (!coupon.isActive) return { ok: false, error: "Bu kod pasif" };

  const now = new Date();
  if (coupon.startsAt && now < coupon.startsAt) {
    return { ok: false, error: "Bu kod henüz aktif değil" };
  }
  if (coupon.endsAt && now > coupon.endsAt) {
    return { ok: false, error: "Bu kodun süresi dolmuş" };
  }

  if (coupon.minSubtotal && input.subtotal < Number(coupon.minSubtotal)) {
    return {
      ok: false,
      error: `Min sepet tutarı ₺${Number(coupon.minSubtotal).toFixed(2)} olmalı`,
    };
  }

  if (coupon.maxUses && coupon._count.usages >= coupon.maxUses) {
    return { ok: false, error: "Bu kodun kullanım hakkı doldu" };
  }

  if (coupon.perUserLimit && input.userId) {
    const userUses = await db.couponUsage.count({
      where: { couponId: coupon.id, userId: input.userId },
    });
    if (userUses >= coupon.perUserLimit) {
      return {
        ok: false,
        error: `Bu kodu maksimum ${coupon.perUserLimit} kez kullanabilirsin`,
      };
    }
  }

  // Indirim hesapla
  const value = Number(coupon.value);
  let discountAmount = 0;
  let freeShipping = false;

  switch (coupon.type) {
    case "PERCENT":
      discountAmount = Math.round((input.subtotal * value) / 100 * 100) / 100;
      // Subtotal'i asamaz
      if (discountAmount > input.subtotal) discountAmount = input.subtotal;
      break;
    case "FIXED":
      discountAmount = Math.min(value, input.subtotal);
      break;
    case "FREE_SHIPPING":
      discountAmount = 0;
      freeShipping = true;
      break;
  }

  return {
    ok: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      type: coupon.type,
      value,
    },
    discountAmount,
    freeShipping,
  };
}

/**
 * CouponUsage kayitlari (audit trail). Order create sonrasi cagrilir.
 * Idempotent: ayni orderId icin ikinci kez yazilirsa upsert ile tek kayit.
 */
export async function recordCouponUsage(args: {
  couponId: string;
  orderId: string;
  userId?: string | null;
  discountAmount: number;
}) {
  await db.couponUsage.upsert({
    where: { orderId: args.orderId },
    create: {
      couponId: args.couponId,
      orderId: args.orderId,
      userId: args.userId ?? null,
      discountAmount: args.discountAmount,
    },
    update: {
      // Idempotency — order zaten kayitliysa hicbir sey degistirmez
      discountAmount: args.discountAmount,
    },
  });
}

export type StoredCoupon = Coupon;
