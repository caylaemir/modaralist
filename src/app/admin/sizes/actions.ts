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

const sizeSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(20)
    .regex(/^[A-Za-z0-9-]+$/, "Sadece harf, rakam ve tire (örn: XS, 38, 42-44)"),
  sortOrder: z.coerce.number().int().min(0).default(0),
});

export async function createSizeAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = sizeSchema.safeParse({
    code: String(fd.get("code") ?? "").trim().toUpperCase(),
    sortOrder: fd.get("sortOrder") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }

  const existing = await db.size.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) return { ok: false, error: "Bu kod zaten var" };

  await db.size.create({ data: parsed.data });
  revalidatePath("/admin/sizes");
  return { ok: true };
}

export async function updateSizeAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = sizeSchema.safeParse({
    code: String(fd.get("code") ?? "").trim().toUpperCase(),
    sortOrder: fd.get("sortOrder") ?? 0,
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }
  try {
    await db.size.update({ where: { id }, data: parsed.data });
  } catch {
    return { ok: false, error: "Güncellenemedi (kod çakışması olabilir)" };
  }
  revalidatePath("/admin/sizes");
  return { ok: true };
}

export async function deleteSizeAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const usedBy = await db.productVariant.count({ where: { sizeId: id } });
  if (usedBy > 0) {
    return {
      ok: false,
      error: `${usedBy} ürün varyantı bu bedeni kullanıyor — önce onları değiştir`,
    };
  }
  await db.size.delete({ where: { id } });
  revalidatePath("/admin/sizes");
  return { ok: true };
}
