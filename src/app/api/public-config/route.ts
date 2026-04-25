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
    },
    {
      headers: {
        // 5 dk cache (settings degisirse yansir)
        "Cache-Control": "public, max-age=300, s-maxage=300",
      },
    }
  );
}
