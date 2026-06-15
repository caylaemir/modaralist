"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function guard() {
  const session = await auth();
  if (!session?.user) throw new Error("Yetkisiz erişim.");
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    throw new Error("Bu işlem için yetkiniz yok.");
  }
  return session;
}

const columnSchema = z.object({
  key: z
    .string()
    .min(1, "Anahtar zorunlu")
    .regex(/^[a-z][a-z0-9_]*$/, "Sadece kucuk harf/rakam/alt cizgi (orn. gogus)"),
  labelTr: z.string().min(1, "TR ad zorunlu"),
  labelEn: z.string().min(1, "EN ad zorunlu"),
});

const rowSchema = z.object({
  sizeCode: z.string().min(1, "Beden kodu zorunlu"),
  values: z.record(z.string(), z.string()),
});

const chartInputSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug zorunlu")
    .regex(/^[a-z0-9-]+$/, "Slug sadece kucuk harf/rakam/tire"),
  unit: z.enum(["cm", "inch"]).default("cm"),
  isActive: z.boolean().default(true),
  nameTr: z.string().min(1, "TR ad zorunlu"),
  nameEn: z.string().min(1, "EN ad zorunlu"),
  noteTr: z.string().optional().nullable(),
  noteEn: z.string().optional().nullable(),
  columns: z.array(columnSchema).min(1, "En az 1 kolon olmali"),
  rows: z.array(rowSchema).min(1, "En az 1 satir olmali"),
  categoryIds: z.array(z.string()).default([]),
});

export type SizeChartInput = z.infer<typeof chartInputSchema>;

export async function createSizeChart(rawInput: SizeChartInput) {
  await guard();
  const input = chartInputSchema.parse(rawInput);

  const existing = await db.sizeChart.findUnique({ where: { slug: input.slug } });
  if (existing) throw new Error("Bu slug zaten kullanılıyor.");

  const chart = await db.sizeChart.create({
    data: {
      slug: input.slug,
      unit: input.unit,
      isActive: input.isActive,
      translations: {
        create: [
          { locale: "tr", name: input.nameTr, note: input.noteTr ?? null },
          { locale: "en", name: input.nameEn, note: input.noteEn ?? null },
        ],
      },
      columns: {
        create: input.columns.map((c, i) => ({
          key: c.key,
          labelTr: c.labelTr,
          labelEn: c.labelEn,
          sortOrder: i,
        })),
      },
      rows: {
        create: input.rows.map((r, i) => ({
          sizeCode: r.sizeCode,
          values: r.values,
          sortOrder: i,
        })),
      },
      categories: {
        connect: input.categoryIds.map((id) => ({ id })),
      },
    },
  });

  revalidatePath("/admin/size-charts");
  return { id: chart.id };
}

export async function updateSizeChart(id: string, rawInput: SizeChartInput) {
  await guard();
  const input = chartInputSchema.parse(rawInput);

  const existing = await db.sizeChart.findUnique({ where: { id } });
  if (!existing) throw new Error("Beden tablosu bulunamadı.");
  if (input.slug !== existing.slug) {
    const clash = await db.sizeChart.findUnique({ where: { slug: input.slug } });
    if (clash && clash.id !== id) throw new Error("Bu slug zaten kullanılıyor.");
  }

  await db.$transaction(async (tx) => {
    await tx.sizeChart.update({
      where: { id },
      data: { slug: input.slug, unit: input.unit, isActive: input.isActive },
    });

    // Cevirileri upsert
    for (const t of [
      { locale: "tr" as const, name: input.nameTr, note: input.noteTr ?? null },
      { locale: "en" as const, name: input.nameEn, note: input.noteEn ?? null },
    ]) {
      await tx.sizeChartTranslation.upsert({
        where: { chartId_locale: { chartId: id, locale: t.locale } },
        update: { name: t.name, note: t.note },
        create: { chartId: id, locale: t.locale, name: t.name, note: t.note },
      });
    }

    // Kolonlar: eski/sil + yeniden olustur (basit, idempotent)
    await tx.sizeChartColumn.deleteMany({ where: { chartId: id } });
    await tx.sizeChartColumn.createMany({
      data: input.columns.map((c, i) => ({
        chartId: id,
        key: c.key,
        labelTr: c.labelTr,
        labelEn: c.labelEn,
        sortOrder: i,
      })),
    });

    // Satirlar: ayni sekilde
    await tx.sizeChartRow.deleteMany({ where: { chartId: id } });
    await tx.sizeChartRow.createMany({
      data: input.rows.map((r, i) => ({
        chartId: id,
        sizeCode: r.sizeCode,
        values: r.values,
        sortOrder: i,
      })),
    });

    // Kategoriler M:N — set ile butun atama silinip yeniden kurulur
    await tx.sizeChart.update({
      where: { id },
      data: { categories: { set: input.categoryIds.map((cid) => ({ id: cid })) } },
    });
  });

  revalidatePath("/admin/size-charts");
  revalidatePath(`/admin/size-charts/${id}`);
  return { id };
}

export async function deleteSizeChart(id: string) {
  await guard();
  const existing = await db.sizeChart.findUnique({ where: { id } });
  if (!existing) throw new Error("Beden tablosu bulunamadı.");

  await db.sizeChart.delete({ where: { id } });
  revalidatePath("/admin/size-charts");
  return { ok: true };
}
