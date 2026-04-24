import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const alt = "Modaralist — numaralı koleksiyonlar";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
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
          background: "#0a0a0a",
          color: "#f5f2ed",
        }}
      >
        <div
          style={{
            fontSize: 18,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a8a8a8",
          }}
        >
          modaralist
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div
            style={{
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#a8a8a8",
            }}
          >
            — numaralı koleksiyonlar
          </div>
          <div
            style={{
              fontSize: 132,
              lineHeight: 1,
              fontFamily: "serif",
              fontStyle: "italic",
            }}
          >
            sınırlı üretim.
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 14,
            letterSpacing: 4,
            textTransform: "uppercase",
            color: "#a8a8a8",
          }}
        >
          <span>made in turkey</span>
          <span>modaralist.shop</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
