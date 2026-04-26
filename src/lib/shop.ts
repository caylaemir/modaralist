import "server-only";
import type { CollectionStatus } from "@prisma/client";
import { db } from "@/lib/db";

export type ShopLocale = "tr" | "en";

export type ShopVariant = {
  id: string;
  size: string;
  color: string;
  colorCode: string;
  stock: number;
};

export type ShopColor = {
  code: string;
  name: string;
  hex: string;
};

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  dropLabel: string | null;
  dropSlug: string | null;
  price: number;
  discountPrice: number | null;
  images: string[];
  hoverImage: string | null;
  description: string;
  material: string;
  care: string;
  sizes: string[];
  colors: ShopColor[];
  variants: ShopVariant[];
  categorySlug: string | null;
  tags: string[];
  soldOut: boolean;
  comingSoon: boolean;
};

export type ShopCollection = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  description: string | null;
  manifesto: string | null;
  status: CollectionStatus;
  startsAt: Date | null;
  endsAt: Date | null;
  themePrimary: string | null;
  themeAccent: string | null;
  heroImageUrl: string | null;
  productCount: number;
};

type ProductWithRelations = {
  id: string;
  slug: string;
  basePrice: { toString(): string } | number;
  discountPrice: { toString(): string } | number | null;
  status: string;
  translations: { locale: string; name: string; description: string | null; material: string | null; care: string | null }[];
  images: { url: string; isHover: boolean; sortOrder: number }[];
  variants: {
    id: string;
    stock: number;
    size: { code: string } | null;
    color: { code: string; hex: string; nameTr: string; nameEn: string };
  }[];
  category: { slug: string } | null;
  tags: { code: string; labelTr: string; labelEn: string }[];
  collections: {
    collection: {
      slug: string;
      translations: { locale: string; name: string }[];
    };
  }[];
};

function mapProduct(p: ProductWithRelations, locale: ShopLocale): ShopProduct {
  const tr = p.translations.find((t) => t.locale === locale);
  const firstColl = p.collections[0]?.collection;
  const firstCollTr = firstColl?.translations.find((t) => t.locale === locale);

  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
  const sizes = Array.from(
    new Set(p.variants.map((v) => v.size?.code).filter(Boolean))
  ) as string[];

  const colors: ShopColor[] = [];
  const seenColors = new Set<string>();
  for (const v of p.variants) {
    if (seenColors.has(v.color.code)) continue;
    seenColors.add(v.color.code);
    colors.push({
      code: v.color.code,
      name: locale === "tr" ? v.color.nameTr : v.color.nameEn,
      hex: v.color.hex,
    });
  }

  const sortedImages = [...p.images].sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    id: p.id,
    slug: p.slug,
    name: tr?.name ?? p.slug,
    dropLabel: firstCollTr?.name ?? null,
    dropSlug: firstColl?.slug ?? null,
    price: Number(p.basePrice),
    discountPrice: p.discountPrice != null ? Number(p.discountPrice) : null,
    images: sortedImages.map((i) => i.url),
    hoverImage:
      sortedImages.find((i) => i.isHover)?.url ?? sortedImages[1]?.url ?? null,
    description: tr?.description ?? "",
    material: tr?.material ?? "",
    care: tr?.care ?? "",
    sizes,
    colors,
    variants: p.variants.map((v) => ({
      id: v.id,
      size: v.size?.code ?? "",
      color: locale === "tr" ? v.color.nameTr : v.color.nameEn,
      colorCode: v.color.code,
      stock: v.stock,
    })),
    categorySlug: p.category?.slug ?? null,
    tags: p.tags.map((t) => (locale === "tr" ? t.labelTr : t.labelEn)),
    soldOut: p.status === "PUBLISHED" && totalStock === 0,
    comingSoon: p.status === "COMING_SOON",
  };
}

const productInclude = {
  translations: true,
  images: true,
  variants: {
    where: { isActive: true },
    include: {
      size: true,
      color: true,
    },
  },
  category: true,
  tags: true,
  collections: {
    include: {
      collection: {
        include: { translations: true },
      },
    },
    take: 1,
  },
};

