"use client";

import { useEffect, useState } from "react";
import { formatPrice } from "@/lib/utils";

/**
 * Sepette ücretsiz kargo eşiğine kalan tutarı gösterir.
 * Settings'ten freeShippingOver değerini /api/public-config'tan çeker.
 * Eşik 0 ise hiç render etmez.
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
        const v = d?.shop?.freeShippingOver ?? 0;
        if (v > 0) setThreshold(v);
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
