import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { TrackForm } from "./track-form";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Sipariş Takibi",
  description: "Sipariş numarası ve e-posta ile sipariş durumunu sorgula.",
};

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade Edildi",
};

const STEPS = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"] as const;

function isCompleted(currentStatus: string, step: string): boolean {
  if (currentStatus === "CANCELLED" || currentStatus === "REFUNDED") return false;
  const order = ["PAID", "PREPARING", "SHIPPED", "DELIVERED"];
  return order.indexOf(currentStatus) >= order.indexOf(step);
}

export default async function TrackPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string; email?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { order: orderNumber = "", email = "" } = await searchParams;
  const queried = orderNumber.trim().length > 0 && email.trim().length > 0;

  const order = queried
    ? await db.order
        .findFirst({
          where: {
            orderNumber: orderNumber.trim().toUpperCase(),
            email: email.trim().toLowerCase(),
          },
          include: {
            items: { select: { productNameSnapshot: true, variantSnapshot: true, quantity: true, lineTotal: true } },
            shipments: { orderBy: { createdAt: "desc" } },
            addresses: { where: { type: "SHIPPING" } },
          },
        })
        .catch(() => null)
    : null;

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto max-w-3xl px-5 pt-24 pb-32 md:px-10 md:pt-40">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — sipariş takibi
        </p>
      </Reveal>
      <h1 className="display mt-6 text-[12vw] leading-[0.95] md:text-[5vw]">
        Sipariş nerede?
      </h1>
      <p className="mt-6 max-w-md text-sm text-mist">
        Sipariş numarası ve sipariş esnasında verdiğin e-postayı yaz, durumu
        anında gör.
      </p>

      <div className="mt-12">
        <TrackForm
          initialOrder={orderNumber}
          initialEmail={email}
        />
      </div>

      {queried && !order ? (
        <div className="mt-16 border-t border-line pt-10 text-center">
          <p className="display text-3xl italic text-mist">
            Eşleşen sipariş bulunamadı
          </p>
          <p className="mt-4 text-sm text-mist">
            Sipariş numarası ve e-posta birlikte doğru olmalı. Sipariş onay
            mailindeki bilgileri kontrol et.
          </p>
        </div>
      ) : null}

      {order ? (
        <article className="mt-16">
          <header className="border-t border-line pt-8">
            <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
              {order.orderNumber}
            </p>
            <h2 className="display mt-3 text-3xl">
              {STATUS_LABEL[order.status]}
            </h2>
            <p className="mt-2 text-xs text-mist tabular-nums">
              {dateFmt.format(order.placedAt)}
            </p>
          </header>

          {order.status !== "CANCELLED" && order.status !== "REFUNDED" ? (
            <div className="mt-10">
              <ol className="grid grid-cols-4 gap-2">
                {STEPS.map((s) => {
                  const done = isCompleted(order.status, s);
                  return (
                    <li
                      key={s}
                      className={`border-t-2 pt-4 ${
                        done ? "border-ink" : "border-line"
                      }`}
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
          ) : null}

          {order.shipments[0] ? (
            <section className="mt-12 border-t border-line pt-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                — kargo
              </p>
              <p className="mt-3 text-sm">
                {order.shipments[0].carrier}
                {order.shipments[0].trackingNumber ? (
                  <span className="ml-3 font-mono text-xs">
                    {order.shipments[0].trackingNumber}
                  </span>
                ) : null}
              </p>
              {order.shipments[0].trackingUrl ? (
                <a
                  href={order.shipments[0].trackingUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                >
                  Kargo firmasında takip et →
                </a>
              ) : null}
            </section>
          ) : null}

          <section className="mt-12 border-t border-line pt-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — kalemler
            </p>
            <ul className="mt-4">
              {order.items.map((it, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-4 border-b border-line py-3 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <p>{it.productNameSnapshot}</p>
                    {it.variantSnapshot ? (
                      <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-mist">
                        {it.variantSnapshot} · {it.quantity}
                      </p>
                    ) : null}
                  </div>
                  <p className="shrink-0 tabular-nums">
                    {formatPrice(Number(it.lineTotal))}
                  </p>
                </li>
              ))}
              <li className="flex items-center justify-between gap-4 pt-4 text-sm">
                <p className="text-[11px] uppercase tracking-[0.3em] text-mist">
                  Toplam
                </p>
                <p className="display text-xl tabular-nums">
                  {formatPrice(Number(order.grandTotal))}
                </p>
              </li>
            </ul>
          </section>

          {order.addresses[0] ? (
            <section className="mt-12 border-t border-line pt-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                — teslimat adresi
              </p>
              <div className="mt-3 text-sm">
                <p>{order.addresses[0].fullName}</p>
                <p className="text-mist">{order.addresses[0].street}</p>
                <p className="text-mist">
                  {order.addresses[0].district}, {order.addresses[0].city}
                </p>
              </div>
            </section>
          ) : null}
        </article>
      ) : null}
    </main>
  );
}
