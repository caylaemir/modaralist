import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ensureGenderTags } from "@/lib/admin-bootstrap";
import { ProductForm } from "../_components/product-form";

export default async function NewProductPage() {
  // Cinsiyet etiketleri yoksa yarat — form'da radio her zaman aktif olsun
  await ensureGenderTags();

  const [categories, colors, sizes, tags, collections] = await Promise.all([
    db.category.findMany({
      where: { isActive: true },
      include: { translations: { where: { locale: "tr" } } },
      orderBy: { sortOrder: "asc" },
    }),
    db.color.findMany({ orderBy: [{ sortOrder: "asc" }, { code: "asc" }] }),
    db.size.findMany({ orderBy: { sortOrder: "asc" } }),
    db.productTag.findMany({ orderBy: { code: "asc" } }),
    db.collection.findMany({
      where: { status: { in: ["UPCOMING", "LIVE", "SOLD_OUT"] } },
      include: { translations: { where: { locale: "tr" } } },
      orderBy: { sortOrder: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/products"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-mist hover:text-ink"
        >
          <ArrowLeft className="size-3" />
          Ürünler
        </Link>
        <h1 className="display mt-2 text-4xl">Yeni Ürün</h1>
        <p className="mt-2 text-sm text-mist">
          TR/EN içerikler, varyantlar ve görseller ile yeni bir ürün ekleyin.
        </p>
      </div>

      <ProductForm
        mode="create"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.translations[0]?.name ?? c.slug,
          parentId: c.parentId,
        }))}
        collections={collections.map((c) => ({
          id: c.id,
          slug: c.slug,
          name: c.translations[0]?.name ?? c.slug,
        }))}
        colors={colors.map((c) => ({
          id: c.id,
          code: c.code,
          hex: c.hex,
          nameTr: c.nameTr,
        }))}
        sizes={sizes.map((s) => ({ id: s.id, code: s.code }))}
        tags={tags.map((t) => ({ id: t.id, code: t.code, labelTr: t.labelTr }))}
      />
    </div>
  );
}
