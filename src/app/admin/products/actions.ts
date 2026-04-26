"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ProductStatus } from "@prisma/client";

async function requireStaff() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    throw new Error("Yetkisiz");
  }
}

const ACTION_TO_STATUS: Record<string, ProductStatus> = {
  publish: "PUBLISHED",
  draft: "DRAFT",
  archive: "ARCHIVED",
};

export async function bulkUpdateProductsAction(
  ids: string[],
  action: "publish" | "draft" | "archive"
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireStaff();
  } catch {
    return { ok: false, error: "Yetkisiz" };
  }
  if (!ids.length) return { ok: false, error: "Seçim boş" };
  const status = ACTION_TO_STATUS[action];
  if (!status) return { ok: false, error: "Geçersiz aksiyon" };

  // publishedAt: yalnızca İLK publish'te set et — sonraki publish'lerde
  // history korunsun. draft/archive'a alınca null'a çekme — eski tarih kalsın.
  if (status === "PUBLISHED") {
    // Sadece daha önce yayınlanmamış (publishedAt null) olanları güncelle
    await db.product.updateMany({
      where: { id: { in: ids }, publishedAt: null },
      data: { status, publishedAt: new Date() },
    });
    // Daha önce yayınlanmış olanların publishedAt'sini DOKUNMA
    await db.product.updateMany({
      where: { id: { in: ids }, publishedAt: { not: null } },
      data: { status },
    });
  } else {
    await db.product.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });
  }
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function bulkDeleteProductsAction(
  ids: string[]
): Promise<{ ok: boolean; error?: string }> {
  try {
    await requireStaff();
  } catch {
    return { ok: false, error: "Yetkisiz" };
  }
  if (!ids.length) return { ok: false, error: "Seçim boş" };

  // Cascade delete (variants, images, translations, collections, reviews, wishlist)
  await db.product.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/products");
  revalidatePath("/", "layout");
  return { ok: true };
}
