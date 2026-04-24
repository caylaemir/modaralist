import Link from "next/link";
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

  const total = collections.length;
  const liveCount = collections.filter((c) => c.status === "LIVE").length;
  const upcomingCount = collections.filter(
    (c) => c.status === "UPCOMING"
  ).length;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — drop
          </p>
          <h1 className="display mt-3 text-5xl leading-none">Koleksiyonlar</h1>
          <p className="mt-4 text-xs text-mist">
            {total} koleksiyon · {liveCount} yayında · {upcomingCount} yakında
          </p>
        </div>
        <Link
          href="/admin/collections/new"
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
        >
          + Yeni Koleksiyon
        </Link>
      </header>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">
                Koleksiyon
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Slug
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Başlangıç
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Ürün
              </th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {collections.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz drop yok
                  </p>
                  <p className="mt-4 text-sm text-mist">
                    İlk koleksiyonunla drop takvimini başlat.
                  </p>
                  <Link
                    href="/admin/collections/new"
                    className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                  >
                    Yeni Koleksiyon →
                  </Link>
                </td>
              </tr>
            ) : (
              collections.map((c) => {
                const tr = c.translations.find((t) => t.locale === "tr");
                return (
                  <tr
                    key={c.id}
                    className="border-b border-line transition-colors hover:bg-bone/70"
                  >
                    <td className="py-4 pr-4">
                      <Link href={`/admin/collections/${c.id}`} className="block">
                        <p className="font-medium text-ink">
                          {tr?.name ?? c.slug}
                        </p>
                        {tr?.tagline ? (
                          <p className="mt-1 text-xs text-mist">{tr.tagline}</p>
                        ) : null}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-mist">
                      {c.slug}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          c.status === "LIVE"
                            ? "border-ink bg-ink text-paper"
                            : "border-line text-mist"
                        }`}
                      >
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-mist tabular-nums">
                      {formatDate(c.startsAt)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {c._count.products}
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          href={`/admin/collections/${c.id}`}
                          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                        >
                          Düzenle →
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
