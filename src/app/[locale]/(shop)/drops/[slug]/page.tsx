import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { ShopGrid } from "../../shop/shop-grid";
import { Countdown } from "@/components/shop/countdown";
import { NotifyMe } from "@/components/shop/notify-me";
import { Marquee } from "@/components/shop/marquee";
import { getCollection, getCollectionProducts, getTopLevelCategories } from "@/lib/shop";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";
  const c = await getCollection(slug, lang);
  if (!c) return { title: "Bulunamadı" };
  return {
    title: c.name,
    description: c.tagline ?? undefined,
    openGraph: c.heroImageUrl ? { images: [{ url: c.heroImageUrl }] } : undefined,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";

  const [collection, products, topLevelCats] = await Promise.all([
    getCollection(slug, lang),
    getCollectionProducts(slug, lang),
    getTopLevelCategories(lang),
  ]);

  if (!collection) notFound();

  const isUpcoming = collection.status === "UPCOMING";
  const heroBgStyle = collection.heroImageUrl?.startsWith("http")
    ? { backgroundImage: `url('${collection.heroImageUrl}')` }
    : { background: "linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)" };

  return (
    <>
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={heroBgStyle}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 py-10 md:px-10 md:py-14">
          <p className="text-[10px] uppercase tracking-[0.4em] text-paper/80">
            {isUpcoming
              ? "○ Yakında"
              : collection.status === "SOLD_OUT"
                ? "○ Tükendi"
                : "● Şu an satışta"}
          </p>

          <div className="space-y-10">
            <SplitText
              text={collection.name}
              as="h1"
              className="display text-[14vw] leading-[0.9] text-paper md:text-[8vw]"
            />
            {collection.tagline ? (
              <Reveal delay={0.4}>
                <p className="max-w-2xl text-lg text-paper/80 md:text-2xl">
                  {collection.tagline}
                </p>
              </Reveal>
            ) : null}

            {isUpcoming && collection.startsAt ? (
              <Reveal delay={0.6}>
                <div className="grid gap-8 border-t border-paper/20 pt-10 md:grid-cols-2 md:items-end md:gap-16">
                  <Countdown target={collection.startsAt.toISOString()} />
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.3em] text-paper/60">
                      Drop açıldığında haberin olsun
                    </p>
                    <div className="mt-4">
                      <NotifyMe collectionSlug={collection.slug} />
                    </div>
                  </div>
                </div>
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {collection.tagline || collection.description ? (
        <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-40">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — manifesto
            </p>
          </Reveal>
          <div className="mt-10 grid gap-16 md:grid-cols-12">
            <div className="md:col-span-7">
              {collection.tagline ? (
                <SplitText
                  text={collection.tagline}
                  as="h2"
                  className="display text-[8vw] leading-[1] md:text-[4.5vw]"
                />
              ) : null}
            </div>
            <div className="md:col-span-5">
              {collection.description ? (
                <Reveal delay={0.3}>
                  <p className="text-base leading-relaxed text-mist">
                    {collection.description}
                  </p>
                </Reveal>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {products.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-5 pb-40 md:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — koleksiyon
            </p>
            <h2 className="display mt-6 text-[8vw] leading-[1] md:text-[4vw]">
              {products.length} parça
            </h2>
            <p className="mt-4 max-w-2xl text-sm text-mist">
              Filtreden kategori, beden, renk veya cinsiyet seçerek
              koleksiyonu keşfet.
            </p>
          </Reveal>
          {/* Filter destekli grid — kategori sayfasiyla ayni component.
              Bu sayfada 'Kategori' bolumu aktif: drop icindeki kategoriler
              arasi filtrelemek mantikli (Tshirt / Sweatshirt / vs.) */}
          <div className="mt-12">
            <ShopGrid
              products={products}
              categories={topLevelCats}
              locale={locale as "tr" | "en"}
            />
          </div>
        </section>
      ) : (
        <section className="mx-auto max-w-[1600px] px-5 py-40 md:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — sabret
            </p>
            <p className="display mt-6 text-4xl md:text-6xl">
              Parçalar henüz sessiz. Drop açıldığında buradalar.
            </p>
          </Reveal>
        </section>
      )}

      <Marquee
        items={[
          "MODARALIST",
          collection.name.toUpperCase(),
          "LIMITED",
          "MODARALIST",
        ]}
      />
    </>
  );
}
