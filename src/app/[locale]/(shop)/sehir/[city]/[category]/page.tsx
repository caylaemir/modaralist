import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { ProductCard } from "@/components/shop/product-card";
import {
  getCityBySlug,
  MARMARA_CITY_SLUGS,
  MARMARA_CITIES,
} from "@/lib/marmara-cities";
import { CATEGORY_SEO_TR } from "@/lib/category-seo";
import { db } from "@/lib/db";
import type { Locale } from "@prisma/client";

export const revalidate = 3600;

export function generateStaticParams() {
  // 11 sehir x 7 kategori x 2 locale = 154 statik path
  const params: Array<{ locale: string; city: string; category: string }> = [];
  for (const city of MARMARA_CITY_SLUGS) {
    for (const category of Object.keys(CATEGORY_SEO_TR)) {
      for (const locale of ["tr", "en"]) {
        params.push({ locale, city, category });
      }
    }
  }
  return params;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string; locale: string }>;
}): Promise<Metadata> {
  const { city: citySlug, category, locale } = await params;
  const city = getCityBySlug(citySlug);
  const seo = CATEGORY_SEO_TR[category];
  if (!city || !seo) return { title: "Bulunamadı" };

  const title = `${city.name} ${seo.name} — Modaralist`;
  const description = `${city.name}'de ${seo.name.toLowerCase()} modelleri. ${city.districts.slice(0, 3).join(", ")} ve diğer ilçelere 1-2 iş günü kargo.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/sehir/${citySlug}/${category}`,
    },
    openGraph: {
      title,
      description,
      locale: locale === "en" ? "en_US" : "tr_TR",
    },
    other: {
      "geo.region": city.isoRegion,
      "geo.placename": city.name,
      "geo.position": `${city.lat};${city.lng}`,
      ICBM: `${city.lat}, ${city.lng}`,
    },
  };
}

export default async function CityCategoryPage({
  params,
}: {
  params: Promise<{ city: string; category: string; locale: string }>;
}) {
  const { city: citySlug, category, locale } = await params;
  setRequestLocale(locale);
  const city = getCityBySlug(citySlug);
  const seo = CATEGORY_SEO_TR[category];
  if (!city || !seo) notFound();

  const lang = (locale === "en" ? "en" : "tr") as Locale;

  const cat = await db.category.findUnique({
    where: { slug: category },
    include: { translations: { where: { locale: lang } } },
  });
  if (!cat) notFound();

  const products = await db.product.findMany({
    where: { status: "PUBLISHED", categoryId: cat.id },
    take: 12,
    orderBy: { createdAt: "desc" },
    include: {
      translations: { where: { locale: lang } },
      images: { orderBy: { sortOrder: "asc" }, take: 2 },
    },
  });

  const productCards = products.map((p) => ({
    slug: p.slug,
    name: p.translations[0]?.name ?? p.slug,
    dropLabel: "",
    price: Number(p.basePrice),
    image: p.images[0]?.url ?? "",
    hoverImage: p.images[1]?.url,
    soldOut: false,
  }));

  // BreadcrumbList JSON-LD: 4 seviye (ana > sehirler > sehir > kategori)
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: `https://modaralist.shop/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: city.name,
        item: `https://modaralist.shop/${locale}/sehir/${citySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: `${city.name} ${seo.name}`,
      },
    ],
  };

  // CollectionPage + LocalBusiness combine
  const pageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${city.name} ${seo.name}`,
    description: `${city.name}'de ${seo.name.toLowerCase()} modelleri`,
    url: `https://modaralist.shop/${locale}/sehir/${citySlug}/${category}`,
    isPartOf: {
      "@type": "WebSite",
      name: "Modaralist",
      url: "https://modaralist.shop",
    },
    about: {
      "@type": "Place",
      name: city.name,
      geo: {
        "@type": "GeoCoordinates",
        latitude: city.lat,
        longitude: city.lng,
      },
    },
  };

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-20 pb-32 md:px-10 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageLd) }}
      />

      {/* Breadcrumb nav */}
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.3em] text-mist"
      >
        <Link href="/" className="hover:text-ink">
          Ana
        </Link>
        <span className="mx-2">·</span>
        <Link href={`/sehir/${citySlug}`} className="hover:text-ink">
          {city.name}
        </Link>
        <span className="mx-2">·</span>
        <span className="text-ink">{seo.name}</span>
      </nav>

      <Reveal>
        <p className="mt-8 text-[10px] uppercase tracking-[0.4em] text-mist">
          — {city.name} {seo.name.toLowerCase()}
        </p>
      </Reveal>
      <SplitText
        text={`${city.name} ${seo.name}`}
        as="h1"
        className="display mt-6 text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-mist md:text-lg">
          <strong className="text-ink">{city.name}</strong> içinde{" "}
          <strong className="text-ink">{seo.name.toLowerCase()}</strong> arıyorsan
          doğru yerdesin. {city.blurb}{" "}
          {seo.intro}
        </p>
      </Reveal>

      {productCards.length > 0 ? (
        <section className="mt-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — {city.name}'ye gönderilebilir
          </p>
          <h2 className="display mt-4 text-3xl md:text-4xl">
            {productCards.length} parça
          </h2>
          <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
            {productCards.map((p, i) => (
              <ProductCard key={p.slug} product={p} locale={lang} index={i} />
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link
              href={`/shop/${category}`}
              className="inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.35em]"
            >
              Tüm {seo.name} modelleri{" "}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </section>
      ) : (
        <section className="mt-16 border-t border-line pt-10">
          <p className="text-sm text-mist">
            Bu kategoride henüz parça yok.{" "}
            <Link href="/shop" className="underline">
              Tüm mağazaya göz at
            </Link>
            .
          </p>
        </section>
      )}

      {/* Long content for SEO */}
      <section className="mt-24 max-w-3xl border-t border-line pt-10">
        <h2 className="display text-2xl md:text-3xl">
          {city.name}'de {seo.name} alışverişi
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-mist md:text-base">
          {seo.longDescription}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-mist md:text-base">
          Modaralist olarak {city.name}'nin{" "}
          <strong className="text-ink">{city.districts.join(", ")}</strong>{" "}
          ilçelerine standart kargoyla 1-2 iş günü içinde teslimat yapıyoruz.
          Hızlı kargo seçeneğinde ertesi iş günü teslim. KVKK uyumlu güvenli
          ödeme + 14 gün koşulsuz iade.
        </p>
      </section>

      <section className="mt-16 border-t border-line pt-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — diğer şehirler
        </p>
        <p className="mt-3 text-sm text-mist">
          Aynı kategori başka bir şehirde:
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {MARMARA_CITIES.filter((c) => c.slug !== citySlug)
            .slice(0, 6)
            .map((c) => (
              <Link
                key={c.slug}
                href={`/sehir/${c.slug}/${category}`}
                className="border border-line bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-mist transition-colors hover:border-ink hover:text-ink"
              >
                {c.name} {seo.name}
              </Link>
            ))}
        </div>
      </section>
    </main>
  );
}
