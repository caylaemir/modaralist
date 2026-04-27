import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { generateProductCopy } from "@/lib/ai-product-copy";

const schema = z.object({
  productName: z.string().min(2).max(200),
  categoryName: z.string().max(100).optional(),
  styleHints: z.string().max(500).optional(),
});

/**
 * POST /api/admin/ai/product-copy
 * Admin tool — Claude AI ile urun copy uretir.
 * Sadece ADMIN/STAFF erisebilir, ANTHROPIC_API_KEY env gerek.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return NextResponse.json({ error: "yetkisiz" }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "gecersiz input" }, { status: 400 });
  }

  const result = await generateProductCopy(parsed.data);
  if ("error" in result) {
    return NextResponse.json(result, { status: 500 });
  }
  return NextResponse.json(result);
}
