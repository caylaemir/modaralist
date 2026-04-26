"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import {
  calculateBundleDiscount,
  type BundleConfig,
  type BundleLine,
} from "@/lib/cart-bundle";

/**
 * Sepet drawer icinde bundle indirim durumunu gosterir.
 * Settings'ten bundle.* okur, calculateBundleDiscount ile hesaplar.
 *
 * Mesajlar:
 * - 'need-more' → "Sepete 1 ürün daha ekle, en ucuz parçada %15 indirim"
 * - 'below-min' → "Bundle indirimi için ₺X daha ekle"
 * - 'next-tier' → "1 ürün daha ekle %40'a yükselt"
 * - 'applied' → "✓ Bundle indirimi aktif: %X"
 */
export function BundleDiscount({
  lines,
  subtotal,
  locale = "tr",
}: {
  lines: BundleLine[];
  subtotal: number;
  locale?: "tr" | "en";
}) {
  const [config, setConfig] = useState<BundleConfig | null>(null);

  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then((d) => {
        if (d?.bundle) {
          setConfig({
            enabled: d.bundle.enabled,
            minSubtotal: d.bundle.minSubtotal,
            tier2Discount: d.bundle.tier2Discount,
            tier3Discount: d.bundle.tier3Discount,
          });
        }
      })
      .catch(() => {});
  }, []);

  if (!config || !config.enabled) return null;

  const result = calculateBundleDiscount(lines, subtotal, config);

  if (result.applied) {
    return (
      <div className="border-b border-line bg-bone px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <p className="text-[11px] uppercase tracking-[0.25em] text-ink">
            ✓ Bundle indirimi aktif
          </p>
          <p className="text-sm font-medium tabular-nums text-ink">
            -{formatPrice(result.discountAmount, locale)}
          </p>
        </div>
        <p className="mt-1 text-[11px] text-mist">
          %{result.discountPercent} indirim — en ucuz parçanda
          {result.status === "next-tier" && result.itemsToNextTier > 0 ? (
            <>
              {" "}· 1 ürün daha ekle %{config.tier3Discount}'a yükselt
            </>
          ) : null}
        </p>
      </div>
    );
  }

  if (result.status === "need-more") {
    // Subtotal min'in altındaysa "ürün ekle" mesajı yanıltıcı —
    // önce tutar yetersiz uyarısı önemli
    if (subtotal < config.minSubtotal) {
      return (
        <div className="border-b border-line bg-bone/60 px-6 py-3">
          <p className="text-[11px] uppercase tracking-[0.25em] text-mist">
            Bundle indirimi için min{" "}
            <span className="text-ink">
              {formatPrice(config.minSubtotal, locale)}
            </span>{" "}
            sepet tutarı + 2 ürün gerekli
          </p>
        </div>
      );
    }
    return (
      <div className="border-b border-line bg-bone/60 px-6 py-3">
        <p className="text-[11px] uppercase tracking-[0.25em] text-mist">
          Bundle: {result.itemsToNextTier} ürün daha ekle, en ucuza %
          {config.tier2Discount} indirim
        </p>
      </div>
    );
  }

  if (result.status === "below-min") {
    return (
      <div className="border-b border-line bg-bone/60 px-6 py-3">
        <p className="text-[11px] uppercase tracking-[0.25em] text-mist">
          Bundle için sepete{" "}
          <span className="font-medium tabular-nums text-ink">
            {formatPrice(result.amountToMin, locale)}
          </span>{" "}
          daha ekle
        </p>
      </div>
    );
  }

  return null;
}
