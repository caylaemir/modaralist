import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  token: z.string().min(32),
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export async function POST(req: NextRequest) {
  // 15 dk'da en fazla 10 reset denemesi/IP
  const rl = rateLimit(`reset:${getClientIp(req)}`, 10, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çok fazla istek. Birkaç dakika sonra dene." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz istek." },
      { status: 400 }
    );
  }
  const { token, email, password } = parsed.data;

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const record = await db.verificationToken.findUnique({
    where: { identifier_token: { identifier: email, token: tokenHash } },
  });

  if (!record || record.expires < new Date()) {
    return NextResponse.json(
      { error: "Bağlantının süresi dolmuş. Yenisini talep et." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await db.$transaction([
    db.user.update({
      where: { email },
      data: { passwordHash },
    }),
    db.verificationToken.deleteMany({ where: { identifier: email } }),
  ]);

  return NextResponse.json({ ok: true });
}
