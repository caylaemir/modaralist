import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  // display_override + prefer_related_applications: PWA install promptu
  // (yerli store yerine direkt PWA olarak yuklensin diye false).
  return {
    name: "Modaralist",
    short_name: "Modaralist",
    description: "Numaralı koleksiyonlar, sınırlı üretim.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    background_color: "#f5f2ed",
    theme_color: "#0a0a0a",
    orientation: "portrait",
    lang: "tr",
    categories: ["shopping", "lifestyle", "fashion"],
    prefer_related_applications: false,
    icons: [
      {
        src: "/api/icon/192",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/api/icon/maskable",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "Mağaza",
        short_name: "Shop",
        description: "Tüm parçalar",
        url: "/shop",
        icons: [{ src: "/api/icon/192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Drop'lar",
        short_name: "Drops",
        description: "Aktif koleksiyonlar",
        url: "/drops",
        icons: [{ src: "/api/icon/192", sizes: "192x192", type: "image/png" }],
      },
      {
        name: "Sipariş Takibi",
        short_name: "Track",
        description: "Sipariş durumu sorgu",
        url: "/track",
        icons: [{ src: "/api/icon/192", sizes: "192x192", type: "image/png" }],
      },
    ],
  };
}
