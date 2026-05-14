import { db } from "@/lib/db";
import {
  orderConfirmationHtml,
  sendEmail,
  shipmentUpdateHtml,
} from "@/lib/email";
import { normalizeOrderEmail } from "@/lib/order-claim";
import { formatPrice } from "@/lib/utils";

function appBaseUrl() {
  return (process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.com").replace(
    /\/$/,
    ""
  );
}

function localePath(locale: "tr" | "en") {
  return locale === "en" ? "/en" : "/tr";
}

function absoluteUrl(baseUrl: string, value: string | null | undefined) {
  if (!value) return undefined;
  try {
    return new URL(value).href;
  } catch {
    return `${baseUrl}${value.startsWith("/") ? value : `/${value}`}`;
  }
}

function orderTrackUrl(args: {
  baseUrl: string;
  locale: "tr" | "en";
  orderNumber: string;
  email: string;
}) {
  const trackParams = new URLSearchParams({
    order: args.orderNumber,
    email: args.email,
  });
  return `${args.baseUrl}${localePath(args.locale)}/track?${trackParams.toString()}`;
}

export async function sendOrderConfirmationEmail(orderId: string) {
  const full = await db.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                select: {
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
      addresses: true,
    },
  });
  if (!full) return { id: null };

  const locale = full.locale === "en" ? "en" : "tr";
  const baseUrl = appBaseUrl();
  const pathPrefix = localePath(locale);
  const email = normalizeOrderEmail(full.email);
  const shipping = full.addresses.find((a) => a.type === "SHIPPING");

  const registerParams = new URLSearchParams({
    email,
    callbackUrl: "/account/orders",
  });

  const result = await sendEmail({
    to: email,
    subject:
      locale === "en"
        ? `Order received - ${full.orderNumber}`
        : `Siparişin alındı - ${full.orderNumber}`,
    html: orderConfirmationHtml({
      orderNumber: full.orderNumber,
      customerName: shipping?.fullName ?? "misafir",
      total: formatPrice(Number(full.grandTotal), locale),
      items: full.items.map((it) => ({
        name: it.productNameSnapshot,
        variant: it.variantSnapshot ?? undefined,
        quantity: it.quantity,
        total: formatPrice(Number(it.lineTotal), locale),
        image: absoluteUrl(baseUrl, it.variant.product.images[0]?.url),
      })),
      address: shipping
        ? `${shipping.fullName}\n${shipping.street}\n${shipping.district}, ${shipping.city}`
        : "",
      trackUrl: orderTrackUrl({
        baseUrl,
        locale,
        orderNumber: full.orderNumber,
        email,
      }),
      registerUrl: `${baseUrl}${pathPrefix}/register?${registerParams.toString()}`,
      guestCheckout: !full.userId,
    }),
  });

  if (!result.id) {
    console.warn("[email] order confirmation not sent", {
      orderNumber: full.orderNumber,
      to: email,
    });
  }

  return result;
}

export async function sendShipmentUpdateEmail(args: {
  orderId: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl?: string | null;
}) {
  const order = await db.order.findUnique({
    where: { id: args.orderId },
    include: { addresses: true },
  });
  if (!order) return { id: null };

  const locale = order.locale === "en" ? "en" : "tr";
  const baseUrl = appBaseUrl();
  const email = normalizeOrderEmail(order.email);
  const shipping = order.addresses.find((a) => a.type === "SHIPPING");

  const result = await sendEmail({
    to: email,
    subject:
      locale === "en"
        ? `Your order is on the way - ${order.orderNumber}`
        : `Siparişin kargoda - ${order.orderNumber}`,
    html: shipmentUpdateHtml({
      orderNumber: order.orderNumber,
      customerName: shipping?.fullName ?? "misafir",
      carrier: args.carrier,
      trackingNumber: args.trackingNumber,
      trackingUrl: args.trackingUrl ?? undefined,
      orderTrackUrl: orderTrackUrl({
        baseUrl,
        locale,
        orderNumber: order.orderNumber,
        email,
      }),
    }),
  });

  if (!result.id) {
    console.warn("[email] shipment update not sent", {
      orderNumber: order.orderNumber,
      to: email,
    });
  }

  return result;
}
