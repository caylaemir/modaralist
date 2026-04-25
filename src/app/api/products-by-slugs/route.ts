import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import type { Locale } from "@prisma/client";

/**
 * Verilen slug listesi icin urun karti datasi doner.
 * Recently viewed UI tarafindan kullanilir.
 */
export async function GET(req: NextRequest) {
  const slugsParam = req.nextUrl.searchParams.get("slugs") ?? "";
  const localeParam = req.nextUrl.searchParams.get("locale") ?? "tr";
  const lang = (localeParam === "en" ? "en" : "tr") as Locale;

  const slugs = slugsParam
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 12); // max 12 slug

  if (slugs.length === 0) {
    return NextResponse.json({ products: [] });
  }

  const rows = await db.product
    .findMany({
      where: { slug: { in: slugs }, status: "PUBLISHED" },
      include: {
        translations: { where: { locale: lang } },
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        variants: { where: { isActive: true }, select: { stock: true } },
        collections: {
          take: 1,
          include: {
            collection: {
              include: { translations: { where: { locale: lang } } },
            },
          },
        },
      },
    })
    .catch(() => []);

  // slug sirasini koru
  const bySlug = new Map(rows.map((r) => [r.slug, r]));
  const products = slugs
    .map((slug) => bySlug.get(slug))
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => {
      const tr = p.translations[0];
      const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
      const drop = p.collections[0]?.collection;
      const dropTr = drop?.translations[0];
      return {
        slug: p.slug,
        name: tr?.name ?? p.slug,
        dropLabel: dropTr?.name ?? "",
        price: p.discountPrice ? Number(p.discountPrice) : Number(p.basePrice),
        image: p.images[0]?.url ?? "",
        hoverImage: p.images[1]?.url ?? undefined,
        soldOut: totalStock === 0,
      };
    });

  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, max-age=60, s-maxage=60",
      },
    }
  );
}
