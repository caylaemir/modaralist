import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CollectionForm } from "../collection-form";

export default async function EditCollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const collection = await db.collection
    .findUnique({
      where: { id },
      include: {
        translations: true,
        products: true,
      },
    })
    .catch(() => null);

  if (!collection) notFound();

  const products = await db.product
    .findMany({
      where: { status: { not: "ARCHIVED" } },
      include: { translations: { where: { locale: "tr" } } },
      orderBy: { createdAt: "desc" },
    })
    .catch(() => []);

  const allProducts = products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.translations[0]?.name ?? p.slug,
  }));

  return (
    <div>
      <Link
        href="/admin/collections"
        className="mb-6 inline-flex items-center gap-2 text-xs text-mist hover:text-ink"
      >
        <ArrowLeft className="size-4" />
        Koleksiyonlar
      </Link>
      <h1 className="display text-4xl mb-8">
        {collection.translations.find((t) => t.locale === "tr")?.name ??
          collection.slug}
      </h1>
      <CollectionForm
        mode="edit"
        collection={{
          id: collection.id,
          slug: collection.slug,
          status: collection.status,
          startsAt: collection.startsAt,
          endsAt: collection.endsAt,
          heroImageUrl: collection.heroImageUrl,
          heroVideoUrl: collection.heroVideoUrl,
          themePrimary: collection.themePrimary,
          themeAccent: collection.themeAccent,
          sortOrder: collection.sortOrder,
          translations: collection.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            slug: t.slug,
            tagline: t.tagline,
            description: t.description,
            manifesto: t.manifesto,
          })),
          products: collection.products.map((cp) => ({
            productId: cp.productId,
          })),
        }}
        allProducts={allProducts}
      />
    </div>
  );
}
