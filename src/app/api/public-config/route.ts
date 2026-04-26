import { NextResponse } from "next/server";
import { getAllSettings } from "@/lib/settings";

/**
 * Storefront client component'larin kullanabilecegi public Settings.
 * Hassas ayarlari dahil etme — sadece UI'da gosterilebilir olanlar.
 */
export async function GET() {
  const s = await getAllSettings();

  return NextResponse.json(
    {
      shop: {
        currency: s["shop.currency"] || "TRY",
        taxRate: Number(s["shop.taxRate"]) || 0.2,
        shippingStandard: Number(s["shop.shippingStandard"]) || 0,
        shippingExpress: Number(s["shop.shippingExpress"]) || 89,
        freeShippingOver: Number(s["shop.freeShippingOver"]) || 0,
      },
      bundle: {
        enabled: s["bundle.enabled"] === "true",
        minSubtotal: Number(s["bundle.minSubtotal"]) || 0,
        tier2Discount: Number(s["bundle.tier2Discount"]) || 0,
        tier3Discount: Number(s["bundle.tier3Discount"]) || 0,
      },
      popup: {
        enabled: s["popup.enabled"] === "true",
        delaySeconds: Number(s["popup.delaySeconds"]) || 15,
        eyebrow: s["popup.eyebrow"] || "",
        title: s["popup.title"] || "",
        subtitle: s["popup.subtitle"] || "",
        ctaLabel: s["popup.ctaLabel"] || "Gönder",
        discountCode: s["popup.discountCode"] || "",
      },
    },
    {
      headers: {
        // 5 dk cache (settings degisirse yansir)
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
