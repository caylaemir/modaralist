import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { CATEGORY_SEO_TR } from "@/lib/category-seo";
import { MARMARA_CITY_SLUGS } from "@/lib/marmara-cities";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.com";
const LOCALES = ["tr", "en"] as const;

// Statik üst-seviye sayfalar (root'tan başlar)
const TOP_PATHS = ["", "/shop", "/drops", "/track", "/search", "/blog"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, pages, activeCategories] = await Promise.all([
    db.product
      .findMany({
        where: { status: "PUBLISHED" },
        select: {
          slug: true,
          updatedAt: true,
          // Image sitemap icin urunun ilk 3 gorseli (Google Image Search)
          images: {
            orderBy: { sortOrder: "asc" },
            take: 3,
            select: { url: true },
          },
        },
      })
      .catch(() => []),
    db.collection
      .findMany({
        where: { status: { in: ["LIVE", "UPCOMING"] } },
        select: { slug: true, createdAt: true, heroImageUrl: true },
      })
      .catch(() => []),
    db.page
      .findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true, template: true },
      })
      .catch(() => []),
    db.category
      .findMany({ where: { isActive: true }, select: { slug: true } })
      .catch(() => []),
  ]);

  const urls: MetadataRoute.Sitemap = [];
  const now = new Date();

  // /shop/[category] — DB'deki AKTIF kategoriler (silinmis/pasif olanlar haric).
  const activeCategorySlugs = activeCategories.map((c) => c.slug);
  const activeSlugSet = new Set(activeCategorySlugs);
  // /sehir/[city]/[category] sadece CATEGORY_SEO_TR'de tanimli VE hala aktif
  // olan kategoriler icin var (sehir sayfasi !seo ise notFound atar) — pasif
  // edilmis (orn. 'polar') slug'lari sitemap'e koymayalim, 404 olur.
  const cityCategorySlugs = Object.keys(CATEGORY_SEO_TR).filter((s) =>
    activeSlugSet.has(s)
  );

  for (const locale of LOCALES) {
    for (const path of TOP_PATHS) {
      urls.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : 0.7,
      });
    }
    // Kategori sayfalari (en yuksek SEO degeri) — aktif kategoriler
    for (const slug of activeCategorySlugs) {
      urls.push({
        url: `${BASE}/${locale}/shop/${slug}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
    for (const p of products) {
      urls.push({
        url: `${BASE}/${locale}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
        images: p.images.map((i) => i.url).filter(Boolean),
      });
    }
    for (const c of collections) {
      urls.push({
        url: `${BASE}/${locale}/drops/${c.slug}`,
        lastModified: c.createdAt,
        changeFrequency: "daily",
        priority: 0.9,
        images: c.heroImageUrl ? [c.heroImageUrl] : undefined,
      });
    }
    // Dinamik /pages/[slug] — Page modelinde yayindaki kayitlar
    // Blog postlari ayri /blog/[slug]'a gider, /pages'e koymayalim
    for (const pg of pages) {
      if (pg.template === "blog") {
        urls.push({
          url: `${BASE}/${locale}/blog/${pg.slug.replace(/^blog-/, "")}`,
          lastModified: pg.updatedAt,
          changeFrequency: "monthly",
          priority: 0.6,
        });
      } else {
        urls.push({
          url: `${BASE}/${locale}/pages/${pg.slug}`,
          lastModified: pg.updatedAt,
          changeFrequency: "monthly",
          priority: 0.4,
        });
      }
    }
    // Lokal SEO landing'leri (sehir + sehir x kategori)
    for (const city of MARMARA_CITY_SLUGS) {
      urls.push({
        url: `${BASE}/${locale}/sehir/${city}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
      for (const cat of cityCategorySlugs) {
        urls.push({
          url: `${BASE}/${locale}/sehir/${city}/${cat}`,
          lastModified: now,
          changeFrequency: "weekly",
          priority: 0.6,
        });
      }
    }
  }

  return urls;
}
