import Link from "next/link";
import { Prisma } from "@prisma/client";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/app/admin/_components/status-badge";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_OPTIONS,
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
  formatDateTR,
} from "./_lib";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  status?: string;
  from?: string;
  to?: string;
  q?: string;
}>;

function parseOrderStatus(value?: string): OrderStatus | undefined {
  if (!value) return undefined;
  return (ORDER_STATUS_OPTIONS as string[]).includes(value)
    ? (value as OrderStatus)
    : undefined;
}

type SearchShape = { status?: string; from?: string; to?: string; q?: string };

function buildHref(
  sp: SearchShape,
  overrides: Partial<SearchShape>
): string {
  const merged: SearchShape = { ...sp, ...overrides };
  const params = new URLSearchParams();
  if (merged.q) params.set("q", merged.q);
  if (merged.status) params.set("status", merged.status);
  if (merged.from) params.set("from", merged.from);
  if (merged.to) params.set("to", merged.to);
  const qs = params.toString();
  return qs ? `/admin/orders?${qs}` : "/admin/orders";
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const statusFilter = parseOrderStatus(sp.status);
  const fromDate = sp.from ? new Date(sp.from) : undefined;
  const toDate = sp.to ? new Date(sp.to) : undefined;
  const q = sp.q?.trim() ?? "";

  const where: Prisma.OrderWhereInput = {};
  if (statusFilter) where.status = statusFilter;
  if (fromDate || toDate) {
    where.placedAt = {};
    if (fromDate && !isNaN(fromDate.getTime())) where.placedAt.gte = fromDate;
    if (toDate && !isNaN(toDate.getTime())) {
      const end = new Date(toDate);
      end.setHours(23, 59, 59, 999);
      where.placedAt.lte = end;
    }
  }
  if (q.length > 0) {
    where.OR = [
      { orderNumber: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [orders, todayCount, todayRevenue, pendingShipmentCount] =
    await Promise.all([
      db.order.findMany({
        where,
        orderBy: { placedAt: "desc" },
        take: 50,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      db.order.count({ where: { placedAt: { gte: todayStart } } }),
      db.order.aggregate({
        where: {
          placedAt: { gte: todayStart },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
        _sum: { grandTotal: true },
      }),
      db.order.count({
        where: {
          status: { in: ["PAID", "PREPARING"] },
          shippingStatus: { in: ["PENDING", "LABEL_CREATED"] },
        },
      }),
    ]);

  const todayRevenueValue = Number(todayRevenue._sum.grandTotal ?? 0);
  const hasActiveFilters = !!(statusFilter || fromDate || toDate || q);

  return (
    <div>
      <header className="border-b border-line pb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — siparişler
        </p>
        <div className="mt-3 flex items-end justify-between gap-6">
          <h1 className="display text-5xl leading-none">Siparişler</h1>
          <p className="max-w-xs text-right text-xs text-mist">
            Son 50 sipariş. Filtreleri kullanarak sonuçları daralt.
          </p>
        </div>
      </header>

      <section className="mt-10 grid grid-cols-1 gap-x-10 gap-y-6 md:grid-cols-3">
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Bugünkü Sipariş
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {todayCount}
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Bugünkü Ciro
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {formatPrice(todayRevenueValue, "tr")}
          </p>
        </div>
        <div className="border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Bekleyen Kargo
          </p>
          <p className="display mt-4 text-4xl leading-none tabular-nums">
            {pendingShipmentCount}
          </p>
        </div>
      </section>

      <section className="mt-14">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — durum
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={buildHref(sp, { status: undefined })}
            className={`border border-line px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
              !statusFilter
                ? "border-ink bg-ink text-paper"
                : "text-mist hover:border-ink hover:text-ink"
            }`}
          >
            Tümü
          </Link>
          {ORDER_STATUS_OPTIONS.map((s) => {
            const active = statusFilter === s;
            return (
              <Link
                key={s}
                href={buildHref(sp, { status: s })}
                className={`border border-line px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "text-mist hover:border-ink hover:text-ink"
                }`}
              >
                {ORDER_STATUS_LABELS[s]}
              </Link>
            );
          })}
        </div>
      </section>

      <form
        method="GET"
        className="mt-8 grid grid-cols-1 gap-4 border-t border-line pt-6 md:grid-cols-[1fr_auto_auto_auto_auto]"
      >
        <input type="hidden" name="status" value={sp.status ?? ""} />
        <div className="flex flex-col">
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Ara
          </label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Sipariş no veya e-posta"
            className="border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Başlangıç
          </label>
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </div>
        <div className="flex flex-col">
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Bitiş
          </label>
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
          />
        </div>
        <button
          type="submit"
          className="mt-auto self-end border-b border-ink pb-2 text-[11px] uppercase tracking-[0.3em] hover:text-mist"
        >
          Filtrele →
        </button>
        <Link
          href="/admin/orders"
          className="mt-auto self-end pb-2 text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          Temizle
        </Link>
      </form>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line px-0 py-3 text-left font-medium">
                Sipariş
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Tarih
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Müşteri
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Tutar
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Ödeme
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Kargo
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
              <th className="border-b border-line px-0 py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Sonuç bulunamadı
                  </p>
                  <p className="mt-4 text-sm text-mist">
                    {hasActiveFilters
                      ? "Filtreleri gevşetmeyi dene."
                      : "Henüz hiç sipariş yok."}
                  </p>
                  {hasActiveFilters ? (
                    <Link
                      href="/admin/orders"
                      className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                    >
                      Filtreleri Temizle →
                    </Link>
                  ) : null}
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-line transition-colors hover:bg-bone/70"
                >
                  <td className="px-0 py-4">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="font-mono text-xs text-ink"
                    >
                      {order.orderNumber}
                    </Link>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.25em] text-mist">
                      {order._count.items} kalem
                    </p>
                  </td>
                  <td className="px-4 py-4 text-xs text-mist tabular-nums">
                    {formatDateTR(order.placedAt)}
                  </td>
                  <td className="px-4 py-4">
                    <p>{order.user?.name ?? order.email.split("@")[0]}</p>
                    <p className="mt-0.5 text-xs text-mist">{order.email}</p>
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums">
                    {formatPrice(Number(order.grandTotal), "tr")}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge>
                      {SHIPMENT_STATUS_LABELS[order.shippingStatus]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge>
                      {ORDER_STATUS_LABELS[order.status]}
                    </StatusBadge>
                  </td>
                  <td className="px-0 py-4 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
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
    </div>
  );
}
