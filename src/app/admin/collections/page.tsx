import Link from "next/link";
import { Plus } from "lucide-react";
import type { CollectionStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { DeleteCollectionButton } from "./delete-button";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<CollectionStatus, string> = {
  UPCOMING: "Yakında",
  LIVE: "Yayında",
  SOLD_OUT: "Tükendi",
  ARCHIVED: "Arşiv",
};

const STATUS_BADGE: Record<CollectionStatus, string> = {
  UPCOMING: "bg-bone text-ink border-line",
  LIVE: "bg-ink text-paper border-ink",
  SOLD_OUT: "bg-amber-50 text-amber-700 border-amber-200",
  ARCHIVED: "bg-paper text-mist border-line",
};

function formatDate(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function CollectionsPage() {
  const collections = await db.collection
    .findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      include: {
        translations: true,
        _count: { select: { products: true } },
      },
    })
    .catch(() => []);

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="display text-4xl">Koleksiyonlar</h1>
          <p className="mt-2 text-sm text-mist">
            Toplam {collections.length} koleksiyon. Drop ve sürekli satış
            koleksiyonlarını buradan yönetin.
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-sm text-paper hover:opacity-90"
        >
          <Plus className="size-4" />
          Yeni Koleksiyon
        </Link>
      </div>

      <div className="mt-10 overflow-x-auto border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-bone text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Ad (TR)</th>
              <th className="px-4 py-3 font-medium">Slug</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium">Başlangıç</th>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium text-right">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-mist">
                  Henüz koleksiyon yok. Sağ üstten yeni ekleyin.
                </td>
              </tr>
            ) : (
              collections.map((c) => {
                const tr = c.translations.find((t) => t.locale === "tr");
                return (
                  <tr
                    key={c.id}
                    className="border-b border-line last:border-0 hover:bg-bone/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/collections/${c.id}`}
                        className="hover:underline"
                      >
                        <div className="font-medium text-ink">
                          {tr?.name ?? c.slug}
                        </div>
                        {tr?.tagline ? (
                          <div className="text-xs text-mist">{tr.tagline}</div>
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-mist">
                      {c.slug}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-wider ${STATUS_BADGE[c.status]}`}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-mist">
                      {formatDate(c.startsAt)}
                    </td>
                    <td className="px-4 py-3">{c._count.products}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/collections/${c.id}`}
                          className="border border-line bg-paper px-3 py-1 text-xs text-ink hover:bg-bone"
                        >
                          Düzenle
                        </Link>
                        <DeleteCollectionButton
                          id={c.id}
                          name={tr?.name ?? c.slug}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
