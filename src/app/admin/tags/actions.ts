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

const tagSchema = z.object({
  code: z
    .string()
    .min(1)
    .max(40)
    .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire (örn: kadin, erkek, yeni)"),
  labelTr: z.string().min(1).max(80),
  labelEn: z.string().min(1).max(80),
});

export async function createTagAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = tagSchema.safeParse({
    code: String(fd.get("code") ?? "").trim().toLowerCase(),
    labelTr: String(fd.get("labelTr") ?? "").trim(),
    labelEn: String(fd.get("labelEn") ?? "").trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }

  const existing = await db.productTag.findUnique({
    where: { code: parsed.data.code },
  });
  if (existing) return { ok: false, error: "Bu kod zaten var" };

  await db.productTag.create({ data: parsed.data });
  revalidatePath("/admin/tags");
  return { ok: true };
}

export async function updateTagAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = tagSchema.safeParse({
    code: String(fd.get("code") ?? "").trim().toLowerCase(),
    labelTr: String(fd.get("labelTr") ?? "").trim(),
    labelEn: String(fd.get("labelEn") ?? "").trim(),
  });
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Geçersiz" };
  }
  try {
    await db.productTag.update({ where: { id }, data: parsed.data });
  } catch {
    return { ok: false, error: "Güncellenemedi (kod çakışması olabilir)" };
  }
  revalidatePath("/admin/tags");
  return { ok: true };
}

export async function deleteTagAction(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  // Sadece kullanilmayanlari sil — varsa kullanan urun kaldirir reddet
  const tag = await db.productTag.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });
  if (!tag) return { ok: false, error: "Etiket bulunamadı" };
  if (tag._count.products > 0) {
    return {
      ok: false,
      error: `${tag._count.products} ürün bu etiketi kullanıyor — önce kaldır`,
    };
  }
  await db.productTag.delete({ where: { id } });
  revalidatePath("/admin/tags");
  return { ok: true };
}
