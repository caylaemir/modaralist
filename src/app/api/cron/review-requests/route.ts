import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, reviewRequestHtml } from "@/lib/email";
import { verifyCronAuth } from "@/lib/cron-auth";

/**
 * GET /api/cron/review-requests
 *
 * Gunde 1 kez calistirilir (VPS cron veya GitHub Actions schedule).
 * Authorization: Bearer <CRON_SECRET> header'i ile korunur.
 *
 * Davranis:
 * - DELIVERED siparisleri 5-7 gun once teslim alanlari bul
 * - Her order icin: o user/email iliskili herhangi bir Review yazmis mi?
 *   - Yazmamissa: en pahali itemi sec, review request mail at
 *   - Yazmissa: skip
 * - Tek seferlik trigger: pencere ~1 gun genisliginde (6-7 gun once teslim
 *   edilmis) — gunluk cron'da her siparis bu pencereye yalnizca BIR kez girer,
 *   yani musteriye ayni mail iki kez gitmez. (Onceki 5-7 gun penceresi 2 gun
 *   genisindeydi -> ust uste 2 gun eslesip cifte mail atiyordu, ozellikle
 *   misafir siparislerinde -- duzeltildi.)
 *
 * Cron komutu (VPS crontab):
 *   0 10 * * * curl -fsSL -H "Authorization: Bearer $CRON_SECRET" https://modaralist.com/api/cron/review-requests
 */
export async function GET(req: Request) {
  if (!verifyCronAuth(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const sevenDaysAgo = new Date(Date.now() - 7 * 86400_000);
  const sixDaysAgo = new Date(Date.now() - 6 * 86400_000);

  // updatedAt'i 6-7 gun once olan + DELIVERED siparisler (~1 gunluk pencere)
  // (updatedAt status degisince update olur, teslim zamani proxy'si)
  const deliveredOrders = await db.order.findMany({
    where: {
      status: "DELIVERED",
      updatedAt: { gte: sevenDaysAgo, lt: sixDaysAgo },
    },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      userId: true,
      locale: true,
      items: {
        select: {
          variantId: true,
          productNameSnapshot: true,
          unitPrice: true,
          variant: {
            select: {
              product: {
                select: {
                  id: true,
                  slug: true,
                  images: {
                    where: { isHover: false },
                    orderBy: { sortOrder: "asc" },
                    take: 1,
                    select: { url: true },
                  },
                },
              },
            },
          },
        },
        orderBy: { unitPrice: "desc" },
      },
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.com";

  let sent = 0;
  let skipped = 0;

  for (const order of deliveredOrders) {
    if (order.items.length === 0) {
      skipped++;
      continue;
    }

    // Bu user'in herhangi bir review'i var mi (sadece login olanlar icin)
    if (order.userId) {
      const existingReview = await db.review.findFirst({
        where: { userId: order.userId },
        select: { id: true },
      });
      if (existingReview) {
        skipped++;
        continue;
      }
    }

    const topItem = order.items[0];
    const product = topItem.variant?.product;
    if (!product) {
      skipped++;
      continue;
    }

    const localePath = order.locale === "en" ? "/en" : "/tr";
    const reviewUrl = `${baseUrl}${localePath}/products/${product.slug}#reviews`;

    const customerName = order.email.split("@")[0] || "müşteri";

    const result = await sendEmail({
      to: order.email,
      subject: "Aldığın parça nasıldı? — Modaralist",
      html: reviewRequestHtml({
        customerName,
        orderNumber: order.orderNumber,
        productName: topItem.productNameSnapshot,
        productSlug: product.slug,
        productImage: product.images[0]?.url,
        reviewUrl,
      }),
    });

    if (result.id) sent++;
    else skipped++;
  }

  // Minimal response (M1): caller'a istatistik vermiyoruz, sadece logla
  console.log(
    `[cron/review-requests] candidates=${deliveredOrders.length} sent=${sent} skipped=${skipped}`
  );
  return NextResponse.json({ ok: true });
}
