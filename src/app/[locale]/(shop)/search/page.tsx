import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { searchProducts } from "@/lib/shop";
import { SearchInput } from "./search-input";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Arama",
  description: "Modaralist'te ara",
};

export default async function SearchPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";
  const { q = "" } = await searchParams;

  const query = q.trim();
  const results = query.length >= 2 ? await searchProducts(query, lang, 50) : [];

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-40">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — arama
          </p>
        </Reveal>
        <h1 className="display mt-6 text-[12vw] leading-[0.95] md:text-[7vw]">
          Ne arıyorsun?
        </h1>
        <div className="mt-12 max-w-2xl">
          <SearchInput initialQuery={query} />
        </div>
        {query.length >= 2 ? (
          <p className="mt-8 text-[11px] uppercase tracking-[0.3em] text-mist">
            &ldquo;{query}&rdquo; — {results.length} sonuç
          </p>
        ) : query.length > 0 ? (
          <p className="mt-8 text-sm text-mist">
            Aramak için en az 2 karakter yaz.
          </p>
        ) : null}
      </section>

      <section className="mx-auto mt-16 max-w-[1600px] px-5 pb-32 md:px-10 md:mt-20">
        {results.length === 0 && query.length >= 2 ? (
          <div className="border-y border-line py-32 text-center">
            <p className="display text-4xl italic text-mist">
              Sonuç bulunamadı
            </p>
            <p className="mt-4 text-sm text-mist">
              Farklı bir kelime dene — slug, ürün adı, açıklama içinde arıyoruz.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
            {results.map((p, i) => (
              <ProductCard
                key={p.slug}
                product={{
                  slug: p.slug,
                  name: p.name,
                  dropLabel: p.dropLabel ?? "",
                  price: p.price,
                  image: p.images[0] ?? "",
                  hoverImage: p.hoverImage ?? undefined,
                  soldOut: p.soldOut,
                }}
                locale={lang}
                index={i}
              />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
