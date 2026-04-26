"use client";

import { useReportWebVitals } from "next/web-vitals";

/**
 * Core Web Vitals -> GA4 event'i.
 *
 * Hangi metrik:
 *   LCP (Largest Contentful Paint), FID (legacy), INP (Interaction to Next Paint),
 *   CLS (Cumulative Layout Shift), FCP (First Contentful Paint), TTFB (Time to First Byte)
 *
 * GA4 'web_vitals' custom event'i olarak gelir, oraya 'event_category=Web Vitals',
 * 'event_label=metric.id', 'value=ms cinsinden round'lanmis deger ekleriz.
 *
 * GA4'te Reports > Engagement > Events > web_vitals goruntulenebilir.
 */
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (typeof window === "undefined") return;
    const w = window as unknown as { gtag?: (...args: unknown[]) => void };
    if (typeof w.gtag !== "function") return;

    // CLS unitless, digerleri ms cinsindendir. CLS'i 1000x ile ms gibi gondermek
    // gangsa GA4 standardiyla uyumlu (Google'un kendi recommend'i bu).
    const value = Math.round(
      metric.name === "CLS" ? metric.value * 1000 : metric.value
    );

    w.gtag("event", metric.name, {
      event_category: "Web Vitals",
      event_label: metric.id,
      value,
      non_interaction: true,
    });
  });

  return null;
}
