import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const upsertSchema = z.object({
  productSlug: z.string().min(1),
  action: z.enum(["add", "remove", "toggle"]),
});

async function getUserId() {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ items: [] });

  const items = await db.wishlistItem.findMany({
    where: { userId },
    select: { productId: true, product: { select: { slug: true } } },
  });
  return NextResponse.json({
    items: items.map((i) => ({ productId: i.productId, slug: i.product.slug })),
  });
}

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Önce giriş yap." },
      { status: 401 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = upsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const { productSlug, action } = parsed.data;

  const product = await db.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) {
    return NextResponse.json({ error: "Ürün bulunamadı." }, { status: 404 });
  }

  const existing = await db.wishlistItem.findUnique({
    where: {
      userId_productId: { userId, productId: product.id },
    },
  });

  if (action === "remove" || (action === "toggle" && existing)) {
    if (existing) {
      await db.wishlistItem.delete({
        where: { userId_productId: { userId, productId: product.id } },
      });
    }
    return NextResponse.json({ wishlisted: false });
  }

  // add or toggle (when not existing)
  if (!existing) {
    await db.wishlistItem.create({
      data: { userId, productId: product.id },
    });
  }
  return NextResponse.json({ wishlisted: true });
}
