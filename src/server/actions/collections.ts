"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

const translationSchema = z.object({
  locale: z.enum(["tr", "en"]),
  name: z.string().min(1, "İsim zorunlu"),
  slug: z.string().min(1, "Slug zorunlu"),
  tagline: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  manifesto: z.string().optional().nullable(),
});

const statusSchema = z.enum(["UPCOMING", "LIVE", "SOLD_OUT", "ARCHIVED"]);

const collectionInputSchema = z.object({
  slug: z.string().min(1, "Slug zorunlu"),
  status: statusSchema.default("UPCOMING"),
  startsAt: z
    .union([z.string(), z.date(), z.null()])
    .optional()
    .transform((v) => {
      if (!v) return null;
      if (v instanceof Date) return v;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }),
  endsAt: z
    .union([z.string(), z.date(), z.null()])
    .optional()
    .transform((v) => {
      if (!v) return null;
      if (v instanceof Date) return v;
      const d = new Date(v);
      return isNaN(d.getTime()) ? null : d;
    }),
  heroImageUrl: z.string().optional().nullable(),
  heroVideoUrl: z.string().optional().nullable(),
  themePrimary: z.string().optional().nullable(),
  themeAccent: z.string().optional().nullable(),
  sortOrder: z.number().int().optional(),
  translations: z.array(translationSchema).min(1, "En az bir çeviri gerekli"),
  productIds: z.array(z.string()).default([]),
});

export type CollectionInput = z.infer<typeof collectionInputSchema>;

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
  revalidatePath("/admin/collections");
  revalidatePath("/tr");
  revalidatePath("/en");
}

export async function createCollection(input: CollectionInput) {
  await guard();
  const data = collectionInputSchema.parse(input);

  const existing = await db.collection.findUnique({
    where: { slug: data.slug },
  });
  if (existing) {
    throw new Error("Bu slug zaten kullanılıyor.");
  }

  const collection = await db.collection.create({
    data: {
      slug: data.slug,
      status: data.status,
      startsAt: data.startsAt,
      endsAt: data.endsAt,
      heroImageUrl: data.heroImageUrl || null,
      heroVideoUrl: data.heroVideoUrl || null,
      themePrimary: data.themePrimary || null,
      themeAccent: data.themeAccent || null,
      sortOrder: data.sortOrder ?? 0,
      translations: {
        create: data.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          slug: t.slug,
          tagline: t.tagline || null,
          description: t.description || null,
          manifesto: t.manifesto || null,
        })),
      },
      products: {
        create: data.productIds.map((productId, index) => ({
          productId,
          sortOrder: index,
        })),
      },
    },
  });

  revalidate();
  return { id: collection.id };
}

export async function updateCollection(id: string, input: CollectionInput) {
  await guard();
  const data = collectionInputSchema.parse(input);

  const current = await db.collection.findUnique({ where: { id } });
  if (!current) {
    throw new Error("Koleksiyon bulunamadı.");
  }

  if (data.slug !== current.slug) {
    const slugClash = await db.collection.findUnique({
      where: { slug: data.slug },
    });
    if (slugClash && slugClash.id !== id) {
      throw new Error("Bu slug zaten kullanılıyor.");
    }
  }

  await db.$transaction(async (tx) => {
    await tx.collection.update({
      where: { id },
      data: {
        slug: data.slug,
        status: data.status,
        startsAt: data.startsAt,
        endsAt: data.endsAt,
        heroImageUrl: data.heroImageUrl || null,
        heroVideoUrl: data.heroVideoUrl || null,
        themePrimary: data.themePrimary || null,
        themeAccent: data.themeAccent || null,
        sortOrder: data.sortOrder ?? current.sortOrder,
      },
    });

    await tx.collectionTranslation.deleteMany({
      where: { collectionId: id },
    });
    await tx.collectionTranslation.createMany({
      data: data.translations.map((t) => ({
        collectionId: id,
        locale: t.locale,
        name: t.name,
        slug: t.slug,
        tagline: t.tagline || null,
        description: t.description || null,
        manifesto: t.manifesto || null,
      })),
    });

    await tx.collectionProduct.deleteMany({ where: { collectionId: id } });
    if (data.productIds.length > 0) {
      await tx.collectionProduct.createMany({
        data: data.productIds.map((productId, index) => ({
          collectionId: id,
          productId,
          sortOrder: index,
        })),
      });
    }
  });

  revalidate();
  return { id };
}

export async function deleteCollection(id: string) {
  await guard();

  const collection = await db.collection.findUnique({ where: { id } });
  if (!collection) {
    throw new Error("Koleksiyon bulunamadı.");
  }

  await db.collection.delete({ where: { id } });
  revalidate();
  return { ok: true };
}

export async function updateCollectionStatus(
  id: string,
  status: "UPCOMING" | "LIVE" | "SOLD_OUT" | "ARCHIVED"
) {
  await guard();
  const parsed = statusSchema.parse(status);

  await db.collection.update({
    where: { id },
    data: { status: parsed },
  });

  revalidate();
  return { ok: true };
}
