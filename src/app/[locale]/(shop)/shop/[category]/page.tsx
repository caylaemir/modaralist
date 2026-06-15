import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { Marquee } from "@/components/shop/marquee";
import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { CATEGORY_SEO_TR, MARMARA_REGION } from "@/lib/category-seo";
import { getProductsByCategoryTree } from "@/lib/shop";
import { ShopGrid } from "../shop-grid";
import type { Locale } from "@prisma/client";

export const revalidate = 1800; // 30 dk cache

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; locale: string }>;
}) {
  const { category, locale } = await params;
  const lang = (locale === "en" ? "en" : "tr") as Locale;

  // SEO content statik dosyada varsa onu kullan, yoksa DB'den uret
  const seoStatic = CATEGORY_SEO_TR[category];
  let seo = seoStatic;
  if (!seo) {
    const cat = await db.category
      .findUnique({
        where: { slug: category },
        include: { translations: { where: { locale: lang } } },
      })
      .catch(() => null);
    if (!cat || !cat.isActive) return { title: "Kategori bulunamadı" };
    const tr = cat.translations[0];
    seo = {
      slug: cat.slug,
      name: tr?.name ?? cat.slug,
      h1: tr?.name ?? cat.slug,
      metaTitle: tr?.seoTitle ?? `${tr?.name ?? cat.slug} | Modaralist`,
      metaDescription: tr?.seoDesc ?? tr?.description ?? "",
      intro: tr?.description ?? "",
      longDescription: tr?.description ?? "",
      keywords: [],
    };
  }

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

  // DB'den kategoriyi cek — isActive=false ise 404 (gizli)
  // children'lerin de torun (grandchildren) ID'lerini cekiyoruz ki her alt
  // kategorinin "X parça" sayisini TUM alt-agacindan (kendi + cocuklari) +
  // M:N pivot'tan (ProductCategory) hesaplayalim. Default _count sadece o
  // kategoriye DIREKT atanmis publishedleri sayar — uc-seviyeli yapida ve
  // cross-listing varken yanlis sonuc verir.
  const cat = await db.category.findUnique({
    where: { slug: category },
    include: {
      translations: { where: { locale: lang } },
      children: {
        where: { isActive: true },
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
        include: {
          translations: { where: { locale: lang } },
          children: {
            where: { isActive: true },
            select: { id: true },
          },
          products: {
            where: { status: "PUBLISHED" },
            take: 1,
            orderBy: { createdAt: "desc" },
            select: {
              images: {
                where: { isHover: false },
                orderBy: { sortOrder: "asc" },
                take: 1,
                select: { url: true },
              },
            },
          },
        },
      },
    },
  });
  if (!cat || !cat.isActive) notFound();

  // Her alt kategorinin alt-agac (kendi + cocuklari) icin DOGRU urun sayisi:
  // categoryId DIREKT eslesir VEYA ProductCategory pivot'undan eslesir.
  // Tek sorgu daha verimli olabilirdi ama paralel countlar yeterince hizli
  // (en fazla ~6 cocuk) ve kod basit kalir.
  const childCounts = await Promise.all(
    cat.children.map(async (child) => {
      const subtree = [child.id, ...child.children.map((g) => g.id)];
      const count = await db.product.count({
        where: {
          status: "PUBLISHED",
          OR: [
            { categoryId: { in: subtree } },
            { extraCategories: { some: { categoryId: { in: subtree } } } },
          ],
        },
      });
      return [child.id, count] as const;
    })
  );
  const productCountByChild = new Map<string, number>(childCounts);

  // "Diger kategoriler" — DB'den aktif top-level'lar (deactivate edilen
  // 'polar' gibi eski kategoriler artik gozukmesin).
  const otherTopLevels = await db.category.findMany({
    where: { isActive: true, parentId: null, slug: { not: category } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      translations: { where: { locale: lang } },
    },
  });

  // SEO icerigi varsa kullan, yoksa DB'den uret (alt kategoriler vs. icin fallback)
  const seoStatic = CATEGORY_SEO_TR[category];
  const trData = cat.translations[0];
  const seo = seoStatic ?? {
    slug: cat.slug,
    name: trData?.name ?? cat.slug,
    h1: trData?.name ?? cat.slug,
    metaTitle: trData?.seoTitle ?? `${trData?.name ?? cat.slug} | Modaralist`,
    metaDescription: trData?.seoDesc ?? trData?.description ?? "",
    intro: trData?.description ?? "",
    longDescription: trData?.description ?? "",
    keywords: [],
  };

  // Urunleri parent + children kategorilerden topla (alt kategori varsa hepsi gelsin)
  // ShopGrid (filter destekli) icin ShopProduct formatinda urun listesi
  // — bu kategorinin ve children'inin altindaki tum PUBLISHED urunleri.
  const products = await getProductsByCategoryTree(seo.slug, lang).catch(
    () => [] as Awaited<ReturnType<typeof getProductsByCategoryTree>>
  );

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.com";

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
          {/* Kategori adi sadelestirilmis hero — tek kelime, italic display.
              SEO H1 (seo.h1) sadelik icin gizli h1 olarak korunur (Google'a
              gider, kullanici sadece kategori adini gorur). */}
          <h1 className="display mt-4 text-[18vw] italic leading-[0.9] md:text-[8vw]">
            {seo.name.toLowerCase()}.
          </h1>
          {seo.h1 && seo.h1 !== seo.name ? (
            <p className="mt-6 max-w-2xl text-[11px] uppercase tracking-[0.35em] text-mist">
              {seo.h1}
            </p>
          ) : null}
        </Reveal>

        <Reveal delay={0.2}>
          <p className="mt-8 max-w-2xl text-base leading-relaxed text-ink/80 md:text-lg">
            {seo.intro}
          </p>
        </Reveal>
      </section>

      {cat.children.length > 0 ? (
        <section className="mx-auto mt-20 max-w-[1600px] px-5 md:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — alt kategoriler
            </p>
            <h2 className="display mt-4 text-2xl md:text-3xl">
              {seo.name} altındakiler
            </h2>
          </Reveal>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
            {cat.children.map((child) => {
              const childTr = child.translations[0];
              const cover = child.bannerUrl ?? child.products[0]?.images[0]?.url;
              const name = childTr?.name ?? child.slug;
              return (
                <Link
                  key={child.id}
                  href={`/shop/${child.slug}`}
                  className="group relative block aspect-[4/3] overflow-hidden bg-sand"
                >
                  {cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={name}
                      className="size-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="size-full bg-gradient-to-br from-bone via-sand to-bone" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4">
                    <div>
                      <p className="display text-xl text-paper md:text-2xl">{name}</p>
                      <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-paper/70">
                        {productCountByChild.get(child.id) ?? 0} parça
                      </p>
                    </div>
                    <span aria-hidden className="text-paper">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

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
          // Filter destekli grid — magaza ana sayfasiyla ayni component.
          // hideCategorySection: zaten o kategorideyiz, 'Kategori' filtresine
          // gerek yok.
          <ShopGrid
            products={products}
            categories={[]}
            locale={lang}
            hideCategorySection
          />
        )}
      </section>

      {/* SEO + brand context — premium asimetrik layout */}
      <section className="mt-40 border-t border-line bg-bone/30">
        <div className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
          {/* Hakkinda — 12-col asimetrik */}
          <div className="grid gap-10 md:grid-cols-12 md:gap-16">
            <div className="md:col-span-5">
              <Reveal>
                <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                  — {seo.name.toLowerCase()} koleksiyonu
                </p>
                <h2 className="display mt-6 text-[8vw] leading-[0.95] md:text-[3.5vw]">
                  <span className="italic">Marmara'nın</span>
                  <br />
                  {seo.name.toLowerCase()} adresi
                </h2>
              </Reveal>
            </div>
            <div className="md:col-span-7 md:pt-6">
              <Reveal delay={0.15}>
                <p className="text-base leading-relaxed text-ink/85 md:text-lg">
                  {seo.longDescription}
                </p>
              </Reveal>
            </div>
          </div>

          {/* Hizmet seridi — 3 column trust badges */}
          <div className="mt-20 grid gap-6 border-t border-line pt-12 md:grid-cols-3 md:gap-12 md:pt-16">
            <Reveal delay={0.1}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                  — Kargo
                </p>
                <p className="display mt-3 text-2xl">1-2 iş günü</p>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  Marmara bölgesinin tüm şehirlerine: {MARMARA_REGION.cities.join(", ")}.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                  — Üretim
                </p>
                <p className="display mt-3 text-2xl">Bursa atölyesi</p>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  Türkiye'nin tekstil başkenti — kumaştan dikişe, baskıdan etikete kadar bizim kontrolümüzde.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.3}>
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                  — İade
                </p>
                <p className="display mt-3 text-2xl">14 gün koşulsuz</p>
                <p className="mt-3 text-sm leading-relaxed text-mist">
                  Ücretsiz iade kargo (Aras). Etiketler takılı oldukça beğenmediğin parçayı geri yolla, paranı al.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Diğer kategoriler — full-width görsel grid */}
      {otherTopLevels.length > 0 ? (
        <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-32">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — koleksiyon devam
            </p>
            <h2 className="display mt-4 text-3xl md:text-5xl">
              <span className="italic">Diğer</span> kategoriler
            </h2>
          </Reveal>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-5 md:gap-x-6">
            {otherTopLevels.map((c) => {
              const cTr = c.translations[0];
              const name = cTr?.name ?? c.slug;
              return (
                <Link
                  key={c.id}
                  href={`/shop/${c.slug}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-bone">
                    {c.bannerUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={c.bannerUrl}
                        alt={name}
                        className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="size-full bg-gradient-to-br from-bone via-sand to-bone" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" />
                  </div>
                  <p className="display mt-4 text-lg group-hover:italic">
                    {name}
                  </p>
                  <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-mist transition-colors group-hover:text-ink">
                    Keşfet →
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

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
