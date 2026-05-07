// Modaralist baslangic urunlerini DB'ye upsert eder.
// Idempotent: birden fazla kez calistirilabilir.
//
// Davranis:
// - Ayni slug'la urun varsa baslica fields update edilir (translations,
//   images, basePrice). Variant ve image kayitlari mevcutsa skip,
//   eksikleri create edilir (variants color+size unique key).
// - PUBLISHED status, publishedAt now.
// - Kategori slug -> categoryId lookup ile baglanir.
//
// Kullanim:
//   npx tsx scripts/import-sample-products.ts

import { PrismaClient } from "@prisma/client";
import { SAMPLE_PRODUCTS } from "../prisma/data/sample-products";

const db = new PrismaClient();

async function main() {
  console.log(`[products] ${SAMPLE_PRODUCTS.length} ornek urun yukleniyor...`);

  // Onbellek: color ve size lookup
  const colors = await db.color.findMany();
  const sizes = await db.size.findMany();

  for (const p of SAMPLE_PRODUCTS) {
    const cat = await db.category.findUnique({
      where: { slug: p.categorySlug },
      select: { id: true },
    });
    if (!cat) {
      console.warn(`[products]  ⊘ kategori bulunamadi: ${p.categorySlug} (urun atlandi: ${p.slug})`);
      continue;
    }

    const existing = await db.product.findUnique({
      where: { slug: p.slug },
      select: { id: true },
    });

    let productId: string;

    if (existing) {
      // Update temel alanlar
      const updated = await db.product.update({
        where: { id: existing.id },
        data: {
          status: "PUBLISHED",
          publishedAt: new Date(),
          basePrice: p.basePrice,
          categoryId: cat.id,
        },
      });
      productId = updated.id;

      // Translations upsert
      for (const locale of ["tr", "en"] as const) {
        const data = p[locale];
        await db.productTranslation.upsert({
          where: {
            productId_locale: { productId, locale },
          },
          update: {
            name: data.name,
            description: data.description,
            material: data.material,
            care: data.care,
            slug: p.slug,
          },
          create: {
            productId,
            locale,
            name: data.name,
            description: data.description,
            material: data.material,
            care: data.care,
            slug: p.slug,
          },
        });
      }

      console.log(`[products]  ✓ ${p.slug} (${p.tr.name}) — guncellendi`);
    } else {
      // Yeni urun yarat (variants + images dahil)
      const variants: Array<{
        sku: string;
        sizeId: string;
        colorId: string;
        stock: number;
      }> = [];
      for (const colorCode of p.colorCodes) {
        const color = colors.find((c) => c.code === colorCode);
        if (!color) continue;
        for (const sizeCode of p.sizeCodes) {
          const size = sizes.find((s) => s.code === sizeCode);
          if (!size) continue;
          variants.push({
            sku: `${p.slug}-${colorCode}-${sizeCode}`.toUpperCase(),
            sizeId: size.id,
            colorId: color.id,
            stock: 8 + Math.floor(Math.random() * 5), // 8-12
          });
        }
      }

      const created = await db.product.create({
        data: {
          slug: p.slug,
          status: "PUBLISHED",
          publishedAt: new Date(),
          basePrice: p.basePrice,
          taxRate: 20,
          currency: "TRY",
          categoryId: cat.id,
          translations: {
            create: [
              {
                locale: "tr",
                name: p.tr.name,
                description: p.tr.description,
                material: p.tr.material,
                care: p.tr.care,
                slug: p.slug,
              },
              {
                locale: "en",
                name: p.en.name,
                description: p.en.description,
                material: p.en.material,
                care: p.en.care,
                slug: p.slug,
              },
            ],
          },
          images: {
            create: p.images.map((url, i) => ({
              url,
              alt: p.tr.name,
              sortOrder: i,
              isHover: i === 1,
            })),
          },
          variants: { create: variants },
        },
      });
      productId = created.id;

      console.log(`[products]  ✓ ${p.slug} (${p.tr.name}) — yaratildi (${variants.length} variant)`);
    }
  }

  const published = await db.product.count({ where: { status: "PUBLISHED" } });
  const draft = await db.product.count({ where: { status: "DRAFT" } });
  console.log();
  console.log(`[products] PUBLISHED: ${published}, DRAFT: ${draft}`);
  console.log("[products] tamamlandi.");
}

main()
  .catch((e) => {
    console.error("[products] HATA:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
