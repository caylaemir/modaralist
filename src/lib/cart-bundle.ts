/**
 * Sepet paket indirimi hesaplama (bundle / multi-buy discount).
 *
 * Mantık:
 * - bundle.enabled false ise hiç çalışmaz
 * - subtotal < minSubtotal ise indirim YOK
 * - Sepetteki toplam ürün sayısı (quantity sum) >= 2 ve subtotal yeterli:
 *   - 2 ürün → en ucuz BİRİ %tier2 indirim
 *   - 3+ ürün → en ucuz BİRİ %tier3 indirim
 *
 * "En ucuz" = unitPrice'a göre sıralama, en düşük unitPrice tek 1 birim
 * indirimli olur. Quantity > 1 olsa bile sadece 1 birim indirim alır.
 *
 * Bu sayede uyanık kullanıcı (1 pahalı + 1 ucuz koyup pahaliya indirim
 * almaya çalışan) engellenir — indirim hep en ucuza.
 */

export type BundleConfig = {
  enabled: boolean;
  minSubtotal: number;
  tier2Discount: number; // % (15 = %15)
  tier3Discount: number;
};

export type BundleLine = {
  variantId: string;
  unitPrice: number;
  quantity: number;
};

export type BundleResult = {
  applied: boolean;
  tier: 0 | 2 | 3;
  discountPercent: number;
  discountAmount: number; // ₺ cinsinden
  discountedVariantId: string | null;
  // UI mesajları
  status: "off" | "below-min" | "need-more" | "applied" | "next-tier";
  amountToMin: number; // min'e ne kadar kaldı
  itemsToNextTier: number; // bir sonraki tier için kaç ürün lazım
};

export function calculateBundleDiscount(
  lines: BundleLine[],
  subtotal: number,
  config: BundleConfig
): BundleResult {
  const empty: BundleResult = {
    applied: false,
    tier: 0,
    discountPercent: 0,
    discountAmount: 0,
    discountedVariantId: null,
    status: "off",
    amountToMin: 0,
    itemsToNextTier: 0,
  };

  if (!config.enabled) return empty;

  const totalQty = lines.reduce((s, l) => s + l.quantity, 0);
  if (totalQty < 2) {
    return {
      ...empty,
      status: "need-more",
      amountToMin: Math.max(0, config.minSubtotal - subtotal),
      itemsToNextTier: 2 - totalQty,
    };
  }

  // Sepet quantity yeterli ama tutar yetmiyor
  if (subtotal < config.minSubtotal) {
    return {
      ...empty,
      status: "below-min",
      amountToMin: config.minSubtotal - subtotal,
      itemsToNextTier: 0,
    };
  }

  // En ucuz line bul
  const cheapest = lines.reduce(
    (min, l) => (l.unitPrice < min.unitPrice ? l : min),
    lines[0]
  );

  const tier = totalQty >= 3 ? 3 : 2;
  const discountPercent =
    tier === 3 ? config.tier3Discount : config.tier2Discount;
  const discountAmount = (cheapest.unitPrice * discountPercent) / 100;

  // Eğer sepet 2 üründe ise ve tier3'e geçmesi mümkünse hint ver
  const itemsToNextTier = tier === 2 ? 1 : 0;

  return {
    applied: true,
    tier,
    discountPercent,
    discountAmount: Math.round(discountAmount * 100) / 100,
    discountedVariantId: cheapest.variantId,
    status: itemsToNextTier > 0 ? "next-tier" : "applied",
    amountToMin: 0,
    itemsToNextTier,
  };
}

/** Settings string'den BundleConfig parse */
export function parseBundleConfig(s: {
  "bundle.enabled"?: string;
  "bundle.minSubtotal"?: string;
  "bundle.tier2Discount"?: string;
  "bundle.tier3Discount"?: string;
}): BundleConfig {
  return {
    enabled: s["bundle.enabled"] === "true",
    minSubtotal: Number(s["bundle.minSubtotal"]) || 0,
    tier2Discount: Number(s["bundle.tier2Discount"]) || 0,
    tier3Discount: Number(s["bundle.tier3Discount"]) || 0,
  };
}
