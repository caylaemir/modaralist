import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ProductGallery } from "@/components/shop/product-gallery";
import { ProductActions } from "@/components/shop/product-actions";
import { ProductCard } from "@/components/shop/product-card";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { Link } from "@/i18n/navigation";
import { getProduct, getRelatedProducts } from "@/lib/shop";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";
  const product = await getProduct(slug, lang);
  if (!product) return { title: "Bulunamadı" };
  return {
    title: product.dropLabel
      ? `${product.name} — ${product.dropLabel}`
      : product.name,
    description: product.description.slice(0, 160),
    openGraph: {
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";

  const [product, related] = await Promise.all([
    getProduct(slug, lang),
    getRelatedProducts(slug, lang),
  ]);

  if (!product) notFound();

  const base = process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";
  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.images,
    sku: product.slug,
    brand: { "@type": "Brand", name: "Modaralist" },
    offers: {
      "@type": "Offer",
      url: `${base}/${locale}/products/${product.slug}`,
      priceCurrency: "TRY",
      price: product.discountPrice ?? product.price,
      availability: product.soldOut
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: locale === "en" ? "Home" : "Ana Sayfa",
        item: `${base}/${locale}`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: locale === "en" ? "Shop" : "Mağaza",
        item: `${base}/${locale}/shop`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: product.name,
        item: `${base}/${locale}/products/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <div className="mx-auto max-w-[1600px] px-5 pt-10 md:px-10 md:pt-14">
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
            <span className="text-ink">{product.name}</span>
          </nav>
        </Reveal>
      </div>

      <section className="mx-auto mt-10 grid max-w-[1600px] gap-10 px-5 md:mt-16 md:grid-cols-12 md:px-10">
        <div className="md:col-span-7 lg:col-span-8">
          <ProductGallery images={product.images} alt={product.name} />
        </div>
        <div className="md:col-span-5 lg:col-span-4">
          <ProductActions product={product} locale={locale as "tr" | "en"} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto mt-40 max-w-[1600px] px-5 md:px-10">
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — benzerleri
            </p>
          </Reveal>
          <SplitText
            text="daha da derine inmek için."
            as="h2"
            className="display mt-6 max-w-4xl text-[8vw] leading-[0.95] md:text-[4.5vw]"
          />
          <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
            {related.map((p, i) => (
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
                locale={locale as "tr" | "en"}
                index={i}
              />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
