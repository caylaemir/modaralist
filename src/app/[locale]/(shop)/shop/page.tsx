"use client";

import { useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { ProductCard } from "@/components/shop/product-card";
import { ShopFilters, type ShopFilter } from "@/components/shop/shop-filters";
import { Marquee } from "@/components/shop/marquee";
import { SplitText } from "@/components/shop/split-text";
import { Reveal } from "@/components/shop/reveal";
import { DEMO_PRODUCTS } from "@/lib/demo-data";

export default function ShopPage() {
  const locale = useLocale() as "tr" | "en";
  const [filter, setFilter] = useState<ShopFilter>({
    category: "all",
    sort: "new",
    inStockOnly: false,
  });

  const products = useMemo(() => {
    let list = DEMO_PRODUCTS.slice();
    if (filter.category !== "all") {
      list = list.filter((p) => p.categorySlug === filter.category);
    }
    if (filter.inStockOnly) {
      list = list.filter((p) => !p.soldOut);
    }
    if (filter.sort === "price-asc") list.sort((a, b) => a.price - b.price);
    if (filter.sort === "price-desc") list.sort((a, b) => b.price - a.price);
    return list;
  }, [filter]);

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-40">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — mağaza
          </p>
        </Reveal>
        <SplitText
          text="her parça bir anın fotoğrafı."
          as="h1"
          className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
        />
        <Reveal delay={0.3}>
          <p className="mt-8 max-w-lg text-sm leading-relaxed text-mist">
            SS26 Drop 01 — numaralı, sınırlı üretim. Tükendiğinde arşive alınır,
            tekrar basılmaz.
          </p>
        </Reveal>
      </section>

      <div className="mx-auto mt-20 max-w-[1600px] px-5 md:px-10">
        <ShopFilters
          value={filter}
          onChange={setFilter}
          total={products.length}
        />

        {products.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center py-20 text-center">
            <p className="display text-4xl">Bu kombinasyonda bir şey yok.</p>
            <p className="mt-4 text-sm text-mist">Filtreleri gevşetmeyi dene.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
            {products.map((p, i) => (
              <ProductCard
                key={p.slug}
                product={{
                  slug: p.slug,
                  name: p.name,
                  dropLabel: p.dropLabel,
                  price: p.price,
                  image: p.images[0],
                  hoverImage: p.images[1],
                  soldOut: p.soldOut,
                }}
                locale={locale}
                index={i}
              />
            ))}
          </div>
        )}
      </div>

      <div className="mt-32">
        <Marquee
          items={[
            "MODARALIST",
            "SS26 — DROP 01",
            "LIMITED EDITION",
            "MODARALIST",
            "MADE IN TURKEY",
          ]}
        />
      </div>
    </>
  );
}
