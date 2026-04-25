import { db } from "@/lib/db";

export type HeroConfig = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
};

export type MarqueeConfig = {
  items?: string[];
  text?: string;
};

export type FeaturedConfig = {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  slugs?: string[];
  ctaLabel?: string;
  ctaHref?: string;
};

export type CollectionCardConfig = {
  collectionSlug?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
};

export type TextBlockConfig = {
  eyebrow?: string;
  title?: string;
  body?: string;
};

export type HomepageBlockData = {
  id: string;
  type: string;
  sortOrder: number;
  config: Record<string, unknown>;
};

export async function getActiveHomepageBlocks(): Promise<HomepageBlockData[]> {
  const blocks = await db.homepageBlock
    .findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    })
    .catch(() => []);

  return blocks.map((b) => ({
    id: b.id,
    type: b.type,
    sortOrder: b.sortOrder,
    config:
      b.config && typeof b.config === "object"
        ? (b.config as Record<string, unknown>)
        : {},
  }));
}
