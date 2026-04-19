import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({ email: z.string().email() });

// MVP placeholder: gerçek sıfırlama akışı için
// VerificationToken tablosuna token yaz + Resend ile mail gönder.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Geçersiz e-posta." }, { status: 400 });
  }

  // TODO: token üret, kaydet, e-posta gönder
  // Şimdilik sessizce OK dön — email enumeration engellemek için
  return NextResponse.json({ ok: true });
}
