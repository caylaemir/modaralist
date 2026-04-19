import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ProductStatus } from "@prisma/client";
import { DeleteProductButton } from "./_components/delete-product-button";

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

const STATUS_BADGE: Record<ProductStatus, string> = {
  DRAFT: "bg-bone text-mist border-line",
  PUBLISHED: "bg-ink text-paper border-ink",
  ARCHIVED: "bg-paper text-mist border-line",
  COMING_SOON: "bg-bone text-ink border-line",
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

  const products = await db.product.findMany({
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
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-4xl">Ürünler</h1>
          <p className="mt-2 text-sm text-mist">
            Toplam {products.length} ürün listeleniyor.
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm text-paper hover:opacity-90"
        >
          <Plus className="size-4" />
          Yeni Ürün
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-8 flex gap-2">
        {STATUS_FILTERS.map((f) => {
          const isActive = f.key === activeFilter.key;
          return (
            <Link
              key={f.key}
              href={`/admin/products?status=${f.key}`}
              className={[
                "px-3 py-1.5 text-xs uppercase tracking-wider border",
                isActive
                  ? "bg-ink text-paper border-ink"
                  : "bg-paper text-mist border-line hover:text-ink",
              ].join(" ")}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      {/* Table */}
      <div className="mt-6 overflow-x-auto border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-bone text-left">
            <tr>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs">
                Görsel
              </th>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs">
                Ad
              </th>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs">
                Kategori
              </th>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs">
                Fiyat
              </th>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs">
                Stok
              </th>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs">
                Durum
              </th>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs">
                Güncellenme
              </th>
              <th className="px-4 py-3 font-normal text-mist uppercase tracking-wider text-xs text-right">
                Aksiyonlar
              </th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-12 text-center text-sm text-mist"
                >
                  Henüz ürün yok. Sağ üstten yeni ürün ekleyin.
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

                return (
                  <tr
                    key={p.id}
                    className="border-b border-line last:border-0 hover:bg-bone/50"
                  >
                    <td className="px-4 py-3">
                      <div className="relative h-12 w-12 overflow-hidden border border-line bg-bone">
                        {firstImage ? (
                          <Image
                            src={firstImage.url}
                            alt={firstImage.alt ?? tr?.name ?? p.slug}
                            fill
                            sizes="48px"
                            className="object-cover"
                            unoptimized
                          />
                        ) : null}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="hover:underline"
                      >
                        <div className="font-medium text-ink">
                          {tr?.name ?? p.slug}
                        </div>
                        <div className="text-xs text-mist">{p.slug}</div>
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-mist">
                      {catTr?.name ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      {discount ? (
                        <div>
                          <div className="text-ink">
                            {formatPrice(discount)}
                          </div>
                          <div className="text-xs text-mist line-through">
                            {formatPrice(price)}
                          </div>
                        </div>
                      ) : (
                        <div className="text-ink">{formatPrice(price)}</div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          totalStock === 0
                            ? "text-red-600"
                            : totalStock <= p.lowStockLimit
                              ? "text-amber-600"
                              : "text-ink"
                        }
                      >
                        {totalStock}
                      </span>
                      <span className="ml-1 text-xs text-mist">
                        / {p._count.variants} varyant
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_BADGE[p.status]}`}
                      >
                        {STATUS_LABEL[p.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-mist">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      }).format(p.updatedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/products/${p.id}`}
                          className="inline-flex items-center gap-1 border border-line bg-paper px-2 py-1 text-xs text-ink hover:bg-bone"
                        >
                          <Pencil className="size-3" />
                          Düzenle
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
