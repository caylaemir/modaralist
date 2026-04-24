import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  email: z.string().email(),
  collectionSlug: z.string().optional(),
  productSlug: z.string().optional(),
  locale: z.enum(["tr", "en"]).default("tr"),
});

export async function POST(req: NextRequest) {
  const rl = rateLimit(`notify:${getClientIp(req)}`, 10, 15 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çok fazla istek. Birkaç dakika sonra dene." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const { email, collectionSlug, productSlug, locale } = parsed.data;

  if (!collectionSlug && !productSlug) {
    return NextResponse.json(
      { error: "Hangi drop / ürün bilgisini ver." },
      { status: 400 }
    );
  }

  let collectionId: string | null = null;
  let productId: string | null = null;

  if (collectionSlug) {
    const c = await db.collection.findUnique({
      where: { slug: collectionSlug },
      select: { id: true },
    });
    if (!c) {
      return NextResponse.json({ error: "Drop bulunamadı." }, { status: 404 });
    }
    collectionId = c.id;
  }

  if (productSlug) {
    const p = await db.product.findUnique({
      where: { slug: productSlug },
      select: { id: true },
    });
    if (!p) {
      return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
    }
    productId = p.id;
  }

  // Aynı email + (collection ya da product) için duplicate olmasın diye kontrol
  const existing = await db.collectionNotify.findFirst({
    where: {
      email: email.toLowerCase(),
      collectionId,
      productId,
    },
  });
  if (existing) {
    return NextResponse.json({ ok: true, alreadySubscribed: true });
  }

  await db.collectionNotify.create({
    data: {
      email: email.toLowerCase(),
      collectionId,
      productId,
      locale,
    },
  });

  return NextResponse.json({ ok: true });
}
