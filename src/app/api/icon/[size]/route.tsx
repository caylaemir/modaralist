import { readFile } from "node:fs/promises";
import path from "node:path";
import type { NextRequest } from "next/server";

export const runtime = "nodejs";

const ICONS = new Map<string, string>([
  ["192", "modaralist-mark-192.png"],
  ["512", "modaralist-mark-512.png"],
  ["maskable", "modaralist-mark-512.png"],
]);

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> }
) {
  const { size: key } = await params;
  const fileName = ICONS.get(key);
  if (!fileName) {
    return new Response("Not found", { status: 404 });
  }

  const file = await readFile(
    path.join(process.cwd(), "public", "brand", fileName)
  );

  return new Response(new Uint8Array(file), {
    headers: {
      "Cache-Control": "public, max-age=31536000, immutable",
      "Content-Type": "image/png",
    },
  });
}
