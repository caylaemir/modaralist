"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { formatPrice, hasValidDiscount, effectivePrice } from "@/lib/utils";
import { WishlistHeart } from "./wishlist-heart";

export type ProductCardData = {
  slug: string;
  name: string;
  dropLabel?: string;
  price: number;
  // Indirimli fiyat (varsa). 0 / null / >= price ise yok sayilir (helper guvenli).
  discountPrice?: number | null;
  image: string;
  hoverImage?: string;
  soldOut?: boolean;
  badge?: string;
  // Renk-bazli kart: tiklayinca urun sayfasi bu renkle acilir (?color=<code>)
  colorParam?: string;
};

export function ProductCard({
  product,
  locale = "tr",
  index = 0,
}: {
  product: ProductCardData;
  locale?: "tr" | "en";
  index?: number;
}) {
  const onSale = hasValidDiscount(product.price, product.discountPrice ?? null);
  const shownPrice = effectivePrice(product.price, product.discountPrice ?? null);
  const href = product.colorParam
    ? `/products/${product.slug}?color=${encodeURIComponent(product.colorParam)}`
    : `/products/${product.slug}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: (index % 4) * 0.1,
      }}
    >
      <div className="group relative">
        <WishlistHeart slug={product.slug} />
        {product.badge ? (
          <span className="absolute left-3 top-3 z-10 inline-flex items-center bg-ink px-2.5 py-1 text-[9px] font-medium uppercase tracking-[0.25em] text-paper">
            {product.badge}
          </span>
        ) : null}
        <Link href={href} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand">
          {product.image ? (
            <Image
              src={product.image}
              alt={product.name}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
            />
          ) : (
            // Gorseli olmayan urun — bos string next/image'i patlatir, placeholder goster
            <div className="flex h-full w-full items-center justify-center bg-bone text-[10px] uppercase tracking-[0.3em] text-mist">
              Modaralist
            </div>
          )}
          {product.hoverImage && (
            <Image
              src={product.hoverImage}
              alt=""
              aria-hidden
              fill
              sizes="(min-width: 1024px) 25vw, 50vw"
              className="hidden object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100 md:block"
            />
          )}
          {product.soldOut && (
            <div className="absolute inset-x-4 bottom-4 bg-ink/85 py-2 text-center text-[10px] tracking-[0.3em] uppercase text-paper">
              Sold Out
            </div>
          )}
          {/* Mobilde her zaman gorunur (touch hover yok), desktopta hover'da slide-up */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-paper/95 px-4 py-3 text-[10px] uppercase tracking-[0.25em] transition-transform duration-500 md:translate-y-full md:group-hover:translate-y-0">
            <span>İncele</span>
            <span>→</span>
          </div>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {product.dropLabel && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                {product.dropLabel}
              </p>
            )}
            <p
              className="mt-1.5 line-clamp-2 text-sm leading-snug"
              title={product.name}
            >
              {product.name}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-sm tabular-nums">{formatPrice(shownPrice, locale)}</p>
            {onSale && (
              <p className="text-[11px] tabular-nums text-mist line-through">
                {formatPrice(product.price, locale)}
              </p>
            )}
          </div>
        </div>
      </Link>
      </div>
    </motion.div>
  );
}
