"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma, ProductStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { slugify } from "@/lib/utils";

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
});

const variantSchema = z.object({
  sku: z.string().min(1),
  sizeId: z.string().optional().nullable(),
  colorId: z.string().optional().nullable(),
  stock: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
});

export const productInputSchema = z.object({
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
});

export type ProductInput = z.infer<typeof productInputSchema>;

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

// ---------- Actions ----------

export async function createProduct(rawInput: ProductInput) {
  await requireStaff();

  const input = productInputSchema.parse(rawInput);
  const translations = normalizeTranslations(input);

  const existing = await db.product.findUnique({ where: { slug: input.slug } });
  if (existing) {
    throw new Error("Bu slug zaten kullanılıyor.");
  }

  const product = await db.product.create({
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
        })),
      });
    }

    // 4. Replace variants (delete then recreate — MVP approach)
    await tx.productVariant.deleteMany({ where: { productId: id } });
    if (input.variants.length > 0) {
      await tx.productVariant.createMany({
        data: input.variants.map((v) => ({
          productId: id,
          sku: v.sku,
          sizeId: v.sizeId || null,
          colorId: v.colorId || null,
          stock: v.stock,
          isActive: v.isActive,
        })),
      });
    }

    // 5. Replace tags (M:N — set butun array'i degistirir)
    await tx.product.update({
      where: { id },
      data: {
        tags: {
          set: input.tagIds.map((tid) => ({ id: tid })),
        },
      },
    });
  });

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

  await db.product.delete({ where: { id } });

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
