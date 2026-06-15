import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { ChartForm } from "../_components/chart-form";

export const dynamic = "force-dynamic";

export default async function NewSizeChartPage() {
  const categories = await db.category
    .findMany({
      where: { isActive: true },
      include: { translations: { where: { locale: "tr" } } },
      orderBy: { sortOrder: "asc" },
    })
    .catch(() => []);

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/size-charts"
          className="inline-flex items-center gap-1 text-xs uppercase tracking-wider text-mist hover:text-ink"
        >
          <ArrowLeft className="size-3" />
          Beden Tabloları
        </Link>
        <h1 className="display mt-2 text-4xl">Yeni Tablo</h1>
      </div>

      <ChartForm
        mode="create"
        categories={categories.map((c) => ({
          id: c.id,
          name: c.translations[0]?.name ?? c.slug,
          parentId: c.parentId,
        }))}
      />
    </div>
  );
}
