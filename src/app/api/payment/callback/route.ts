import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { sendEmail, orderConfirmationHtml } from "@/lib/email";
import { formatPrice } from "@/lib/utils";
import { restoreStockForOrder } from "@/lib/stock";
import { getAllSettings } from "@/lib/settings";
import { awardOrderPoints, parseLoyaltyConfig } from "@/lib/loyalty";
import { verifyPaytrCallback } from "@/lib/payment/paytr";

export const dynamic = "force-dynamic";

function ok() {
  return new NextResponse("OK", { status: 200 });
}

function formValue(form: FormData, key: string) {
  return String(form.get(key) ?? "");
}

async function sendOrderConfirmation(orderId: string) {
  const full = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true },
  });
  if (!full) return;

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

// PAYTR Bildirim URL'si. Musterinin yonlendirildigi ok/fail sayfasi degil,
// odemenin kesin sonucunu aldigimiz server-to-server callback budur.
export async function POST(req: NextRequest) {
  const form = await req.formData();
  const merchantOid = formValue(form, "merchant_oid");
  const status = formValue(form, "status");
  const totalAmount = formValue(form, "total_amount");
  const hash = formValue(form, "hash");
  const failedReasonCode = formValue(form, "failed_reason_code");
  const failedReasonMsg = formValue(form, "failed_reason_msg");

  const verified = verifyPaytrCallback({
    merchantOid,
    status,
    totalAmount,
    hash,
  });

  if (!verified) {
    console.error("[paytr-callback] bad hash", { merchantOid, status });
    return new NextResponse("PAYTR notification failed: bad hash", {
      status: 400,
    });
  }

  const order = await db.order.findUnique({ where: { orderNumber: merchantOid } });
  if (!order) {
    console.error("[paytr-callback] order not found", { merchantOid });
    return new NextResponse("order not found", { status: 404 });
  }

  // PAYTR ayni siparis icin tekrar bildirim yollayabilir. Onaylanmis veya
  // iptal edilmis sipariste ikinci kez mail/puan/stok islemi yapma.
  if (order.paymentStatus === "CAPTURED" || order.status === "CANCELLED") {
    return ok();
  }

  const callbackRaw = {
    merchant_oid: merchantOid,
    status,
    total_amount: totalAmount,
    failed_reason_code: failedReasonCode || null,
    failed_reason_msg: failedReasonMsg || null,
  };

  if (status === "success") {
    const expectedKurus = Math.round(Number(order.grandTotal) * 100);
    const paidKurus = Number(totalAmount);

    if (!Number.isFinite(paidKurus) || paidKurus < expectedKurus) {
      console.error("[paytr-callback] amount mismatch", {
        merchantOid,
        expectedKurus,
        paidKurus,
      });
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: "FAILED",
            status: "CANCELLED",
            history: {
              create: {
                fromStatus: order.status,
                toStatus: "CANCELLED",
                note: `PAYTR tutar uyusmazligi: beklenen ${expectedKurus}, gelen ${totalAmount}`,
              },
            },
          },
        });
        await tx.payment.updateMany({
          where: { orderId: order.id },
          data: { status: "FAILED", raw: callbackRaw },
        });
        await restoreStockForOrder(order.id, tx);
      });
      return ok();
    }

    await db.$transaction([
      db.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "CAPTURED",
          status: "PAID",
          history: {
            create: {
              fromStatus: order.status,
              toStatus: "PAID",
              note: `PAYTR merchant_oid: ${merchantOid}`,
            },
          },
        },
      }),
      db.payment.updateMany({
        where: { orderId: order.id },
        data: {
          status: "CAPTURED",
          providerTxnId: merchantOid,
          raw: callbackRaw,
        },
      }),
    ]);

    try {
      const settings = await getAllSettings();
      const cfg = parseLoyaltyConfig(settings);
      if (cfg.enabled) {
        await awardOrderPoints(order.id, cfg);
      }
    } catch (err) {
      console.error("[paytr-callback] loyalty error", err);
    }

    try {
      await sendOrderConfirmation(order.id);
    } catch (err) {
      console.error("[paytr-callback] email error", err);
    }

    return ok();
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: "FAILED",
        status: "CANCELLED",
        history: {
          create: {
            fromStatus: order.status,
            toStatus: "CANCELLED",
            note:
              failedReasonMsg ||
              failedReasonCode ||
              "PAYTR odeme onaylanmadi",
          },
        },
      },
    });
    await tx.payment.updateMany({
      where: { orderId: order.id },
      data: { status: "FAILED", raw: callbackRaw },
    });
    await restoreStockForOrder(order.id, tx);
  });

  return ok();
}
