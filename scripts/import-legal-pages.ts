// Hukuki sayfa metinlerini DB'ye upsert eder.
// Idempotent — birden fazla kez calistirilabilir.
//
// Kullanim:
//   npx tsx scripts/import-legal-pages.ts
//
// Kaynak: prisma/data/legal-pages.ts (PDF'den HTML'e cevrilmis metinler)

import { PrismaClient } from "@prisma/client";
import { LEGAL_PAGES } from "../prisma/data/legal-pages";

const db = new PrismaClient();

async function main() {
  console.log(`[legal-pages] ${LEGAL_PAGES.length} sayfa import ediliyor...`);

  for (const lp of LEGAL_PAGES) {
    const page = await db.page.upsert({
      where: { slug: lp.slug },
      update: {
        isPublished: true,
        template: "default",
      },
      create: {
        slug: lp.slug,
        isPublished: true,
        template: "default",
      },
    });

    for (const locale of ["tr", "en"] as const) {
      const data = lp[locale];
      await db.pageTranslation.upsert({
        where: {
          pageId_locale: { pageId: page.id, locale },
        },
        update: {
          title: data.title,
          bodyHtml: data.body,
          seoTitle: data.seoTitle ?? data.title,
          seoDesc: data.seoDesc ?? data.title,
          slug: lp.slug,
        },
        create: {
          pageId: page.id,
          locale,
          title: data.title,
          bodyHtml: data.body,
          seoTitle: data.seoTitle ?? data.title,
          seoDesc: data.seoDesc ?? data.title,
          slug: lp.slug,
        },
      });
    }

    console.log(`[legal-pages]  ✓ ${lp.slug}`);
  }

  console.log(`[legal-pages] tamamlandi.`);
}

main()
  .catch((e) => {
    console.error("[legal-pages] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
