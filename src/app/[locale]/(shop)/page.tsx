import { setRequestLocale, getTranslations } from "next-intl/server";
import { Hero } from "@/components/shop/hero";
import { Newsletter } from "@/components/shop/newsletter";
import { ProductCard, type ProductCardData } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";

const DEMO_PRODUCTS: ProductCardData[] = [
  {
    slug: "asymetric-drape-top",
    name: "Asymetric Drape Top",
    dropLabel: "Drop 01",
    price: 2490,
    image:
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=900&q=80",
    hoverImage:
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "linen-wide-leg",
    name: "Linen Wide Leg Trousers",
    dropLabel: "Drop 01",
    price: 1890,
    image:
      "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "cotton-slip-dress",
    name: "Cotton Slip Dress",
    dropLabel: "Drop 01",
    price: 2190,
    image:
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=900&q=80",
  },
  {
    slug: "sheer-mesh-top",
    name: "Sheer Mesh Top",
    dropLabel: "Drop 01",
    price: 1590,
    image:
      "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    soldOut: true,
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

  return (
    <>
      <Hero />

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
        <div className="mb-12 flex items-end justify-between gap-6">
          <h2 className="caps-wide text-2xl md:text-4xl">{t("lineupTitle")}</h2>
          <Link
            href="/shop"
            className="eyebrow shrink-0 text-mist hover:text-ink"
          >
            {t("shopAll")} →
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
          {DEMO_PRODUCTS.map((p) => (
            <ProductCard
              key={p.slug}
              product={p}
              locale={locale as "tr" | "en"}
            />
          ))}
        </div>
      </section>

      <section className="relative h-[80vh] min-h-[560px] w-full overflow-hidden bg-bone">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-ink/30" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 py-20 md:px-10">
          <p className="eyebrow text-paper/80">{t("featuredCollection")}</p>
          <h3 className="display mt-4 max-w-2xl text-5xl text-paper md:text-7xl">
            Drop 01 — Where stillness meets movement.
          </h3>
          <Link
            href="/drops"
            className="caps-wide mt-10 inline-flex w-fit items-center gap-3 border border-paper px-8 py-4 text-xs text-paper hover:bg-paper hover:text-ink"
          >
            {t("viewCollection")} →
          </Link>
        </div>
      </section>

      <Newsletter />
    </>
  );
}
