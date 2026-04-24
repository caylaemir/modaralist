import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminNewsletterPage() {
  const [total, activeCount, unsubCount, subscribers] = await Promise.all([
    db.newsletterSubscriber.count(),
    db.newsletterSubscriber.count({ where: { unsubscribedAt: null } }),
    db.newsletterSubscriber.count({
      where: { unsubscribedAt: { not: null } },
    }),
    db.newsletterSubscriber.findMany({
      orderBy: { subscribedAt: "desc" },
      take: 200,
    }),
  ]);

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <header className="border-b border-line pb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — bülten
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Abone Listesi</h1>
        <p className="mt-4 text-xs text-mist">
          {total} toplam · {activeCount} aktif · {unsubCount} abonelikten çıktı
        </p>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Aktif Abone
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {activeCount}
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Toplam Kayıt
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {total}
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Çıkış
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {unsubCount}
          </p>
        </div>
      </section>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">
                E-posta
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Dil
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Kaynak
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Kayıt Tarihi
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
            </tr>
          </thead>
          <tbody>
            {subscribers.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz abone yok
                  </p>
                  <p className="mt-4 text-sm text-mist">
                    Ana sayfa footer newsletter formu üzerinden toplanacak.
                  </p>
                </td>
              </tr>
            ) : (
              subscribers.map((s) => (
                <tr
                  key={s.id}
                  className="border-b border-line transition-colors hover:bg-bone/70"
                >
                  <td className="py-4 pr-4">
                    <a
                      href={`mailto:${s.email}`}
                      className="font-mono text-xs hover:text-mist"
                    >
                      {s.email}
                    </a>
                  </td>
                  <td className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-mist">
                    {s.locale}
                  </td>
                  <td className="px-4 py-4 text-xs text-mist">
                    {s.source ?? "—"}
                  </td>
                  <td className="px-4 py-4 text-xs text-mist tabular-nums">
                    {dateFmt.format(s.subscribedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                        s.unsubscribedAt
                          ? "border-line text-mist"
                          : "border-ink bg-ink text-paper"
                      }`}
                    >
                      {s.unsubscribedAt ? "Çıktı" : "Aktif"}
                    </span>
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
