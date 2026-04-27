import Link from "next/link";
import Image from "next/image";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductStatus } from "@prisma/client";
import { DeleteProductButton } from "./_components/delete-product-button";

export const dynamic = "force-dynamic";

type SearchParams = { status?: string };

const STATUS_FILTERS: Array<{
  key: string;
  label: string;
  value: ProductStatus | "ALL";
}> = [
  { key: "all", label: "Tümü", value: "ALL" },
  { key: "published", label: "Yayında", value: "PUBLISHED" },
  { key: "draft", label: "Taslak", value: "DRAFT" },
  { key: "archived", label: "Arşiv", value: "ARCHIVED" },
];

const STATUS_LABEL: Record<ProductStatus, string> = {
  DRAFT: "Taslak",
  PUBLISHED: "Yayında",
  ARCHIVED: "Arşiv",
  COMING_SOON: "Yakında",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const activeFilter =
    STATUS_FILTERS.find((f) => f.key === (sp.status ?? "all")) ??
    STATUS_FILTERS[0];

  const where =
    activeFilter.value === "ALL"
      ? {}
      : { status: activeFilter.value as ProductStatus };

  const [products, totalCount, publishedCount, draftCount] = await Promise.all([
    db.product.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      include: {
        translations: { where: { locale: "tr" } },
        category: {
          include: { translations: { where: { locale: "tr" } } },
        },
        images: { orderBy: { sortOrder: "asc" }, take: 1 },
        _count: { select: { variants: true } },
        variants: { select: { stock: true } },
      },
    }),
    db.product.count(),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.product.count({ where: { status: "DRAFT" } }),
  ]);

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — katalog
          </p>
          <h1 className="display mt-3 text-5xl leading-none">Ürünler</h1>
          <p className="mt-4 text-xs text-mist">
            {totalCount} ürün · {publishedCount} yayında · {draftCount} taslak
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/admin/products/bulk-price"
            className="inline-flex items-center gap-3 border border-line px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-mist hover:border-ink hover:text-ink"
          >
            ₺ Toplu Fiyat
          </Link>
          <Link
            href="/admin/products/import"
            className="inline-flex items-center gap-3 border border-line px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-mist hover:border-ink hover:text-ink"
          >
            CSV Import
          </Link>
          <Link
            href="/admin/products/new"
            className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
          >
            + Yeni Ürün
          </Link>
        </div>
      </header>

      <section className="mt-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — durum
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const isActive = f.key === activeFilter.key;
            return (
              <Link
                key={f.key}
                href={`/admin/products?status=${f.key}`}
                className={`border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                  isActive
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-mist hover:border-ink hover:text-ink"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium" />
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Ürün
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Kategori
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Fiyat
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Stok
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Güncellendi
              </th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz ürün yok
                  </p>
                  <p className="mt-4 text-sm text-mist">
                    İlk ürünü ekleyerek başla.
                  </p>
                  <Link
                    href="/admin/products/new"
                    className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                  >
                    Yeni Ürün Ekle →
                  </Link>
                </td>
              </tr>
            ) : (
              products.map((p) => {
                const tr = p.translations[0];
                const catTr = p.category?.translations[0];
                const totalStock = p.variants.reduce(
                  (sum, v) => sum + v.stock,
                  0
                );
                const firstImage = p.images[0];
                const price = Number(p.basePrice);
                const discount = p.discountPrice
                  ? Number(p.discountPrice)
                  : null;
                const stockColor =
                  totalStock === 0
                    ? "text-red-600"
                    : totalStock <= p.lowStockLimit
                      ? "text-amber-600"
                      : "text-ink";

                return (
                  <tr
                    key={p.id}
                    className="border-b border-line transition-colors hover:bg-bone/70"
                  >
                    <td className="py-4 pr-4">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="relative block size-14 overflow-hidden border border-line bg-bone"
                      >
                        {firstImage ? (
                          <Image
                            src={firstImage.url}
                            alt={firstImage.alt ?? tr?.name ?? p.slug}
                            fill
                            sizes="56px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-4 py-4">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="block"
                      >
                        <p className="font-medium text-ink">
                          {tr?.name ?? p.slug}
                        </p>
                        <p className="mt-0.5 font-mono text-[11px] text-mist">
                          {p.slug}
                        </p>
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-mist">
                      {catTr?.name ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {discount ? (
                        <div>
                          <p>{formatPrice(discount)}</p>
                          <p className="text-[11px] text-mist line-through">
                            {formatPrice(price)}
                          </p>
                        </div>
                      ) : (
                        <p>{formatPrice(price)}</p>
                      )}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`tabular-nums ${stockColor}`}>
                        {totalStock}
                      </span>
                      <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-mist">
                        / {p._count.variants}v
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-block border border-line px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-mist">
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-mist tabular-nums">
                      {dateFmt.format(p.updatedAt)}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                        >
                          Düzenle →
                        </Link>
                        <DeleteProductButton
                          id={p.id}
                          name={tr?.name ?? p.slug}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
