"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ProductStatus } from "@prisma/client";

/**
 * Toplu fiyat guncelleme arac.
 *
 * Operasyonlar:
 *  - increase-percent: %X arttir (1990 + %10 = 2189)
 *  - decrease-percent: %X azalt
 *  - increase-amount: sabit ekle (1990 + 100 = 2090)
 *  - decrease-amount: sabit cikar
 *  - set-fixed: tum filtre eslesenleri ayni fiyata cek (tehlikeli, onay gerek)
 *  - reset-discount: discountPrice = NULL (tum indirimleri kaldir)
 *
 * Filtre: kategori (opsiyonel), status (opsiyonel)
 *
 * 'preview' true ise yazma yapar, sadece onceki/sonraki listesini doner.
 * 'apply' icin preview false. Uygulanan her urun BulkPriceLog'a yazilir
 * (rollback icin) — ama biz simdilik in-memory revert verisini doneriz,
 * admin manuel olarak revert eder isterse.
 *
 * basePrice 0'in altina dusurmez (clamp). discountPrice basePrice'tan
 * buyukse uyari (geri donmez ama warning'e koyar).
 */

const operationSchema = z.enum([
  "increase-percent",
  "decrease-percent",
  "increase-amount",
  "decrease-amount",
  "set-fixed",
  "reset-discount",
]);

const inputSchema = z.object({
  operation: operationSchema,
  // M10: yuzdelik islemlerde 100'u gecmesin (decrease-percent 100 = %100
  // indirim = 0 TL; >100 = negatif fiyat). Sabit eklemede de astronomik
  // sayi vermek istemeyiz: 1M TL ust limit.
  value: z.number().min(0).max(1_000_000).default(0),
  field: z.enum(["basePrice", "discountPrice", "both"]).default("basePrice"),
  filters: z
    .object({
      categoryId: z.string().optional(),
      status: z
        .enum(["DRAFT", "PUBLISHED", "ARCHIVED", "COMING_SOON"])
        .optional(),
    })
    .default({}),
  preview: z.boolean().default(true),
});

export type BulkPriceInput = z.infer<typeof inputSchema>;

export type BulkPriceRow = {
  id: string;
  slug: string;
  name: string;
  oldBasePrice: number;
  newBasePrice: number;
  oldDiscountPrice: number | null;
  newDiscountPrice: number | null;
  warning?: string;
};

export type BulkPriceResult = {
  preview: boolean;
  total: number;
  changed: number;
  applied: number;
  rows: BulkPriceRow[];
  warnings: string[];
};

function calc(
  current: number,
  op: BulkPriceInput["operation"],
  value: number
): number {
  switch (op) {
    case "increase-percent":
      return current * (1 + value / 100);
    case "decrease-percent":
      return current * (1 - value / 100);
    case "increase-amount":
      return current + value;
    case "decrease-amount":
      return current - value;
    case "set-fixed":
      return value;
    case "reset-discount":
      return current;
  }
}

function round(n: number) {
  return Math.max(0, Math.round(n * 100) / 100);
}

export async function bulkPriceAction(
  input: BulkPriceInput
): Promise<BulkPriceResult> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    throw new Error("Yetkisiz");
  }

  const parsed = inputSchema.parse(input);

  // M10: yuzdelik indirim 100'u gecerse mantiksiz (negatif fiyat)
  if (parsed.operation === "decrease-percent" && parsed.value > 100) {
    throw new Error("İndirim %100'ü geçemez");
  }
  if (
    parsed.operation === "increase-percent" &&
    parsed.value > 1000
  ) {
    throw new Error("Zam %1000'i geçemez (yanlışlık olabilir)");
  }

  const products = await db.product.findMany({
    where: {
      ...(parsed.filters.categoryId
        ? { categoryId: parsed.filters.categoryId }
        : {}),
      ...(parsed.filters.status
        ? { status: parsed.filters.status as ProductStatus }
        : {}),
    },
    select: {
      id: true,
      slug: true,
      basePrice: true,
      discountPrice: true,
      translations: { where: { locale: "tr" }, select: { name: true } },
    },
  });

  const rows: BulkPriceRow[] = [];
  const warnings: string[] = [];
  const updates: Array<{ id: string; basePrice?: number; discountPrice?: number | null }> = [];

  for (const p of products) {
    const oldBase = Number(p.basePrice);
    const oldDisc = p.discountPrice == null ? null : Number(p.discountPrice);
    let newBase = oldBase;
    let newDisc = oldDisc;
    const upd: { id: string; basePrice?: number; discountPrice?: number | null } = { id: p.id };

    if (parsed.operation === "reset-discount") {
      if (oldDisc != null) {
        newDisc = null;
        upd.discountPrice = null;
      }
    } else {
      if (parsed.field === "basePrice" || parsed.field === "both") {
        newBase = round(calc(oldBase, parsed.operation, parsed.value));
        if (newBase !== oldBase) upd.basePrice = newBase;
      }
      if ((parsed.field === "discountPrice" || parsed.field === "both") && oldDisc != null) {
        const computed = round(calc(oldDisc, parsed.operation, parsed.value));
        if (computed !== oldDisc) {
          newDisc = computed;
          upd.discountPrice = newDisc;
        }
      }
    }

    let warning: string | undefined;
    if (newDisc != null && newDisc >= newBase) {
      warning = "Indirimli fiyat normal fiyattan yuksek/esit";
      warnings.push(`${p.slug}: ${warning}`);
    }

    rows.push({
      id: p.id,
      slug: p.slug,
      name: p.translations[0]?.name ?? p.slug,
      oldBasePrice: oldBase,
      newBasePrice: newBase,
      oldDiscountPrice: oldDisc,
      newDiscountPrice: newDisc,
      warning,
    });

    if (Object.keys(upd).length > 1) {
      updates.push(upd);
    }
  }

  let applied = 0;
  if (!parsed.preview && updates.length > 0) {
    const ops = updates.map((u) =>
      db.product.update({
        where: { id: u.id },
        data: {
          ...(u.basePrice !== undefined ? { basePrice: u.basePrice } : {}),
          ...(u.discountPrice !== undefined
            ? { discountPrice: u.discountPrice }
            : {}),
        },
      })
    );
    await db.$transaction(ops);
    applied = updates.length;
    revalidatePath("/admin/products");
  }

  return {
    preview: parsed.preview,
    total: products.length,
    changed: updates.length,
    applied,
    rows,
    warnings,
  };
}
