import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { ProductCard } from "@/components/shop/product-card";
import { Countdown } from "@/components/shop/countdown";
import { NotifyMe } from "@/components/shop/notify-me";
import { Marquee } from "@/components/shop/marquee";
import {
  getCollection,
  getCollectionProducts,
  DEMO_COLLECTIONS,
} from "@/lib/demo-data";

export async function generateStaticParams() {
  return DEMO_COLLECTIONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug } = await params;
  const c = getCollection(slug);
  if (!c) return { title: "Bulunamadı" };
  return {
    title: c.name,
    description: c.tagline,
    openGraph: { images: [{ url: c.heroImage }] },
  };
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);

  const collection = getCollection(slug);
  if (!collection) notFound();

  const products = getCollectionProducts(slug);
  const isUpcoming = collection.status === "UPCOMING";

  return (
    <>
      <section className="relative h-[100svh] min-h-[640px] w-full overflow-hidden bg-ink">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${collection.heroImage}')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 py-10 md:px-10 md:py-14">
          <p className="text-[10px] uppercase tracking-[0.4em] text-paper/80">
            {isUpcoming ? "○ Yakında" : "● Şu an satışta"}
          </p>

          <div className="space-y-10">
            <SplitText
              text={collection.name}
              as="h1"
              className="display text-[14vw] leading-[0.9] text-paper md:text-[8vw]"
            />
            <Reveal delay={0.4}>
              <p className="max-w-2xl text-lg text-paper/80 md:text-2xl">
                {collection.tagline}
              </p>
            </Reveal>

            {isUpcoming && (
              <Reveal delay={0.6}>
                <div className="grid gap-8 border-t border-paper/20 pt-10 md:grid-cols-2 md:items-end md:gap-16">
                  <Countdown target={collection.startsAt} />
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
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-40">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — manifesto
          </p>
        </Reveal>
        <div className="mt-10 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-7">
            <SplitText
              text={collection.tagline}
              as="h2"
              className="display text-[8vw] leading-[1] md:text-[4.5vw]"
            />
          </div>
          <div className="md:col-span-5">
            <Reveal delay={0.3}>
              <p className="text-base leading-relaxed text-mist">
                {collection.description}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {products.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-5 pb-40 md:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — koleksiyon
            </p>
          </Reveal>
          <h2 className="display mt-6 text-[8vw] leading-[1] md:text-[4vw]">
            {products.length} parça
          </h2>
          <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
            {products.map((p, i) => (
              <ProductCard
                key={p.slug}
                product={{
                  slug: p.slug,
                  name: p.name,
                  dropLabel: p.dropLabel,
                  price: p.price,
                  image: p.images[0],
                  hoverImage: p.images[1],
                  soldOut: p.soldOut,
                }}
                locale={locale as "tr" | "en"}
                index={i}
              />
            ))}
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
        items={["MODARALIST", collection.name.toUpperCase(), "LIMITED", "MODARALIST"]}
      />
    </>
  );
}
