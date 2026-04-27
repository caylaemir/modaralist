"use client";

import { useState, useMemo } from "react";
import { ProductCard } from "@/components/shop/product-card";
import { ShopFilters, type ShopFilter } from "@/components/shop/shop-filters";
import type { ShopProduct } from "@/lib/shop";

type Props = {
  products: ShopProduct[];
  categories: { slug: string; name: string }[];
  locale: "tr" | "en";
};

export function ShopGrid({ products, categories, locale }: Props) {
  const [filter, setFilter] = useState<ShopFilter>({
    category: "all",
    sort: "new",
    inStockOnly: false,
    sizes: [],
    colorCodes: [],
    gender: "all",
  });

  // Tum urunlerden unique size + color set'i (filter dropdown icin)
  const { availableSizes, availableColors } = useMemo(() => {
    const sizeSet = new Set<string>();
    const colorMap = new Map<string, { code: string; name: string; hex: string }>();
    for (const p of products) {
      for (const s of p.sizes) sizeSet.add(s);
      for (const c of p.colors) {
        if (!colorMap.has(c.code)) colorMap.set(c.code, c);
      }
    }
    // Beden sirasi: XS, S, M, L, XL, XXL — once standard sonra digerleri
    const standard = ["XS", "S", "M", "L", "XL", "XXL", "XXXL"];
    const sortedSizes = [...sizeSet].sort((a, b) => {
      const ai = standard.indexOf(a);
      const bi = standard.indexOf(b);
      if (ai !== -1 && bi !== -1) return ai - bi;
      if (ai !== -1) return -1;
      if (bi !== -1) return 1;
      return a.localeCompare(b);
    });
    return {
      availableSizes: sortedSizes,
      availableColors: [...colorMap.values()],
    };
  }, [products]);

  const filtered = useMemo(() => {
    let list = products.slice();

    if (filter.category !== "all") {
      list = list.filter((p) => p.categorySlug === filter.category);
    }

    // Cinsiyet filtresi — Tag.code uzerinden
    if (filter.gender !== "all") {
      list = list.filter((p) =>
        p.tagCodes.some(
          (code) => code.toLowerCase() === filter.gender.toLowerCase()
        )
      );
    }

    // Beden — urun bu beden'lerin EN AZ BIRINI taşımalı (OR)
    if (filter.sizes.length > 0) {
      list = list.filter((p) =>
        p.sizes.some((s) => filter.sizes.includes(s))
      );
    }

    // Renk — aynı (OR)
    if (filter.colorCodes.length > 0) {
      list = list.filter((p) =>
        p.colors.some((c) => filter.colorCodes.includes(c.code))
      );
    }

    if (filter.inStockOnly) {
      list = list.filter((p) => !p.soldOut);
    }
    if (filter.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (filter.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [products, filter]);

  return (
    <>
      <ShopFilters
        value={filter}
        onChange={setFilter}
        total={filtered.length}
        categories={categories}
        availableSizes={availableSizes}
        availableColors={availableColors}
      />

      {filtered.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center py-20 text-center">
          <p className="display text-4xl">Bu kombinasyonda bir şey yok.</p>
          <p className="mt-4 text-sm text-mist">Filtreleri gevşetmeyi dene.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
          {filtered.map((p, i) => (
            <ProductCard
              key={p.slug}
              product={{
                slug: p.slug,
                name: p.name,
                dropLabel: p.dropLabel ?? "",
                price: p.price,
                image: p.images[0] ?? "",
                hoverImage: p.hoverImage ?? undefined,
                soldOut: p.soldOut,
              }}
              locale={locale}
              index={i}
            />
          ))}
        </div>
      )}
    </>
  );
}
