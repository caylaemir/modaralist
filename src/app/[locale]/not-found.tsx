import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { CategoriesGrid } from "@/components/shop/categories-grid";
import { ProductCard } from "@/components/shop/product-card";
import { getCategoriesWithCover, getBestSellingProducts } from "@/lib/shop";

// 404'te bos sayfa yerine kullaniciyi tutmak icin: kategori + cok satan
// urunleri gosteriyoruz. SEO icin: noindex header default Next.js'te, ama
// bu sayfa indexlenmemeli zaten.
export default async function NotFound() {
  const [categories, bestSellers] = await Promise.all([
    getCategoriesWithCover("tr", 6),
    getBestSellingProducts("tr", 4, 90),
  ]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-20 md:px-10 md:py-32">
      <div className="text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">404</p>
        <h1 className="display mt-6 text-5xl leading-[0.95] md:text-7xl">
          Bu sayfa artık bir anı.
        </h1>
        <p className="mx-auto mt-6 max-w-md text-sm text-mist">
          Aradığın şey ya taşındı ya da hiç var olmadı. Aşağıdan yola devam et.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper"
          >
            Ana Sayfa <ArrowUpRight className="size-4" />
          </Link>
          <Link
            href="/shop"
            className="inline-flex items-center gap-3 border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em]"
          >
            Tüm Mağaza
          </Link>
        </div>
      </div>

      {categories.length > 0 ? (
        <div className="mt-24">
          <p className="text-center text-[10px] uppercase tracking-[0.4em] text-mist">
            — kategoriler
          </p>
          <h2 className="display mt-4 text-center text-3xl md:text-5xl">
            Belki de aradığın bunlardan biri.
          </h2>
          <div className="mt-12">
            <CategoriesGrid categories={categories} locale="tr" />
          </div>
        </div>
      ) : null}

      {bestSellers.length > 0 ? (
        <div className="mt-24">
          <p className="text-center text-[10px] uppercase tracking-[0.4em] text-mist">
            — en çok satanlar
          </p>
          <h2 className="display mt-4 text-center text-3xl md:text-5xl">
            Veya bir göz at.
          </h2>
          <div className="mt-12 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-4 md:gap-x-6">
            {bestSellers.map((p, i) => (
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
                locale="tr"
                index={i}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
