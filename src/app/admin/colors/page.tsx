import { db } from "@/lib/db";
import { ColorsClient } from "./colors-client";

export const dynamic = "force-dynamic";

export default async function ColorsPage() {
  const colors = await db.color.findMany({
    orderBy: { code: "asc" },
    include: {
      _count: { select: { variants: true } },
    },
  });

  const rows = colors.map((c) => ({
    id: c.id,
    code: c.code,
    hex: c.hex,
    nameTr: c.nameTr,
    nameEn: c.nameEn,
    variantCount: c._count.variants,
  }));

  return (
    <div>
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — taksonomi
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Renkler</h1>
        <p className="mt-4 max-w-xl text-sm text-mist">
          Ürün varyantlarında kullanılacak renkler. Hex değer swatch için, TR/EN ad ise filtre/UI için.
        </p>
      </header>

      <ColorsClient initial={rows} />
    </div>
  );
}
