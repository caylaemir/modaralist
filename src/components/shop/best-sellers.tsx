import { Link } from "@/i18n/navigation";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { ProductCard, type ProductCardData } from "@/components/shop/product-card";

/**
 * Cok satanlar section'i — gercek satis verisinden gelen urunler.
 * Animasyonlar: SplitText (baslik), Reveal (alt metin),
 * ProductCard kendi stagger reveal'ini yapiyor (index*0.1).
 */
export function BestSellers({
  products,
  locale = "tr",
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/shop",
  badgeLabel,
}: {
  products: ProductCardData[];
  locale?: "tr" | "en";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  badgeLabel?: string;
}) {
  if (products.length === 0) return null;

  const _eyebrow = eyebrow ?? (locale === "tr" ? "— en çok satanlar" : "— best sellers");
  const _title = title ?? (locale === "tr" ? "herkesin tercihi." : "everyone's pick.");
  const _subtitle =
    subtitle ??
    (locale === "tr"
      ? "Müşterilerin en çok seçtiği parçalar — stok bittikçe yenileri eklenir."
      : "What customers buy most — restocked as they sell.");
  const _ctaLabel = ctaLabel ?? (locale === "tr" ? "Tümünü gör" : "View all");
  const _badgeLabel = badgeLabel ?? (locale === "tr" ? "Çok satan" : "Best Seller");

  // Ilk 3 urun "BEST SELLER" badge'i alir
  const productsWithBadge: ProductCardData[] = products.map((p, i) => ({
    ...p,
    badge: i < 3 ? _badgeLabel : p.badge,
  }));

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
      <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
        <div className="md:col-span-8">
          <Reveal>
            <p className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.4em] text-mist">
              <TrendingUp className="size-3.5" />
              {_eyebrow}
            </p>
          </Reveal>
          <SplitText
            text={_title}
            as="h2"
            className="display mt-5 text-[10vw] leading-[0.95] md:mt-6 md:text-[5.5vw]"
          />
        </div>
        <div className="md:col-span-4">
          <Reveal delay={0.3}>
            <p className="max-w-sm text-sm leading-relaxed text-mist">
              {_subtitle}
            </p>
            <Link
              href={ctaHref}
              className="group mt-5 inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.35em]"
            >
              <span>{_ctaLabel}</span>
              <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </Reveal>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
        {productsWithBadge.map((p, i) => (
          <ProductCard key={p.slug} product={p} locale={locale} index={i} />
        ))}
      </div>
    </section>
  );
}
