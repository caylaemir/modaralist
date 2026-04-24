import Link from "next/link";
import { notFound } from "next/navigation";
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

function SectionHeader({
  eyebrow,
  title,
  right,
}: {
  eyebrow: string;
  title: string;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-end justify-between gap-4 border-t border-line pt-5">
      <div>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          {eyebrow}
        </p>
        <h2 className="display mt-3 text-2xl leading-none">{title}</h2>
      </div>
      {right ? <div className="shrink-0">{right}</div> : null}
    </div>
  );
}

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
      <header className="border-b border-line pb-8">
        <Link
          href="/admin/orders"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Siparişler
        </Link>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
              {order.orderNumber}
            </p>
            <h1 className="display mt-3 text-5xl leading-none">
              {order.user?.name ?? order.email.split("@")[0]}
            </h1>
            <p className="mt-3 text-xs text-mist tabular-nums">
              {formatDateTimeTR(order.placedAt)} · {order.locale.toUpperCase()}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge>{ORDER_STATUS_LABELS[order.status]}</StatusBadge>
            <StatusBadge>
              {PAYMENT_STATUS_LABELS[order.paymentStatus]}
            </StatusBadge>
            <StatusBadge>
              {SHIPMENT_STATUS_LABELS[order.shippingStatus]}
            </StatusBadge>
          </div>
        </div>
      </header>

      <div className="mt-10 grid grid-cols-1 items-start gap-10 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-14">
          <section>
            <SectionHeader eyebrow="— ürünler" title="Sipariş kalemleri" />
            <table className="mt-6 w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
                  <th className="border-b border-line py-3 text-left font-medium">
                    Ürün
                  </th>
                  <th className="border-b border-line py-3 text-left font-medium">
                    Varyant
                  </th>
                  <th className="border-b border-line py-3 text-right font-medium">
                    Adet
                  </th>
                  <th className="border-b border-line py-3 text-right font-medium">
                    Birim
                  </th>
                  <th className="border-b border-line py-3 text-right font-medium">
                    Toplam
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-10 text-center text-sm text-mist">
                      Sipariş kalemi yok.
                    </td>
                  </tr>
                ) : (
                  order.items.map((item) => (
                    <tr key={item.id} className="border-b border-line">
                      <td className="py-4 pr-4">{item.productNameSnapshot}</td>
                      <td className="py-4 pr-4 text-mist">
                        {item.variantSnapshot ?? "—"}
                      </td>
                      <td className="py-4 pr-4 text-right tabular-nums">
                        {item.quantity}
                      </td>
                      <td className="py-4 pr-4 text-right tabular-nums">
                        {formatPrice(Number(item.unitPrice), "tr")}
                      </td>
                      <td className="py-4 text-right tabular-nums">
                        {formatPrice(Number(item.lineTotal), "tr")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td
                    colSpan={4}
                    className="py-2 text-right text-[11px] uppercase tracking-[0.25em] text-mist"
                  >
                    Ara toplam
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatPrice(Number(order.subtotal), "tr")}
                  </td>
                </tr>
                <tr>
                  <td
                    colSpan={4}
                    className="py-2 text-right text-[11px] uppercase tracking-[0.25em] text-mist"
                  >
                    Kargo
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatPrice(Number(order.shippingCost), "tr")}
                  </td>
                </tr>
                {Number(order.discountTotal) > 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="py-2 text-right text-[11px] uppercase tracking-[0.25em] text-mist"
                    >
                      İndirim
                    </td>
                    <td className="py-2 text-right tabular-nums">
                      -{formatPrice(Number(order.discountTotal), "tr")}
                    </td>
                  </tr>
                ) : null}
                <tr>
                  <td
                    colSpan={4}
                    className="py-2 text-right text-[11px] uppercase tracking-[0.25em] text-mist"
                  >
                    KDV
                  </td>
                  <td className="py-2 text-right tabular-nums">
                    {formatPrice(Number(order.taxTotal), "tr")}
                  </td>
                </tr>
                <tr className="border-t-2 border-ink">
                  <td
                    colSpan={4}
                    className="py-4 text-right text-[11px] uppercase tracking-[0.25em]"
                  >
                    Genel toplam
                  </td>
                  <td className="display py-4 text-right text-2xl tabular-nums">
                    {formatPrice(Number(order.grandTotal), "tr")}
                  </td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <div>
              <SectionHeader eyebrow="— ödemeler" title="Ödeme" />
              {order.payments.length === 0 ? (
                <p className="mt-6 text-sm text-mist">Ödeme kaydı yok.</p>
              ) : (
                <ul className="mt-6 space-y-5">
                  {order.payments.map((p) => (
                    <li key={p.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[11px] uppercase tracking-[0.25em]">
                          {p.provider}
                        </span>
                        <StatusBadge>
                          {PAYMENT_STATUS_LABELS[p.status]}
                        </StatusBadge>
                      </div>
                      <p className="mt-2 tabular-nums">
                        {formatPrice(Number(p.amount), "tr")}
                      </p>
                      <p className="mt-1 text-xs text-mist tabular-nums">
                        {formatDateTimeTR(p.createdAt)}
                      </p>
                      {p.providerTxnId ? (
                        <p className="mt-2 break-all font-mono text-[10px] text-mist">
                          {p.providerTxnId}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <SectionHeader eyebrow="— kargo" title="Gönderi" />
              {order.shipments.length === 0 ? (
                <p className="mt-6 text-sm text-mist">Kargo kaydı yok.</p>
              ) : (
                <ul className="mt-6 space-y-5">
                  {order.shipments.map((s) => (
                    <li key={s.id} className="border-t border-line pt-4 first:border-0 first:pt-0">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-[11px] uppercase tracking-[0.25em]">
                          {s.carrier}
                        </span>
                        <StatusBadge>
                          {SHIPMENT_STATUS_LABELS[s.status]}
                        </StatusBadge>
                      </div>
                      {s.trackingNumber ? (
                        <p className="mt-2 font-mono text-xs">
                          {s.trackingNumber}
                        </p>
                      ) : null}
                      {s.trackingUrl ? (
                        <a
                          href={s.trackingUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-block text-[11px] uppercase tracking-[0.3em] text-mist underline underline-offset-4 hover:text-ink"
                        >
                          Takip linki →
                        </a>
                      ) : null}
                      <p className="mt-2 text-xs text-mist tabular-nums">
                        {formatDateTimeTR(s.shippedAt ?? s.createdAt)}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>

          <section>
            <SectionHeader eyebrow="— geçmiş" title="Durum geçmişi" />
            {order.history.length === 0 ? (
              <p className="mt-6 text-sm text-mist">Henüz geçmiş yok.</p>
            ) : (
              <ol className="mt-6 space-y-5">
                {order.history.map((h, idx) => (
                  <li key={h.id} className="flex gap-5">
                    <div className="flex flex-col items-center pt-1">
                      <span className="size-2 rounded-full bg-ink" />
                      {idx < order.history.length - 1 ? (
                        <span className="mt-1 h-full w-px bg-line" />
                      ) : null}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex flex-wrap items-center gap-2 text-sm">
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
                      <p className="mt-2 text-xs text-mist tabular-nums">
                        {formatDateTimeTR(h.createdAt)}
                        {h.changedBy ? ` · ${h.changedBy}` : ""}
                      </p>
                      {h.note ? <p className="mt-2 text-sm">{h.note}</p> : null}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </div>

        <aside className="space-y-10 lg:sticky lg:top-10 lg:self-start">
          <section>
            <p className="border-t border-line pt-5 text-[10px] uppercase tracking-[0.4em] text-mist">
              — müşteri
            </p>
            <div className="mt-4 space-y-1 text-sm">
              <p>{order.user?.name ?? "Misafir"}</p>
              <p>
                <a
                  href={`mailto:${order.email}`}
                  className="text-mist hover:text-ink"
                >
                  {order.email}
                </a>
              </p>
              {order.phone ? (
                <p>
                  <a
                    href={`tel:${order.phone}`}
                    className="text-mist hover:text-ink tabular-nums"
                  >
                    {order.phone}
                  </a>
                </p>
              ) : null}
              {order.couponCode ? (
                <p className="pt-2 text-[10px] uppercase tracking-[0.25em] text-mist">
                  Kupon · {order.couponCode}
                </p>
              ) : null}
            </div>
          </section>

          <section>
            <p className="border-t border-line pt-5 text-[10px] uppercase tracking-[0.4em] text-mist">
              — teslimat adresi
            </p>
            {shippingAddress ? (
              <div className="mt-4 space-y-1 text-sm">
                <p>{shippingAddress.fullName}</p>
                <p className="text-mist tabular-nums">
                  {shippingAddress.phone}
                </p>
                <p>{shippingAddress.street}</p>
                <p>
                  {shippingAddress.district}, {shippingAddress.city}
                  {shippingAddress.zip ? ` ${shippingAddress.zip}` : ""}
                </p>
                <p className="text-mist">{shippingAddress.country}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-mist">Kayıtlı adres yok.</p>
            )}
          </section>

          <section>
            <p className="border-t border-line pt-5 text-[10px] uppercase tracking-[0.4em] text-mist">
              — fatura adresi
            </p>
            {billingAddress ? (
              <div className="mt-4 space-y-1 text-sm">
                <p>{billingAddress.fullName}</p>
                <p className="text-mist tabular-nums">{billingAddress.phone}</p>
                <p>{billingAddress.street}</p>
                <p>
                  {billingAddress.district}, {billingAddress.city}
                  {billingAddress.zip ? ` ${billingAddress.zip}` : ""}
                </p>
                <p className="text-mist">{billingAddress.country}</p>
              </div>
            ) : (
              <p className="mt-4 text-sm text-mist">
                Teslimat adresiyle aynı.
              </p>
            )}
          </section>

          <div className="border-t border-line pt-6">
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
          </div>
        </aside>
      </div>
    </div>
  );
}
