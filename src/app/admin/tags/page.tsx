import { db } from "@/lib/db";
import { TagsClient } from "./tags-client";

export const dynamic = "force-dynamic";

const SUGGESTED = [
  { code: "kadin", labelTr: "Kadın", labelEn: "Women" },
  { code: "erkek", labelTr: "Erkek", labelEn: "Men" },
  { code: "unisex", labelTr: "Unisex", labelEn: "Unisex" },
  { code: "yeni", labelTr: "Yeni", labelEn: "New" },
  { code: "cok-satan", labelTr: "Çok Satan", labelEn: "Bestseller" },
  { code: "limited", labelTr: "Sınırlı", labelEn: "Limited" },
  { code: "sale", labelTr: "İndirim", labelEn: "Sale" },
];

export default async function TagsPage() {
  const tags = await db.productTag.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { products: true } },
    },
  });

  const rows = tags.map((t) => ({
    id: t.id,
    code: t.code,
    labelTr: t.labelTr,
    labelEn: t.labelEn,
    productCount: t._count.products,
  }));

  // Mevcutta olmayan onerilenler
  const existingCodes = new Set(tags.map((t) => t.code));
  const missing = SUGGESTED.filter((s) => !existingCodes.has(s.code));

  return (
    <div>
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — taksonomi
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Etiketler</h1>
        <p className="mt-4 max-w-2xl text-sm text-mist">
          Ürünlere atanan etiketler. <strong>Cinsiyet</strong> filtresi için{" "}
          <span className="font-mono text-ink">kadin</span>,{" "}
          <span className="font-mono text-ink">erkek</span>,{" "}
          <span className="font-mono text-ink">unisex</span> kodları zorunlu —
          shop sayfasındaki cinsiyet filtre butonları bunlara bağlı çalışır.
          Diğerleri (yeni, çok-satan, sale vs.) kategori grid + ürün
          rozetleri için.
        </p>
      </header>

      <TagsClient initial={rows} suggested={missing} />
    </div>
  );
}
