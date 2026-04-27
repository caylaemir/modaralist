import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { chat, type ChatMessage } from "@/lib/seloo-ai";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(2000),
});

const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(20),
});

/**
 * POST /api/chat — SelooAI musteri asistani
 *
 * Rate limit: 30 mesaj/IP/saat (cost koruma)
 * Max 20 mesaj history (token tasarrufu)
 * Each message max 2000 char (spam koruma)
 */
export async function POST(req: NextRequest) {
  // Rate limit
  const rl = rateLimit(`seloo:${getClientIp(req)}`, 30, 60 * 60_000);
  if (!rl.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: "Çok fazla mesaj gönderdin, biraz sonra tekrar dene.",
      },
      { status: 429 }
    );
  }

  const body = await req.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Geçersiz istek" },
      { status: 400 }
    );
  }

  const result = await chat(parsed.data.messages as ChatMessage[]);
  return NextResponse.json(result, { status: result.ok ? 200 : 500 });
}
