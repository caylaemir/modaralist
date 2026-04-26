"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  setManySettings,
  SETTING_DEFAULTS,
  type SettingKey,
} from "@/lib/settings";

export async function saveSettingsAction(
  formData: FormData
): Promise<{ ok: boolean; error?: string }> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return { ok: false, error: "Yetkisiz" };
  }

  const allKeys = Object.keys(SETTING_DEFAULTS) as SettingKey[];
  const entries: Partial<Record<SettingKey, string>> = {};

  for (const key of allKeys) {
    const raw = formData.get(key);
    if (raw === null) {
      // Boolean alanlar checkbox — gelmezse false.
      entries[key] = "false";
      continue;
    }
    entries[key] = String(raw).trim();
  }

  // Checkbox'lar formData'da "on" döner, "true"ya normalize.
  // YENI checkbox eklerken bu listeyi guncelle, yoksa "on" raw kaydedilir
  // ve === "true" check'leri her yerde false dondurur (silent dead toggle).
  for (const key of [
    "shop.maintenanceMode",
    "shop.announcementActive",
    "bundle.enabled",
    "popup.enabled",
    "whatsapp.enabled",
    "security.adminTwoFactorEnabled",
    "shop.freeShippingAB",
  ] as const) {
    const val = entries[key];
    entries[key] = val === "on" || val === "true" ? "true" : "false";
  }

  try {
    await setManySettings(entries);
  } catch (err) {
    console.error("[settings] save failed", err);
    return { ok: false, error: "Kaydedilemedi" };
  }

  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  return { ok: true };
}
