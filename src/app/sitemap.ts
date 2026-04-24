import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";
const LOCALES = ["tr", "en"] as const;

const STATIC_PATHS = [
  "",
  "/shop",
  "/drops",
  "/about",
  "/contact",
  "/kvkk",
  "/privacy",
  "/terms",
  "/distance-sales",
  "/returns",
  "/faq",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, collections] = await Promise.all([
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
  ]);

  const urls: MetadataRoute.Sitemap = [];
  const now = new Date();

  for (const locale of LOCALES) {
    for (const path of STATIC_PATHS) {
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
  }

  return urls;
}
