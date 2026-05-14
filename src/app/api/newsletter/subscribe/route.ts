import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import {
  NEWSLETTER_DISCOUNT_CODE,
  ensureNewsletterDiscountCoupon,
  sendNewsletterDiscountEmail,
} from "@/lib/newsletter-discount";

const schema = z.object({
  email: z.string().email(),
  source: z.string().max(40).optional(),
  locale: z.enum(["tr", "en"]).default("tr"),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(`newsletter:${getClientIp(req)}`, 10, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çok fazla istek. Birkaç dakika sonra dene." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz e-posta." }, { status: 400 });
  }
  const { source, locale } = parsed.data;
  const email = parsed.data.email.toLowerCase();
  let emailSent = false;

  try {
    await db.newsletterSubscriber.upsert({
      where: { email },
      create: {
        email,
        source: source ?? null,
        locale,
        unsubscribedAt: null,
      },
      update: {
        unsubscribedAt: null,
        source: source ?? undefined,
        locale,
      },
    });
    await ensureNewsletterDiscountCoupon();
    const result = await sendNewsletterDiscountEmail({ to: email, locale });
    emailSent = Boolean(result.id);
  } catch (err) {
    console.error("[newsletter] subscribe failed", err);
  }

  // Her zaman 200 — abonelik durumu enumeration korumasi
  return NextResponse.json({
    ok: true,
    discountCode: NEWSLETTER_DISCOUNT_CODE,
    emailSent,
  });
}
