import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function SizeChartsPage() {
  const charts = await db.sizeChart.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      translations: { where: { locale: "tr" } },
      _count: { select: { columns: true, rows: true, categories: true } },
    },
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — beden tabloları
          </p>
          <h1 className="display mt-3 text-5xl leading-none">Beden Tabloları</h1>
          <p className="mt-4 text-xs text-mist">
            {charts.length} tablo · kategorilere atanir, ürün sayfasında "Beden
            Tablosu" butonundan açılır.
          </p>
        </div>
        <Link
          href="/admin/size-charts/new"
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
        >
          + Yeni Tablo
        </Link>
      </header>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">Ad</th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">Slug</th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">Birim</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Kolon</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Beden</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Kategori</th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">Durum</th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {charts.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">— boş</p>
                  <p className="display mt-4 text-3xl italic text-mist">Henüz tablo yok</p>
                  <Link
                    href="/admin/size-charts/new"
                    className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                  >
                    İlk tabloyu ekle →
                  </Link>
                </td>
              </tr>
            ) : (
              charts.map((c) => (
                <tr key={c.id} className="border-b border-line hover:bg-bone/70">
                  <td className="py-4 pr-4">
                    <Link
                      href={`/admin/size-charts/${c.id}`}
                      className="text-ink hover:underline"
                    >
                      {c.translations[0]?.name ?? c.slug}
                    </Link>
                  </td>
                  <td className="px-4 py-4 font-mono text-[11px] text-mist">
                    {c.slug}
                  </td>
                  <td className="px-4 py-4 text-mist">{c.unit}</td>
                  <td className="px-4 py-4 text-right tabular-nums text-mist">
                    {c._count.columns}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-mist">
                    {c._count.rows}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums text-mist">
                    {c._count.categories}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                        c.isActive
                          ? "border-ink text-ink"
                          : "border-line text-mist"
                      }`}
                    >
                      {c.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <Link
                      href={`/admin/size-charts/${c.id}`}
                      className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                    >
                      Düzenle →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
