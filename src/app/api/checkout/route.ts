import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { nanoid } from "nanoid";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { initiateThreeDSPayment } from "@/lib/payment/iyzico";
import { restoreStockForOrder } from "@/lib/stock";
import { getAllSettings } from "@/lib/settings";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { calculateBundleDiscount, parseBundleConfig } from "@/lib/cart-bundle";

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
  // 1 dakikada en fazla 10 checkout/IP — bot/spam koruma
  const rl = rateLimit(`checkout:${getClientIp(req)}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Çok fazla istek. Birkaç saniye sonra dene." },
      { status: 429 }
    );
  }

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

  // GUVENLIK: client'tan gelen unitPrice'a guvenmek YASAK — kullanici
  // sahte fiyat gondererek indirim alabilir. Server DB'den gercek fiyati
  // (discountPrice ?? basePrice) cekip dogrular ve hesaplari onunla yapar.
  const variantIds = [...new Set(lines.map((l) => l.variantId))];
  const dbVariants = await db.productVariant.findMany({
    where: { id: { in: variantIds }, isActive: true },
    include: {
      product: { select: { basePrice: true, discountPrice: true } },
    },
  });
  if (dbVariants.length !== variantIds.length) {
    return NextResponse.json(
      { error: "Sepetteki bir ürün artık mevcut değil." },
      { status: 400 }
    );
  }
  const priceByVariantId = new Map(
    dbVariants.map((v) => [
      v.id,
      Number(v.product.discountPrice ?? v.product.basePrice),
    ])
  );

  // Kanonik line'lar (server-trusted)
  const safeLines = lines.map((l) => {
    const realPrice = priceByVariantId.get(l.variantId);
    if (realPrice === undefined) {
      throw new Error("PRICE_NOT_FOUND");
    }
    return {
      variantId: l.variantId,
      name: l.name,
      size: l.size,
      color: l.color,
      image: l.image,
      quantity: l.quantity,
      unitPrice: realPrice,
      lineTotal: realPrice * l.quantity,
    };
  });

  // Kargo + ücretsiz kargo eşiği Settings'ten okunur — admin panelden değiştirilebilir
  const settings = await getAllSettings();
  const subtotal = safeLines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const standardCost = Number(settings["shop.shippingStandard"] ?? 0) || 0;
  const expressCost = Number(settings["shop.shippingExpress"] ?? 89) || 89;

  // Free shipping A/B: cookie'de mdr-ab-free-shipping=B ise B esigini kullan
  // (FreeShippingBar ile tutarli — kullanici bardaki esikten farkli odemez)
  const abActive = settings["shop.freeShippingAB"] === "true";
  const overA = Number(settings["shop.freeShippingOver"] ?? 0) || 0;
  const overB = Number(settings["shop.freeShippingOverB"] ?? 0) || 0;
  const variantCookie = req.cookies.get("mdr-ab-free-shipping")?.value;
  const freeOver = abActive && overB > 0 && variantCookie === "B" ? overB : overA;

  const baseShipping = shippingMethod === "express" ? expressCost : standardCost;
  const shippingCost = freeOver > 0 && subtotal >= freeOver && shippingMethod === "standard" ? 0 : baseShipping;

  // Bundle indirimi (sepet 2+ ürün, min tutarı geçmiş, en ucuz parçaya)
  const bundleConfig = parseBundleConfig({
    "bundle.enabled": settings["bundle.enabled"],
    "bundle.minSubtotal": settings["bundle.minSubtotal"],
    "bundle.tier2Discount": settings["bundle.tier2Discount"],
    "bundle.tier3Discount": settings["bundle.tier3Discount"],
  });
  const bundle = calculateBundleDiscount(
    safeLines.map((l) => ({
      variantId: l.variantId,
      unitPrice: l.unitPrice,
      quantity: l.quantity,
    })),
    subtotal,
    bundleConfig
  );
  const bundleDiscount = bundle.applied ? bundle.discountAmount : 0;
  const grandTotal = Math.max(0, subtotal + shippingCost - bundleDiscount);

  const orderNumber = `MDR-${new Date().getFullYear()}-${nanoid(8).toUpperCase()}`;
  const [name, ...rest] = customer.fullName.trim().split(" ");
  const surname = rest.join(" ") || name;

  // Stok kontrol + atomic decrement + sipariş oluşturma — hepsi tek transaction.
  // Stok yetmezse veya varyant yoksa transaction rollback olur.
  let order;
  try {
    order = await db.$transaction(async (tx) => {
      // Her satır için stoğu atomic olarak düş; yetmezse hata at.
      for (const line of lines) {
        const updated = await tx.productVariant.updateMany({
          where: {
            id: line.variantId,
            isActive: true,
            stock: { gte: line.quantity },
          },
          data: { stock: { decrement: line.quantity } },
        });
        if (updated.count === 0) {
          throw new Error(`STOK_YETERSIZ:${line.variantId}:${line.name}`);
        }
      }

      return tx.order.create({
        data: {
          orderNumber,
          userId,
          email: customer.email,
          phone: customer.phone,
          subtotal,
          shippingCost,
          discountTotal: bundleDiscount,
          grandTotal,
          status: "PENDING",
          paymentStatus: "PENDING",
          items: {
            create: safeLines.map((l) => ({
              variantId: l.variantId,
              productNameSnapshot: l.name,
              variantSnapshot: [l.size, l.color].filter(Boolean).join(" · "),
              unitPrice: l.unitPrice,
              quantity: l.quantity,
              lineTotal: l.lineTotal,
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
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "";
    if (msg.startsWith("STOK_YETERSIZ:")) {
      const [, , itemName] = msg.split(":");
      return NextResponse.json(
        {
          error: `Stok yetersiz: ${itemName ?? "ürün"}. Sepetini güncelle.`,
          code: "OUT_OF_STOCK",
        },
        { status: 409 }
      );
    }
    console.error("[checkout] order create failed", err);
    return NextResponse.json(
      { error: "Sipariş oluşturulamadı. Tekrar dene." },
      { status: 500 }
    );
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1";

  // Simülasyon modu — iyzico API key alınana kadar bu aktif.
  // Canlıda gerçek iyzico'ya geçmek için PAYMENT_SIMULATION_MODE=false yap.
  if (process.env.PAYMENT_SIMULATION_MODE === "true") {
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
              note: "simülasyon modu — iyzico atlandı",
            },
          },
        },
      }),
      db.payment.create({
        data: {
          orderId: order.id,
          provider: "simulation",
          providerTxnId: `SIM-${orderNumber}`,
          amount: grandTotal,
          status: "CAPTURED",
          raw: { simulation: true, card: { last4: card.cardNumber.slice(-4) } },
        },
      }),
    ]);
    return NextResponse.json({ ok: true, orderNumber, simulation: true });
  }

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
      items: safeLines.map((l) => ({
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
      await db.$transaction(async (tx) => {
        await tx.order.update({
          where: { id: order.id },
          data: { paymentStatus: "FAILED", status: "CANCELLED" },
        });
        await restoreStockForOrder(order.id, tx);
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
    await db.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: { paymentStatus: "FAILED", status: "CANCELLED" },
      });
      await restoreStockForOrder(order.id, tx);
    }).catch(() => undefined);
    return NextResponse.json(
      { error: "Ödeme sağlayıcısına ulaşılamadı" },
      { status: 502 }
    );
  }
}
