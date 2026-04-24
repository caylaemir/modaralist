import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminContentPage() {
  const pages = await db.page
    .findMany({
      orderBy: { updatedAt: "desc" },
      include: { translations: true },
    })
    .catch(() => []);

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — sayfalar
          </p>
          <h1 className="display mt-3 text-5xl leading-none">İçerik</h1>
          <p className="mt-4 text-xs text-mist">
            Hakkımızda, KVKK, iade, gizlilik gibi statik sayfalar. {pages.length}{" "}
            sayfa.
          </p>
        </div>
        <Link
          href="/admin/content/new"
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
        >
          + Yeni Sayfa
        </Link>
      </header>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">
                Sayfa
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Slug
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Şablon
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Güncellendi
              </th>
            </tr>
          </thead>
          <tbody>
            {pages.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz sayfa yok
                  </p>
                  <p className="mt-4 mx-auto max-w-md text-sm text-mist">
                    Hakkımızda, iletişim, KVKK gibi sayfalar için ilk kaydı
                    oluştur. TR ve EN içerikleri tek formda.
                  </p>
                  <Link
                    href="/admin/content/new"
                    className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                  >
                    Yeni Sayfa →
                  </Link>
                </td>
              </tr>
            ) : (
              pages.map((p) => {
                const tr = p.translations.find((t) => t.locale === "tr");
                return (
                  <tr
                    key={p.id}
                    className="border-b border-line transition-colors hover:bg-bone/70"
                  >
                    <td className="py-4 pr-4">
                      <Link
                        href={`/admin/content/${p.id}`}
                        className="hover:underline"
                      >
                        {tr?.title ?? p.slug}
                      </Link>
                    </td>
                    <td className="px-4 py-4 font-mono text-[11px] text-mist">
                      {p.slug}
                    </td>
                    <td className="px-4 py-4 text-xs text-mist">
                      {p.template}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          p.isPublished
                            ? "border-ink bg-ink text-paper"
                            : "border-line text-mist"
                        }`}
                      >
                        {p.isPublished ? "Yayında" : "Taslak"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs text-mist tabular-nums">
                      <div className="flex items-center justify-between gap-4">
                        <span>{dateFmt.format(p.updatedAt)}</span>
                        <Link
                          href={`/admin/content/${p.id}`}
                          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                        >
                          Düzenle →
                        </Link>
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
