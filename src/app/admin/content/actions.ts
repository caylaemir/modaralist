"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import slugify from "slugify";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireStaff() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    throw new Error("Yetkisiz");
  }
}

const trSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  bodyHtml: z.string().default(""),
  seoTitle: z.string().optional(),
  seoDesc: z.string().optional(),
});

const updateSchema = z.object({
  slug: z.string().min(1),
  template: z.string().default("default"),
  isPublished: z.boolean().default(false),
  tr: trSchema,
  en: trSchema,
});

const createSchema = updateSchema;

function readPayload(fd: FormData) {
  const slug = String(fd.get("slug") ?? "").trim();
  const template = String(fd.get("template") ?? "default").trim() || "default";
  const isPublished = fd.get("isPublished") === "on";

  const tr = {
    title: String(fd.get("tr.title") ?? "").trim(),
    slug:
      String(fd.get("tr.slug") ?? "").trim() ||
      slugify(String(fd.get("tr.title") ?? ""), { lower: true, strict: true }),
    bodyHtml: String(fd.get("tr.bodyHtml") ?? ""),
    seoTitle: String(fd.get("tr.seoTitle") ?? "").trim() || undefined,
    seoDesc: String(fd.get("tr.seoDesc") ?? "").trim() || undefined,
  };

  const en = {
    title: String(fd.get("en.title") ?? "").trim(),
    slug:
      String(fd.get("en.slug") ?? "").trim() ||
      slugify(String(fd.get("en.title") ?? ""), { lower: true, strict: true }),
    bodyHtml: String(fd.get("en.bodyHtml") ?? ""),
    seoTitle: String(fd.get("en.seoTitle") ?? "").trim() || undefined,
    seoDesc: String(fd.get("en.seoDesc") ?? "").trim() || undefined,
  };

  return { slug, template, isPublished, tr, en };
}

export async function createPageAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = createSchema.safeParse(readPayload(fd));
  if (!parsed.success) {
    return { ok: false, error: "Zorunlu alanlar eksik." };
  }
  const { slug, template, isPublished, tr, en } = parsed.data;

  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) {
    return { ok: false, error: "Bu slug zaten var." };
  }

  const page = await db.page.create({
    data: {
      slug,
      template,
      isPublished,
      translations: {
        create: [
          { locale: "tr", ...tr },
          { locale: "en", ...en },
        ],
      },
    },
  });

  revalidatePath("/admin/content");
  redirect(`/admin/content/${page.id}`);
}

export async function updatePageAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = updateSchema.safeParse(readPayload(fd));
  if (!parsed.success) {
    return { ok: false, error: "Zorunlu alanlar eksik." };
  }
  const { slug, template, isPublished, tr, en } = parsed.data;

  try {
    await db.$transaction([
      db.page.update({
        where: { id },
        data: { slug, template, isPublished },
      }),
      db.pageTranslation.upsert({
        where: { pageId_locale: { pageId: id, locale: "tr" } },
        create: { pageId: id, locale: "tr", ...tr },
        update: tr,
      }),
      db.pageTranslation.upsert({
        where: { pageId_locale: { pageId: id, locale: "en" } },
        create: { pageId: id, locale: "en", ...en },
        update: en,
      }),
    ]);
  } catch (err) {
    console.error("[content] update failed", err);
    return { ok: false, error: "Kaydedilemedi — slug çakışması olabilir." };
  }

  revalidatePath("/admin/content");
  revalidatePath(`/admin/content/${id}`);
  return { ok: true };
}

export async function deletePageAction(id: string): Promise<void> {
  await requireStaff();
  await db.page.delete({ where: { id } });
  revalidatePath("/admin/content");
  redirect("/admin/content");
}
