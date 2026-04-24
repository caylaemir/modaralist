import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import { db } from "@/lib/db";
import { sendPasswordResetEmail } from "@/lib/email";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({ email: z.string().email() });

const TOKEN_TTL_MIN = 30;

export async function POST(req: NextRequest) {
  // 15 dk'da en fazla 5 istek/IP — brute force engellemek icin
  const rl = rateLimit(`forgot:${getClientIp(req)}`, 5, 15 * 60_000);
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
  const { email } = parsed.data;

  const user = await db.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true },
  });

  if (user) {
    const rawToken = crypto.randomBytes(32).toString("hex");
    const tokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expires = new Date(Date.now() + TOKEN_TTL_MIN * 60_000);

    await db.verificationToken.deleteMany({ where: { identifier: user.email } });
    await db.verificationToken.create({
      data: { identifier: user.email, token: tokenHash, expires },
    });

    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const resetUrl = `${base}/reset-password?token=${rawToken}&email=${encodeURIComponent(user.email)}`;

    await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      resetUrl,
      ttlMinutes: TOKEN_TTL_MIN,
    });
  }

  // Her zaman 200 — email enumeration açığını kapatmak için.
  return NextResponse.json({ ok: true });
}
