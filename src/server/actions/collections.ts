"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail, dropNotifyHtml } from "@/lib/email";

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

  // Onceki status -> LIVE gecisi varsa drop notify maillerini gonder.
  // Idempotent degil — admin yanlislikla LIVE -> UPCOMING -> LIVE yaparsa
  // tekrar mail atar. Bu nadir bir aksiyon, kabul edilebilir.
  const before = await db.collection.findUnique({
    where: { id },
    include: {
      translations: true,
      notifies: { select: { email: true, locale: true } },
    },
  });
  if (!before) throw new Error("Koleksiyon bulunamadı.");

  await db.collection.update({
    where: { id },
    data: { status: parsed },
  });

  if (parsed === "LIVE" && before.status !== "LIVE") {
    // Subscriber'lara mail at — async, hata bastirilir (admin akisini bozma)
    void sendDropNotifyEmails(before).catch((err) => {
      console.error("[drop-notify] hata", err);
    });
  }

  revalidate();
  return { ok: true };
}

type CollectionForNotify = {
  slug: string;
  heroImageUrl: string | null;
  translations: { locale: string; name: string }[];
  notifies: { email: string; locale: string }[];
};

async function sendDropNotifyEmails(collection: CollectionForNotify) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";
  const trName =
    collection.translations.find((t) => t.locale === "tr")?.name ??
    collection.slug;

  // Aboneleri benzersizle (ayni email iki kez kayitli olabilir)
  const seen = new Set<string>();
  const unique = collection.notifies.filter((n) => {
    const key = n.email.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // 50'lik batch'lerde gonder — Resend rate limit (10 req/s)
  for (let i = 0; i < unique.length; i += 50) {
    const batch = unique.slice(i, i + 50);
    await Promise.allSettled(
      batch.map((n) =>
        sendEmail({
          to: n.email,
          subject: `${trName} açıldı — Modaralist`,
          html: dropNotifyHtml({
            collectionName: trName,
            collectionSlug: collection.slug,
            heroImageUrl: collection.heroImageUrl ?? undefined,
            baseUrl: `${baseUrl}/${n.locale === "en" ? "en" : "tr"}`,
          }),
        })
      )
    );
    // 1 sn bekle batch'ler arasi
    if (i + 50 < unique.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
