import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { formatPrice } from "@/lib/utils";

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
}: {
  product: ProductCardData;
  locale?: "tr" | "en";
}) {
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-opacity duration-700 group-hover:opacity-0"
        />
        {product.hoverImage && (
          <Image
            src={product.hoverImage}
            alt=""
            aria-hidden
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover opacity-0 transition-opacity duration-700 group-hover:opacity-100"
          />
        )}
        {product.soldOut && (
          <div className="absolute inset-x-0 bottom-0 bg-ink/80 py-2 text-center text-[10px] tracking-widest uppercase text-paper">
            Sold Out
          </div>
        )}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          {product.dropLabel && (
            <p className="eyebrow text-mist">{product.dropLabel}</p>
          )}
          <p className="mt-1 text-sm">{product.name}</p>
        </div>
        <p className="text-sm tabular-nums">
          {formatPrice(product.price, locale)}
        </p>
      </div>
    </Link>
  );
}
