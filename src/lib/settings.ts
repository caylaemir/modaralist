import { db } from "@/lib/db";

// Tüm site ayarları tek bir yerde tanımlı — key + default value + tip.
// Her key Setting tablosunda bir row. Value her zaman string (form-friendly).
// Numeric/bool değerler kullanıldığı yerde parse edilir.
//
// Yeni bir ayar eklemek için bu obje'ye satır ekle, admin/settings/page.tsx'te
// karşılık gelen input'u render et, form action aynı key'i kaydeder.

export const SETTING_DEFAULTS = {
  // Marka
  "site.title": "Modaralist",
  "site.tagline": "Numaralı koleksiyonlar, sınırlı üretim.",
  "site.description":
    "Modaralist — modern siluetler, numaralı koleksiyonlar, sınırlı üretim.",

  // İletişim
  "contact.email": "",
  "contact.phone": "",
  "contact.address": "",
  "contact.hours": "Pzt-Cmt 10:00 - 18:00",

  // Sosyal medya
  "social.instagram": "",
  "social.tiktok": "",
  "social.x": "",
  "social.facebook": "",
  "social.youtube": "",
  "social.pinterest": "",

  // E-ticaret
  "shop.currency": "TRY",
  "shop.taxRate": "0.20",
  "shop.shippingStandard": "0",
  "shop.shippingExpress": "89",
  "shop.freeShippingOver": "1500",

  // Durum
  "shop.maintenanceMode": "false",
  "shop.announcementText": "",
  "shop.announcementActive": "false",

  // Yasal
  "legal.companyName": "",
  "legal.taxOffice": "",
  "legal.taxNumber": "",
  "legal.mersisNumber": "",
} as const;

export type SettingKey = keyof typeof SETTING_DEFAULTS;
export type SettingsMap = Record<SettingKey, string>;

const ALL_KEYS = Object.keys(SETTING_DEFAULTS) as SettingKey[];

export async function getAllSettings(): Promise<SettingsMap> {
  const rows = await db.setting.findMany({
    where: { key: { in: ALL_KEYS } },
  });

  const map = { ...SETTING_DEFAULTS } as SettingsMap;
  for (const row of rows) {
    const key = row.key as SettingKey;
    if (key in SETTING_DEFAULTS) {
      const raw = row.value as unknown;
      map[key] = typeof raw === "string" ? raw : String(raw ?? "");
    }
  }
  return map;
}

export async function getSetting(key: SettingKey): Promise<string> {
  const row = await db.setting.findUnique({ where: { key } });
  if (!row) return SETTING_DEFAULTS[key];
  const raw = row.value as unknown;
  return typeof raw === "string" ? raw : String(raw ?? SETTING_DEFAULTS[key]);
}

export async function setSetting(
  key: SettingKey,
  value: string
): Promise<void> {
  await db.setting.upsert({
    where: { key },
    create: { key, value, scope: "global" },
    update: { value },
  });
}

export async function setManySettings(
  entries: Partial<Record<SettingKey, string>>
): Promise<void> {
  const ops = Object.entries(entries)
    .filter((e): e is [SettingKey, string] => e[0] in SETTING_DEFAULTS)
    .map(([key, value]) =>
      db.setting.upsert({
        where: { key },
        create: { key, value, scope: "global" },
        update: { value },
      })
    );
  await db.$transaction(ops);
}

