import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

// Manifest'te referansli boyutlar — herhangi baska deger 404 doner.
// 'maskable' icin Android adaptive-icon spec'inin guvenli alanini birakiriz
// (icerik ortadaki %80'lik daireye sigmali).
const SIZES = new Map<string, { px: number; mode: "any" | "maskable" }>([
  ["192", { px: 192, mode: "any" }],
  ["512", { px: 512, mode: "any" }],
  ["maskable", { px: 512, mode: "maskable" }],
]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: key } = await params;
  const meta = SIZES.get(key);
  if (!meta) {
    return new Response("Not found", { status: 404 });
  }

  // Maskable olunca harf %60 boyutta, etrafinda safe area
  const fontSize = meta.mode === "maskable" ? meta.px * 0.5 : meta.px * 0.7;

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
          fontSize,
          fontWeight: 400,
          letterSpacing: -fontSize * 0.05,
          paddingBottom: fontSize * 0.1,
        }}
      >
        m
      </div>
    ),
    {
      width: meta.px,
      height: meta.px,
      headers: {
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    }
  );
}
