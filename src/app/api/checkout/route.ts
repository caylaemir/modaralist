import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { initiateThreeDSPayment } from "@/lib/payment/iyzico";

const schema = z.object({
  lines: z
    .array(
      z.object({
        variantId: z.string(),
        productId: z.string(),
        name: z.string(),
        size: z.string().nullable(),
        color: z.string().nullable(),
        image: z.string().nullable(),
        unitPrice: z.number(),
        quantity: z.number().int().min(1),
      })
    )
    .min(1),
  customer: z.object({
    email: z.string().email(),
    phone: z.string().min(7),
    fullName: z.string().min(2),
    tcNo: z.string().length(11),
  }),
  address: z.object({
    street: z.string().min(5),
    district: z.string().min(2),
    city: z.string().min(2),
    zip: z.string().optional().default(""),
  }),
  shippingMethod: z.enum(["standard", "express"]),
  card: z.object({
    cardHolder: z.string().min(3),
    cardNumber: z.string().min(15).max(16),
    expireMonth: z.string().min(1).max(2),
    expireYear: z.string().min(2).max(4),
    cvc: z.string().min(3).max(4),
  }),
});

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Geçersiz veri", details: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { lines, customer, address, shippingMethod, card } = parsed.data;

  const session = await auth();
  const userId = session?.user?.id ?? null;

  const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const shippingCost = shippingMethod === "express" ? 89 : 0;
  const grandTotal = subtotal + shippingCost;

  const orderNumber = `MDR-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  const [name, ...rest] = customer.fullName.trim().split(" ");
  const surname = rest.join(" ") || name;

  // Siparişi PENDING olarak oluştur — 3DS başarılı olunca PAID'e çekilir
  let order;
  try {
    order = await db.order.create({
      data: {
        orderNumber,
        userId,
        email: customer.email,
        phone: customer.phone,
        subtotal,
        shippingCost,
        grandTotal,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: lines.map((l) => ({
            variantId: l.variantId,
            productNameSnapshot: l.name,
            variantSnapshot: [l.size, l.color].filter(Boolean).join(" · "),
            unitPrice: l.unitPrice,
            quantity: l.quantity,
            lineTotal: l.unitPrice * l.quantity,
          })),
        },
        addresses: {
          create: [
            {
              type: "SHIPPING",
              fullName: customer.fullName,
              phone: customer.phone,
              city: address.city,
              district: address.district,
              street: address.street,
              zip: address.zip,
            },
            {
              type: "BILLING",
              fullName: customer.fullName,
              phone: customer.phone,
              city: address.city,
              district: address.district,
              street: address.street,
              zip: address.zip,
            },
          ],
        },
      },
    });
  } catch (err) {
    // DB yoksa (lokal dev) mock bir akış: ödeme iframe'i atla
    console.warn("[checkout] DB yok — mock akışa düştü", err);
    return NextResponse.json({ ok: true, orderNumber, mock: true });
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  try {
    const result = await initiateThreeDSPayment({
      orderNumber,
      totalPrice: Number(grandTotal),
      currency: "TRY",
      buyer: {
        id: order.id,
        name,
        surname,
        email: customer.email,
        phone: customer.phone,
        tcNo: customer.tcNo,
        ip,
        registrationAddress: address.street,
        city: address.city,
        country: "Turkey",
        zip: address.zip,
      },
      shippingAddress: {
        contactName: customer.fullName,
        city: address.city,
        country: "Turkey",
        address: address.street,
        zip: address.zip,
      },
      billingAddress: {
        contactName: customer.fullName,
        city: address.city,
        country: "Turkey",
        address: address.street,
        zip: address.zip,
      },
      items: lines.map((l) => ({
        id: l.variantId,
        name: l.name,
        category: "Fashion",
        price: l.unitPrice * l.quantity,
      })),
      card: {
        cardHolderName: card.cardHolder,
        cardNumber: card.cardNumber,
        expireMonth: card.expireMonth,
        expireYear: card.expireYear.length === 2 ? `20${card.expireYear}` : card.expireYear,
        cvc: card.cvc,
      },
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/payment/callback?order=${orderNumber}`,
    });

    if (result.status !== "success" || !result.threeDSHtmlContent) {
      await db.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      });
      return NextResponse.json(
        { error: result.errorMessage ?? "Ödeme başlatılamadı" },
        { status: 400 }
      );
    }

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "iyzico",
        providerTxnId: result.paymentId ?? null,
        amount: grandTotal,
        status: "PENDING",
        raw: JSON.parse(JSON.stringify(result)) as object,
      },
    });

    // 3DS iframe HTML'i (base64 encoded iyzico'da) frontend'e yollanıp iframe'de açılacak
    const html = Buffer.from(result.threeDSHtmlContent, "base64").toString("utf-8");
    return NextResponse.json({ ok: true, orderNumber, htmlContent: html });
  } catch (err) {
    console.error("[checkout] iyzico error", err);
    return NextResponse.json(
      { error: "Ödeme sağlayıcısına ulaşılamadı" },
      { status: 502 }
    );
  }
}
