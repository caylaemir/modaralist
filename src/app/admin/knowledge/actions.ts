"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireStaff() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    throw new Error("Yetkisiz");
  }
}

const kbSchema = z.object({
  title: z.string().min(2).max(200),
  content: z.string().min(5).max(10000),
  keywords: z.string().max(500).optional().nullable(),
  isActive: z.boolean().default(true),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

function readPayload(fd: FormData) {
  return {
    title: String(fd.get("title") ?? "").trim(),
    content: String(fd.get("content") ?? "").trim(),
    keywords: String(fd.get("keywords") ?? "").trim() || null,
    isActive: fd.get("isActive") === "on" || fd.get("isActive") === "true",
    sortOrder: Number(fd.get("sortOrder") ?? 0),
  };
}

export async function createKbAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string; id?: string }> {
  await requireStaff();
  const parsed = kbSchema.safeParse(readPayload(fd));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz veri",
    };
  }
  const created = await db.knowledgeBase.create({ data: parsed.data });
  revalidatePath("/admin/knowledge");
  return { ok: true, id: created.id };
}

export async function updateKbAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = kbSchema.safeParse(readPayload(fd));
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Geçersiz veri",
    };
  }
  await db.knowledgeBase.update({ where: { id }, data: parsed.data });
  revalidatePath("/admin/knowledge");
  return { ok: true };
}

export async function deleteKbAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  await db.knowledgeBase.delete({ where: { id } });
  revalidatePath("/admin/knowledge");
  return { ok: true };
}
