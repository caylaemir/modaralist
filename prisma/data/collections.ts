// Modaralist sezonluk koleksiyonlari — yilda 4 (Ilkbahar, Yaz, Sonbahar, Kis).
// Idempotent upsert: scripts/import-collections.ts ile yuklenir.
//
// Status takvimi (Turkiye iklimi referansi):
//   - Ilkbahar: Mart-Mayis    (suanda 2026 May'da: ARCHIVED)
//   - Yaz:      Haziran-Agustos
//   - Sonbahar: Eylul-Kasim
//   - Kis:      Aralik-Subat
//
// Buradaki status admin panelinden manuel guncellenebilir; bu seed sadece
// baslangic kayitlarini olusturur. Sonradan calistirildiginda mevcut status
// degerini bozmaz (update'te status alani yok).

export type SeasonalCollection = {
  slug: string;
  sortOrder: number;
  startsAt: string; // ISO date
  endsAt: string;
  themePrimary?: string;
  themeAccent?: string;
  initialStatus: "UPCOMING" | "LIVE" | "SOLD_OUT" | "ARCHIVED";
  tr: { name: string; tagline: string; description: string };
  en: { name: string; tagline: string; description: string };
};

export const COLLECTIONS_2026: SeasonalCollection[] = [
  {
    slug: "ilkbahar-2026",
    sortOrder: 0,
    startsAt: "2026-03-01T00:00:00.000Z",
    endsAt: "2026-05-31T23:59:59.000Z",
    initialStatus: "LIVE",
    themePrimary: "#7a8b6f",
    themeAccent: "#f5f2ed",
    tr: {
      name: "İlkbahar 2026",
      tagline: "uyanış",
      description:
        "İlkbahar 2026 — kış katmanlarından arınmış, hafif ve nefes alan kumaşlar. Pamuk-keten karışımları, zemin tonları, sokak için yapılmış silüetler.",
    },
    en: {
      name: "Spring 2026",
      tagline: "awakening",
      description:
        "Spring 2026 — stripped of winter layers, light and breathable fabrics. Cotton-linen blends, earth tones, silhouettes built for the street.",
    },
  },
  {
    slug: "yaz-2026",
    sortOrder: 1,
    startsAt: "2026-06-01T00:00:00.000Z",
    endsAt: "2026-08-31T23:59:59.000Z",
    initialStatus: "LIVE",
    themePrimary: "#d6c8a8",
    themeAccent: "#0a0a0a",
    tr: {
      name: "Yaz 2026",
      tagline: "yaz başlıyor",
      description:
        "Yaz 2026 — kısa kollu, kısa paçalı, açık renkli. Plajdan şehre, sabahtan geceye taşınabilen parçalar.",
    },
    en: {
      name: "Summer 2026",
      tagline: "summer begins",
      description:
        "Summer 2026 — short sleeves, short hems, light colors. Pieces that travel from beach to city, morning to night.",
    },
  },
  {
    slug: "sonbahar-2026",
    sortOrder: 2,
    startsAt: "2026-09-01T00:00:00.000Z",
    endsAt: "2026-11-30T23:59:59.000Z",
    initialStatus: "UPCOMING",
    themePrimary: "#9e7b5a",
    themeAccent: "#f5f2ed",
    tr: {
      name: "Sonbahar 2026",
      tagline: "katmanlar",
      description:
        "Sonbahar 2026 — orta katmanın gücü. Sweatshirt, kapşonlu, hafif outdoor. Yapraklar düşerken kumaş ağırlaşır.",
    },
    en: {
      name: "Autumn 2026",
      tagline: "layers",
      description:
        "Autumn 2026 — the power of the mid-layer. Sweatshirts, hoodies, light outdoor. As leaves fall, fabric weighs more.",
    },
  },
  {
    slug: "kis-2026",
    sortOrder: 3,
    startsAt: "2026-12-01T00:00:00.000Z",
    endsAt: "2027-02-28T23:59:59.000Z",
    initialStatus: "UPCOMING",
    themePrimary: "#2a2a2a",
    themeAccent: "#d6c8a8",
    tr: {
      name: "Kış 2026",
      tagline: "ağırlık",
      description:
        "Kış 2026 — koyu tonlar, kalın dokular, fonksiyonel kesim. Polar, fermuarlı kapşonlu, oversize sweatshirt. Soğuğa hazır.",
    },
    en: {
      name: "Winter 2026",
      tagline: "weight",
      description:
        "Winter 2026 — deep tones, heavy textures, functional cuts. Fleece, zip hoodies, oversize sweats. Built for the cold.",
    },
  },
];

// Eski demo koleksiyonu — yeni 4'lu yapida yer almiyor, archive'la.
// Slug iki dilde de olabilir: TR seed'de 'ss26-birinci-bolum', EN seed'de
// 'ss26-chapter-one' yaratildi (Collection.slug top-level field, ikisinden
// hangisinin yaratildigina seed.ts kullanim sirasi karar verir).
export const DEPRECATED_COLLECTION_SLUGS = [
  "ss26-birinci-bolum",
  "ss26-chapter-one",
];
