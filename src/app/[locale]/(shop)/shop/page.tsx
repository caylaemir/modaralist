import { setRequestLocale } from "next-intl/server";
import { Marquee } from "@/components/shop/marquee";
import { SplitText } from "@/components/shop/split-text";
import { Reveal } from "@/components/shop/reveal";
import { getProductsList, getCategoriesList } from "@/lib/shop";
import { ShopGrid } from "./shop-grid";

export const dynamic = "force-dynamic";

export default async function ShopPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";

  const [products, categories] = await Promise.all([
    getProductsList(lang),
    getCategoriesList(lang),
  ]);

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-40">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — mağaza
          </p>
        </Reveal>
        <SplitText
          text="her parça bir anın fotoğrafı."
          as="h1"
          className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
        />
        <Reveal delay={0.3}>
          <p className="mt-8 max-w-lg text-sm leading-relaxed text-mist">
            Numaralı, sınırlı üretim. Tükendiğinde arşive alınır, tekrar
            basılmaz.
          </p>
        </Reveal>
      </section>

      <div className="mx-auto mt-20 max-w-[1600px] px-5 md:px-10">
        <ShopGrid
          products={products}
          categories={categories}
          locale={lang}
        />
      </div>

      <div className="mt-32">
        <Marquee
          items={[
            "MODARALIST",
            "LIMITED EDITION",
            "MADE IN TURKEY",
            "MODARALIST",
          ]}
        />
      </div>
    </>
  );
}
