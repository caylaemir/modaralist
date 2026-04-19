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

  const stats = [
    { label: "Bugünkü Sipariş", value: String(todayCount) },
    { label: "Bugünkü Ciro", value: formatPrice(todayRevenueValue, "tr") },
    { label: "Bekleyen Kargo", value: String(pendingShipmentCount) },
  ];

  return (
    <div>
      <div className="flex items-end justify-between">
        <div>
          <h1 className="display text-4xl">Siparişler</h1>
          <p className="mt-2 text-sm text-mist">
            Son 50 sipariş gösteriliyor. Filtreleri kullanarak daralt.
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded border border-line bg-paper p-6"
          >
            <p className="eyebrow text-mist">{s.label}</p>
            <p className="display mt-3 text-3xl">{s.value}</p>
          </div>
        ))}
      </div>

      <form
        method="GET"
        className="mt-8 flex flex-wrap items-end gap-3 rounded border border-line bg-paper p-4"
      >
        <div className="flex flex-col">
          <label className="eyebrow mb-1 text-mist">Ara</label>
          <input
            type="text"
            name="q"
            defaultValue={q}
            placeholder="Sipariş no veya e-posta"
            className="rounded border border-line bg-paper px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="eyebrow mb-1 text-mist">Durum</label>
          <select
            name="status"
            defaultValue={sp.status ?? ""}
            className="rounded border border-line bg-paper px-3 py-2 text-sm"
          >
            <option value="">Tümü</option>
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col">
          <label className="eyebrow mb-1 text-mist">Başlangıç</label>
          <input
            type="date"
            name="from"
            defaultValue={sp.from ?? ""}
            className="rounded border border-line bg-paper px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col">
          <label className="eyebrow mb-1 text-mist">Bitiş</label>
          <input
            type="date"
            name="to"
            defaultValue={sp.to ?? ""}
            className="rounded border border-line bg-paper px-3 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="bg-ink px-4 py-2 text-sm text-paper"
        >
          Filtrele
        </button>
        <Link
          href="/admin/orders"
          className="border border-line px-4 py-2 text-sm"
        >
          Temizle
        </Link>
      </form>

      <div className="mt-6 overflow-x-auto rounded border border-line bg-paper">
        <table className="w-full text-sm">
          <thead className="bg-bone text-left">
            <tr>
              <th className="px-4 py-3 font-medium">Sipariş No</th>
              <th className="px-4 py-3 font-medium">Tarih</th>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Tutar</th>
              <th className="px-4 py-3 font-medium">Ödeme</th>
              <th className="px-4 py-3 font-medium">Kargo</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-mist">
                  Sonuç bulunamadı.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr
                  key={order.id}
                  className="border-t border-line hover:bg-bone/50"
                >
                  <td className="px-4 py-3 font-mono text-xs">
                    {order.orderNumber}
                  </td>
                  <td className="px-4 py-3 text-mist">
                    {formatDateTR(order.placedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div>{order.user?.name ?? "—"}</div>
                    <div className="text-xs text-mist">{order.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    {formatPrice(Number(order.grandTotal), "tr")}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge>
                      {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge>
                      {SHIPMENT_STATUS_LABELS[order.shippingStatus]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge>
                      {ORDER_STATUS_LABELS[order.status]}
                    </StatusBadge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-sm underline underline-offset-4"
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
