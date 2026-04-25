"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { getRecentlyViewed } from "@/lib/recently-viewed";

type Product = {
  slug: string;
  name: string;
  dropLabel?: string;
  price: number;
  image: string;
  hoverImage?: string;
  soldOut?: boolean;
};

/**
 * Recently viewed urunler. localStorage'tan slug listesi alir,
 * /api/products-by-slugs ile detaylari fetch eder.
 * Bos liste varsa hicbir sey gostermez.
 */
export function RecentlyViewed({
  excludeSlug,
  locale = "tr",
  title = "— son baktıkların",
  heading = "Son baktıkların",
  limit = 4,
}: {
  excludeSlug?: string;
  locale?: "tr" | "en";
  title?: string;
  heading?: string;
  limit?: number;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const slugs = getRecentlyViewed()
      .filter((s) => s !== excludeSlug)
      .slice(0, limit);
    if (slugs.length === 0) {
      setLoading(false);
      return;
    }
    fetch(`/api/products-by-slugs?slugs=${encodeURIComponent(slugs.join(","))}&locale=${locale}`)
      .then((r) => r.json())
      .then((d) => {
        setProducts(Array.isArray(d.products) ? d.products : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [excludeSlug, locale, limit]);

  if (loading || products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">{title}</p>
      <h3 className="display mt-4 text-3xl md:text-4xl">{heading}</h3>
      <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
        {products.map((p, i) => (
          <ProductCard
            key={p.slug}
            product={p}
            locale={locale}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}
