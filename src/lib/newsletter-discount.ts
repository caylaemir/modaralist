import "server-only";
import { db } from "@/lib/db";
import { sendEmail, welcomeDiscountHtml } from "@/lib/email";

export const NEWSLETTER_DISCOUNT_CODE = "WELCOME10";
export const NEWSLETTER_DISCOUNT_PERCENT = 10;

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.com"
).replace(/\/$/, "");

export async function ensureNewsletterDiscountCoupon() {
  return db.coupon.upsert({
    where: { code: NEWSLETTER_DISCOUNT_CODE },
    create: {
      code: NEWSLETTER_DISCOUNT_CODE,
      type: "PERCENT",
      value: NEWSLETTER_DISCOUNT_PERCENT,
      isActive: true,
      fullPriceOnly: true,
    },
    update: {
      type: "PERCENT",
      value: NEWSLETTER_DISCOUNT_PERCENT,
      isActive: true,
      fullPriceOnly: true,
    },
  });
}

export async function sendNewsletterDiscountEmail(args: {
  to: string;
  locale: "tr" | "en";
}) {
  const localePath = args.locale === "en" ? "/en" : "/tr";
  return sendEmail({
    to: args.to,
    subject:
      args.locale === "en"
        ? "Modaralist - your 10% discount code"
        : "Modaralist - %10 indirim kodun",
    html: welcomeDiscountHtml({
      code: NEWSLETTER_DISCOUNT_CODE,
      discountPercent: NEWSLETTER_DISCOUNT_PERCENT,
      shopUrl: `${APP_URL}${localePath}/shop`,
    }),
  });
}
