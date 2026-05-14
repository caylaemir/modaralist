"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, ProductStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { seasonalCollectionSlugForDate } from "@/lib/season";

// ---------- Auth guard ----------

async function requireStaff() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Oturum açmanız gerekiyor.");
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    throw new Error("Bu işlem için yetkiniz yok.");
  }
  return session.user;
}

// ---------- Schemas ----------

const translationSchema = z.object({
  locale: z.enum(["tr", "en"]),
  name: z.string().min(1, "Ad zorunlu"),
  description: z.string().optional().nullable(),
  material: z.string().optional().nullable(),
  care: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
  slug: z.string().optional(),
});

const imageSchema = z.object({
  url: z.string().url("Geçerli bir URL girin"),
  alt: z.string().optional().nullable(),
  sortOrder: z.number().int().default(0),
  isHover: z.boolean().default(false),
  // Bos/null -> genel gorsel; doluysa Color.id (o renge ait gorsel)
  colorId: z.string().optional().nullable(),
});

const variantSchema = z.object({
  sku: z.string().min(1),
  sizeId: z.string().optional().nullable(),
  colorId: z.string().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

// Bu schema sadece bu modul icinde kullaniliyor. Export ETMIYORUZ —
// Next.js'te '"use server"' dosyalari sadece async function export edebilir;
// object export edersen runtime'da 'A "use server" file can only export
// async functions, found object' hatasi.
const productInputSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug zorunlu")
    .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire kullanılabilir"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "COMING_SOON"]),
  categoryId: z.string().optional().nullable(),
  basePrice: z.number().min(0, "Fiyat negatif olamaz"),
  discountPrice: z.number().min(0).optional().nullable(),
  taxRate: z.number().min(0).max(100).default(20),
  currency: z.string().default("TRY"),
  lowStockLimit: z.number().int().min(0).default(3),
  translations: z.array(translationSchema).min(1),
  images: z.array(imageSchema).default([]),
  variants: z.array(variantSchema).default([]),
  tagIds: z.array(z.string()).default([]),
  // Koleksiyon: admin form'da secilirse direkt o ID kullanilir.
  // null/bos -> tarih bazli auto-assign (mart-mayis -> ilkbahar vs.)
  collectionId: z.string().optional().nullable(),
});

// Type-only export TypeScript tarafindan compile-time'da silinir,
// runtime'da object yok — Next.js'i tetiklemez.
type ProductInput = z.infer<typeof productInputSchema>;
type ProductVariantInput = ProductInput["variants"][number];

// ---------- Helpers ----------

function normalizeTranslations(input: ProductInput) {
  return input.translations.map((t) => ({
    locale: t.locale,
    name: t.name,
    description: t.description ?? null,
    material: t.material ?? null,
    care: t.care ?? null,
    seoTitle: t.seoTitle ?? null,
    seoDesc: t.seoDesc ?? null,
    slug: t.slug && t.slug.length > 0 ? t.slug : slugify(t.name),
  }));
}

function throwFriendlyProductError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      throw new Error(
        "Bu ürün başka bir kayıtla çakışıyor. Slug veya SKU farklı olmalı."
      );
    }
    if (error.code === "P2003") {
      throw new Error(
        "Bu ürün geçmiş siparişlerde kullanıldığı için silinemez. Satışı durdurmak için arşivleyin."
      );
    }
  }

  throw error;
}

// Urune koleksiyon bagla. input.collectionId varsa direkt o, yoksa
// tarih bazli sezonluk koleksiyona dene (varsa attach, yoksa skip).
async function attachToCollection(
  tx: Prisma.TransactionClient,
  productId: string,
  collectionId: string | null | undefined,
  fallbackDate: Date
): Promise<void> {
  let targetId: string | null = null;

  if (collectionId) {
    targetId = collectionId;
  } else {
    // Auto-assign: tarih bazli slug, DB'de varsa kullan
    const slug = seasonalCollectionSlugForDate(fallbackDate);
    const found = await tx.collection.findUnique({
      where: { slug },
      select: { id: true },
    });
    if (found) targetId = found.id;
  }

  if (!targetId) return;

  // Onceki koleksiyon baglantilarini temizle (admin formda re-save sirasinda
  // birden fazla collection olusmasin)
  await tx.collectionProduct.deleteMany({ where: { productId } });

  await tx.collectionProduct.create({
    data: {
      collectionId: targetId,
      productId,
      sortOrder: 0,
    },
  });
}

