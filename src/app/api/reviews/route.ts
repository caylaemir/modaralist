import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const schema = z.object({
  productSlug: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().max(2000).optional(),
});

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Yorum bırakmak için giriş yapmalısın." },
      { status: 401 }
    );
  }

  const rl = rateLimit(
    `review:${getClientIp(req)}`,
    5,
    60 * 60_000
  );
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çok fazla yorum gönderdin. Birazdan tekrar dene." },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }

  const product = await db.product.findUnique({
    where: { slug: parsed.data.productSlug },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  // SATIN ALMA KONTROLU — sadece bu urunu DELIVERED ya da SHIPPED olarak
  // alan kullanici yorum yazabilir. Spam/sahte review koruma.
  const purchasedItem = await db.orderItem.findFirst({
    where: {
      order: {
        userId: session.user.id,
        status: { in: ["DELIVERED", "SHIPPED"] },
      },
      variant: { productId: product.id },
    },
    select: { id: true },
  });
  if (!purchasedItem) {
    return NextResponse.json(
      {
        error:
          "Bu ürünü satın almadığın için yorum yazamazsın. Hesabın altında geçmiş siparişlerini görebilirsin.",
      },
      { status: 403 }
    );
  }

  // DUPLICATE KORUMA — ayni kullanici ayni urune birden fazla yorum yazmasin
  const existing = await db.review.findFirst({
    where: { productId: product.id, userId: session.user.id },
    select: { id: true, status: true },
  });
  if (existing) {
    const status =
      existing.status === "PENDING"
        ? "moderasyonda"
        : existing.status === "APPROVED"
          ? "yayında"
          : "arşivde";
    return NextResponse.json(
      { error: `Bu ürün için zaten bir yorumun var (${status}).` },
      { status: 409 }
    );
  }

  await db.review.create({
    data: {
      productId: product.id,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title || null,
      body: parsed.data.body || null,
      status: "PENDING",
    },
  });

  return NextResponse.json({
    ok: true,
    message: "Yorumun gönderildi. Moderasyon sonrası yayınlanacak.",
  });
}
