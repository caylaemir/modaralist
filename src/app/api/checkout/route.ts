import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { customAlphabet } from "nanoid";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { initiatePaytrPayment } from "@/lib/payment/paytr";
import { sendOrderConfirmationEmail } from "@/lib/order-emails";
import { normalizeOrderEmail } from "@/lib/order-claim";
import { restoreStockForOrder } from "@/lib/stock";
import { getAllSettings } from "@/lib/settings";
import { rateLimit, getClientIp } from "@/lib/rate-limit";
import { calculateBundleDiscount, parseBundleConfig } from "@/lib/cart-bundle";
import { effectivePrice } from "@/lib/utils";
import { validateCoupon, recordCouponUsage } from "@/lib/coupon";

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
  locale: z.enum(["tr", "en"]).optional().default("tr"),
  // Opsiyonel kupon kodu — server-side recompute (client'in dedigi tutar
  // kullanilmaz, validate edilir ve burada hesaplanir)
  couponCode: z.string().optional(),
});

const createOrderSuffix = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 8);

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
  const { lines, customer, address, shippingMethod, locale } = parsed.data;
  const customerEmail = normalizeOrderEmail(customer.email);

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
  // discountPrice 0 olabiliyor (admin form bos yerine 0 kaydediyor) — `??`
  // operatoru 0'i null kabul etmez, sonuc 0 olur ve odeme tutari 0 TL olur.
  // Helper basePrice + discountPrice'i guvenli sekilde degerlendirir.
  const priceByVariantId = new Map(
    dbVariants.map((v) => {
      const base = Number(v.product.basePrice);
      const disc =
        v.product.discountPrice != null
          ? Number(v.product.discountPrice)
          : null;
      return [v.id, effectivePrice(base, disc)];
    })
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

  // Kupon kontrolu — server-side recompute (client'in dedigi tutara guvenmeyiz)
  let couponDiscount = 0;
  let couponShippingFree = false;
  let appliedCouponId: string | null = null;
  let appliedCouponCode: string | null = null;
  if (parsed.data.couponCode && parsed.data.couponCode.trim().length > 0) {
    const result = await validateCoupon({
      code: parsed.data.couponCode,
      subtotal,
      userId,
    });
    if (!result.ok) {
      return NextResponse.json(
        { error: `Kupon: ${result.error}` },
        { status: 400 }
      );
    }
    couponDiscount = result.discountAmount;
    couponShippingFree = result.freeShipping;
    appliedCouponId = result.coupon.id;
    appliedCouponCode = result.coupon.code;
  }

  // Final shipping (FREE_SHIPPING kuponu varsa kargo bedava)
  const finalShipping = couponShippingFree ? 0 : shippingCost;

  // Toplam indirim = bundle + kupon (subtotal'dan dusulur)
  const totalDiscount = bundleDiscount + couponDiscount;
  const grandTotal = Math.max(0, subtotal + finalShipping - totalDiscount);

  const orderNumber = `MDR${new Date().getFullYear()}${createOrderSuffix()}`;

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
          email: customerEmail,
          phone: customer.phone,
          locale,
          subtotal,
          shippingCost: finalShipping,
          discountTotal: totalDiscount,
          grandTotal,
          status: "PENDING",
          paymentStatus: "PENDING",
          couponCode: appliedCouponCode,
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

  // Kupon kullanim kaydi (order create basarili oldu)
  if (appliedCouponId) {
    try {
      await recordCouponUsage({
        couponId: appliedCouponId,
        orderId: order.id,
        userId,
        discountAmount: couponDiscount,
      });
    } catch (err) {
      console.error("[checkout] coupon usage record failed", err);
      // Order zaten yaratildi, akisi durdurma
    }
  }

  const clientIp = getClientIp(req);
  const ip = clientIp === "unknown" ? "127.0.0.1" : clientIp;

  // Simülasyon modu — PAYTR bilgileri tanimlanana kadar bu aktif kalabilir.
  // Canlida gerçek PAYTR iFrame'e gecmek icin PAYMENT_SIMULATION_MODE=false yap.
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
              note: "simülasyon modu — PAYTR atlandı",
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
          raw: { simulation: true, provider: "paytr" },
        },
      }),
    ]);
    try {
      await sendOrderConfirmationEmail(order.id);
    } catch (err) {
      console.error("[checkout] simulation email error", err);
    }
    return NextResponse.json({ ok: true, orderNumber, simulation: true });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const localePath = locale === "en" ? "/en" : "/tr";
    const result = await initiatePaytrPayment({
      orderNumber,
      totalPrice: Number(grandTotal),
      email: customerEmail,
      userName: customer.fullName,
      userAddress: `${address.street}, ${address.district}, ${address.city}`,
      userPhone: customer.phone,
      userIp: ip,
      okUrl: `${baseUrl}${localePath}/checkout/success?order=${orderNumber}`,
      failUrl: `${baseUrl}${localePath}/checkout/failed?order=${orderNumber}&reason=paytr`,
      locale,
      items: safeLines.map((l) => ({
        name: l.name,
        unitPrice: l.unitPrice,
        quantity: l.quantity,
      })),
    });

    await db.payment.create({
      data: {
        orderId: order.id,
        provider: "paytr",
        providerTxnId: orderNumber,
        amount: grandTotal,
        status: "PENDING",
        raw: {
          token: result.token,
          iframeUrl: result.iframeUrl,
          paymentAmount: result.paymentAmount,
          testMode: result.testMode,
        },
      },
    });

    return NextResponse.json({
      ok: true,
      orderNumber,
      provider: "paytr",
      iframeUrl: result.iframeUrl,
    });
  } catch (err) {
    console.error("[checkout] paytr error", err);
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
