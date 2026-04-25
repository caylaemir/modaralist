import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Modaralist",
    short_name: "Modaralist",
    description: "Numaralı koleksiyonlar, sınırlı üretim.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f2ed",
    theme_color: "#0a0a0a",
    orientation: "portrait",
    lang: "tr",
    categories: ["shopping", "lifestyle", "fashion"],
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
      },
      {
        name: "Drop'lar",
        short_name: "Drops",
        description: "Aktif koleksiyonlar",
        url: "/drops",
      },
      {
        name: "Sipariş Takibi",
        short_name: "Track",
        description: "Sipariş durumu sorgu",
        url: "/track",
      },
    ],
  };
}
