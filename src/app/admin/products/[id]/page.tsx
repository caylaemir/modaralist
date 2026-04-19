import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ProductForm } from "../_components/product-form";
import { DeleteProductButton } from "../_components/delete-product-button";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [product, categories, colors, sizes] = await Promise.all([
    db.product
      .findUnique({
        where: { id },
        include: {
          translations: true,
          variants: {
            include: { size: true, color: true },
          },
          images: { orderBy: { sortOrder: "asc" } },
          category: {
            include: { translations: { where: { locale: "tr" } } },
          },
        },
      })
      .catch(() => null),
    db.category
      .findMany({
        where: { isActive: true },
        include: { translations: { where: { locale: "tr" } } },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
    db.color.findMany({ orderBy: { code: "asc" } }).catch(() => []),
    db.size.findMany({ orderBy: { sortOrder: "asc" } }).catch(() => []),
  ]);

  if (!product) {
    notFound();
  }

  const tr = product.translations.find((t) => t.locale === "tr");
  const en = product.translations.find((t) => t.locale === "en");

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-mist hover:text-ink"
          >
            <ArrowLeft className="size-3" />
            Ürünler
          </Link>
          <h1 className="display mt-2 text-4xl">
            {tr?.name ?? product.slug}
          </h1>
          <p className="mt-2 text-sm text-mist">
            /{product.slug} · {product.status}
          </p>
        </div>
        <DeleteProductButton
          id={product.id}
          name={tr?.name ?? product.slug}
          afterDeleteHref="/admin/products"
        />
      </div>

      <ProductForm
        mode="edit"
        productId={product.id}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.translations[0]?.name ?? c.slug,
        }))}
        colors={colors.map((c) => ({
          id: c.id,
          code: c.code,
          hex: c.hex,
          nameTr: c.nameTr,
        }))}
        sizes={sizes.map((s) => ({ id: s.id, code: s.code }))}
        initial={{
          id: product.id,
          slug: product.slug,
          status: product.status,
          categoryId: product.categoryId,
          basePrice: Number(product.basePrice),
          discountPrice:
            product.discountPrice != null
              ? Number(product.discountPrice)
              : null,
          taxRate: Number(product.taxRate),
          lowStockLimit: product.lowStockLimit,
          tr: {
            name: tr?.name ?? "",
            description: tr?.description ?? null,
            material: tr?.material ?? null,
            care: tr?.care ?? null,
          },
          en: {
            name: en?.name ?? "",
            description: en?.description ?? null,
            material: en?.material ?? null,
            care: en?.care ?? null,
          },
          images: product.images.map((img) => ({ url: img.url })),
          variants: product.variants.map((v) => ({
            sizeId: v.sizeId,
            colorId: v.colorId,
            stock: v.stock,
          })),
        }}
      />
    </div>
  );
}
