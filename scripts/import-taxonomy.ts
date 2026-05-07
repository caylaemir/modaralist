// 3-seviye kategori taksonomisini DB'ye upsert eder.
// Idempotent — birden fazla kez calistirilabilir.
//
// Kullanim:
//   npx tsx scripts/import-taxonomy.ts
//
// Davranis:
// - Her node icin Category.upsert(slug) — varsa parentId+sortOrder gunceller, yoksa yaratir
// - Her node icin CategoryTranslation.upsert(categoryId+locale) — TR + EN
// - DEPRECATED_SLUGS (orn. "polar") kategoriler isActive=false yapilir, silinmez
// - Mevcut urunler hangi kategorideyse oldugu gibi kalir (yeni alt-kat'lere
//   tasinmasi admin tarafindan yapilir)

import { PrismaClient } from "@prisma/client";
import {
  TAXONOMY,
  DEPRECATED_SLUGS,
  flattenTaxonomy,
} from "../prisma/data/taxonomy";

const db = new PrismaClient();

async function main() {
  console.log("[taxonomy] Yapı:");
  console.log(`  Top-level: ${TAXONOMY.length}`);
  let subCount = 0;
  let seriesCount = 0;
  for (const top of TAXONOMY) {
    for (const c of top.children) {
      if ("children" in c) {
        subCount++;
        seriesCount += c.children.length;
      } else {
        seriesCount++;
      }
    }
  }
  console.log(`  Sub-cats:  ${subCount}`);
  console.log(`  Series:    ${seriesCount}`);
  console.log(`  Toplam:    ${TAXONOMY.length + subCount + seriesCount}`);
  console.log();

  // 1) Tum kategorileri upsert et (parentSlug -> parentId iki tur)
  // Once depth=0, sonra depth=1, sonra depth=2 — parent referansi ressolve etmek icin.
  const allNodes = [...flattenTaxonomy()];
  allNodes.sort((a, b) => a.depth - b.depth);

  for (const node of allNodes) {
    let parentId: string | null = null;
    if (node.parentSlug) {
      const parent = await db.category.findUnique({
        where: { slug: node.parentSlug },
        select: { id: true },
      });
      if (!parent) {
        throw new Error(
          `Parent kategori bulunamadi: ${node.parentSlug} (cocuk: ${node.slug})`
        );
      }
      parentId = parent.id;
    }

    // bannerUrl: yalnizca DB'de bos ise atanir — admin override etmis olabilir.
    const existing = await db.category.findUnique({
      where: { slug: node.slug },
      select: { bannerUrl: true },
    });
    const bannerUpdate =
      existing?.bannerUrl == null && node.bannerUrl
        ? { bannerUrl: node.bannerUrl }
        : {};

    const cat = await db.category.upsert({
      where: { slug: node.slug },
      update: {
        parentId,
        sortOrder: node.sortOrder,
        isActive: true,
        ...bannerUpdate,
      },
      create: {
        slug: node.slug,
        parentId,
        sortOrder: node.sortOrder,
        isActive: true,
        bannerUrl: node.bannerUrl ?? null,
      },
    });

    // Translations — TR + EN
    for (const locale of ["tr", "en"] as const) {
      const name = locale === "tr" ? node.nameTr : node.nameEn;
      await db.categoryTranslation.upsert({
        where: {
          categoryId_locale: { categoryId: cat.id, locale },
        },
        update: {
          name,
          slug: node.slug,
        },
        create: {
          categoryId: cat.id,
          locale,
          name,
          slug: node.slug,
          description: null,
          seoTitle: null,
          seoDesc: null,
        },
      });
    }

    const indent = "  ".repeat(node.depth);
    console.log(`[taxonomy] ${indent}✓ ${node.slug} (${node.nameTr})`);
  }

  // 2) Deprecated kategorileri deactivate
  for (const slug of DEPRECATED_SLUGS) {
    const result = await db.category.updateMany({
      where: { slug },
      data: { isActive: false },
    });
    if (result.count > 0) {
      console.log(`[taxonomy] ⊘ deactivate edildi: ${slug}`);
    }
  }

  // 3) Ozet
  const totalCats = await db.category.count();
  const activeCats = await db.category.count({ where: { isActive: true } });
  const productsWithCategory = await db.product.count({
    where: { categoryId: { not: null } },
  });
  const productsWithoutCategory = await db.product.count({
    where: { categoryId: null },
  });

  console.log();
  console.log("[taxonomy] Ozet:");
  console.log(`  Toplam kategori:        ${totalCats}`);
  console.log(`  Aktif kategori:         ${activeCats}`);
  console.log(`  Kategorili urun:        ${productsWithCategory}`);
  console.log(`  Kategorisiz urun:       ${productsWithoutCategory}`);
  console.log();
  console.log("[taxonomy] tamamlandi.");
}

main()
  .catch((e) => {
    console.error("[taxonomy] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
