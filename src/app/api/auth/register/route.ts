import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { claimGuestOrdersForUser, normalizeOrderEmail } from "@/lib/order-claim";

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
});

export async function POST(req: NextRequest) {
  // 1 saatte en fazla 10 kayıt/IP — sahte hesap üretimini engelle
  const rl = rateLimit(`register:${getClientIp(req)}`, 10, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çok fazla istek. Birazdan tekrar dene." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri." },
      { status: 400 }
    );
  }
  const { name, password } = parsed.data;
  const email = normalizeOrderEmail(parsed.data.email);

  const existing = await db.user.findFirst({
    where: { email: { equals: email, mode: "insensitive" } },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Bu e-posta zaten kayıtlı." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email, passwordHash, role: "CUSTOMER" },
    select: { id: true, email: true, name: true },
  });

  let claimedOrders = 0;
  try {
    const claimed = await claimGuestOrdersForUser({
      userId: user.id,
      email: user.email,
    });
    claimedOrders = claimed.count;
  } catch (err) {
    console.error("[register] guest order claim failed", err);
  }

  return NextResponse.json({ ok: true, user, claimedOrders });
}
