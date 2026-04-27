import Link from "next/link";
import { db } from "@/lib/db";
import { BulkPriceClient } from "./bulk-price-client";

export const dynamic = "force-dynamic";

export default async function BulkPricePage() {
  // Kategori filtresi icin secenekler
  const categories = await db.category.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    include: {
      translations: { where: { locale: "tr" } },
      _count: { select: { products: true } },
    },
  });

  const categoryOptions = categories.map((c) => ({
    id: c.id,
    name: c.translations[0]?.name ?? c.slug,
    slug: c.slug,
    productCount: c._count.products,
  }));

  return (
    <div>
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — toplu islem
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Topluca Fiyat</h1>
        <p className="mt-4 max-w-2xl text-sm text-mist">
          Filtrelenen ürünlere yüzdelik veya sabit miktarlı fiyat değişikliği
          uygula. Önce <strong>önizle</strong>, kontrol et, sonra
          uygula. Kayıt sırasında basePrice ve discountPrice alanları güncellenir.
        </p>
        <Link
          href="/admin/products"
          className="mt-3 inline-block text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Ürünlere dön
        </Link>
      </header>

      <BulkPriceClient categories={categoryOptions} />
    </div>
  );
}
