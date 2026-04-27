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

  // Sepet paket indirimi (bundle discount)
  // Sepete 2.+3. urun ekleyince en ucuz parcaya indirim uygulanir.
  // 'En ucuz'a verilir cunku uyanik kullanici 1 pahali + 1 ucuz koyup
  // pahaliya indirim almasin.
  "bundle.enabled": "false",
  "bundle.minSubtotal": "800",
  "bundle.tier2Discount": "15",
  "bundle.tier3Discount": "40",

  // Newsletter popup (15sn sonra ilk ziyarette)
  "popup.enabled": "true",
  "popup.delaySeconds": "15",
  "popup.eyebrow": "— ilk siparişine özel",
  "popup.title": "%10 indirim hemen senin.",
  "popup.subtitle":
    "Email'ini bırak, ilk siparişine özel %10 indirim kodunu yolla. Drop'lar açılınca da ilk sen öğren.",
  "popup.ctaLabel": "İndirim Kodumu Gönder",
  "popup.discountCode": "",

  // WhatsApp destek butonu (sag-alt float)
  "whatsapp.enabled": "false",
  "whatsapp.number": "",
  "whatsapp.message": "Merhaba, Modaralist sitesinden yazıyorum.",

  // Guvenlik — admin 2FA toggle (placeholder, gerek olunca implement)
  "security.adminTwoFactorEnabled": "false",

  // Free shipping A/B test (true ise alternatif esik kullanilir)
  "shop.freeShippingAB": "false",
  "shop.freeShippingOverB": "1000",

  // Loyalty / puan sistemi
  // earnPerTL: her 1 TL siparis -> kac puan (varsayilan 1 TL = 1 puan)
  // redeemValue: 1 puan kac TL (varsayilan 100 puan = 5 TL = 0.05 TL/puan)
  // minRedeem: minimum kullanim puani (cok kucuk bakiye spam'i engelle)
  "loyalty.enabled": "false",
  "loyalty.earnPerTL": "1",
  "loyalty.redeemValue": "0.05",
  "loyalty.minRedeem": "100",
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
  {
    id: "bundle",
    title: "Sepet Paket İndirimi",
    eyebrow: "— upsell",
    description:
      "Sepete 2. ürün eklenince en ucuz parçaya %X, 3. ürün eklenince %Y indirim uygulanır. İndirim her zaman EN UCUZ ürüne uygulanır (uyanık kullanıcıyı engellemek için). Min sepet tutarı altında çalışmaz.",
    fields: [
      {
        key: "bundle.enabled",
        label: "Bundle indirimi aktif",
        type: "boolean",
        hint: "Aktif değilken hiçbir indirim uygulanmaz, sepet drawer'ında da gösterilmez.",
      },
      {
        key: "bundle.minSubtotal",
        label: "Min sepet tutarı (₺)",
        type: "number",
        hint: "Sepet bu tutarın altındaysa bundle indirimi uygulanmaz. 0 yazarsan her tutarda aktif.",
      },
      {
        key: "bundle.tier2Discount",
        label: "2. ürün indirimi (%)",
        type: "number",
        hint: "Sepette tam 2 ürün varken en ucuz olanına uygulanan yüzde.",
      },
      {
        key: "bundle.tier3Discount",
        label: "3+ ürün indirimi (%)",
        type: "number",
        hint: "Sepette 3 veya daha fazla ürün varken en ucuz olanına uygulanan yüzde.",
      },
    ],
  },
  {
    id: "whatsapp",
    title: "WhatsApp Destek",
    eyebrow: "— canlı destek",
    description:
      "Sağ-alt köşede beliren WhatsApp butonu. Müşteri tıklayınca direkt WhatsApp uygulamasına yönlenir, hazır mesaj gelir. Numarayı uluslararası formatta gir (905XXXXXXXXX).",
    fields: [
      { key: "whatsapp.enabled", label: "Buton aktif", type: "boolean" },
      {
        key: "whatsapp.number",
        label: "WhatsApp numarası",
        type: "text",
        placeholder: "905551112233",
        hint: "Sadece rakam, + işareti ve boşluk olmadan. Türkiye için 90 ile başla.",
      },
      {
        key: "whatsapp.message",
        label: "Hazır mesaj",
        type: "text",
        placeholder: "Merhaba, Modaralist sitesinden yazıyorum.",
      },
    ],
  },
  {
    id: "security",
    title: "Güvenlik",
    eyebrow: "— admin",
    description:
      "Admin paneline ek koruma. 2FA (Google Authenticator) ileride aktif edilince login sırasında 6 haneli kod istenir.",
    fields: [
      {
        key: "security.adminTwoFactorEnabled",
        label: "Admin 2FA zorunlu",
        type: "boolean",
        hint: "(Henüz implement edilmedi — toggle açıldığında uyarı verilir, gerek duyduğunda söyle eklerim.)",
      },
    ],
  },
  {
    id: "ab",
    title: "Free Shipping A/B Test",
    eyebrow: "— deney",
    description:
      "Aktifken kullanıcının rastgele yarısı 'B' eşiğini görür. Hangi eşik daha çok satışa dönüşüyor karşılaştırılır. (Settings'ten manuel okunan basit deney — istatistik için Cookie ile sticky.)",
    fields: [
      { key: "shop.freeShippingAB", label: "A/B testi aktif", type: "boolean" },
      {
        key: "shop.freeShippingOverB",
        label: "B varyantı eşiği (₺)",
        type: "number",
        hint: "A varyantı yukardaki standart eşik. B yarısı bu eşiği görür.",
      },
    ],
  },
  {
    id: "loyalty",
    title: "Sadakat Puanı",
    eyebrow: "— loyalty",
    description:
      "Müşteri her siparişinden puan kazanır, sonraki alışverişte kullanır. Repeat customer rate'i artırır. Earn rate düşük (1:1), redeem değer makul (100 puan = 5 TL = %5'e benzer indirim).",
    fields: [
      { key: "loyalty.enabled", label: "Sadakat puanı aktif", type: "boolean" },
      {
        key: "loyalty.earnPerTL",
        label: "1 TL = kaç puan",
        type: "number",
        hint: "Varsayılan 1. Sipariş tutarı x bu değer = kazanılan puan.",
      },
      {
        key: "loyalty.redeemValue",
        label: "1 puanın TL değeri",
        type: "number",
        hint: "Varsayılan 0.05. 100 puan = 5 TL indirim.",
      },
      {
        key: "loyalty.minRedeem",
        label: "Minimum kullanım (puan)",
        type: "number",
        hint: "Bu puanın altında redeem edilemez (varsayılan 100).",
      },
    ],
  },
  {
    id: "popup",
    title: "Newsletter Popup",
    eyebrow: "— popup",
    description:
      "Site'ye ilk geldiğinde gösterilecek email toplama modal'ı. Kullanıcı kapatırsa bir daha gösterilmez (localStorage). İndirim kodunu otomatik yollamak için bir kupon oluşturup kodu buraya yaz.",
    fields: [
      {
        key: "popup.enabled",
        label: "Popup aktif",
        type: "boolean",
      },
      {
        key: "popup.delaySeconds",
        label: "Gösterme gecikmesi (saniye)",
        type: "number",
        hint: "Sayfa yüklendikten kaç saniye sonra modal açılsın.",
      },
      {
        key: "popup.eyebrow",
        label: "Üst label",
        type: "text",
        placeholder: "— ilk siparişine özel",
      },
      {
        key: "popup.title",
        label: "Başlık",
        type: "text",
        placeholder: "%10 indirim hemen senin.",
      },
      {
        key: "popup.subtitle",
        label: "Alt metin",
        type: "textarea",
      },
      {
        key: "popup.ctaLabel",
        label: "Buton metni",
        type: "text",
        placeholder: "İndirim Kodumu Gönder",
      },
      {
        key: "popup.discountCode",
        label: "Kupon kodu (opsiyonel)",
        type: "text",
        hint: "Kayıt olunca müşteriye gösterilen kod (sonra Resend ile mail atılacak).",
      },
    ],
  },
];
