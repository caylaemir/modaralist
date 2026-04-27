import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { OrderReviewButton } from "@/components/shop/order-review-button";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order: orderNumber } = await searchParams;

  // Sipariş detayini cek (kullanici giris yapmissa kendi siparisi olmali)
  const session = await auth();
  const order =
    orderNumber && session?.user?.id
      ? await db.order
          .findFirst({
            where: {
              orderNumber: orderNumber.toUpperCase(),
              userId: session.user.id,
            },
            include: {
              items: {
                include: {
                  variant: {
                    include: {
                      product: {
                        select: {
                          id: true,
                          slug: true,
                          images: {
                            orderBy: { sortOrder: "asc" },
                            take: 1,
                            select: { url: true },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          })
          .catch(() => null)
      : null;

  // Yorum durumu — sadece SHIPPED/DELIVERED'da reviewable. Yeni PAID
  // siparis genelde reviewable olmaz, ama nadiren API gecikmeli olabilir.
  const isReviewable =
    order?.status === "DELIVERED" || order?.status === "SHIPPED";
  const productIds = order
    ? Array.from(
        new Set(
          order.items
            .map((it) => it.variant?.product?.id)
            .filter((id): id is string => Boolean(id))
        )
      )
    : [];
  const existingReviews =
    isReviewable && productIds.length > 0 && session?.user?.id
      ? await db.review.findMany({
          where: { userId: session.user.id, productId: { in: productIds } },
          select: { productId: true },
        })
      : [];
  const reviewedProductIds = new Set(existingReviews.map((r) => r.productId));

  return (
    <div className="mx-auto max-w-3xl px-5 py-24 md:px-10 md:py-32">
      <Reveal>
        <p className="text-center text-[10px] uppercase tracking-[0.4em] text-mist">
          — tamamlandı
        </p>
        <h1 className="display mt-8 text-center text-[10vw] leading-[0.95] md:text-[6vw]">
          Hoş geldin drop'a.
        </h1>
        <p className="mx-auto mt-8 max-w-md text-center text-base leading-relaxed text-mist">
          Siparişin alındı{orderNumber ? ` — referans ${orderNumber}` : ""}.
          Onay e-postası yolda. Kargolanınca tekrar haber vereceğiz.
        </p>
      </Reveal>

      {order && order.items.length > 0 ? (
        <Reveal delay={0.2}>
          <section className="mt-16 border-t border-line pt-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — aldığın parçalar
            </p>
            <h2 className="display mt-3 text-2xl">
              {order.items.length} ürün
            </h2>

            <ul className="mt-6 space-y-3">
              {order.items.map((it) => {
                const slug = it.variant?.product?.slug;
                const productId = it.variant?.product?.id;
                const cover = it.variant?.product?.images[0]?.url;
                const reviewState =
                  !isReviewable || !slug
                    ? "not-deliverable"
                    : productId && reviewedProductIds.has(productId)
                      ? "reviewed"
                      : "reviewable";
                return (
                  <li
                    key={it.id}
                    className="flex items-center gap-4 border border-line bg-paper p-3"
                  >
                    <div className="relative size-16 shrink-0 overflow-hidden bg-bone">
                      {cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={cover}
                          alt={it.productNameSnapshot}
                          className="size-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">
                        {it.productNameSnapshot}
                      </p>
                      {it.variantSnapshot ? (
                        <p className="mt-0.5 text-[10px] uppercase tracking-[0.25em] text-mist">
                          {it.variantSnapshot} · {it.quantity} adet
                        </p>
                      ) : null}
                      {slug ? (
                        <div className="mt-2">
                          <OrderReviewButton
                            productSlug={slug}
                            productName={it.productNameSnapshot}
                            state={reviewState}
                          />
                        </div>
                      ) : null}
                    </div>
                    <p className="shrink-0 text-sm tabular-nums">
                      {formatPrice(Number(it.lineTotal))}
                    </p>
                  </li>
                );
              })}
            </ul>

            {!isReviewable ? (
              <div className="mt-6 border border-line bg-bone/40 p-4 text-[12px] text-mist">
                Ürünlerin eline ulaştığında{" "}
                <Link
                  href="/account/orders"
                  className="text-ink underline underline-offset-4"
                >
                  Siparişlerim
                </Link>{" "}
                sayfasından her birine yorum bırakabilirsin.
              </div>
            ) : null}
          </section>
        </Reveal>
      ) : null}

      <Reveal delay={0.3}>
        <div className="mt-16 flex flex-wrap justify-center gap-4">
          <Link
            href="/account/orders"
            className="border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper"
          >
            Siparişlerim
          </Link>
          <Link
            href="/shop"
            className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            Alışverişe Devam →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
