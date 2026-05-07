// Demo seed urunlerini DRAFT'a ceker (publish'ten kaldirir).
//
// Sebep: prisma/seed.ts'te demo amacli eklenen urunler
// (slip dress, blazer, overcoat, merino triko, keten pantolon, drape bluz)
// streetwear marka konumlandirmasiyla uyumsuz. Best seller listesinde
// yanlis sinyal veriyor. DRAFT'a cekilince ana sayfada gorunmez.
//
// Idempotent: birden fazla kez calistirilabilir. Production'a gercek
// urunler eklendiginde admin elle bunlari silebilir.
//
// Kullanim:
//   npx tsx scripts/draft-demo-products.ts

import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const DEMO_SLUGS = [
  "asymetric-drape-top",
  "linen-wide-leg",
  "cotton-slip-dress",
  "raw-edge-blazer",
  "knit-column",
  "wool-overcoat",
];

async function main() {
  console.log(`[draft-demo] ${DEMO_SLUGS.length} demo urunu DRAFT'a cekiliyor...`);

  for (const slug of DEMO_SLUGS) {
    const result = await db.product.updateMany({
      where: { slug },
      data: { status: "DRAFT" },
    });
    if (result.count > 0) {
      console.log(`[draft-demo]  ✓ ${slug} → DRAFT`);
    } else {
      console.log(`[draft-demo]  ⊘ ${slug} (bulunamadi)`);
    }
  }

  const published = await db.product.count({ where: { status: "PUBLISHED" } });
  const draft = await db.product.count({ where: { status: "DRAFT" } });
  console.log();
  console.log(`[draft-demo] PUBLISHED: ${published}, DRAFT: ${draft}`);
  console.log("[draft-demo] tamamlandi.");
}

main()
  .catch((e) => {
    console.error("[draft-demo] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
