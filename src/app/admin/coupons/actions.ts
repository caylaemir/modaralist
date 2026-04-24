"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import type { CouponType } from "@prisma/client";
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
  code: z.string().min(3).max(32),
  type: z.enum(["PERCENT", "FIXED", "FREE_SHIPPING"]),
  value: z.number().min(0),
  minSubtotal: z.number().nullable(),
  maxUses: z.number().int().nullable(),
  perUserLimit: z.number().int().nullable(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  isActive: z.boolean(),
});

function readPayload(fd: FormData) {
  const codeRaw = String(fd.get("code") ?? "").trim();
  return {
    code: codeRaw.toUpperCase(),
    type: (String(fd.get("type") ?? "PERCENT").trim() as CouponType),
    value: Number(fd.get("value") ?? 0),
    minSubtotal:
      fd.get("minSubtotal") && String(fd.get("minSubtotal")).trim() !== ""
        ? Number(fd.get("minSubtotal"))
        : null,
    maxUses:
      fd.get("maxUses") && String(fd.get("maxUses")).trim() !== ""
        ? Number(fd.get("maxUses"))
        : null,
    perUserLimit:
      fd.get("perUserLimit") && String(fd.get("perUserLimit")).trim() !== ""
        ? Number(fd.get("perUserLimit"))
        : null,
    startsAt:
      fd.get("startsAt") && String(fd.get("startsAt")).trim() !== ""
        ? String(fd.get("startsAt"))
        : null,
    endsAt:
      fd.get("endsAt") && String(fd.get("endsAt")).trim() !== ""
        ? String(fd.get("endsAt"))
        : null,
    isActive: fd.get("isActive") === "on",
  };
}

export async function createCouponAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = schema.safeParse(readPayload(fd));
  if (!parsed.success) {
    return { ok: false, error: "Geçersiz veri." };
  }
  const data = parsed.data;

  const exists = await db.coupon.findUnique({ where: { code: data.code } });
  if (exists) {
    return { ok: false, error: "Bu kod zaten var." };
  }

  const coupon = await db.coupon.create({
    data: {
      code: data.code,
      type: data.type,
      value: data.value,
      minSubtotal: data.minSubtotal ?? undefined,
      maxUses: data.maxUses ?? undefined,
      perUserLimit: data.perUserLimit ?? undefined,
      startsAt: data.startsAt ? new Date(data.startsAt) : undefined,
      endsAt: data.endsAt ? new Date(data.endsAt) : undefined,
      isActive: data.isActive,
    },
  });

  revalidatePath("/admin/coupons");
  redirect(`/admin/coupons/${coupon.id}`);
}

export async function updateCouponAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  await requireStaff();
  const parsed = schema.safeParse(readPayload(fd));
  if (!parsed.success) {
    return { ok: false, error: "Geçersiz veri." };
  }
  const data = parsed.data;

  try {
    await db.coupon.update({
      where: { id },
      data: {
        code: data.code,
        type: data.type,
        value: data.value,
        minSubtotal: data.minSubtotal,
        maxUses: data.maxUses,
        perUserLimit: data.perUserLimit,
        startsAt: data.startsAt ? new Date(data.startsAt) : null,
        endsAt: data.endsAt ? new Date(data.endsAt) : null,
        isActive: data.isActive,
      },
    });
  } catch (err) {
    console.error("[coupons] update failed", err);
    return { ok: false, error: "Kaydedilemedi — kod çakışması olabilir." };
  }

  revalidatePath("/admin/coupons");
  revalidatePath(`/admin/coupons/${id}`);
  return { ok: true };
}

export async function deleteCouponAction(id: string): Promise<void> {
  await requireStaff();
  await db.coupon.delete({ where: { id } });
  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}
