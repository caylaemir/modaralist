import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, abandonedCartHtml } from "@/lib/email";
import { formatPrice } from "@/lib/utils";

/**
 * GET /api/cron/abandoned-cart
 *
 * Saatte bir calistirilir (VPS cron).
 * Authorization: Bearer <CRON_SECRET>.
 *
 * Davranis:
 * - Order.status='PENDING' AND paymentStatus='PENDING' kayitlari bul
 * - placedAt 1-24 saat once olanlar (cok yeni: kullanici hala odeme yapiyor olabilir,
 *   cok eski: terk edilmis)
 * - notes alaninda 'abandoned-mailed' yoksa: mail at + notes'u guncelle
 *
 * Cron komutu (VPS crontab):
 *   0 * * * * curl -fsSL -H "Authorization: Bearer $CRON_SECRET" https://modaralist.shop/api/cron/abandoned-cart
 */
export async function GET(req: Request) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60_000);
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60_000);

  const candidates = await db.order.findMany({
    where: {
      status: "PENDING",
      paymentStatus: "PENDING",
      placedAt: { gte: oneDayAgo, lte: oneHourAgo },
      // notes alaninda flag yoksa
      OR: [{ notes: null }, { notes: { not: { contains: "abandoned-mailed" } } }],
    },
    select: {
      id: true,
      orderNumber: true,
      email: true,
      locale: true,
      notes: true,
      items: {
        select: {
          productNameSnapshot: true,
          unitPrice: true,
          quantity: true,
          variant: {
            select: {
              product: {
                select: {
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
      },
    },
  });

  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";

  let sent = 0;
  let skipped = 0;

  for (const order of candidates) {
    if (order.items.length === 0) {
      skipped++;
      continue;
    }
    const localePath = order.locale === "en" ? "/en" : "/tr";
    const cartUrl = `${baseUrl}${localePath}/cart`;
    const customerName = order.email.split("@")[0] || undefined;

    const result = await sendEmail({
      to: order.email,
      subject: "Sepetinde bir şey unuttun — Modaralist",
      html: abandonedCartHtml({
        customerName,
        cartUrl,
        items: order.items.map((it) => ({
          name: it.productNameSnapshot,
          image: it.variant?.product?.images[0]?.url,
          price: formatPrice(Number(it.unitPrice) * it.quantity, order.locale === "en" ? "en" : "tr"),
        })),
      }),
    });

    if (result.id) {
      sent++;
      // Tekrar gondermemek icin notes'a flag yaz
      const newNotes = (order.notes ?? "") + " [abandoned-mailed]";
      await db.order.update({
        where: { id: order.id },
        data: { notes: newNotes.trim() },
      });
    } else {
      skipped++;
    }
  }

  return NextResponse.json({
    ok: true,
    candidates: candidates.length,
    sent,
    skipped,
  });
}