function variantOptionKey(sizeId: string | null, colorId: string | null) {
  return `${sizeId ?? "none"}:${colorId ?? "none"}`;
}

async function syncProductVariants(
  tx: Prisma.TransactionClient,
  productId: string,
  variants: ProductVariantInput[]
) {
  const existingVariants = await tx.productVariant.findMany({
    where: { productId },
    include: { _count: { select: { orderItems: true } } },
  });

  const byOptions = new Map<string, (typeof existingVariants)[number]>();
  for (const variant of existingVariants) {
    byOptions.set(variantOptionKey(variant.sizeId, variant.colorId), variant);
  }

  const incomingKeys = new Set(
    variants.map((variant) =>
      variantOptionKey(variant.sizeId || null, variant.colorId || null)
    )
  );

  for (const variant of existingVariants) {
    const key = variantOptionKey(variant.sizeId, variant.colorId);
    if (incomingKeys.has(key)) continue;

    if (variant._count.orderItems > 0) {
      await tx.productVariant.update({
        where: { id: variant.id },
        data: { stock: 0, isActive: false },
      });
    } else {
      await tx.productVariant.delete({ where: { id: variant.id } });
    }
  }

  for (const variant of variants) {
    const sizeId = variant.sizeId || null;
    const colorId = variant.colorId || null;
    const existing = byOptions.get(variantOptionKey(sizeId, colorId));

    if (existing) {
      await tx.productVariant.update({
        where: { id: existing.id },
        data: {
          sku: variant.sku,
          sizeId,
          colorId,
          stock: variant.stock,
          isActive: variant.isActive,
        },
      });
    } else {
      await tx.productVariant.create({
        data: {
          productId,
          sku: variant.sku,
          sizeId,
          colorId,
          stock: variant.stock,
          isActive: variant.isActive,
        },
      });
    }
  }
}

// ---------- Actions ----------

export async function createProduct(rawInput: ProductInput) {
  await requireStaff();

  const input = productInputSchema.parse(rawInput);
  const translations = normalizeTranslations(input);

  const existing = await db.product.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw new Error("Bu slug zaten kullanılıyor.");
  }

  const product = await db
    .$transaction(async (tx) => {
      const created = await tx.product.create({
        data: {
          slug: input.slug,
          status: input.status as ProductStatus,
          categoryId: input.categoryId || null,
          basePrice: new Prisma.Decimal(input.basePrice),
          discountPrice:
            input.discountPrice != null && input.discountPrice !== undefined
              ? new Prisma.Decimal(input.discountPrice)
              : null,
          taxRate: new Prisma.Decimal(input.taxRate),
          currency: input.currency,
          lowStockLimit: input.lowStockLimit,
          publishedAt: input.status === "PUBLISHED" ? new Date() : null,
          translations: { create: translations },
          images: {
            create: input.images.map((img, i) => ({
              url: img.url,
              alt: img.alt ?? null,
              sortOrder: img.sortOrder ?? i,
              isHover: img.isHover ?? false,
              colorId: img.colorId || null,
            })),
          },
          variants: {
            create: input.variants.map((v) => ({
              sku: v.sku,
              sizeId: v.sizeId || null,
              colorId: v.colorId || null,
              stock: v.stock,
              isActive: v.isActive,
            })),
          },
          tags:
            input.tagIds.length > 0
              ? { connect: input.tagIds.map((id) => ({ id })) }
              : undefined,
        },
      });

      await attachToCollection(tx, created.id, input.collectionId, new Date());
      return created;
    })
    .catch((error) => throwFriendlyProductError(error));

  revalidatePath("/admin/products");
  return { id: product.id };
}

