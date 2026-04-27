import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/lib/coupon";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  code: z.string().min(1).max(40),
  subtotal: z.number().min(0),
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
  const result = await validateCoupon({
    code: parsed.data.code,
    subtotal: parsed.data.subtotal,
    userId: session?.user?.id ?? null,
  });

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
