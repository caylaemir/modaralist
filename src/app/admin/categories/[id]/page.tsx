import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { CategoryForm, type ParentOption } from "../category-form";

export const dynamic = "force-dynamic";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const category = await db.category.findUnique({
    where: { id },
    include: { translations: true },
  });

  if (!category) {
    notFound();
  }

  const all = await db.category.findMany({
    where: { id: { not: id } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: { translations: true },
  });

  const parents: ParentOption[] = all.map((c) => {
    const tr = c.translations.find((t) => t.locale === "tr");
    return { id: c.id, name: tr?.name ?? c.slug };
  });

  const tr = category.translations.find((t) => t.locale === "tr");
  const en = category.translations.find((t) => t.locale === "en");

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-4xl">Kategori Düzenle</h1>
          <p className="mt-2 text-sm text-mist">{category.slug}</p>
        </div>
        <Link
          href="/admin/categories"
          className="border border-line px-4 py-2 text-sm hover:border-ink"
        >
          Geri
        </Link>
      </div>

      <div className="mt-10">
        <CategoryForm
          mode="edit"
          parents={parents}
          initial={{
            id: category.id,
            slug: category.slug,
            parentId: category.parentId,
            bannerUrl: category.bannerUrl,
            sortOrder: category.sortOrder,
            isActive: category.isActive,
            nameTr: tr?.name ?? "",
            slugTr: tr?.slug ?? "",
            descriptionTr: tr?.description ?? null,
            seoTitleTr: tr?.seoTitle ?? null,
            seoDescTr: tr?.seoDesc ?? null,
            nameEn: en?.name ?? "",
            slugEn: en?.slug ?? "",
            descriptionEn: en?.description ?? null,
            seoTitleEn: en?.seoTitle ?? null,
            seoDescEn: en?.seoDesc ?? null,
          }}
        />
      </div>
    </div>
  );
}