// Section metadata — admin form'u bu şekilde gruplar.
export const SETTING_SECTIONS: Array<{
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  fields: Array<{
    key: SettingKey;
    label: string;
    type: "text" | "textarea" | "email" | "tel" | "url" | "number" | "boolean";
    placeholder?: string;
    hint?: string;
  }>;
}> = [
  {
    id: "brand",
    title: "Marka",
    eyebrow: "— kimlik",
    description:
      "Sitede ve paylaşımlarda görünen ad, başlık ve kısa tanım. Değişikliği yaparken SEO'yu aklında tut — başlık 60, açıklama 155 karakteri aşmasın.",
    fields: [
      {
        key: "site.title",
        label: "Site başlığı",
        type: "text",
        placeholder: "Modaralist",
      },
      {
        key: "site.tagline",
        label: "Slogan",
        type: "text",
        placeholder: "Numaralı koleksiyonlar, sınırlı üretim.",
      },
      {
        key: "site.description",
        label: "Meta açıklama",
        type: "textarea",
        hint: "Google sonuçlarında görünen kısa metin (≤155 karakter).",
      },
    ],
  },
  {
    id: "contact",
    title: "İletişim",
    eyebrow: "— iletişim",
    description:
      "Footer, iletişim sayfası ve e-postalarda kullanılır. Boş bıraktığın alanlar sitede gösterilmez.",
    fields: [
      { key: "contact.email", label: "E-posta", type: "email", placeholder: "merhaba@modaralist.shop" },
      { key: "contact.phone", label: "Telefon", type: "tel", placeholder: "+90 212 000 00 00" },
      {
        key: "contact.address",
        label: "Adres",
        type: "textarea",
        placeholder: "İstanbul, Türkiye",
      },
      { key: "contact.hours", label: "Çalışma saatleri", type: "text" },
    ],
  },
  {
    id: "social",
    title: "Sosyal Medya",
    eyebrow: "— sosyal",
    description: "Footer'daki ikonlara bağlanır. Tam URL gir — başında https://",
    fields: [
      { key: "social.instagram", label: "Instagram", type: "url", placeholder: "https://instagram.com/..." },
      { key: "social.tiktok", label: "TikTok", type: "url", placeholder: "https://tiktok.com/@..." },
      { key: "social.x", label: "X (Twitter)", type: "url" },
      { key: "social.facebook", label: "Facebook", type: "url" },
      { key: "social.youtube", label: "YouTube", type: "url" },
      { key: "social.pinterest", label: "Pinterest", type: "url" },
    ],
  },
  {
    id: "shop",
    title: "E-ticaret",
    eyebrow: "— mağaza",
    description:
      "Kargo, KDV ve ücretsiz kargo eşiği. KDV ondalıklı gir (0.20 = %20).",
    fields: [
      {
        key: "shop.currency",
        label: "Para birimi",
        type: "text",
        hint: "ISO kodu — TRY, USD, EUR",
      },
      { key: "shop.taxRate", label: "KDV oranı", type: "number", hint: "0.20 = %20" },
      {
        key: "shop.shippingStandard",
        label: "Standart kargo (₺)",
        type: "number",
        hint: "0 yazarsan ücretsiz",
      },
      { key: "shop.shippingExpress", label: "Hızlı kargo (₺)", type: "number" },
      {
        key: "shop.freeShippingOver",
        label: "Ücretsiz kargo eşiği (₺)",
        type: "number",
        hint: "Bu tutarın üstü standart kargo ücretsiz",
      },
    ],
  },
  {
    id: "banner",
    title: "Duyuru & Bakım",
    eyebrow: "— durum",
    description:
      "Site tepesinde gösterilecek duyuru ve bakım modu. Bakım aktifken sadece admin girebilir.",
    fields: [
      {
        key: "shop.announcementActive",
        label: "Duyuruyu göster",
        type: "boolean",
      },
      {
        key: "shop.announcementText",
        label: "Duyuru metni",
        type: "text",
        placeholder: "Drop 02 — 1 Mayıs'ta",
      },
      {
        key: "shop.maintenanceMode",
        label: "Bakım modu",
        type: "boolean",
        hint: "Aktifken müşteri siteye giremez. Admin'den kapatılır.",
      },
    ],
  },
  {
    id: "legal",
    title: "Yasal Bilgiler",
    eyebrow: "— yasal",
    description:
      "KVKK, fatura ve mesafeli satış sözleşmesinde görünür. Tüzel kişi bilgilerini doldur.",
    fields: [
      { key: "legal.companyName", label: "Ünvan", type: "text" },
      { key: "legal.taxOffice", label: "Vergi dairesi", type: "text" },
      { key: "legal.taxNumber", label: "Vergi no", type: "text" },
      { key: "legal.mersisNumber", label: "MERSİS no", type: "text" },
    ],
  },
];
