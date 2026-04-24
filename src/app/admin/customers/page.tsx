import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "Müşteri",
  STAFF: "Personel",
  ADMIN: "Admin",
};

export default async function CustomersPage() {
  const users = await db.user
    .findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    .catch(() => []);

  const customerCount = users.filter((u) => u.role === "CUSTOMER").length;
  const staffCount = users.filter(
    (u) => u.role === "STAFF" || u.role === "ADMIN"
  ).length;
  const totalOrders = users.reduce((s, u) => s + u._count.orders, 0);

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div>
      <header className="border-b border-line pb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — müşteri tabanı
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Müşteriler</h1>
        <p className="mt-4 text-xs text-mist">
          {users.length} kullanıcı · {customerCount} müşteri · {staffCount}{" "}
          personel · {totalOrders} toplam sipariş
        </p>
      </header>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">
                Müşteri
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                E-posta
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Rol
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Kayıt
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Sipariş
              </th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz kayıtlı kullanıcı yok
                  </p>
                  <p className="mt-4 text-sm text-mist">
                    İlk kayıt geldiğinde burada görünecek.
                  </p>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-line transition-colors hover:bg-bone/70"
                >
                  <td className="py-4 pr-4">{u.name ?? "—"}</td>
                  <td className="px-4 py-4">
                    <a
                      href={`mailto:${u.email}`}
                      className="font-mono text-xs text-mist hover:text-ink"
                    >
                      {u.email}
                    </a>
                  </td>
                  <td className="px-4 py-4">
                    <span
                      className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                        u.role === "ADMIN" || u.role === "STAFF"
                          ? "border-ink bg-ink text-paper"
                          : "border-line text-mist"
                      }`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-mist tabular-nums">
                    {dateFmt.format(u.createdAt)}
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums">
                    {u._count.orders}
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
