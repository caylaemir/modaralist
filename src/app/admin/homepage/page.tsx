import Link from "next/link";
import { db } from "@/lib/db";
import { ToggleBlockButton } from "./_components/toggle-button";

export const dynamic = "force-dynamic";

function summarizeConfig(cfg: unknown): string {
  if (!cfg || typeof cfg !== "object") return "—";
  const obj = cfg as Record<string, unknown>;
  const title = obj.title ?? obj.text ?? obj.eyebrow ?? obj.body;
  if (typeof title === "string") {
    return title.length > 60 ? title.slice(0, 60) + "…" : title;
  }
  const keys = Object.keys(obj);
  return keys.length > 0 ? keys.slice(0, 3).join(", ") : "—";
}

export default async function AdminHomepagePage() {
  const blocks = await db.homepageBlock
    .findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }] })
    .catch(() => []);

  const activeCount = blocks.filter((b) => b.isActive).length;

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — ana sayfa
          </p>
          <h1 className="display mt-3 text-5xl leading-none">
            Sayfa Bloklari
          </h1>
          <p className="mt-4 text-xs text-mist">
            {blocks.length} blok · {activeCount} aktif · sıralama küçükten büyüğe
          </p>
        </div>
        <Link
          href="/admin/homepage/new"
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
        >
          + Yeni Blok
        </Link>
      </header>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">
                Sıra
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Tip
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Özet
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {blocks.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz blok yok
                  </p>
                  <p className="mt-4 mx-auto max-w-md text-sm text-mist">
                    Hero, marquee, featured ürünler — ana sayfaya gelecek
                    blokları buradan sırala ve yönet. Mevcut hardcoded bloklar
                    entegrasyondan sonra bu listeden gelecek.
                  </p>
                  <Link
                    href="/admin/homepage/new"
                    className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                  >
                    Yeni Blok →
                  </Link>
                </td>
              </tr>
            ) : (
              blocks.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-line transition-colors hover:bg-bone/70"
                >
                  <td className="py-4 pr-4 tabular-nums text-mist">
                    {b.sortOrder}
                  </td>
                  <td className="px-4 py-4">
                    <Link
                      href={`/admin/homepage/${b.id}`}
                      className="font-mono text-xs uppercase"
                    >
                      {b.type}
                    </Link>
                  </td>
                  <td className="px-4 py-4 text-xs text-mist">
                    {summarizeConfig(b.config)}
                  </td>
                  <td className="px-4 py-4">
                    <ToggleBlockButton id={b.id} isActive={b.isActive} />
                  </td>
                  <td className="py-4 pl-4 text-right">
                    <Link
                      href={`/admin/homepage/${b.id}`}
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
