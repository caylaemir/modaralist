import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Reveal } from "@/components/shop/reveal";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

const statusLabel: Record<string, string> = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;

  let orders: Awaited<ReturnType<typeof db.order.findMany>> = [];
  try {
    orders = await db.order.findMany({
      where: { userId: session.user.id },
      orderBy: { placedAt: "desc" },
      take: 20,
    });
  } catch {
    // DB bağlı değilse sessizce boş dön
  }

  return (
    <>
      <Reveal>
        <h2 className="display text-4xl md:text-5xl">Siparişlerim.</h2>
      </Reveal>

      {orders.length === 0 ? (
        <Reveal delay={0.2}>
          <div className="mt-16 border border-line bg-bone p-12 text-center">
            <p className="display text-3xl">Henüz sipariş yok.</p>
            <p className="mt-4 text-sm text-mist">
              İlk parçanla buluşmak için alışverişe başla.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
            >
              Mağazaya Git →
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="mt-12 divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/account/orders/${o.orderNumber}`}
              className="grid grid-cols-2 gap-4 py-6 text-sm transition-colors hover:bg-bone md:grid-cols-5"
            >
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  No
                </p>
                <p className="mt-1 tabular-nums">{o.orderNumber}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Tarih
                </p>
                <p className="mt-1">
                  {new Date(o.placedAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Durum
                </p>
                <p className="mt-1">{statusLabel[o.status] ?? o.status}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Tutar
                </p>
                <p className="mt-1 tabular-nums">
                  {formatPrice(Number(o.grandTotal), "tr")}
                </p>
              </div>
              <div className="text-right text-mist">→</div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
