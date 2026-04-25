import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";
const LOCALES = ["tr", "en"] as const;

// Statik üst-seviye sayfalar (root'tan başlar)
const TOP_PATHS = ["", "/shop", "/drops", "/track", "/search"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections, pages] = await Promise.all([
    db.product
      .findMany({
        where: { status: "PUBLISHED" },
        select: { slug: true, updatedAt: true },
      })
      .catch(() => []),
    db.collection
      .findMany({
        where: { status: { in: ["LIVE", "UPCOMING"] } },
        select: { slug: true, createdAt: true },
      })
      .catch(() => []),
    db.page
      .findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
      })
      .catch(() => []),
  ]);

  const urls: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const locale of LOCALES) {
    for (const path of TOP_PATHS) {
      urls.push({
        url: `${BASE}/${locale}${path}`,
        lastModified: now,
        changeFrequency: path === "" ? "daily" : "weekly",
        priority: path === "" ? 1.0 : 0.7,
      });
    }
    for (const p of products) {
      urls.push({
        url: `${BASE}/${locale}/products/${p.slug}`,
        lastModified: p.updatedAt,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
    for (const c of collections) {
      urls.push({
        url: `${BASE}/${locale}/drops/${c.slug}`,
        lastModified: c.createdAt,
        changeFrequency: "daily",
        priority: 0.9,
      });
    }
    // Dinamik /pages/[slug] — Page modelinde yayindaki tum kayitlar
    for (const pg of pages) {
      urls.push({
        url: `${BASE}/${locale}/pages/${pg.slug}`,
        lastModified: pg.updatedAt,
        changeFrequency: "monthly",
        priority: 0.4,
      });
    }
  }

  return urls;
}
