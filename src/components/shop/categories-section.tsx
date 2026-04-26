import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { CategoriesGrid } from "@/components/shop/categories-grid";
import type { CategoryWithCover } from "@/lib/shop";

/**
 * Anasayfa kategoriler section'i — baslik + animasyonlu grid.
 * "Ne ariyorsun?" sorusuyla acilir, 7 ana kategori karti gosterir.
 */
export function CategoriesSection({
  categories,
  locale = "tr",
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref = "/shop",
}: {
  categories: CategoryWithCover[];
  locale?: "tr" | "en";
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
}) {
  if (categories.length === 0) return null;

  const _eyebrow = eyebrow ?? (locale === "tr" ? "— kategoriler" : "— categories");
  const _title = title ?? (locale === "tr" ? "ne arıyorsun?" : "what are you looking for?");
  const _subtitle =
    subtitle ??
    (locale === "tr"
      ? "Tişört, sweatshirt, oversize, outdoor — istediğin parçaya tek tıkla ulaş."
      : "T-shirt, sweatshirt, oversize, outdoor — one click to your fit.");
  const _ctaLabel = ctaLabel ?? (locale === "tr" ? "Tüm mağaza" : "All shop");

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
      <div className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end md:gap-10">
        <div className="md:col-span-8">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
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

      <CategoriesGrid categories={categories} locale={locale} />
    </section>
  );
}