export async function getProductsList(locale: ShopLocale): Promise<ShopProduct[]> {
  const products = await db.product.findMany({
    where: { status: { in: ["PUBLISHED", "COMING_SOON"] } },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: productInclude,
  });
  return products.map((p) => mapProduct(p as ProductWithRelations, locale));
}

export async function getProduct(
  slug: string,
  locale: ShopLocale
): Promise<ShopProduct | null> {
  const p = await db.product.findUnique({
    where: { slug },
    include: productInclude,
  });
  if (!p) return null;
  if (p.status === "DRAFT" || p.status === "ARCHIVED") return null;
  return mapProduct(p as ProductWithRelations, locale);
}

export async function getRelatedProducts(
  slug: string,
  locale: ShopLocale,
  limit = 4
): Promise<ShopProduct[]> {
  const current = await db.product.findUnique({
    where: { slug },
    select: { id: true, categoryId: true },
  });
  if (!current) return [];

  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      id: { not: current.id },
      ...(current.categoryId ? { categoryId: current.categoryId } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: productInclude,
  });
  return products.map((p) => mapProduct(p as ProductWithRelations, locale));
}

export async function getFeaturedProducts(
  locale: ShopLocale,
  limit = 6
): Promise<ShopProduct[]> {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { createdAt: "desc" },
    take: limit,
    include: productInclude,
  });
  return products.map((p) => mapProduct(p as ProductWithRelations, locale));
}

/**
 * Cok satan urunler — son N gunde PAID order'lardaki quantity toplamina gore.
 * Hic siparis yoksa fallback olarak en yeni publish edilen urunleri doner
 * (bos section gostermek yerine).
 */
export async function getBestSellingProducts(
  locale: ShopLocale,
  limit = 8,
  withinDays = 90
): Promise<ShopProduct[]> {
  const since = new Date(Date.now() - withinDays * 24 * 60 * 60 * 1000);

  // OrderItem -> variantId -> sum(quantity), join Variant'a productId icin.
  // CAPTURED = iyzico'da basariyla cekilen odeme (PaymentStatus enum).
  const grouped = await db.orderItem.groupBy({
    by: ["variantId"],
    where: {
      order: {
        paymentStatus: "CAPTURED",
        placedAt: { gte: since },
      },
    },
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: limit * 3, // ayni urunun farkli variant'lari icin pay ver
  });

  if (grouped.length === 0) {
    // Hic satis yoksa featured fallback — anasayfa bos kalmasin
    return getFeaturedProducts(locale, limit);
  }

  const variantIds = grouped.map((g) => g.variantId);
  const variants = await db.productVariant.findMany({
    where: { id: { in: variantIds } },
    select: { id: true, productId: true },
  });
  const variantToProduct = new Map(variants.map((v) => [v.id, v.productId]));

  // Variant satislarini product seviyesine topla, en cok satilanlar onde
  const productScores = new Map<string, number>();
  for (const g of grouped) {
    const productId = variantToProduct.get(g.variantId);
    if (!productId) continue;
    productScores.set(
      productId,
      (productScores.get(productId) ?? 0) + (g._sum.quantity ?? 0)
    );
  }

  const topProductIds = [...productScores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);

  if (topProductIds.length === 0) {
    return getFeaturedProducts(locale, limit);
  }

  const products = await db.product.findMany({
    where: { id: { in: topProductIds }, status: "PUBLISHED" },
    include: productInclude,
  });

  // DB sirasini kullanma — bizim score sirasini koru
  const byId = new Map(products.map((p) => [p.id, p]));
  return topProductIds
    .map((id) => byId.get(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p))
    .map((p) => mapProduct(p as ProductWithRelations, locale));
}

export type CategoryWithCover = {
  slug: string;
  name: string;
  productCount: number;
  coverImage: string | null;
};

/**
 * Kategoriler + her birinin kapak gorseli (bannerUrl > ilk publish urunun ilk gorseli).
 * Anasayfa kategori gridi icin tasarlandi — sadece urunu olan kategoriler doner.
 */
