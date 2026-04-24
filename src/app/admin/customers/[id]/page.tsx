import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/app/admin/_components/status-badge";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  formatDateTimeTR,
} from "../../orders/_lib";

export const dynamic = "force-dynamic";

const ROLE_LABEL: Record<string, string> = {
  CUSTOMER: "Müşteri",
  STAFF: "Personel",
  ADMIN: "Admin",
};

export default async function AdminCustomerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const user = await db.user
    .findUnique({
      where: { id },
      include: {
        orders: {
          orderBy: { placedAt: "desc" },
          take: 50,
          select: {
            id: true,
            orderNumber: true,
            placedAt: true,
            grandTotal: true,
            status: true,
            paymentStatus: true,
            email: true,
          },
        },
        addresses: true,
        _count: {
          select: { orders: true, wishlist: true, reviews: true },
        },
      },
    })
    .catch(() => null);

  if (!user) notFound();

  const totalSpent = user.orders
    .filter(
      (o) => o.status !== "CANCELLED" && o.status !== "REFUNDED"
    )
    .reduce((s, o) => s + Number(o.grandTotal), 0);

  const avgOrder =
    user.orders.length > 0 ? totalSpent / user.orders.length : 0;

  const lastOrder = user.orders[0] ?? null;

  const registeredFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div>
      <header className="border-b border-line pb-8">
        <Link
          href="/admin/customers"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Müşteriler
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
              {user.id}
            </p>
            <h1 className="display mt-3 text-5xl leading-none">
              {user.name ?? user.email.split("@")[0]}
            </h1>
            <p className="mt-3 text-xs text-mist">
              <a
                href={`mailto:${user.email}`}
                className="hover:text-ink"
              >
                {user.email}
              </a>
              {user.phone ? (
                <span className="ml-3 tabular-nums">{user.phone}</span>
              ) : null}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-block border px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                user.role === "ADMIN" || user.role === "STAFF"
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-mist"
              }`}
            >
              {ROLE_LABEL[user.role]}
            </span>
            {user.emailVerified ? (
              <span className="inline-block border border-line px-3 py-1 text-[10px] uppercase tracking-[0.25em] text-mist">
                Doğrulandı
              </span>
            ) : null}
          </div>
        </div>
      </header>

      <section className="mt-10 grid grid-cols-2 gap-x-10 gap-y-6 md:grid-cols-4">
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Toplam Sipariş
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {user._count.orders}
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Toplam Harcama
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {formatPrice(totalSpent)}
          </p>
          <p className="mt-2 text-[11px] text-mist">
            İptal/iade hariç
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Ortalama Sipariş
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {formatPrice(avgOrder)}
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Kayıt Tarihi
          </p>
          <p className="display mt-4 text-2xl leading-none">
            {registeredFmt.format(user.createdAt)}
          </p>
          {lastOrder ? (
            <p className="mt-2 text-[11px] text-mist">
              Son sipariş: {formatDateTimeTR(lastOrder.placedAt)}
            </p>
          ) : null}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between border-t border-line pt-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — siparişler
            </p>
            <h2 className="display mt-3 text-3xl leading-none">
              Sipariş Geçmişi
            </h2>
          </div>
          <p className="text-[11px] uppercase tracking-[0.3em] text-mist">
            Son {user.orders.length}
          </p>
        </div>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
                <th className="border-b border-line py-3 text-left font-medium">
                  Sipariş
                </th>
                <th className="border-b border-line px-4 py-3 text-left font-medium">
                  Tarih
                </th>
                <th className="border-b border-line px-4 py-3 text-right font-medium">
                  Tutar
                </th>
                <th className="border-b border-line px-4 py-3 text-left font-medium">
                  Ödeme
                </th>
                <th className="border-b border-line px-4 py-3 text-left font-medium">
                  Durum
                </th>
                <th className="border-b border-line py-3 text-right font-medium" />
              </tr>
            </thead>
            <tbody>
              {user.orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="py-16 text-center text-sm text-mist"
                  >
                    Henüz sipariş yok.
                  </td>
                </tr>
              ) : (
                user.orders.map((o) => (
                  <tr
                    key={o.id}
                    className="border-b border-line transition-colors hover:bg-bone/70"
                  >
                    <td className="py-4 pr-4">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="font-mono text-xs"
                      >
                        {o.orderNumber}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-xs text-mist tabular-nums">
                      {formatDateTimeTR(o.placedAt)}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {formatPrice(Number(o.grandTotal))}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge>
                        {PAYMENT_STATUS_LABELS[o.paymentStatus]}
                      </StatusBadge>
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge>
                        {ORDER_STATUS_LABELS[o.status]}
                      </StatusBadge>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                      >
                        Detay →
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-16 grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <div className="border-t border-line pt-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — adresler
            </p>
            <h2 className="display mt-3 text-3xl leading-none">Adresler</h2>
            <p className="mt-3 text-xs text-mist">
              Kayıtlı {user.addresses.length} adres.
            </p>
          </div>
          {user.addresses.length === 0 ? (
            <p className="mt-6 text-sm text-mist">Henüz adres yok.</p>
          ) : (
            <ul className="mt-6">
              {user.addresses.map((a) => (
                <li
                  key={a.id}
                  className="border-t border-line py-5 last:border-b"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] uppercase tracking-[0.3em]">
                      {a.label ?? "Adres"}
                    </p>
                    {a.isDefault ? (
                      <span className="text-[10px] uppercase tracking-[0.25em] text-mist">
                        Varsayılan
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-3 text-sm">{a.fullName}</p>
                  <p className="text-xs text-mist tabular-nums">{a.phone}</p>
                  <p className="mt-2 text-sm">{a.street}</p>
                  <p className="text-sm">
                    {a.district}, {a.city}
                    {a.zip ? ` ${a.zip}` : ""}
                  </p>
                  <p className="text-xs text-mist">{a.country}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="border-t border-line pt-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — aktivite
            </p>
            <h2 className="display mt-3 text-3xl leading-none">Özet</h2>
          </div>
          <dl className="mt-6">
            <div className="flex items-center justify-between border-t border-line py-4">
              <dt className="text-[11px] uppercase tracking-[0.3em] text-mist">
                Wishlist
              </dt>
              <dd className="tabular-nums">{user._count.wishlist}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-line py-4">
              <dt className="text-[11px] uppercase tracking-[0.3em] text-mist">
                Değerlendirme
              </dt>
              <dd className="tabular-nums">{user._count.reviews}</dd>
            </div>
            <div className="flex items-center justify-between border-t border-line py-4 last:border-b">
              <dt className="text-[11px] uppercase tracking-[0.3em] text-mist">
                E-posta doğrulama
              </dt>
              <dd className="text-sm">
                {user.emailVerified ? "Onaylı" : "Bekliyor"}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  );
}
