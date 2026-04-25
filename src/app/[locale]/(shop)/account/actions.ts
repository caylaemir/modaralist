"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Yetkisiz");
  }
  return session.user.id;
}

// ---------- Profil ----------

const profileSchema = z.object({
  name: z.string().min(2).max(80),
  phone: z.string().max(20).optional(),
});

export async function updateProfileAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Yetkisiz" };
  }

  const parsed = profileSchema.safeParse({
    name: String(fd.get("name") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim() || undefined,
  });
  if (!parsed.success) {
    return { ok: false, error: "Ad en az 2 karakter olmalı." };
  }

  await db.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name,
      phone: parsed.data.phone ?? null,
    },
  });
  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { ok: true };
}

// ---------- Şifre değiştirme ----------

const passwordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(8),
});

export async function changePasswordAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Yetkisiz" };
  }

  const parsed = passwordSchema.safeParse({
    currentPassword: String(fd.get("currentPassword") ?? ""),
    newPassword: String(fd.get("newPassword") ?? ""),
  });
  if (!parsed.success) {
    return { ok: false, error: "Yeni şifre en az 8 karakter olmalı." };
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    select: { passwordHash: true },
  });
  if (!user?.passwordHash) {
    return { ok: false, error: "Şifre değiştirme bu hesap için kullanılamıyor." };
  }
  const ok = await bcrypt.compare(parsed.data.currentPassword, user.passwordHash);
  if (!ok) {
    return { ok: false, error: "Mevcut şifre yanlış." };
  }
  const newHash = await bcrypt.hash(parsed.data.newPassword, 10);
  await db.user.update({
    where: { id: userId },
    data: { passwordHash: newHash },
  });
  return { ok: true };
}

// ---------- Hesap silme (KVKK) ----------

export async function deleteAccountAction(): Promise<void> {
  const userId = await requireUserId();
  await db.user.delete({ where: { id: userId } });
  // Cascade siler: addresses, sessions, accounts, wishlist, vb.
  await signOut({ redirect: false });
  redirect("/");
}

// ---------- Adresler ----------

const addressSchema = z.object({
  title: z.string().max(60).optional(),
  fullName: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  city: z.string().min(2).max(60),
  district: z.string().min(2).max(80),
  street: z.string().min(5).max(255),
  zip: z.string().max(10).optional(),
  isDefault: z.boolean().default(false),
});

function readAddressForm(fd: FormData) {
  return {
    title: String(fd.get("title") ?? "").trim() || undefined,
    fullName: String(fd.get("fullName") ?? "").trim(),
    phone: String(fd.get("phone") ?? "").trim(),
    city: String(fd.get("city") ?? "").trim(),
    district: String(fd.get("district") ?? "").trim(),
    street: String(fd.get("street") ?? "").trim(),
    zip: String(fd.get("zip") ?? "").trim() || undefined,
    isDefault: fd.get("isDefault") === "on",
  };
}

export async function createAddressAction(
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Yetkisiz" };
  }
  const parsed = addressSchema.safeParse(readAddressForm(fd));
  if (!parsed.success) {
    return { ok: false, error: "Lütfen tüm zorunlu alanları doldur." };
  }

  // isDefault true ise diğer adresleri pasifleştir
  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }

  await db.address.create({
    data: {
      userId,
      type: "SHIPPING",
      ...parsed.data,
      title: parsed.data.title ?? null,
      zip: parsed.data.zip ?? null,
    },
  });

  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function updateAddressAction(
  id: string,
  fd: FormData
): Promise<{ ok: boolean; error?: string }> {
  let userId: string;
  try {
    userId = await requireUserId();
  } catch {
    return { ok: false, error: "Yetkisiz" };
  }
  const parsed = addressSchema.safeParse(readAddressForm(fd));
  if (!parsed.success) {
    return { ok: false, error: "Lütfen tüm zorunlu alanları doldur." };
  }

  const existing = await db.address.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== userId) {
    return { ok: false, error: "Yetkisiz" };
  }

  if (parsed.data.isDefault) {
    await db.address.updateMany({
      where: { userId, NOT: { id } },
      data: { isDefault: false },
    });
  }

  await db.address.update({
    where: { id },
    data: {
      ...parsed.data,
      title: parsed.data.title ?? null,
      zip: parsed.data.zip ?? null,
    },
  });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function deleteAddressAction(id: string): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const existing = await db.address.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== userId) return { ok: false };
  await db.address.delete({ where: { id } });
  revalidatePath("/account/addresses");
  return { ok: true };
}

export async function setDefaultAddressAction(
  id: string
): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const existing = await db.address.findUnique({
    where: { id },
    select: { userId: true },
  });
  if (!existing || existing.userId !== userId) return { ok: false };
  await db.$transaction([
    db.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    }),
    db.address.update({ where: { id }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
  return { ok: true };
}

// ---------- Wishlist ----------

export async function removeFromWishlistAction(
  productSlug: string
): Promise<{ ok: boolean }> {
  const userId = await requireUserId();
  const product = await db.product.findUnique({
    where: { slug: productSlug },
    select: { id: true },
  });
  if (!product) return { ok: false };
  await db.wishlistItem
    .delete({
      where: { userId_productId: { userId, productId: product.id } },
    })
    .catch(() => null);
  revalidatePath("/account/wishlist");
  return { ok: true };
}
