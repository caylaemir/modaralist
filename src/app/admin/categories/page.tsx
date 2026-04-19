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

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-4xl">Kategoriler</h1>
          <p className="mt-2 text-sm text-mist">
            Toplam {total} kategori. Hiyerarşik yapıda yönetin.
          </p>
        </div>
        <Link
          href="/admin/categories/new"
          className="bg-ink px-4 py-2 text-sm text-paper"
        >
          Yeni Kategori
        </Link>
      </div>

      <div className="mt-10 border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-bone text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Ad (TR)</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium">Sıra</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {roots.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-10 text-center text-mist"
                >
                  Henüz kategori yok. İlk kategoriyi ekleyin.
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
      <tr key={row.id} className="border-b border-line">
        <td className="px-4 py-3">
          <span
            className="inline-block"
            style={{ paddingLeft: depth * 20 }}
          >
            {depth > 0 && <span className="mr-2 text-mist">└</span>}
            {row.nameTr}
          </span>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-mist">{row.slug}</td>
        <td className="px-4 py-3">{row.productCount}</td>
        <td className="px-4 py-3">{row.sortOrder}</td>
        <td className="px-4 py-3">
          {row.isActive ? (
            <span className="bg-bone px-2 py-0.5 text-[10px] uppercase tracking-wider">
              Aktif
            </span>
          ) : (
            <span className="border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-mist">
              Pasif
            </span>
          )}
        </td>
        <td className="px-4 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <Link
              href={`/admin/categories/${row.id}`}
              className="border border-line px-3 py-1 text-xs hover:border-ink"
            >
              Düzenle
            </Link>
            <DeleteCategoryButton id={row.id} name={row.nameTr} />
          </div>
        </td>
      </tr>
      {row.children.map((child) => renderRow(child, depth + 1))}
    </>
  );
}
