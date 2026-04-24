import { ImageResponse } from "next/og";
import { getProduct } from "@/lib/shop";
import { formatPrice } from "@/lib/utils";

export const runtime = "nodejs";
export const alt = "Modaralist ürün";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { slug: string; locale: string };
}) {
  const lang = (params.locale === "en" ? "en" : "tr") as "tr" | "en";
  const product = await getProduct(params.slug, lang);

  const title = product?.name ?? "Modaralist";
  const subtitle = product?.dropLabel ?? "Modaralist";
  const price = product
    ? formatPrice(product.discountPrice ?? product.price, lang)
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#f5f2ed",
          color: "#0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            fontSize: 16,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8a8a8a",
          }}
        >
          modaralist
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#8a8a8a",
            }}
          >
            — {subtitle}
          </div>
          <div
            style={{
              fontSize: 96,
              lineHeight: 1,
              fontFamily: "serif",
              fontStyle: "italic",
              maxWidth: 900,
            }}
          >
            {title}
          </div>
          {price ? (
            <div style={{ fontSize: 36, marginTop: 20 }}>{price}</div>
          ) : null}
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#8a8a8a",
          }}
        >
          <span>numaralı · sınırlı üretim</span>
          <span>modaralist.shop</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
