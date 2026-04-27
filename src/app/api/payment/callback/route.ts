import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { finalizeThreeDSPayment } from "@/lib/payment/iyzico";
import { sendEmail, orderConfirmationHtml } from "@/lib/email";
import { formatPrice } from "@/lib/utils";
import { restoreStockForOrder } from "@/lib/stock";
import { getAllSettings } from "@/lib/settings";
import { awardOrderPoints, parseLoyaltyConfig } from "@/lib/loyalty";

// iyzico 3DS sonunda buraya POST atar.
// Body: application/x-www-form-urlencoded
// Alanlar: paymentId, conversationId, status, mdStatus
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const paymentId = String(form.get("paymentId") ?? "");
  const conversationId = String(form.get("conversationId") ?? "");
  const status = String(form.get("status") ?? "");
  const mdStatus = String(form.get("mdStatus") ?? "");

  const orderNumber = req.nextUrl.searchParams.get("order");
  if (!orderNumber) {
    return NextResponse.redirect(
      new URL("/tr/checkout/failed", req.url)
    );
  }

  const order = await db.order.findUnique({ where: { orderNumber } }).catch(() => null);
  if (!order) {
    return NextResponse.redirect(
      new URL(`/tr/checkout/failed?reason=not-found`, req.url)
    );
  }

  if (status !== "success" || mdStatus !== "1") {
    if (order.status === "PENDING") {
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED", status: "CANCELLED" },
        });
        await restoreStockForOrder(order.id, tx);
      });
    }
    return NextResponse.redirect(
      new URL(`/tr/checkout/failed?reason=3ds`, req.url)
    );
  }

  try {
    const final = await finalizeThreeDSPayment(paymentId, conversationId);
    if (final.status !== "success") {
      if (order.status === "PENDING") {
        await db.$transaction(async (tx) => {
          await tx.order.update({
            where: { id: order.id },
            data: { paymentStatus: "FAILED", status: "CANCELLED" },
          });
          await restoreStockForOrder(order.id, tx);
        });
      }
      return NextResponse.redirect(
        new URL(`/tr/checkout/failed?reason=capture`, req.url)
      );
    }

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "CAPTURED",
          status: "PAID",
          history: {
            create: {
              fromStatus: "PENDING",
              toStatus: "PAID",
              note: `iyzico paymentId: ${final.paymentId}`,
            },
          },
        },
      }),
      db.payment.updateMany({
        where: { orderId: order.id },
        data: { status: "CAPTURED", providerTxnId: final.paymentId },
      }),
    ]);

    // Loyalty puan ekle (siparis CAPTURED oldu) — hata olsa akisi durdurma
    try {
      const settings = await getAllSettings();
      const cfg = parseLoyaltyConfig(settings);
      if (cfg.enabled) {
        await awardOrderPoints(order.id, cfg);
      }
    } catch (err) {
      console.error("[payment-callback] loyalty error", err);
    }

    // Sipariş onay e-postası (async, hata olsa da akışı durdurma)
    try {
      const full = await db.order.findUnique({
        where: { id: order.id },
        include: { items: true, addresses: true },
      });
      if (full) {
        const shipping = full.addresses.find((a) => a.type === "SHIPPING");
        await sendEmail({
          to: full.email,
          subject: `Siparişin alındı — ${full.orderNumber}`,
          html: orderConfirmationHtml({
            orderNumber: full.orderNumber,
            customerName: shipping?.fullName ?? "misafir",
            total: formatPrice(Number(full.grandTotal), "tr"),
            items: full.items.map((it) => ({
              name: it.productNameSnapshot,
              variant: it.variantSnapshot ?? undefined,
              quantity: it.quantity,
              total: formatPrice(Number(it.lineTotal), "tr"),
            })),
            address: shipping
              ? `${shipping.fullName}\n${shipping.street}\n${shipping.district}, ${shipping.city}`
              : "",
          }),
        });
      }
    } catch (err) {
      console.error("[payment-callback] email error", err);
    }

    return NextResponse.redirect(
      new URL(`/tr/checkout/success?order=${orderNumber}`, req.url)
    );
  } catch (err) {
    console.error("[payment-callback]", err);
    return NextResponse.redirect(
      new URL(`/tr/checkout/failed?reason=exception`, req.url)
    );
  }
}
