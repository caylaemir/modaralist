import Link from "next/link";
import { db } from "@/lib/db";
import { CategoryForm, type ParentOption } from "../category-form";

export const dynamic = "force-dynamic";

export default async function NewCategoryPage() {
  const categories = await db.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { translations: true },
  });

  const parents: ParentOption[] = categories.map((c) => {
    const tr = c.translations.find((t) => t.locale === "tr");
    return { id: c.id, name: tr?.name ?? c.slug };
  });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-4xl">Yeni Kategori</h1>
          <p className="mt-2 text-sm text-mist">
            TR ve EN için ad, slug ve SEO alanlarını doldurun.
          </p>
        </div>
        <Link
          href="/admin/categories"
          className="border border-line px-4 py-2 text-sm hover:border-ink"
        >
          Geri
        </Link>
      </div>

      <div className="mt-10">
        <CategoryForm mode="create" parents={parents} />
      </div>
    </div>
  );
}
