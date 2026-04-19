"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const translationSchema = z.object({
  locale: z.enum(["tr", "en"]),
  name: z.string().min(1, "İsim zorunlu"),
  slug: z.string().min(1, "Slug zorunlu"),
  description: z.string().optional().nullable(),
  seoTitle: z.string().optional().nullable(),
  seoDesc: z.string().optional().nullable(),
});

const categoryInputSchema = z.object({
  slug: z.string().min(1, "Slug zorunlu"),
  parentId: z.string().optional().nullable(),
  bannerUrl: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  isActive: z.boolean().optional(),
  translations: z.array(translationSchema).min(1, "En az bir çeviri gerekli"),
});

export type CategoryInput = z.infer<typeof categoryInputSchema>;

async function guard() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Yetkisiz erişim.");
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    throw new Error("Bu işlem için yetkiniz yok.");
  }
  return session;
}

function revalidate() {
  revalidatePath("/admin/categories");
  revalidatePath("/tr");
  revalidatePath("/en");
}

export async function createCategory(input: CategoryInput) {
  await guard();
  const data = categoryInputSchema.parse(input);

  const existing = await db.category.findUnique({ where: { slug: data.slug } });
  if (existing) {
    throw new Error("Bu slug zaten kullanılıyor.");
  }

  const category = await db.category.create({
    data: {
      slug: data.slug,
      parentId: data.parentId || null,
      bannerUrl: data.bannerUrl || null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
      translations: {
        create: data.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          slug: t.slug,
          description: t.description || null,
          seoTitle: t.seoTitle || null,
          seoDesc: t.seoDesc || null,
        })),
      },
    },
  });

  revalidate();
  return { id: category.id };
}

export async function updateCategory(id: string, input: CategoryInput) {
  await guard();
  const data = categoryInputSchema.parse(input);

  const current = await db.category.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Kategori bulunamadı.");
  }

  if (data.parentId && data.parentId === id) {
    throw new Error("Bir kategori kendi üst kategorisi olamaz.");
  }

  if (data.slug !== current.slug) {
    const slugClash = await db.category.findUnique({
      where: { slug: data.slug },
    });
    if (slugClash && slugClash.id !== id) {
      throw new Error("Bu slug zaten kullanılıyor.");
    }
  }

  await db.$transaction(async (tx) => {
    await tx.category.update({
      where: { id },
      data: {
        slug: data.slug,
        parentId: data.parentId || null,
        bannerUrl: data.bannerUrl || null,
        sortOrder: data.sortOrder ?? current.sortOrder,
        isActive: data.isActive ?? current.isActive,
      },
    });

    await tx.categoryTranslation.deleteMany({ where: { categoryId: id } });

    await tx.categoryTranslation.createMany({
      data: data.translations.map((t) => ({
        categoryId: id,
        locale: t.locale,
        name: t.name,
        slug: t.slug,
        description: t.description || null,
        seoTitle: t.seoTitle || null,
        seoDesc: t.seoDesc || null,
      })),
    });
  });

  revalidate();
  return { id };
}

export async function deleteCategory(id: string) {
  await guard();

  const productCount = await db.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error(
      `Bu kategoriye bağlı ${productCount} ürün var. Önce ürünleri taşıyın.`
    );
  }

  const childCount = await db.category.count({ where: { parentId: id } });
  if (childCount > 0) {
    throw new Error(
      `Bu kategorinin ${childCount} alt kategorisi var. Önce onları silin.`
    );
  }

  await db.category.delete({ where: { id } });
  revalidate();
  return { ok: true };
}

export async function reorderCategories(ids: string[]) {
  await guard();
  const parsed = z.array(z.string().min(1)).parse(ids);

  await db.$transaction(
    parsed.map((id, index) =>
      db.category.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  );

  revalidate();
  return { ok: true };
}
