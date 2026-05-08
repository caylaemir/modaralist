// Bir defalik script: Sezonluk koleksiyonlarin heroImageUrl'ini
// prisma/data/collections.ts'teki yeni degerlerle FORCE override eder.
//
// import-collections script'i admin'in elle yukledigi gorseli ezmesin
// diye sadece null'a atiyor. Ama placeholder gorselleri yenilemek icin
// bir kerelik buna ihtiyacimiz var.
//
// Kullanim:
//   npx tsx scripts/force-update-collection-heroes.ts

import { PrismaClient } from "@prisma/client";
import { COLLECTIONS_2026 } from "../prisma/data/collections";

const db = new PrismaClient();

async function main() {
  console.log(
    `[force-hero] ${COLLECTIONS_2026.length} koleksiyon hero gorseli guncelleniyor...`
  );

  for (const c of COLLECTIONS_2026) {
    if (!c.heroImageUrl) continue;
    const result = await db.collection.updateMany({
      where: { slug: c.slug },
      data: { heroImageUrl: c.heroImageUrl },
    });
    if (result.count > 0) {
      console.log(`[force-hero]  ✓ ${c.slug} guncellendi`);
    } else {
      console.log(`[force-hero]  ⊘ ${c.slug} bulunamadi`);
    }
  }

  console.log("[force-hero] tamamlandi.");
}

main()
  .catch((e) => {
    console.error("[force-hero] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