export async function updateProduct(id: string, rawInput: ProductInput) {
  await requireStaff();

  const input = productInputSchema.parse(rawInput);
  const translations = normalizeTranslations(input);

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Ürün bulunamadı.");
  }

  if (input.slug !== existing.slug) {
    const other = await db.product.findUnique({ where: { slug: input.slug } });
    if (other && other.id !== id) {
      throw new Error("Bu slug zaten kullanılıyor.");
    }
  }

  const willPublish =
    input.status === "PUBLISHED" && existing.status !== "PUBLISHED";

  try {
    await db.$transaction(async (tx) => {
    // 1. Update core product
    await tx.product.update({
      where: { id },
      data: {
        slug: input.slug,
        status: input.status as ProductStatus,
        categoryId: input.categoryId || null,
        basePrice: new Prisma.Decimal(input.basePrice),
        discountPrice:
          input.discountPrice != null && input.discountPrice !== undefined
            ? new Prisma.Decimal(input.discountPrice)
            : null,
        taxRate: new Prisma.Decimal(input.taxRate),
        currency: input.currency,
        lowStockLimit: input.lowStockLimit,
        publishedAt: willPublish ? new Date() : existing.publishedAt,
      },
    });

    // 2. Upsert translations
    for (const t of translations) {
      await tx.productTranslation.upsert({
        where: {
          productId_locale: { productId: id, locale: t.locale },
        },
        update: {
          name: t.name,
          description: t.description,
          material: t.material,
          care: t.care,
          seoTitle: t.seoTitle,
          seoDesc: t.seoDesc,
          slug: t.slug,
        },
        create: {
          productId: id,
          locale: t.locale,
          name: t.name,
          description: t.description,
          material: t.material,
          care: t.care,
          seoTitle: t.seoTitle,
          seoDesc: t.seoDesc,
          slug: t.slug,
        },
      });
    }

    // 3. Replace images
    await tx.productImage.deleteMany({ where: { productId: id } });
    if (input.images.length > 0) {
      await tx.productImage.createMany({
        data: input.images.map((img, i) => ({
          productId: id,
          url: img.url,
          alt: img.alt ?? null,
          sortOrder: img.sortOrder ?? i,
          isHover: img.isHover ?? false,
          colorId: img.colorId || null,
        })),
      });
    }

    // 4. Sync variants; order-linked old variants are archived, not deleted.
    await syncProductVariants(tx, id, input.variants);

    // 5. Replace tags (M:N — set butun array'i degistirir)
    await tx.product.update({
      where: { id },
      data: {
        tags: {
          set: input.tagIds.map((tid) => ({ id: tid })),
        },
      },
    });

    // 6. Koleksiyon: form'da secilmisse direkt, yoksa tarih bazli auto.
    // (Update'te urunun createdAt'ini kullaniyoruz — yeni urun degil.)
    await attachToCollection(
      tx,
      id,
      input.collectionId,
      existing.createdAt
    );
    });
  } catch (error) {
    throwFriendlyProductError(error);
  }

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { id };
}

export async function deleteProduct(id: string) {
  await requireStaff();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Ürün bulunamadı.");
  }

  const orderLinkedVariantCount = await db.productVariant.count({
    where: { productId: id, orderItems: { some: {} } },
  });
  if (orderLinkedVariantCount > 0) {
    throw new Error(
      "Bu ürün geçmiş siparişlerde kullanıldığı için silinemez. Satışı durdurmak için arşivleyin."
    );
  }

  try {
    await db.product.delete({ where: { id } });
  } catch (error) {
    throwFriendlyProductError(error);
  }

  revalidatePath("/admin/products");
  return { ok: true };
}

export async function toggleProductStatus(id: string, status: ProductStatus) {
  await requireStaff();

  const existing = await db.product.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Ürün bulunamadı.");
  }

  await db.product.update({
    where: { id },
    data: {
      status,
      publishedAt:
        status === "PUBLISHED" && !existing.publishedAt
          ? new Date()
          : existing.publishedAt,
    },
  });

  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${id}`);
  return { ok: true };
}
