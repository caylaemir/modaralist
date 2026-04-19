import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "Müşteri",
  STAFF: "Personel",
  ADMIN: "Admin",
};

const ROLE_BADGE: Record<string, string> = {
  CUSTOMER: "bg-bone text-mist border-line",
  STAFF: "bg-amber-50 text-amber-700 border-amber-200",
  ADMIN: "bg-ink text-paper border-ink",
};

export default async function CustomersPage() {
  const users = await db.user
    .findMany({
      include: { _count: { select: { orders: true } } },
      orderBy: { createdAt: "desc" },
      take: 100,
    })
    .catch(() => []);

  return (
    <div>
      <div>
        <h1 className="display text-4xl">Müşteriler</h1>
        <p className="mt-2 text-sm text-mist">
          Toplam {users.length} kullanıcı.
        </p>
      </div>

      <div className="mt-10 overflow-x-auto border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="border-b border-line bg-bone text-left">
            <tr>
              <th className="px-4 py-3 font-medium">E-posta</th>
              <th className="px-4 py-3 font-medium">Ad</th>
              <th className="px-4 py-3 font-medium">Rol</th>
              <th className="px-4 py-3 font-medium">Kayıt</th>
              <th className="px-4 py-3 font-medium text-right">Sipariş</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-mist">
                  Henüz kayıtlı kullanıcı yok.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                  <td className="px-4 py-3">{u.name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block border px-2 py-0.5 text-[10px] uppercase tracking-wider ${ROLE_BADGE[u.role]}`}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-mist">
                    {new Intl.DateTimeFormat("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(u.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
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
