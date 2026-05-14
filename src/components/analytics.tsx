"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

const COOKIE_KEY = "modaralist-cookies";

// Analytics — sadece production'da ve kullanıcı "tümünü kabul et" dediyse
// yüklenir. Böylece zorunlu olmayan üçüncü taraf scriptler opt-in çalışır.

export function Analytics() {
  const ga = process.env.NEXT_PUBLIC_GA_ID;
  const metaPixel = process.env.NEXT_PUBLIC_META_PIXEL_ID;
  const tiktokPixel = process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID;
  const [enabled, setEnabled] = useState(
    () =>
      typeof window !== "undefined" &&
      window.localStorage.getItem(COOKIE_KEY) === "all"
  );

  useEffect(() => {
    function onAcceptAll() {
      setEnabled(true);
    }

    window.addEventListener("cookies-accepted-all", onAcceptAll);
    return () => {
      window.removeEventListener("cookies-accepted-all", onAcceptAll);
    };
  }, []);

  if (process.env.NODE_ENV !== "production") return null;
  if (!enabled) return null;

  return (
    <>
      {ga && (
        <>
          <Script
            strategy="afterInteractive"
            src={`https://www.googletagmanager.com/gtag/js?id=${ga}`}
          />
          <Script id="ga-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('consent', 'default', {
                'ad_storage': 'granted',
                'analytics_storage': 'granted'
              });
              gtag('js', new Date());
              gtag('config', '${ga}', { anonymize_ip: true });
            `}
          </Script>
        </>
      )}

      {metaPixel && (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`
            !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
            n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
            document,'script','https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${metaPixel}');
            fbq('consent', 'grant');
            fbq('track', 'PageView');
          `}
        </Script>
      )}

      {tiktokPixel && (
        <Script id="tiktok-pixel" strategy="afterInteractive">
          {`
            !function (w, d, t) {
              w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
              ttq.load('${tiktokPixel}');
              ttq.page();
            }(window, document, 'ttq');
          `}
        </Script>
      )}
    </>
  );
}
