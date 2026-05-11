"use client";

import { useState } from "react";
import { ProductGallery } from "./product-gallery";
import { ProductActions } from "./product-actions";
import type { ShopProduct } from "@/lib/shop";

// Galeri ile aksiyon paneli arasinda secili rengi paylasan istemci sarmalayici.
// Renk degisince galeri o rengin gorsellerini gosterir. initialColor: magaza
// listesinden ?color=<code> ile gelinirse o renkle acilir.
export function ProductDetail({
  product,
  locale,
  initialColor,
}: {
  product: ShopProduct;
  locale: "tr" | "en";
  initialColor?: string | null;
}) {
  const startColor =
    (initialColor && product.colors.some((c) => c.code === initialColor)
      ? initialColor
      : product.colors[0]?.code) ?? null;
  const [selectedColor, setSelectedColor] = useState<string | null>(startColor);

  return (
    <section className="mx-auto mt-10 grid max-w-[1600px] gap-10 px-5 md:mt-16 md:grid-cols-12 md:px-10">
      <div className="md:col-span-7">
        <ProductGallery
          images={product.images}
          sharedImages={product.sharedImages}
          colorImages={product.colorImages}
          selectedColor={selectedColor}
          alt={product.name}
        />
      </div>
      <div className="md:col-span-5">
        <ProductActions
          product={product}
          locale={locale}
          initialColorCode={startColor}
          onColorChange={setSelectedColor}
        />
      </div>
    </section>
  );
}
