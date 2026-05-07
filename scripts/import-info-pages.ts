// Statik bilgi sayfalari (about, contact) DB'ye upsert eder. Idempotent.
//
// Kullanim:
//   npx tsx scripts/import-info-pages.ts
//
// Kaynak: prisma/data/info-pages.ts

import { PrismaClient } from "@prisma/client";
import { INFO_PAGES } from "../prisma/data/info-pages";

const db = new PrismaClient();

async function main() {
  console.log(`[info-pages] ${INFO_PAGES.length} sayfa import ediliyor...`);

  for (const ip of INFO_PAGES) {
    const page = await db.page.upsert({
      where: { slug: ip.slug },
      update: { isPublished: true, template: "default" },
      create: {
        slug: ip.slug,
        isPublished: true,
        template: "default",
      },
    });

    for (const locale of ["tr", "en"] as const) {
      const data = ip[locale];
      await db.pageTranslation.upsert({
        where: {
          pageId_locale: { pageId: page.id, locale },
        },
        update: {
          title: data.title,
          bodyHtml: data.body,
          seoTitle: data.seoTitle ?? data.title,
          seoDesc: data.seoDesc ?? data.title,
          slug: ip.slug,
        },
        create: {
          pageId: page.id,
          locale,
          title: data.title,
          bodyHtml: data.body,
          seoTitle: data.seoTitle ?? data.title,
          seoDesc: data.seoDesc ?? data.title,
          slug: ip.slug,
        },
      });
    }

    console.log(`[info-pages]  ✓ ${ip.slug}`);
  }

  console.log("[info-pages] tamamlandi.");
}

main()
  .catch((e) => {
    console.error("[info-pages] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
