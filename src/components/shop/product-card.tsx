"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";
import { WishlistHeart } from "./wishlist-heart";

export type ProductCardData = {
  slug: string;
  name: string;
  dropLabel?: string;
  price: number;
  image: string;
  hoverImage?: string;
  soldOut?: boolean;
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
        <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand">
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
          />
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
          <div>
            {product.dropLabel && (
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                {product.dropLabel}
              </p>
            )}
            <p className="mt-1.5 text-sm">{product.name}</p>
          </div>
          <p className="text-sm tabular-nums">
            {formatPrice(product.price, locale)}
          </p>
        </div>
      </Link>
      </div>
    </motion.div>
  );
}
