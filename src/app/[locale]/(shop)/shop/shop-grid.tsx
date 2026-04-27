"use client";

import { useState, useMemo } from "react";
import { X } from "lucide-react";
import { ProductCard } from "@/components/shop/product-card";
import { ShopFilters, type ShopFilter } from "@/components/shop/shop-filters";
import type { ShopProduct } from "@/lib/shop";

function FilterPill({ label, onClear }: { label: string; onClear: () => void }) {
  return (
    <span className="inline-flex items-center gap-2 border border-ink bg-paper px-3 py-1.5 text-[11px]">
      <span>{label}</span>
      <button
        type="button"
        onClick={onClear}
        aria-label={`${label} filtresini kaldır`}
        className="grid place-items-center text-mist hover:text-ink"
      >
        <X className="size-3" />
      </button>
    </span>
  );
}

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
          <p className="mt-4 text-sm text-mist">Filtreleri gevşet veya temizle.</p>

          {/* Aktif filtre pill'leri (H5) — kullanici neyi sectigini ve neyi
              kaldirabilecegini net gorur */}
          {(filter.category !== "all" ||
            filter.gender !== "all" ||
            filter.sizes.length > 0 ||
            filter.colorCodes.length > 0 ||
            filter.inStockOnly) && (
            <div className="mt-8 flex max-w-lg flex-wrap justify-center gap-2">
              {filter.category !== "all" ? (
                <FilterPill
                  label={`Kategori: ${categories.find((c) => c.slug === filter.category)?.name ?? filter.category}`}
                  onClear={() => setFilter({ ...filter, category: "all" })}
                />
              ) : null}
              {filter.gender !== "all" ? (
                <FilterPill
                  label={`Cinsiyet: ${filter.gender === "kadin" ? "Kadın" : filter.gender === "erkek" ? "Erkek" : "Unisex"}`}
                  onClear={() => setFilter({ ...filter, gender: "all" })}
                />
              ) : null}
              {filter.sizes.map((s) => (
                <FilterPill
                  key={s}
                  label={`Beden: ${s}`}
                  onClear={() =>
                    setFilter({
                      ...filter,
                      sizes: filter.sizes.filter((x) => x !== s),
                    })
                  }
                />
              ))}
              {filter.colorCodes.map((c) => {
                const color = availableColors.find((x) => x.code === c);
                return (
                  <FilterPill
                    key={c}
                    label={`Renk: ${color?.name ?? c}`}
                    onClear={() =>
                      setFilter({
                        ...filter,
                        colorCodes: filter.colorCodes.filter((x) => x !== c),
                      })
                    }
                  />
                );
              })}
              {filter.inStockOnly ? (
                <FilterPill
                  label="Sadece stoktakiler"
                  onClear={() => setFilter({ ...filter, inStockOnly: false })}
                />
              ) : null}
            </div>
          )}

          <button
            type="button"
            onClick={() =>
              setFilter({
                category: "all",
                sort: "new",
                inStockOnly: false,
                sizes: [],
                colorCodes: [],
                gender: "all",
              })
            }
            className="mt-8 border border-ink px-5 py-2 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper"
          >
            Tüm filtreleri temizle
          </button>
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
