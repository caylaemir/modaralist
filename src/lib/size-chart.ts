import "server-only";
import { db } from "@/lib/db";

export type SizeChartData = {
  id: string;
  unit: string;
  name: string;
  note: string | null;
  columns: { key: string; label: string }[];
  rows: { sizeCode: string; values: Record<string, string> }[];
};

/**
 * Bir kategori (veya hiyerarsisindeki ata) icin beden tablosu cek.
 * Onceligi: kategorinin kendi atanmis chart'i -> parent -> grandparent
 * (3 seviyeye kadar yukari). Hicbiri yoksa null.
 *
 * Aktif olmayan chart'lar gozardi edilir.
 */
export async function getSizeChartForCategorySlug(
  categorySlug: string | null,
  locale: "tr" | "en"
): Promise<SizeChartData | null> {
  if (!categorySlug) return null;

  // 3 seviye yukariya kadar ata zinciri
  const cat = await db.category.findUnique({
    where: { slug: categorySlug },
    include: {
      parent: {
        include: { parent: true },
      },
    },
  });
  if (!cat) return null;
  const ids = [cat.id, cat.parent?.id, cat.parent?.parent?.id].filter(
    Boolean
  ) as string[];

  // Onceligi koruyarak: ilk eslesen kategori-id'nin aktif ilk chart'i
  for (const cid of ids) {
    const chart = await db.sizeChart.findFirst({
      where: { isActive: true, categories: { some: { id: cid } } },
      include: {
        translations: { where: { locale } },
        columns: { orderBy: { sortOrder: "asc" } },
        rows: { orderBy: { sortOrder: "asc" } },
      },
    });
    if (chart) {
      const tr = chart.translations[0];
      return {
        id: chart.id,
        unit: chart.unit,
        name: tr?.name ?? "Beden Tablosu",
        note: tr?.note ?? null,
        columns: chart.columns.map((c) => ({
          key: c.key,
          label: locale === "tr" ? c.labelTr : c.labelEn,
        })),
        rows: chart.rows.map((r) => ({
          sizeCode: r.sizeCode,
          values: (r.values ?? {}) as Record<string, string>,
        })),
      };
    }
  }
  return null;
}
