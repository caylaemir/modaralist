import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { auth } from "@/lib/auth";

// Admin tarafından görsel yüklemek için signed Cloudinary upload token üretir.
// Frontend upload widget signature ile direkt Cloudinary'ye POST atar.

// Whitelist: client'tan gelen folder mutlaka bu listedekilerden biri olmali.
// Path traversal ('../../') veya keyfi klasor sokmasini engeller.
const ALLOWED_FOLDERS = [
  "modaralist/products",
  "modaralist/collections",
  "modaralist/categories",
  "modaralist/blog",
] as const;

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  const body = (await req.json().catch(() => ({}))) as { folder?: string };
  const folder = body.folder ?? "modaralist/products";

  if (!ALLOWED_FOLDERS.includes(folder as typeof ALLOWED_FOLDERS[number])) {
    return NextResponse.json(
      { error: "invalid folder" },
      { status: 400 }
    );
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;

  if (!apiSecret || !apiKey || !cloudName) {
    return NextResponse.json({ error: "cloudinary not configured" }, { status: 503 });
  }

  // Minimal signature: sadece folder + timestamp imzalanir. resource_type
  // upload URL'inde zaten /image/ olarak belirtiliyor; max_file_size client
  // tarafinda ve Cloudinary preset'inde kontrol edilir. Signature parametre
  // sayisi azaldikca "Invalid Signature" riski dramatik dusuyor.
  // SHA-1 — Cloudinary default. SHA-256 cloud'da explicitly aktif olmaliydi,
  // SHA-1 daha geniş uyumlu.
  // ALPHABETICAL ORDER ZORUNLU (Cloudinary docs).
  const timestamp = Math.floor(Date.now() / 1000);
  const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash("sha1")
    .update(paramsToSign + apiSecret)
    .digest("hex");

  return NextResponse.json({
    apiKey,
    cloudName,
    folder,
    timestamp,
    signature,
  });
}
