import { db } from "@/lib/db";
import { orderConfirmationHtml, sendEmail } from "@/lib/email";
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

export async function sendOrderConfirmationEmail(orderId: string) {
  const full = await db.order.findUnique({
    where: { id: orderId },
    include: { items: true, addresses: true },
  });
  if (!full) return { id: null };

  const locale = full.locale === "en" ? "en" : "tr";
  const baseUrl = appBaseUrl();
  const pathPrefix = localePath(locale);
  const email = normalizeOrderEmail(full.email);
  const shipping = full.addresses.find((a) => a.type === "SHIPPING");

  const trackParams = new URLSearchParams({
    order: full.orderNumber,
    email,
  });
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
      })),
      address: shipping
        ? `${shipping.fullName}\n${shipping.street}\n${shipping.district}, ${shipping.city}`
        : "",
      trackUrl: `${baseUrl}${pathPrefix}/track?${trackParams.toString()}`,
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
