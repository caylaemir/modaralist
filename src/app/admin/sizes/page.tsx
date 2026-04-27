import { db } from "@/lib/db";
import { SizesClient } from "./sizes-client";

export const dynamic = "force-dynamic";

export default async function SizesPage() {
  const sizes = await db.size.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      _count: { select: { variants: true } },
    },
  });

  const rows = sizes.map((s) => ({
    id: s.id,
    code: s.code,
    sortOrder: s.sortOrder,
    variantCount: s._count.variants,
  }));

  return (
    <div>
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — taksonomi
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Bedenler</h1>
        <p className="mt-4 max-w-xl text-sm text-mist">
          Ürün varyantlarında kullanılacak bedenler. Sıra UI'da göründüğü
          düzeni belirler (XS=0, S=1, M=2 gibi). Numerik bedenler için 38, 40,
          42-44 vb. de yazılabilir.
        </p>
      </header>

      <SizesClient initial={rows} />
    </div>
  );
}
