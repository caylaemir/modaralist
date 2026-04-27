import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { buildUserDataExport } from "@/app/[locale]/(shop)/account/privacy/actions";

/**
 * GET /api/account/export
 * KVKK madde 11 — kullanici tum verisini JSON olarak indirir.
 * Auth gerekli — sadece kendi verisini cekebilir.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const data = await buildUserDataExport(session.user.id);
  if (!data) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }

  const json = JSON.stringify(data, null, 2);
  const ts = new Date().toISOString().slice(0, 10);

  return new NextResponse(json, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="modaralist-${ts}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
