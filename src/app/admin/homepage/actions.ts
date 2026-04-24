"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
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

const schema = z.object({
  type: z.string().min(1),
  sortOrder: z.number().int(),
  isActive: z.boolean(),
  config: z.record(z.string(), z.unknown()),
});

function readPayload(fd: FormData) {
  const type = String(fd.get("type") ?? "").trim();
  const sortOrder = Number(fd.get("sortOrder") ?? 0);
  const isActive = fd.get("isActive") === "on";
  const configRaw = String(fd.get("config") ?? "{}").trim();
  let config: Record<string, unknown> = {};
  try {
    config = JSON.parse(configRaw);
    if (typeof config !== "object" || config === null || Array.isArray(config)) {
      throw new Error("not object");
    }
  } catch {
    throw new Error("Config geçerli JSON olmalı.");
  }
  return { type, sortOrder, isActive, config };
}

export async function createBlockAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  let payload;
  try {
    payload = readPayload(fd);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Geçersiz veri." };
  }

  const block = await db.homepageBlock.create({
    data: {
      type: parsed.data.type,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
      config: parsed.data.config,
    },
  });

  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
  redirect(`/admin/homepage/${block.id}`);
}

export async function updateBlockAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  let payload;
  try {
    payload = readPayload(fd);
  } catch (err) {
    return { ok: false, error: (err as Error).message };
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return { ok: false, error: "Geçersiz veri." };
  }

  await db.homepageBlock.update({
    where: { id },
    data: parsed.data,
  });

  revalidatePath("/admin/homepage");
  revalidatePath(`/admin/homepage/${id}`);
  revalidatePath("/", "layout");
  return { ok: true };
}

export async function deleteBlockAction(id: string): Promise<void> {
  await requireStaff();
  await db.homepageBlock.delete({ where: { id } });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
  redirect("/admin/homepage");
}

export async function toggleBlockAction(id: string): Promise<{ ok: boolean }> {
  await requireStaff();
  const block = await db.homepageBlock.findUnique({ where: { id } });
  if (!block) return { ok: false };
  await db.homepageBlock.update({
    where: { id },
    data: { isActive: !block.isActive },
  });
  revalidatePath("/admin/homepage");
  revalidatePath("/", "layout");
  return { ok: true };
}
