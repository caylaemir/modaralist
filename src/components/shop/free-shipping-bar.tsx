"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";
import { getOrAssignVariant } from "@/lib/ab-test";

/**
 * Sepette ücretsiz kargo eşiğine kalan tutarı gösterir.
 * Settings'ten freeShippingOver değerini /api/public-config'tan çeker.
 * Eşik 0 ise hiç render etmez.
 *
 * A/B test: shop.freeShippingAB === true ise yariya 'A' (varsayilan esik),
 * yariya 'B' (freeShippingOverB) gosterir. Cookie ile sticky.
 */
export function FreeShippingBar({
  subtotal,
  locale = "tr",
}: {
  subtotal: number;
  locale?: "tr" | "en";
}) {
  const [threshold, setThreshold] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then((d) => {
        const a = d?.shop?.freeShippingOver ?? 0;
        const ab = d?.shop?.freeShippingAB === true;
        const b = d?.shop?.freeShippingOverB ?? 0;
        let chosen = a;
        if (ab && b > 0) {
          const variant = getOrAssignVariant("free-shipping");
          chosen = variant === "B" ? b : a;
        }
        if (chosen > 0) setThreshold(chosen);
      })
      .catch(() => {});
  }, []);

  if (!threshold) return null;

  const remaining = Math.max(0, threshold - subtotal);
  const reached = remaining === 0;
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <div className="border-b border-line px-6 py-4">
      <p className="text-[11px] uppercase tracking-[0.25em] text-ink">
        {reached ? (
          <span className="text-green-700">✓ Kargo bedava</span>
        ) : (
          <>
            Ücretsiz kargoya{" "}
            <span className="font-medium tabular-nums">
              {formatPrice(remaining, locale)}
            </span>{" "}
            kaldı
          </>
        )}
      </p>
      <div className="mt-2 h-1 overflow-hidden bg-line">
        <div
          className="h-full bg-ink transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
