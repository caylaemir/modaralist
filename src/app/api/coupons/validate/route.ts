import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupon";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { hasValidDiscount } from "@/lib/utils";

const schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().min(0),
  lines: z
    .array(
      z.object({
        variantId: z.string(),
        quantity: z.number().int().min(1),
      })
    )
    .optional(),
});

/**
 * POST /api/coupons/validate
 * Sepet drawer ve checkout'tan cagrilir. Kupon kodunu dogrular,
 * indirim tutarini doner. ASIL UYGULAMA checkout'ta yapilir
 * (server-side recompute, client-supplied amount asla guvenilmez).
 *
 * Rate limit: 20 deneme/IP/saat (brute-force koruma — kullanici deneme
 * yanilma ile gecerli kod bulamasin).
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(`coupon:${getClientIp(req)}`, 20, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { ok: false, error: "Çok fazla deneme. Sonra tekrar dene." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Geçersiz istek" },
      { status: 400 }
    );
  }

  const session = await auth();
  let discountableSubtotal = parsed.data.subtotal;

  if (parsed.data.lines?.length) {
    const qtyByVariantId = new Map<string, number>();
    for (const line of parsed.data.lines) {
      qtyByVariantId.set(
        line.variantId,
        (qtyByVariantId.get(line.variantId) ?? 0) + line.quantity
      );
    }
    const variants = await db.productVariant.findMany({
      where: { id: { in: Array.from(qtyByVariantId.keys()) }, isActive: true },
      include: {
        product: { select: { basePrice: true, discountPrice: true } },
      },
    });
    discountableSubtotal = variants.reduce((sum, variant) => {
      const basePrice = Number(variant.product.basePrice);
      const discountPrice =
        variant.product.discountPrice != null
          ? Number(variant.product.discountPrice)
          : null;
      if (hasValidDiscount(basePrice, discountPrice)) return sum;
      return sum + basePrice * (qtyByVariantId.get(variant.id) ?? 0);
    }, 0);
  }

  const result = await validateCoupon({
    code: parsed.data.code,
    subtotal: parsed.data.subtotal,
    discountableSubtotal,
    userId: session?.user?.id ?? null,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
