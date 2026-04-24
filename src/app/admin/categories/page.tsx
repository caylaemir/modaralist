import Link from "next/link";
import { db } from "@/lib/db";
import { DeleteCategoryButton } from "./delete-button";

export const dynamic = "force-dynamic";

type CategoryRow = {
  id: string;
  slug: string;
  parentId: string | null;
  sortOrder: number;
  isActive: boolean;
  nameTr: string;
  slugTr: string;
  productCount: number;
  children: CategoryRow[];
};

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      translations: true,
      _count: { select: { products: true } },
    },
  });

  const byId = new Map<string, CategoryRow>();
  const roots: CategoryRow[] = [];

  for (const c of categories) {
    const tr = c.translations.find((t) => t.locale === "tr");
    byId.set(c.id, {
      id: c.id,
      slug: c.slug,
      parentId: c.parentId,
      sortOrder: c.sortOrder,
      isActive: c.isActive,
      nameTr: tr?.name ?? c.slug,
      slugTr: tr?.slug ?? c.slug,
      productCount: c._count.products,
      children: [],
    });
  }

  for (const row of byId.values()) {
    if (row.parentId && byId.has(row.parentId)) {
      byId.get(row.parentId)!.children.push(row);
    } else {
      roots.push(row);
    }
  }

  const total = categories.length;
  const activeCount = categories.filter((c) => c.isActive).length;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — taksonomi
          </p>
          <h1 className="display mt-3 text-5xl leading-none">Kategoriler</h1>
          <p className="mt-4 text-xs text-mist">
            {total} kategori · {activeCount} aktif · hiyerarşik yapı
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
        >
          + Yeni Kategori
        </Link>
      </header>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">
                Ad
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Slug
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Ürün
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Sıra
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {roots.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz kategori yok
                  </p>
                  <p className="mt-4 text-sm text-mist">
                    Ürünleri organize etmek için ilk kategoriyi ekle.
                  </p>
                  <Link
                    href="/admin/categories/new"
                    className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                  >
                    Yeni Kategori Ekle →
                  </Link>
                </td>
              </tr>
            ) : (
              roots.map((row) => renderRow(row, 0))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function renderRow(row: CategoryRow, depth: number): React.ReactNode {
  return (
    <>
      <tr
        key={row.id}
        className="border-b border-line transition-colors hover:bg-bone/70"
      >
        <td className="py-4 pr-4">
          <Link
            href={`/admin/categories/${row.id}`}
            className="inline-block"
            style={{ paddingLeft: depth * 24 }}
          >
            {depth > 0 ? (
              <span className="mr-3 text-mist">└</span>
            ) : null}
            <span className="text-ink">{row.nameTr}</span>
          </Link>
        </td>
        <td className="px-4 py-4 font-mono text-[11px] text-mist">
          {row.slug}
        </td>
        <td className="px-4 py-4 text-right tabular-nums text-mist">
          {row.productCount}
        </td>
        <td className="px-4 py-4 text-right tabular-nums text-mist">
          {row.sortOrder}
        </td>
        <td className="px-4 py-4">
          <span
            className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
              row.isActive
                ? "border-ink text-ink"
                : "border-line text-mist"
            }`}
          >
            {row.isActive ? "Aktif" : "Pasif"}
          </span>
        </td>
        <td className="py-4 pl-4 text-right">
          <div className="flex items-center justify-end gap-4">
            <Link
              href={`/admin/categories/${row.id}`}
              className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
            >
              Düzenle →
            </Link>
            <DeleteCategoryButton id={row.id} name={row.nameTr} />
          </div>
        </td>
      </tr>
      {row.children.map((child) => renderRow(child, depth + 1))}
    </>
  );
}
