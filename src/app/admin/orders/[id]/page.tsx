import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { StatusBadge } from "@/app/admin/_components/status-badge";
import { ActionsPanel } from "./actions-panel";
import {
  ORDER_STATUS_LABELS,
  PAYMENT_STATUS_LABELS,
  SHIPMENT_STATUS_LABELS,
  formatDateTimeTR,
} from "../_lib";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const order = await db.order
    .findUnique({
      where: { id },
      include: {
        items: true,
        addresses: true,
        payments: { orderBy: { createdAt: "desc" } },
        shipments: { orderBy: { createdAt: "desc" } },
        history: { orderBy: { createdAt: "desc" } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    })
    .catch(() => null);

  if (!order) {
    notFound();
  }

  const shippingAddress = order.addresses.find((a) => a.type === "SHIPPING");
  const billingAddress = order.addresses.find((a) => a.type === "BILLING");
  const latestShipment = order.shipments[0] ?? null;

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-mist hover:text-ink"
          >
            <ArrowLeft className="size-3" />
            Siparişler
          </Link>
          <h1 className="display mt-2 text-4xl">
            Sipariş {order.orderNumber}
          </h1>
          <p className="mt-2 text-sm text-mist">
            {formatDateTimeTR(order.placedAt)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          {/* Summary */}
          <section className="rounded border border-line bg-paper p-5">
            <h2 className="caps-wide text-xs">Özet</h2>
            <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
              <div>
                <p className="eyebrow text-mist">Sipariş</p>
                <p className="mt-1 text-sm">
                  <StatusBadge>
                    {ORDER_STATUS_LABELS[order.status]}
                  </StatusBadge>
                </p>
              </div>
              <div>
                <p className="eyebrow text-mist">Ödeme</p>
                <p className="mt-1 text-sm">
                  <StatusBadge>
                    {PAYMENT_STATUS_LABELS[order.paymentStatus]}
                  </StatusBadge>
                </p>
              </div>
              <div>
                <p className="eyebrow text-mist">Kargo</p>
                <p className="mt-1 text-sm">
                  <StatusBadge>
                    {SHIPMENT_STATUS_LABELS[order.shippingStatus]}
                  </StatusBadge>
                </p>
              </div>
              <div>
                <p className="eyebrow text-mist">Toplam</p>
                <p className="display mt-1 text-xl">
                  {formatPrice(Number(order.grandTotal), "tr")}
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-line pt-4 md:grid-cols-3">
              <div>
                <p className="eyebrow text-mist">Müşteri</p>
                <p className="mt-1 text-sm">
                  {order.user?.name ?? "Misafir"}
                </p>
                <p className="text-xs text-mist">{order.email}</p>
                {order.phone ? (
                  <p className="text-xs text-mist">{order.phone}</p>
                ) : null}
              </div>
              <div>
                <p className="eyebrow text-mist">Locale</p>
                <p className="mt-1 text-sm uppercase">{order.locale}</p>
              </div>
              <div>
                <p className="eyebrow text-mist">Kupon</p>
                <p className="mt-1 text-sm">{order.couponCode ?? "—"}</p>
              </div>
            </div>
          </section>

          {/* Items */}
          <section className="rounded border border-line bg-paper">
            <div className="border-b border-line px-5 py-4">
              <h2 className="caps-wide text-xs">Ürünler</h2>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-bone text-left">
                <tr>
                  <th className="px-4 py-3 font-medium">Ürün</th>
                  <th className="px-4 py-3 font-medium">Varyant</th>
                  <th className="px-4 py-3 font-medium text-right">Adet</th>
                  <th className="px-4 py-3 font-medium text-right">
                    Birim Fiyat
                  </th>
                  <th className="px-4 py-3 font-medium text-right">Toplam</th>
                </tr>
              </thead>
              <tbody>
                {order.items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-8 text-center text-mist"
                    >
                      Sipariş kalemi yok.
                    </td>
                  </tr>
                ) : (
                  order.items.map((item) => (
                    <tr
                      key={item.id}
                      className="border-t border-line"
                    >
                      <td className="px-4 py-3">{item.productNameSnapshot}</td>
                      <td className="px-4 py-3 text-mist">
                        {item.variantSnapshot ?? "—"}
                      </td>
                      <td className="px-4 py-3 text-right">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {formatPrice(Number(item.unitPrice), "tr")}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {formatPrice(Number(item.lineTotal), "tr")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot className="bg-bone">
                <tr className="border-t border-line">
                  <td colSpan={4} className="px-4 py-2 text-right text-mist">
                    Ara Toplam
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatPrice(Number(order.subtotal), "tr")}
                  </td>
                </tr>
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-mist">
                    Kargo
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatPrice(Number(order.shippingCost), "tr")}
                  </td>
                </tr>
                {Number(order.discountTotal) > 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-2 text-right text-mist">
                      İndirim
                    </td>
                    <td className="px-4 py-2 text-right">
                      -{formatPrice(Number(order.discountTotal), "tr")}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td colSpan={4} className="px-4 py-2 text-right text-mist">
                    KDV
                  </td>
                  <td className="px-4 py-2 text-right">
                    {formatPrice(Number(order.taxTotal), "tr")}
                  </td>
                </tr>
                <tr className="border-t border-line">
                  <td colSpan={4} className="px-4 py-3 text-right font-medium">
                    Genel Toplam
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {formatPrice(Number(order.grandTotal), "tr")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          {/* Addresses */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-line bg-paper p-5">
              <h3 className="caps-wide text-xs">Teslimat Adresi</h3>
              {shippingAddress ? (
                <div className="mt-3 space-y-0.5 text-sm">
                  <p className="font-medium">{shippingAddress.fullName}</p>
                  <p className="text-mist">{shippingAddress.phone}</p>
                  <p>{shippingAddress.street}</p>
                  <p>
                    {shippingAddress.district}, {shippingAddress.city}
                    {shippingAddress.zip ? ` ${shippingAddress.zip}` : ""}
                  </p>
                  <p className="text-mist">{shippingAddress.country}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-mist">Kayıtlı adres yok.</p>
              )}
            </div>
            <div className="rounded border border-line bg-paper p-5">
              <h3 className="caps-wide text-xs">Fatura Adresi</h3>
              {billingAddress ? (
                <div className="mt-3 space-y-0.5 text-sm">
                  <p className="font-medium">{billingAddress.fullName}</p>
                  <p className="text-mist">{billingAddress.phone}</p>
                  <p>{billingAddress.street}</p>
                  <p>
                    {billingAddress.district}, {billingAddress.city}
                    {billingAddress.zip ? ` ${billingAddress.zip}` : ""}
                  </p>
                  <p className="text-mist">{billingAddress.country}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-mist">
                  Teslimat adresiyle aynı.
                </p>
              )}
            </div>
          </section>

          {/* Payments & Shipments */}
          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="rounded border border-line bg-paper p-5">
              <h3 className="caps-wide text-xs">Ödemeler</h3>
              {order.payments.length === 0 ? (
                <p className="mt-3 text-sm text-mist">Ödeme kaydı yok.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {order.payments.map((p) => (
                    <li
                      key={p.id}
                      className="border-t border-line pt-3 first:border-0 first:pt-0"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{p.provider}</span>
                        <StatusBadge>
                          {PAYMENT_STATUS_LABELS[p.status]}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-xs text-mist">
                        {formatPrice(Number(p.amount), "tr")} ·{" "}
                        {formatDateTimeTR(p.createdAt)}
                      </p>
                      {p.providerTxnId ? (
                        <p className="mt-0.5 font-mono text-[10px] text-mist">
                          {p.providerTxnId}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="rounded border border-line bg-paper p-5">
              <h3 className="caps-wide text-xs">Kargo</h3>
              {order.shipments.length === 0 ? (
                <p className="mt-3 text-sm text-mist">Kargo kaydı yok.</p>
              ) : (
                <ul className="mt-3 space-y-3">
                  {order.shipments.map((s) => (
                    <li
                      key={s.id}
                      className="border-t border-line pt-3 first:border-0 first:pt-0"
                    >
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{s.carrier}</span>
                        <StatusBadge>
                          {SHIPMENT_STATUS_LABELS[s.status]}
                        </StatusBadge>
                      </div>
                      {s.trackingNumber ? (
                        <p className="mt-1 font-mono text-xs">
                          {s.trackingNumber}
                        </p>
                      ) : null}
                      {s.trackingUrl ? (
                        <a
                          href={s.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block text-xs text-mist underline underline-offset-4 hover:text-ink"
                        >
                          Takip linki →
                        </a>
                      ) : null}
                      <p className="mt-1 text-xs text-mist">
                        {formatDateTimeTR(s.shippedAt ?? s.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          {/* History */}
          <section className="rounded border border-line bg-paper p-5">
            <h3 className="caps-wide text-xs">Durum Geçmişi</h3>
            {order.history.length === 0 ? (
              <p className="mt-3 text-sm text-mist">Henüz geçmiş yok.</p>
            ) : (
              <ol className="mt-4 space-y-4">
                {order.history.map((h) => (
                  <li key={h.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <span className="mt-1 size-2 rounded-full bg-ink" />
                      <span className="mt-1 h-full w-px bg-line" />
                    </div>
                    <div className="flex-1 pb-2">
                      <div className="flex items-center gap-2 text-sm">
                        {h.fromStatus ? (
                          <>
                            <StatusBadge>
                              {ORDER_STATUS_LABELS[h.fromStatus]}
                            </StatusBadge>
                            <span className="text-mist">→</span>
                          </>
                        ) : null}
                        <StatusBadge>
                          {ORDER_STATUS_LABELS[h.toStatus]}
                        </StatusBadge>
                      </div>
                      <p className="mt-1 text-xs text-mist">
                        {formatDateTimeTR(h.createdAt)}
                        {h.changedBy ? ` · ${h.changedBy}` : ""}
                      </p>
                      {h.note ? (
                        <p className="mt-1 text-sm">{h.note}</p>
                      ) : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <ActionsPanel
            orderId={order.id}
            currentStatus={order.status}
            currentTracking={
              latestShipment
                ? {
                    carrier: latestShipment.carrier,
                    trackingNumber: latestShipment.trackingNumber,
                    trackingUrl: latestShipment.trackingUrl,
                  }
                : null
            }
          />
        </aside>
      </div>
    </div>
  );
}
