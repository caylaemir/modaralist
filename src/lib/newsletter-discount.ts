import "server-only";
import { db } from "@/lib/db";
import { sendEmail, welcomeDiscountHtml } from "@/lib/email";
import { getAllSettings } from "@/lib/settings";

const DEFAULT_NEWSLETTER_DISCOUNT_CODE = "WELCOME10";
const DEFAULT_NEWSLETTER_DISCOUNT_PERCENT = 10;

const APP_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.com"
).replace(/\/$/, "");

export type NewsletterDiscountConfig = {
  code: string;
  discountPercent: number;
};

function normalizeCouponCode(value: string | undefined) {
  const code = (value ?? "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "");
  return code || DEFAULT_NEWSLETTER_DISCOUNT_CODE;
}

function normalizeDiscountPercent(value: string | undefined) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_NEWSLETTER_DISCOUNT_PERCENT;
  }
  return Math.min(100, Math.round(parsed * 100) / 100);
}

export async function getNewsletterDiscountConfig(): Promise<NewsletterDiscountConfig> {
  const settings = await getAllSettings();
  return {
    code: normalizeCouponCode(settings["popup.discountCode"]),
    discountPercent: normalizeDiscountPercent(settings["popup.discountPercent"]),
  };
}

export async function ensureNewsletterDiscountCoupon(
  config: NewsletterDiscountConfig
) {
  return db.coupon.upsert({
    where: { code: config.code },
    create: {
      code: config.code,
      type: "PERCENT",
      value: config.discountPercent,
      isActive: true,
      fullPriceOnly: true,
    },
    update: {
      type: "PERCENT",
      value: config.discountPercent,
      isActive: true,
      fullPriceOnly: true,
    },
  });
}

export async function sendNewsletterDiscountEmail(args: {
  to: string;
  locale: "tr" | "en";
  config: NewsletterDiscountConfig;
}) {
  const localePath = args.locale === "en" ? "/en" : "/tr";
  return sendEmail({
    to: args.to,
    subject:
      args.locale === "en"
        ? `Modaralist - your ${args.config.discountPercent}% discount code`
        : `Modaralist - %${args.config.discountPercent} indirim kodun`,
    html: welcomeDiscountHtml({
      code: args.config.code,
      discountPercent: args.config.discountPercent,
      shopUrl: `${APP_URL}${localePath}/shop`,
    }),
  });
}