export async function getCategoriesWithCover(
  locale: ShopLocale,
  limit = 12
): Promise<CategoryWithCover[]> {
  const cats = await db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    take: limit,
    include: {
      translations: { where: { locale } },
      _count: { select: { products: true } },
      products: {
        where: { status: "PUBLISHED" },
        take: 1,
        orderBy: { createdAt: "desc" },
        select: {
          images: {
            where: { isHover: false },
            orderBy: { sortOrder: "asc" },
            take: 1,
            select: { url: true },
          },
        },
      },
    },
  });

  return cats
    .filter((c) => c._count.products > 0)
    .map((c) => ({
      slug: c.slug,
      name: c.translations[0]?.name ?? c.slug,
      productCount: c._count.products,
      coverImage: c.bannerUrl ?? c.products[0]?.images[0]?.url ?? null,
    }));
}

export async function getCollectionsList(
  locale: ShopLocale
): Promise<ShopCollection[]> {
  const cols = await db.collection.findMany({
    where: { status: { in: ["UPCOMING", "LIVE", "SOLD_OUT"] } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    include: {
      translations: { where: { locale } },
      _count: { select: { products: true } },
    },
  });
  return cols.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.translations[0]?.name ?? c.slug,
    tagline: c.translations[0]?.tagline ?? null,
    description: c.translations[0]?.description ?? null,
    manifesto: c.translations[0]?.manifesto ?? null,
    status: c.status,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    themePrimary: c.themePrimary,
    themeAccent: c.themeAccent,
    heroImageUrl: c.heroImageUrl,
    productCount: c._count.products,
  }));
}

export async function getCollection(
  slug: string,
  locale: ShopLocale
): Promise<ShopCollection | null> {
  const c = await db.collection.findUnique({
    where: { slug },
    include: {
      translations: { where: { locale } },
      _count: { select: { products: true } },
    },
  });
  if (!c) return null;
  return {
    id: c.id,
    slug: c.slug,
    name: c.translations[0]?.name ?? c.slug,
    tagline: c.translations[0]?.tagline ?? null,
    description: c.translations[0]?.description ?? null,
    manifesto: c.translations[0]?.manifesto ?? null,
    status: c.status,
    startsAt: c.startsAt,
    endsAt: c.endsAt,
    themePrimary: c.themePrimary,
    themeAccent: c.themeAccent,
    heroImageUrl: c.heroImageUrl,
    productCount: c._count.products,
  };
}

export async function getCollectionProducts(
  slug: string,
  locale: ShopLocale
): Promise<ShopProduct[]> {
  const links = await db.collectionProduct.findMany({
    where: { collection: { slug } },
    orderBy: { sortOrder: "asc" },
    include: {
      product: { include: productInclude },
    },
  });
  return links
    .filter(
      (l) =>
        l.product.status === "PUBLISHED" || l.product.status === "COMING_SOON"
    )
    .map((l) => mapProduct(l.product as ProductWithRelations, locale));
}

export async function getCategoriesList(
  locale: ShopLocale
): Promise<{ slug: string; name: string }[]> {
  const cats = await db.category.findMany({
    where: { isActive: true, parentId: null },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      translations: { where: { locale } },
      _count: { select: { products: true } },
    },
  });
  return [
    { slug: "all", name: locale === "tr" ? "Tümü" : "All" },
    ...cats
      .filter((c) => c._count.products > 0)
      .map((c) => ({
        slug: c.slug,
        name: c.translations[0]?.name ?? c.slug,
      })),
  ];
}

export async function searchProducts(
  query: string,
  locale: ShopLocale,
  limit = 20
): Promise<ShopProduct[]> {
  if (!query.trim()) return [];
  const products = await db.product.findMany({
    where: {
      status: "PUBLISHED",
      OR: [
        { slug: { contains: query, mode: "insensitive" } },
        {
          translations: {
            some: {
              OR: [
                { name: { contains: query, mode: "insensitive" } },
                { description: { contains: query, mode: "insensitive" } },
              ],
            },
          },
        },
      ],
    },
    take: limit,
    include: productInclude,
  });
  return products.map((p) => mapProduct(p as ProductWithRelations, locale));
}
