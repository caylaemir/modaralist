import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/shop/hero";
import { Newsletter } from "@/components/shop/newsletter";
import { ProductCard, type ProductCardData } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";
import { Splash } from "@/components/shop/splash";
import { Marquee } from "@/components/shop/marquee";
import { SplitText } from "@/components/shop/split-text";
import { Reveal } from "@/components/shop/reveal";
import { ArrowUpRight } from "lucide-react";
import {
  getFeaturedProducts,
  getBestSellingProducts,
  getCategoriesWithCover,
  getCollectionsList,
} from "@/lib/shop";
import { getActiveHomepageBlocks } from "@/lib/homepage";
import { DynamicBlocks } from "@/components/shop/blocks/dynamic-blocks";
import { ActiveDropBanner } from "@/components/shop/active-drop-banner";
import { CategoriesSection } from "@/components/shop/categories-section";
import { BestSellers } from "@/components/shop/best-sellers";

export const dynamic = "force-dynamic";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";

  const [dbProducts, activeBlocks, categories, bestSellers, collections] = await Promise.all([
    getFeaturedProducts(lang, 8),
    getActiveHomepageBlocks(),
    getCategoriesWithCover(lang, 7),
    getBestSellingProducts(lang, 8, 90),
    getCollectionsList(lang),
  ]);
  // Spotlight koleksiyon: ilk LIVE'i, yoksa ilk UPCOMING'i, hicbir biri
  // yoksa null (spotlight render edilmez).
  const spotlight =
    collections.find((c) => c.status === "LIVE") ??
    collections.find((c) => c.status === "UPCOMING") ??
    null;
  const featured: ProductCardData[] = dbProducts.map((p) => ({
    slug: p.slug,
    name: p.name,
    dropLabel: p.dropLabel ?? "",
    price: p.price,
    image: p.images[0] ?? "",
    hoverImage: p.hoverImage ?? undefined,
    soldOut: p.soldOut,
  }));
  const bestSellersCards: ProductCardData[] = bestSellers.map((p) => ({
    slug: p.slug,
    name: p.name,
    dropLabel: p.dropLabel ?? "",
    price: p.price,
    image: p.images[0] ?? "",
    hoverImage: p.hoverImage ?? undefined,
    soldOut: p.soldOut,
  }));

  // Admin'de aktif HomepageBlock varsa onları kullan, yoksa hardcoded fallback
  if (activeBlocks.length > 0) {
    return (
      <>
        <Splash />
        <DynamicBlocks blocks={activeBlocks} locale={lang} />
        <Newsletter />
      </>
    );
  }

  return (
    <>
      <Splash />
      <Hero />
      <ActiveDropBanner locale={lang} />

      <Marquee
        items={[
          "MODARALIST",
          "NUMARALI KOLEKSİYONLAR",
          "MODARALIST",
          "MADE IN TURKEY",
          "MODARALIST",
          "LIMITED EDITION",
        ]}
      />

      <CategoriesSection categories={categories} locale={lang} />

      <BestSellers products={bestSellersCards} locale={lang} />

      {featured.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-40">
          <div className="mb-16 grid gap-10 md:grid-cols-12 md:items-end">
            <div className="md:col-span-8">
              <Reveal>
                <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                  — {t("lineupTitle").toLowerCase()}
                </p>
              </Reveal>
              <SplitText
                text={t("lineupTitle")}
                as="h2"
                className="display mt-6 text-[10vw] leading-[0.95] md:text-[6vw]"
              />
            </div>
            <div className="md:col-span-4">
              <Reveal delay={0.3}>
                <p className="max-w-sm text-sm leading-relaxed text-mist">
                  {lang === "en"
                    ? "Numbered, limited-run pieces — Bursa-made streetwear. Each drop captures a season."
                    : "Numaralı, sınırlı sayıda — Bursa'da üretilen streetwear. Her drop sezonun bir anını yakalar."}
                </p>
                <Link
                  href="/shop"
                  className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.35em]"
                >
                  {t("shopAll")} <ArrowUpRight className="size-4" />
                </Link>
              </Reveal>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
            {featured.map((p, i) => (
              <ProductCard
                key={p.slug}
                product={p}
                locale={locale as "tr" | "en"}
                index={i}
              />
            ))}
          </div>
        </section>
      ) : null}

      {spotlight ? (
        <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink">
          <div
            className="absolute inset-0 scale-105 bg-cover bg-center"
            style={
              spotlight.heroImageUrl
                ? { backgroundImage: `url('${spotlight.heroImageUrl}')` }
                : {
                    background:
                      "linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)",
                  }
            }
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
          <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-20 md:px-10 md:pb-32">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.4em] text-paper/70">
                {t("featuredCollection")}
              </p>
            </Reveal>
            <SplitText
              text={spotlight.tagline ?? spotlight.name}
              as="h3"
              className="display mt-6 max-w-4xl text-[10vw] leading-[0.95] text-paper md:text-[6vw]"
            />
            <Reveal delay={0.5}>
              <Link
                href={`/drops/${spotlight.slug}`}
                className="mt-12 inline-flex items-center gap-3 border-b border-paper pb-2 text-[11px] uppercase tracking-[0.35em] text-paper"
              >
                {t("viewCollection")} <ArrowUpRight className="size-4" />
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      <Marquee
        items={[
          "BURSA",
          "MODARALIST",
          "SINIRLI ÜRETİM",
          "MODARALIST",
          "MARMARA'YA HIZLI KARGO",
          "MODARALIST",
        ]}
      />

      <Newsletter />
    </>
  );
}
