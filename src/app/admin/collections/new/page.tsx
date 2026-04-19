import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { CollectionForm } from "../collection-form";

export default async function NewCollectionPage() {
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
      <h1 className="display text-4xl mb-8">Yeni Koleksiyon</h1>
      <CollectionForm mode="create" allProducts={allProducts} />
    </div>
  );
}
