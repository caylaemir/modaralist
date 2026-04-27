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

const colorSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire"),
  hex: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Hex format: #RRGGBB"),
  nameTr: z.string().min(1).max(80),
  nameEn: z.string().min(1).max(80),
});

export async function createColorAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = colorSchema.safeParse({
    code: String(fd.get("code") ?? "").trim().toLowerCase(),
    hex: String(fd.get("hex") ?? "").trim(),
    nameTr: String(fd.get("nameTr") ?? "").trim(),
    nameEn: String(fd.get("nameEn") ?? "").trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }

  const existing = await db.color.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) return { ok: false, error: "Bu kod zaten var" };

  await db.color.create({ data: parsed.data });
  revalidatePath("/admin/colors");
  return { ok: true };
}

export async function updateColorAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = colorSchema.safeParse({
    code: String(fd.get("code") ?? "").trim().toLowerCase(),
    hex: String(fd.get("hex") ?? "").trim(),
    nameTr: String(fd.get("nameTr") ?? "").trim(),
    nameEn: String(fd.get("nameEn") ?? "").trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }
  try {
    await db.color.update({ where: { id }, data: parsed.data });
  } catch {
    return { ok: false, error: "Güncellenemedi (kod çakışması olabilir)" };
  }
  revalidatePath("/admin/colors");
  return { ok: true };
}

export async function deleteColorAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  // Bu rengi kullanan variant varsa silme — degrade yerine reddet
  const usedBy = await db.productVariant.count({ where: { colorId: id } });
  if (usedBy > 0) {
    return {
      ok: false,
      error: `${usedBy} ürün varyantı bu rengi kullanıyor — önce onları değiştir`,
    };
  }
  await db.color.delete({ where: { id } });
  revalidatePath("/admin/colors");
  return { ok: true };
}
