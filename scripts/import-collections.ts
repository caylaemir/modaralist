// 4 sezonluk koleksiyonu DB'ye upsert eder. Idempotent.
//
// Davranis:
// - Yeni koleksiyonlar create edilir
// - Mevcut koleksiyonlar guncellenir (sortOrder, tarih, theme) ama
//   admin'in elle degistirdigi STATUS bozulmaz (update'te status yok)
// - DEPRECATED_COLLECTION_SLUGS ARCHIVED status'a cekilir
//
// Kullanim:
//   npx tsx scripts/import-collections.ts

import { PrismaClient } from "@prisma/client";
import {
  COLLECTIONS_2026,
  DEPRECATED_COLLECTION_SLUGS,
} from "../prisma/data/collections";

const db = new PrismaClient();

async function main() {
  console.log(`[collections] ${COLLECTIONS_2026.length} sezonluk koleksiyon import...`);

  for (const c of COLLECTIONS_2026) {
    const existing = await db.collection.findUnique({ where: { slug: c.slug } });

    // heroImageUrl: yalnizca DB'de bos ise atanir — admin gercek brand
    // gorseliyle override etmis olabilir, onu ezme.
    const heroUpdate =
      existing?.heroImageUrl == null && c.heroImageUrl
        ? { heroImageUrl: c.heroImageUrl }
        : {};

    const col = await db.collection.upsert({
      where: { slug: c.slug },
      update: {
        sortOrder: c.sortOrder,
        startsAt: new Date(c.startsAt),
        endsAt: new Date(c.endsAt),
        themePrimary: c.themePrimary ?? null,
        themeAccent: c.themeAccent ?? null,
        ...heroUpdate,
      },
      create: {
        slug: c.slug,
        status: c.initialStatus,
        sortOrder: c.sortOrder,
        startsAt: new Date(c.startsAt),
        endsAt: new Date(c.endsAt),
        themePrimary: c.themePrimary ?? null,
        themeAccent: c.themeAccent ?? null,
        heroImageUrl: c.heroImageUrl ?? null,
      },
    });

    for (const locale of ["tr", "en"] as const) {
      const data = c[locale];
      await db.collectionTranslation.upsert({
        where: {
          collectionId_locale: { collectionId: col.id, locale },
        },
        update: {
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          slug: c.slug,
        },
        create: {
          collectionId: col.id,
          locale,
          name: data.name,
          tagline: data.tagline,
          description: data.description,
          slug: c.slug,
        },
      });
    }

    const action = existing ? "guncellendi" : "yaratildi";
    console.log(`[collections]  ✓ ${c.slug} (${c.tr.name}) — ${action}`);
  }

  // Eski demo koleksiyonlari ARCHIVE et
  for (const slug of DEPRECATED_COLLECTION_SLUGS) {
    const result = await db.collection.updateMany({
      where: { slug },
      data: { status: "ARCHIVED" },
    });
    if (result.count > 0) {
      console.log(`[collections] ⊘ ARCHIVED: ${slug}`);
    }
  }

  const total = await db.collection.count();
  console.log();
  console.log(`[collections] Toplam koleksiyon: ${total}`);
  console.log("[collections] tamamlandi.");
}

main()
  .catch((e) => {
    console.error("[collections] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
