import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Reveal } from "@/components/shop/reveal";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};

const PROGRESS = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

function isCompleted(currentStatus: string, step: string): boolean {
  if (currentStatus === "CANCELLED" || currentStatus === "REFUNDED") return false;
  const order = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"];
  return order.indexOf(currentStatus) >= order.indexOf(step);
}

export default async function CustomerOrderDetail({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/tr/login?callbackUrl=/account/orders");

  const { orderNumber } = await params;

  const order = await db.order
    .findFirst({
      where: {
        orderNumber: orderNumber.toUpperCase(),
        userId: session.user.id,
      },
      include: {
        items: true,
        addresses: true,
        shipments: { orderBy: { createdAt: "desc" } },
        payments: { orderBy: { createdAt: "desc" } },
      },
    })
    .catch(() => null);

  if (!order) notFound();

  const shipping = order.addresses.find((a) => a.type === "SHIPPING");
  const billing = order.addresses.find((a) => a.type === "BILLING");
  const latestShipment = order.shipments[0] ?? null;

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <>
      <Reveal>
        <Link
          href="/account/orders"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Siparişlerim
        </Link>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
          {order.orderNumber}
        </p>
        <h2 className="display mt-3 text-4xl md:text-5xl">
          {STATUS_LABEL[order.status]}
        </h2>
        <p className="mt-2 text-xs text-mist tabular-nums">
          {dateFmt.format(order.placedAt)}
        </p>
      </Reveal>

      {order.status !== "CANCELLED" && order.status !== "REFUNDED" ? (
        <Reveal delay={0.2}>
          <div className="mt-12">
            <ol className="grid grid-cols-4 gap-2">
              {PROGRESS.map((s) => {
                const done = isCompleted(order.status, s);
                return (
                  <li
                    key={s}
                    className={`border-t-2 pt-4 ${done ? "border-ink" : "border-line"}`}
                  >
                    <p
                      className={`text-[10px] uppercase tracking-[0.3em] ${
                        done ? "text-ink" : "text-mist"
                      }`}
                    >
                      {STATUS_LABEL[s]}
                    </p>
                  </li>
                );
              })}
            </ol>
          </div>
        </Reveal>
      ) : null}

      <Reveal delay={0.3}>
        <section className="mt-12 border-t border-line pt-8">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">— ürünler</p>
          <ul className="mt-4">
            {order.items.map((it) => (
              <li
                key={it.id}
                className="flex items-center justify-between gap-4 border-b border-line py-4 text-sm"
              >
                <div className="min-w-0 flex-1">
                  <p>{it.productNameSnapshot}</p>
                  {it.variantSnapshot ? (
                    <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-mist">
                      {it.variantSnapshot} · {it.quantity} adet
                    </p>
                  ) : null}
                </div>
                <p className="shrink-0 tabular-nums">
                  {formatPrice(Number(it.lineTotal))}
                </p>
              </li>
            ))}
          </ul>

          <dl className="mt-6 grid gap-2 text-sm">
            <div className="flex justify-between text-mist">
              <dt>Ara toplam</dt>
              <dd className="tabular-nums">{formatPrice(Number(order.subtotal))}</dd>
            </div>
            <div className="flex justify-between text-mist">
              <dt>Kargo</dt>
              <dd className="tabular-nums">{formatPrice(Number(order.shippingCost))}</dd>
            </div>
            {Number(order.discountTotal) > 0 ? (
              <div className="flex justify-between text-mist">
                <dt>İndirim</dt>
                <dd className="tabular-nums">
                  -{formatPrice(Number(order.discountTotal))}
                </dd>
              </div>
            ) : null}
            <div className="flex justify-between border-t-2 border-ink pt-3 text-base">
              <dt>Toplam</dt>
              <dd className="display tabular-nums">
                {formatPrice(Number(order.grandTotal))}
              </dd>
            </div>
          </dl>
        </section>
      </Reveal>

      {latestShipment ? (
        <Reveal delay={0.4}>
          <section className="mt-12 border-t border-line pt-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">— kargo</p>
            <p className="mt-3 text-sm">
              {latestShipment.carrier}
              {latestShipment.trackingNumber ? (
                <span className="ml-3 font-mono text-xs">
                  {latestShipment.trackingNumber}
                </span>
              ) : null}
            </p>
            {latestShipment.trackingUrl ? (
              <a
                href={latestShipment.trackingUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-3 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
              >
                Kargo firmasında takip et →
              </a>
            ) : null}
          </section>
        </Reveal>
      ) : null}

      <Reveal delay={0.5}>
        <section className="mt-12 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
          {shipping ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                — teslimat adresi
              </p>
              <div className="mt-3 text-sm leading-relaxed">
                <p>{shipping.fullName}</p>
                <p className="text-mist">{shipping.phone}</p>
                <p className="mt-2">{shipping.street}</p>
                <p className="text-mist">
                  {shipping.district}, {shipping.city}
                  {shipping.zip ? ` ${shipping.zip}` : ""}
                </p>
              </div>
            </div>
          ) : null}
          {billing ? (
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                — fatura adresi
              </p>
              <div className="mt-3 text-sm leading-relaxed">
                <p>{billing.fullName}</p>
                <p className="text-mist">{billing.phone}</p>
                <p className="mt-2">{billing.street}</p>
                <p className="text-mist">
                  {billing.district}, {billing.city}
                  {billing.zip ? ` ${billing.zip}` : ""}
                </p>
              </div>
            </div>
          ) : null}
        </section>
      </Reveal>
    </>
  );
}
