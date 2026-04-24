import { ImageResponse } from "next/og";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0a0a",
          color: "#f5f2ed",
          fontFamily: "serif",
          fontStyle: "italic",
          fontSize: 130,
          fontWeight: 400,
          letterSpacing: -4,
        }}
      >
        m
      </div>
    ),
    { ...size }
  );
}
