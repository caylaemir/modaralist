import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const securityHeaders = [
  // Tarayıcıyı X-Content-Type-Options: nosniff zorla
  { key: "X-Content-Type-Options", value: "nosniff" },
  // iframe icine gomulmeyi engelle (clickjacking)
  { key: "X-Frame-Options", value: "DENY" },
  // Referrer'ı sadece origin kadarıyla paylaş (gizlilik)
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Browser feature izinleri — varsayılan olarak hepsini kapat
  {
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(), payment=(self), usb=(), magnetometer=(), gyroscope=(), accelerometer=()",
  },
  // HSTS — HTTPS zorla, 6 ay süreli, alt domainler dahil
  {
    key: "Strict-Transport-Security",
    value: "max-age=15768000; includeSubDomains",
  },
  // XSS koruması (eski tarayıcılar için)
  { key: "X-XSS-Protection", value: "1; mode=block" },
  // DNS prefetch'e izin ver (performans)
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  serverExternalPackages: ["iyzipay"],
  poweredByHeader: false,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "cdn.modaralist.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Admin sayfalarına ek olarak X-Robots-Tag (noindex)
      {
        source: "/admin/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    // Eski kategori slug'larini yeniye 301 redirect (SEO link juice korunur,
    // Google eski URL'leri yeniye geciser). Yeni rename'lerde buraya ekle.
    return [
      { source: "/shop/tisort", destination: "/shop/tshirt", permanent: true },
      { source: "/tr/shop/tisort", destination: "/tr/shop/tshirt", permanent: true },
      { source: "/en/shop/tisort", destination: "/en/shop/tshirt", permanent: true },
      { source: "/shop/sweat", destination: "/shop/sweatshirt", permanent: true },
      { source: "/tr/shop/sweat", destination: "/tr/shop/sweatshirt", permanent: true },
      { source: "/en/shop/sweat", destination: "/en/shop/sweatshirt", permanent: true },
      { source: "/shop/oversize-sweatshirt", destination: "/shop/oversize", permanent: true },
      { source: "/tr/shop/oversize-sweatshirt", destination: "/tr/shop/oversize", permanent: true },
      { source: "/en/shop/oversize-sweatshirt", destination: "/en/shop/oversize", permanent: true },
      { source: "/shop/outdoor-polar", destination: "/shop/outdoor", permanent: true },
      { source: "/tr/shop/outdoor-polar", destination: "/tr/shop/outdoor", permanent: true },
      { source: "/en/shop/outdoor-polar", destination: "/en/shop/outdoor", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);
