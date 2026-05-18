import Image from "next/image";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Reveal } from "@/components/shop/reveal";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";

export const dynamic = "force-dynamic";

const statusLabel: Record<string, string> = {
  PENDING: "Beklemede",
  PAID: "Ödendi",
  PREPARING: "Hazırlanıyor",
  SHIPPED: "Kargoda",
  DELIVERED: "Teslim Edildi",
  CANCELLED: "İptal",
  REFUNDED: "İade",
};

// Bir order item icin gosterilecek gorseli sec: 1) o varyantin renginin
// gorseli, 2) renksiz/genel gorsel, 3) urunun ilk gorseli.
function pickItemImage(
  images: { url: string; colorId: string | null }[],
  variantColorId: string | null
): string | null {
  if (variantColorId) {
    const m = images.find((i) => i.colorId === variantColorId);
    if (m) return m.url;
  }
  const shared = images.find((i) => i.colorId === null);
  if (shared) return shared.url;
  return images[0]?.url ?? null;
}

function orderQuery(userId: string) {
  return db.order.findMany({
    where: { userId },
    orderBy: { placedAt: "desc" },
    take: 20,
    include: {
      items: {
        select: {
          id: true,
          productNameSnapshot: true,
          variantSnapshot: true,
          variant: {
            select: {
              colorId: true,
              product: {
                select: {
                  slug: true,
                  images: {
                    orderBy: { sortOrder: "asc" },
                    select: { url: true, colorId: true },
                  },
                },
              },
            },
          },
        },
      },
    },
  });
}

export default async function OrdersPage() {
  const session = await auth();
  if (!session?.user) return null;

  let orders: Awaited<ReturnType<typeof orderQuery>> = [];
  try {
    orders = await orderQuery(session.user.id);
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
          {orders.map((o) => {
            // Her line item icin gosterilecek gorseli derle (varyantin rengine
            // gore — yoksa genel / ilk gorsel). Aynisi tekrar etmesin diye URL
            // bazinda dedupe.
            const seen = new Set<string>();
            const thumbs: { url: string; alt: string }[] = [];
            for (const it of o.items) {
              const url = pickItemImage(
                it.variant?.product?.images ?? [],
                it.variant?.colorId ?? null
              );
              if (!url || seen.has(url)) continue;
              seen.add(url);
              thumbs.push({
                url,
                alt: [it.productNameSnapshot, it.variantSnapshot]
                  .filter(Boolean)
                  .join(" — "),
              });
            }
            const maxThumbs = 4;
            const visible = thumbs.slice(0, maxThumbs);
            const extra = Math.max(0, thumbs.length - maxThumbs);

            return (
              <Link
                key={o.id}
                href={`/account/orders/${o.orderNumber}`}
                className="block py-6 text-sm transition-colors hover:bg-bone"
              >
                {visible.length > 0 ? (
                  <div className="mb-4 flex items-center gap-2">
                    {visible.map((t, i) => (
                      <div
                        key={i}
                        className="relative size-14 shrink-0 overflow-hidden bg-bone"
                      >
                        <Image
                          src={t.url}
                          alt={t.alt}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                    ))}
                    {extra > 0 ? (
                      <span className="grid size-14 shrink-0 place-items-center bg-bone text-[11px] uppercase tracking-[0.2em] text-mist">
                        +{extra}
                      </span>
                    ) : null}
                  </div>
                ) : null}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
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
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
