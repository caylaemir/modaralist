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
import { getFeaturedProducts } from "@/lib/shop";
import { getActiveHomepageBlocks } from "@/lib/homepage";
import { DynamicBlocks } from "@/components/shop/blocks/dynamic-blocks";

export const dynamic = "force-dynamic";

const FALLBACK_PRODUCTS: ProductCardData[] = [
  {
    slug: "asymetric-drape-top",
    name: "Asymetric Drape Top",
    dropLabel: "Drop 01",
    price: 2490,
    image:
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1000&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "linen-wide-leg",
    name: "Linen Wide Leg Trousers",
    dropLabel: "Drop 01",
    price: 1890,
    image:
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "cotton-slip-dress",
    name: "Cotton Slip Dress",
    dropLabel: "Drop 01",
    price: 2190,
    image:
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "sheer-mesh-top",
    name: "Sheer Mesh Top",
    dropLabel: "Drop 01",
    price: 1590,
    image:
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=1000&q=85",
    soldOut: true,
  },
  {
    slug: "raw-edge-blazer",
    name: "Raw Edge Blazer",
    dropLabel: "Drop 01",
    price: 3290,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "knit-column",
    name: "Merino Column Knit",
    dropLabel: "Drop 01",
    price: 2790,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "wool-overcoat",
    name: "Wool Overcoat",
    dropLabel: "Drop 01",
    price: 4890,
    image:
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1000&q=85",
  },
  {
    slug: "silk-scarf-top",
    name: "Silk Scarf Top",
    dropLabel: "Drop 01",
    price: 1790,
    image:
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1000&q=85",
  },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Home");
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";

  const [dbProducts, activeBlocks] = await Promise.all([
    getFeaturedProducts(lang, 8),
    getActiveHomepageBlocks(),
  ]);
  const featured: ProductCardData[] =
    dbProducts.length > 0
      ? dbProducts.map((p) => ({
          slug: p.slug,
          name: p.name,
          dropLabel: p.dropLabel ?? "",
          price: p.price,
          image: p.images[0] ?? "",
          hoverImage: p.hoverImage ?? undefined,
          soldOut: p.soldOut,
        }))
      : FALLBACK_PRODUCTS;

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

      <Marquee
        items={[
          "MODARALIST",
          "SS26 — DROP 01",
          "MODARALIST",
          "MADE IN TURKEY",
          "MODARALIST",
          "LIMITED EDITION",
        ]}
      />

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
                Sezonun ilk drop'u — numaralı, sınırlı, sonrası yok. Her parça bir anın fotoğrafı gibi.
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

      <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink">
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2400&q=85')",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-20 md:px-10 md:pb-32">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-paper/70">
              {t("featuredCollection")}
            </p>
          </Reveal>
          <SplitText
            text="where stillness meets movement."
            as="h3"
            className="display mt-6 max-w-4xl text-[10vw] leading-[0.95] text-paper md:text-[6vw]"
          />
          <Reveal delay={0.5}>
            <Link
              href="/drops"
              className="mt-12 inline-flex items-center gap-3 border-b border-paper pb-2 text-[11px] uppercase tracking-[0.35em] text-paper"
            >
              {t("viewCollection")} <ArrowUpRight className="size-4" />
            </Link>
          </Reveal>
        </div>
      </section>

      <Marquee
        items={[
          "NEW SEASON",
          "MODARALIST",
          "SHOP SS26",
          "MODARALIST",
          "DROP 01",
          "MODARALIST",
        ]}
      />

      <Newsletter />
    </>
  );
}
