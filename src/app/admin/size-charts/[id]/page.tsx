import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ChartForm } from "../_components/chart-form";
import { DeleteChartButton } from "./delete-button";

export const dynamic = "force-dynamic";

export default async function EditSizeChartPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [chart, categories] = await Promise.all([
    db.sizeChart
      .findUnique({
        where: { id },
        include: {
          translations: true,
          columns: { orderBy: { sortOrder: "asc" } },
          rows: { orderBy: { sortOrder: "asc" } },
          categories: { select: { id: true } },
        },
      })
      .catch(() => null),
    db.category
      .findMany({
        where: { isActive: true },
        include: { translations: { where: { locale: "tr" } } },
        orderBy: { sortOrder: "asc" },
      })
      .catch(() => []),
  ]);

  if (!chart) notFound();
  const tr = chart.translations.find((t) => t.locale === "tr");
  const en = chart.translations.find((t) => t.locale === "en");

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <Link
            href="/admin/size-charts"
            className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-mist hover:text-ink"
          >
            <ArrowLeft className="size-3" />
            Beden Tabloları
          </Link>
          <h1 className="display mt-2 text-4xl">
            {tr?.name ?? chart.slug}
          </h1>
        </div>
        <DeleteChartButton id={chart.id} name={tr?.name ?? chart.slug} />
      </div>

      <ChartForm
        mode="edit"
        chartId={chart.id}
        categories={categories.map((c) => ({
          id: c.id,
          name: c.translations[0]?.name ?? c.slug,
          parentId: c.parentId,
        }))}
        initial={{
          slug: chart.slug,
          unit: (chart.unit as "cm" | "inch") ?? "cm",
          isActive: chart.isActive,
          nameTr: tr?.name ?? "",
          nameEn: en?.name ?? "",
          noteTr: tr?.note ?? null,
          noteEn: en?.note ?? null,
          columns: chart.columns.map((c) => ({
            key: c.key,
            labelTr: c.labelTr,
            labelEn: c.labelEn,
          })),
          rows: chart.rows.map((r) => ({
            sizeCode: r.sizeCode,
            values: (r.values ?? {}) as Record<string, string>,
          })),
          categoryIds: chart.categories.map((c) => c.id),
        }}
      />
    </div>
  );
}
