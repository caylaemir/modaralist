"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { SizeGuide } from "./size-guide";
import type { ShopProduct } from "@/lib/shop";

export function ProductActions({
  product,
  locale,
}: {
  product: ShopProduct;
  locale: "tr" | "en";
}) {
  const add = useCart((s) => s.add);
  const [color, setColor] = useState(product.colors[0]?.name ?? null);
  const [size, setSize] = useState<string | null>(null);
  const [openDetails, setOpenDetails] = useState<"desc" | "material" | "care" | null>(
    "desc"
  );

  const variant = useMemo(
    () => product.variants.find((v) => v.color === color && v.size === size) ?? null,
    [product.variants, color, size]
  );

  // Mobile sticky bar: ana 'Sepete Ekle' butonu ekrandan cikinca alta
  // sabit kucuk bar gosterilir. IntersectionObserver ile takip edilir.
  const mainBtnRef = useRef<HTMLButtonElement | null>(null);
  const [showSticky, setShowSticky] = useState(false);
  useEffect(() => {
    const el = mainBtnRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const sizesInStock = useMemo(() => {
    const map = new Map<string, number>();
    for (const v of product.variants) {
      if (v.color === color) {
        map.set(v.size, (map.get(v.size) ?? 0) + v.stock);
      }
    }
    return map;
  }, [product.variants, color]);

  function handleAdd() {
    if (product.soldOut) return;
    if (!size) {
      toast.error("Önce bir beden seç.");
      return;
    }
    if (!variant || variant.stock <= 0) {
      toast.error("Bu varyant stokta yok.");
      return;
    }
    add({
      variantId: variant.id,
      productId: product.slug,
      productSlug: product.slug,
      name: product.name,
      size: variant.size,
      color: variant.color,
      image: product.images[0] ?? null,
      unitPrice: product.discountPrice ?? product.price,
      quantity: 1,
    });
    toast.success(`${product.name} sepete eklendi.`);
  }

  return (
    <div className="sticky top-24 flex flex-col gap-8">
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          {product.dropLabel}
        </p>
        <h1 className="display mt-3 text-4xl md:text-5xl">{product.name}</h1>
        <div className="mt-4 flex items-baseline gap-3">
          <p className="text-lg tabular-nums">
            {formatPrice(product.discountPrice ?? product.price, locale)}
          </p>
          {product.discountPrice && (
            <p className="text-sm tabular-nums text-mist line-through">
              {formatPrice(product.price, locale)}
            </p>
          )}
        </div>
      </div>

      {product.colors.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Renk
            </p>
            <p className="text-xs">{color}</p>
          </div>
          <div className="flex gap-2">
            {product.colors.map((c) => (
              <button
                key={c.code}
                onClick={() => setColor(c.name)}
                className={`size-8 rounded-full border transition-all ${
                  color === c.name
                    ? "border-ink ring-2 ring-ink/20 ring-offset-2"
                    : "border-line"
                }`}
                style={{ backgroundColor: c.hex }}
                aria-label={c.name}
              />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Beden
          </p>
          <SizeGuide />
        </div>
        <div className="grid grid-cols-5 gap-2">
          {product.sizes.map((s) => {
            const stock = sizesInStock.get(s) ?? 0;
            const disabled = stock <= 0;
            return (
              <button
                key={s}
                onClick={() => !disabled && setSize(s)}
                disabled={disabled}
                className={`relative h-11 border text-xs uppercase tracking-widest transition-colors ${
                  size === s
                    ? "border-ink bg-ink text-paper"
                    : disabled
                      ? "cursor-not-allowed border-line text-mist/50"
                      : "border-line hover:border-ink"
                }`}
              >
                {s}
                {disabled && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <span className="h-px w-full rotate-[-20deg] bg-line" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        {variant && variant.stock > 0 && variant.stock <= 3 && (
          <p className="mt-3 text-[10px] uppercase tracking-[0.3em] text-mist">
            Son {variant.stock} adet
          </p>
        )}
      </div>

      <button
        ref={mainBtnRef}
        type="button"
        onClick={handleAdd}
        disabled={product.soldOut}
        className="group flex h-14 items-center justify-between bg-ink px-6 text-[11px] uppercase tracking-[0.3em] text-paper transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
      >
        <span>{product.soldOut ? "Tükendi" : "Sepete Ekle"}</span>
        {!product.soldOut && (
          <span className="transition-transform duration-500 group-hover:translate-x-1">
            →
          </span>
        )}
      </button>

      {/* Mobile sticky add-to-cart bar — ana buton scroll ile cikinca gorunur */}
      <AnimatePresence>
        {showSticky && !product.soldOut ? (
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur-md md:hidden"
            style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
          >
            <div className="flex items-center gap-3">
              <div className="relative size-12 shrink-0 overflow-hidden bg-bone">
                {product.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={product.images[0]}
                    alt=""
                    className="size-full object-cover"
                  />
                ) : null}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[12px] leading-tight">
                  {product.name}
                </p>
                <p className="mt-0.5 text-[13px] tabular-nums">
                  {formatPrice(product.discountPrice ?? product.price, locale)}
                </p>
              </div>
              <button
                type="button"
                onClick={handleAdd}
                className="grid h-11 shrink-0 place-items-center bg-ink px-5 text-[11px] uppercase tracking-[0.25em] text-paper"
              >
                {size ? "Sepete Ekle" : "Beden seç"}
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="border-t border-line">
        {(
          [
            ["desc", "Açıklama", product.description],
            ["material", "Materyal", product.material],
            ["care", "Bakım", product.care],
          ] as const
        ).map(([key, label, content]) => (
          <div key={key} className="border-b border-line">
            <button
              onClick={() =>
                setOpenDetails((o) => (o === key ? null : key))
              }
              className="flex w-full items-center justify-between py-5 text-left text-[11px] uppercase tracking-[0.3em]"
            >
              {label}
              <span className="text-mist">
                {openDetails === key ? "−" : "+"}
              </span>
            </button>
            <AnimatePresence>
              {openDetails === key && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-5 text-sm leading-relaxed text-mist">
                    {content}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </div>
  );
}
