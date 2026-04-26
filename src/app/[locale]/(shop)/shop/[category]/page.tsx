import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { Marquee } from "@/components/shop/marquee";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { CATEGORY_SEO_TR, MARMARA_REGION } from "@/lib/category-seo";
import type { Locale } from "@prisma/client";

export const revalidate = 1800; // 30 dk cache

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category, locale } = await params;
  const seo = CATEGORY_SEO_TR[category];
  if (!seo) return { title: "Kategori bulunamadı" };

  // Locale-aware metaTitle/Description — TR'yi bizler doldurduk, EN icin
  // basit otomatik cevirme: kategori adi degismez (Tshirt, Sweatshirt vs.)
  const isEn = locale === "en";
  const metaTitle = isEn
    ? `${seo.name} | Marmara Online Store | Modaralist`
    : seo.metaTitle;
  const metaDescription = isEn
    ? `${seo.name} models in Marmara region — Modaralist. Fast shipping to Istanbul, Bursa, Kocaeli. Limited drops, premium fabric.`
    : seo.metaDescription;

  return {
    title: metaTitle,
    description: metaDescription,
    keywords: seo.keywords.join(", "),
    alternates: {
      canonical: `/${locale}/shop/${category}`,
      languages: {
        tr: `/tr/shop/${category}`,
        en: `/en/shop/${category}`,
        "x-default": `/tr/shop/${category}`,
      },
    },
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      type: "website",
      locale: isEn ? "en_US" : "tr_TR",
      alternateLocale: isEn ? "tr_TR" : "en_US",
    },
    other: {
      "geo.region": MARMARA_REGION.geo.region,
      "geo.placename": MARMARA_REGION.geo.placename,
      "geo.position": `${MARMARA_REGION.geo.latitude};${MARMARA_REGION.geo.longitude}`,
      ICBM: `${MARMARA_REGION.geo.latitude}, ${MARMARA_REGION.geo.longitude}`,
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category, locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as Locale;

  const seo = CATEGORY_SEO_TR[category];
  if (!seo) notFound();

  const cat = await db.category.findUnique({
    where: { slug: category },
    include: { translations: { where: { locale: lang } } },
  });
  if (!cat) notFound();

  const products = await db.product
    .findMany({
      where: { status: "PUBLISHED", categoryId: cat.id },
      orderBy: { createdAt: "desc" },
      include: {
        translations: { where: { locale: lang } },
        images: { orderBy: { sortOrder: "asc" }, take: 2 },
        variants: { where: { isActive: true }, select: { stock: true } },
        collections: {
          take: 1,
          include: {
            collection: {
              include: { translations: { where: { locale: lang } } },
            },
          },
        },
      },
    })
    .catch(() => []);

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";

  // Breadcrumb JSON-LD
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: `${base}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Mağaza",
        item: `${base}/${locale}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: seo.name,
        item: `${base}/${locale}/shop/${seo.slug}`,
      },
    ],
  };

  // CollectionPage JSON-LD (Google'a kategori sayfası tipini bildirir)
  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.name,
    description: seo.metaDescription,
    url: `${base}/${locale}/shop/${seo.slug}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Modaralist",
      url: base,
    },
    about: {
      "@type": "Thing",
      name: seo.name,
    },
    audience: {
      "@type": "GeoShape",
      addressRegion: "Marmara",
      addressCountry: "TR",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd),
        }}
      />

      <section className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-40">
        <Reveal>
          <nav className="flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-mist">
            <Link href="/" className="hover:text-ink">
              Ana Sayfa
            </Link>
            <span>/</span>
            <Link href="/shop" className="hover:text-ink">
              Mağaza
            </Link>
            <span>/</span>
            <span className="text-ink">{seo.name}</span>
          </nav>
        </Reveal>

        <Reveal delay={0.1}>
          <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-mist">
            — kategori
          </p>
          <h1 className="display mt-6 max-w-5xl text-[10vw] leading-[0.95] md:text-[6vw]">
            {seo.h1}
          </h1>
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-mist">
            {seo.intro}
          </p>
        </Reveal>
      </section>

      <section className="mx-auto mt-20 max-w-[1600px] px-5 md:px-10">
        {products.length === 0 ? (
          <div className="border-y border-line py-32 text-center">
            <p className="display text-4xl italic text-mist">
              Bu kategoride henüz ürün yok
            </p>
            <p className="mt-4 text-sm text-mist">
              Yakında eklenecek. Tüm ürünleri görmek için mağazaya git.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
            >
              Tüm Mağaza →
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-12 text-[11px] uppercase tracking-[0.3em] text-mist">
              {products.length} parça
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
              {products.map((p, i) => {
                const tr = p.translations[0];
                const totalStock = p.variants.reduce(
                  (s, v) => s + v.stock,
                  0
                );
                const drop = p.collections[0]?.collection;
                const dropTr = drop?.translations[0];
                return (
                  <ProductCard
                    key={p.slug}
                    product={{
                      slug: p.slug,
                      name: tr?.name ?? p.slug,
                      dropLabel: dropTr?.name ?? "",
                      price: p.discountPrice
                        ? Number(p.discountPrice)
                        : Number(p.basePrice),
                      image: p.images[0]?.url ?? "",
                      hoverImage: p.images[1]?.url,
                      soldOut: totalStock === 0,
                    }}
                    locale={lang}
                    index={i}
                  />
                );
              })}
            </div>
          </>
        )}
      </section>

      {/* SEO odaklı uzun açıklama — kategorinin altında */}
      <section className="mx-auto mt-32 max-w-3xl px-5 pb-32 md:px-10">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — {seo.name.toLowerCase()} hakkında
          </p>
          <h2 className="display mt-6 text-3xl md:text-4xl">
            Marmara'nın {seo.name.toLowerCase()} adresi
          </h2>
          <p className="mt-8 text-base leading-relaxed text-mist">
            {seo.longDescription}
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <div className="mt-12 border-t border-line pt-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — kargo bölgeleri
            </p>
            <p className="mt-4 text-sm text-mist">
              Marmara bölgesinin tüm şehirlerine 1-2 iş günü içinde kargolanır:{" "}
              {MARMARA_REGION.cities.join(", ")}.
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.3}>
          <div className="mt-12 border-t border-line pt-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — diğer kategoriler
            </p>
            <ul className="mt-4 flex flex-wrap gap-3">
              {Object.values(CATEGORY_SEO_TR)
                .filter((c) => c.slug !== seo.slug)
                .map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop/${c.slug}`}
                      className="border border-line px-3 py-2 text-[11px] uppercase tracking-[0.25em] hover:border-ink"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>
        </Reveal>
      </section>

      <Marquee
        items={[
          "MODARALIST",
          seo.name.toUpperCase(),
          "MARMARA",
          "MODARALIST",
          "İSTANBUL · BURSA · KOCAELİ",
        ]}
      />
    </>
  );
}
