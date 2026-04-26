import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { CategoriesGrid } from "@/components/shop/categories-grid";
import {
  getCityBySlug,
  MARMARA_CITY_SLUGS,
  MARMARA_CITIES,
} from "@/lib/marmara-cities";
import { CATEGORY_SEO_TR } from "@/lib/category-seo";
import { getCategoriesWithCover } from "@/lib/shop";

export const revalidate = 3600;

export function generateStaticParams() {
  // tr + en x 11 sehir = 22 statik path
  return MARMARA_CITY_SLUGS.flatMap((city) =>
    ["tr", "en"].map((locale) => ({ locale, city }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; locale: string }>;
}): Promise<Metadata> {
  const { city: citySlug } = await params;
  const city = getCityBySlug(citySlug);
  if (!city) return { title: "Bulunamadı" };
  return {
    title: `${city.name} — Streetwear & Outdoor | Modaralist`,
    description: `${city.name}'ye 1-2 iş günü kargo. Tişört, sweatshirt, oversize, outdoor, polar, eşofman, şort. ${city.districts.slice(0, 4).join(", ")} ve diğer ilçelere ulaşan Modaralist koleksiyonu.`,
    alternates: {
      canonical: `/sehir/${citySlug}`,
    },
    openGraph: {
      title: `${city.name} — Modaralist`,
      description: `${city.name}'ye hızlı kargo, sınırlı üretim streetwear.`,
    },
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ city: string; locale: string }>;
}) {
  const { city: citySlug, locale } = await params;
  setRequestLocale(locale);
  const city = getCityBySlug(citySlug);
  if (!city) notFound();

  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";
  const categories = await getCategoriesWithCover(lang, 12);

  // LocalBusiness JSON-LD: Google'a sehir-spesifik isletme sinyali
  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "OnlineStore",
    name: `Modaralist — ${city.name}`,
    url: `https://modaralist.shop/${locale}/sehir/${citySlug}`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Marmara Bölgesi",
      },
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lng,
    },
  };

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
        name: "Şehirler",
        item: `https://modaralist.shop/${locale}/sehir/${citySlug}`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: city.name,
      },
    ],
  };

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-20 pb-32 md:px-10 md:pt-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — marmara bölgesi
        </p>
      </Reveal>
      <SplitText
        text={`${city.name} — Modaralist.`}
        as="h1"
        className="display mt-6 text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <p className="mt-10 max-w-2xl text-lg leading-relaxed text-mist">
          {city.blurb}
        </p>
      </Reveal>

      <section className="mt-20">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — kategoriler
          </p>
          <h2 className="display mt-4 text-3xl md:text-5xl">
            {city.name}'ye gönderdiğimiz parçalar
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-2 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(CATEGORY_SEO_TR).map((cat) => (
            <Link
              key={cat.slug}
              href={`/sehir/${citySlug}/${cat.slug}`}
              className="group flex items-center justify-between border border-line bg-bone/40 px-5 py-5 transition-colors hover:border-ink hover:bg-paper"
            >
              <div>
                <p className="display text-2xl">
                  {city.name} {cat.name}
                </p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-mist">
                  {cat.name.toLowerCase()} modelleri →
                </p>
              </div>
              <ArrowUpRight className="size-5 text-mist transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-ink" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — ürün kategorileri
          </p>
          <h2 className="display mt-4 text-3xl md:text-5xl">Tüm parçalar</h2>
        </Reveal>
        <div className="mt-12">
          <CategoriesGrid categories={categories} locale={lang} />
        </div>
      </section>

      <section className="mt-20 border-t border-line pt-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — ilçeler
        </p>
        <p className="mt-3 text-sm text-mist">
          {city.name}'nin{" "}
          <strong className="text-ink">
            {city.districts.join(", ")}
          </strong>{" "}
          ilçelerine standart kargoyla 1-2 iş günü içinde teslim.
        </p>
      </section>

      <section className="mt-16 border-t border-line pt-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — diğer marmara şehirleri
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          {MARMARA_CITIES.filter((c) => c.slug !== citySlug).map((c) => (
            <Link
              key={c.slug}
              href={`/sehir/${c.slug}`}
              className="border border-line bg-paper px-4 py-2 text-[11px] uppercase tracking-[0.25em] text-mist transition-colors hover:border-ink hover:text-ink"
            >
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
