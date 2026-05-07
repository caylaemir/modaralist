// Modaralist 3-seviye kategori taksonomisi.
// Top-level (6) -> Sub-category (varsa) -> Series (urun seri).
//
// Kullanim: scripts/import-taxonomy.ts upsert eder. Mevcut kategorileri
// SLUG'a gore esleyip gunceller; yeni olanlari yaratir; eski ama listede
// olmayanlari (orn. polar) sadece deactivate eder (silmez — urun kaybi olmasin).

export type SeriesNode = {
  slug: string;
  nameTr: string;
  nameEn: string;
};

export type SubCategoryNode = {
  slug: string;
  nameTr: string;
  nameEn: string;
  children: SeriesNode[];
};

export type TopCategoryNode = {
  slug: string;
  nameTr: string;
  nameEn: string;
  // Top-level'in ya alt-kategorileri ya da direkt series cocuklari olur.
  // Ornek: TISORT direkt 6 series; OVERSIZE 3 alt-kat, her biri 6 series.
  children: SubCategoryNode[] | SeriesNode[];
};

const COMMON_SERIES: SeriesNode[] = [
  { slug: "basic", nameTr: "Basic", nameEn: "Basic" },
  { slug: "adventure", nameTr: "Adventure", nameEn: "Adventure" },
  { slug: "deniz", nameTr: "Deniz", nameEn: "Sea" },
  { slug: "street-wear", nameTr: "Street Wear", nameEn: "Street Wear" },
  { slug: "teddy-bear", nameTr: "Teddy Bear", nameEn: "Teddy Bear" },
  { slug: "spor", nameTr: "Spor", nameEn: "Sport" },
];

function seriesFor(prefix: string): SeriesNode[] {
  return COMMON_SERIES.map((s) => ({
    slug: `${prefix}-${s.slug}`,
    nameTr: s.nameTr,
    nameEn: s.nameEn,
  }));
}

export const TAXONOMY: TopCategoryNode[] = [
  {
    // OVERSIZE — 3 alt-kategori, her biri kendi serileriyle
    slug: "oversize",
    nameTr: "Oversize",
    nameEn: "Oversize",
    children: [
      {
        slug: "oversize-tisort",
        nameTr: "Oversize Tshirt",
        nameEn: "Oversize T-Shirt",
        children: seriesFor("oversize-tisort"),
      },
      {
        slug: "oversize-sweatshirt",
        nameTr: "Oversize Sweatshirt",
        nameEn: "Oversize Sweatshirt",
        children: seriesFor("oversize-sweatshirt"),
      },
      {
        slug: "oversize-kapsonlu",
        nameTr: "Oversize Kapsonlu",
        nameEn: "Oversize Hoodie",
        children: seriesFor("oversize-kapsonlu"),
      },
    ],
  },
  {
    // TISORT — direkt 6 series (alt-kategori yok)
    slug: "tshirt",
    nameTr: "Tshirt",
    nameEn: "T-Shirt",
    children: seriesFor("tshirt"),
  },
  {
    // SWEATSHIRT — 3 alt-kategori, her biri kendi serileriyle
    slug: "sweatshirt",
    nameTr: "Sweatshirt",
    nameEn: "Sweatshirt",
    children: [
      {
        slug: "sweatshirt-classic",
        nameTr: "Sweatshirt",
        nameEn: "Sweatshirt",
        children: seriesFor("sweatshirt-classic"),
      },
      {
        slug: "sweatshirt-kapsonlu",
        nameTr: "Kapsonlu",
        nameEn: "Hoodie",
        children: seriesFor("sweatshirt-kapsonlu"),
      },
      {
        slug: "sweatshirt-fermuarli-kapsonlu",
        nameTr: "Fermuarli Kapsonlu",
        nameEn: "Zip Hoodie",
        children: seriesFor("sweatshirt-fermuarli-kapsonlu"),
      },
    ],
  },
  {
    // ESOFMAN — Erkek / Kadin
    slug: "esofman",
    nameTr: "Esofman",
    nameEn: "Sweatpants",
    children: [
      {
        slug: "esofman-erkek",
        nameTr: "Erkek",
        nameEn: "Men",
        children: [],
      },
      {
        slug: "esofman-kadin",
        nameTr: "Kadin",
        nameEn: "Women",
        children: [],
      },
    ],
  },
  {
    // SORT — Erkek / Kadin
    slug: "sort",
    nameTr: "Sort",
    nameEn: "Shorts",
    children: [
      {
        slug: "sort-erkek",
        nameTr: "Erkek",
        nameEn: "Men",
        children: [],
      },
      {
        slug: "sort-kadin",
        nameTr: "Kadin",
        nameEn: "Women",
        children: [],
      },
    ],
  },
  {
    // OUTDOOR — Erkek / Kadin
    slug: "outdoor",
    nameTr: "Outdoor",
    nameEn: "Outdoor",
    children: [
      {
        slug: "outdoor-erkek",
        nameTr: "Erkek",
        nameEn: "Men",
        children: [],
      },
      {
        slug: "outdoor-kadin",
        nameTr: "Kadin",
        nameEn: "Women",
        children: [],
      },
    ],
  },
];

// Eski yapidan kalan ama yeni listede olmayan kategoriler — deactivate edilecek.
// Urun atamasi varsa silmiyoruz; admin elle tasiyabilir.
// 'tops', 'bottoms', 'dresses', 'outerwear', 'knitwear' — eski seed.ts'ten kalan
// generic kategoriler. 'polar' — yeni 6'lik yapida yer almiyor.
export const DEPRECATED_SLUGS = [
  "polar",
  "tops",
  "bottoms",
  "dresses",
  "outerwear",
  "knitwear",
];

// Top-level slug listesi — header navigation icin kullanilir.
export const TOP_LEVEL_SLUGS = TAXONOMY.map((t) => t.slug);

// Yardimci: Tum kategorileri (her seviye) duzlestiren generator.
export function* flattenTaxonomy(): Generator<{
  slug: string;
  nameTr: string;
  nameEn: string;
  parentSlug: string | null;
  depth: 0 | 1 | 2;
  sortOrder: number;
}> {
  let topOrder = 0;
  for (const top of TAXONOMY) {
    yield {
      slug: top.slug,
      nameTr: top.nameTr,
      nameEn: top.nameEn,
      parentSlug: null,
      depth: 0,
      sortOrder: topOrder++,
    };

    let subOrder = 0;
    for (const child of top.children) {
      // SeriesNode mi, SubCategoryNode mu?
      const isSubCat = "children" in child;
      yield {
        slug: child.slug,
        nameTr: child.nameTr,
        nameEn: child.nameEn,
        parentSlug: top.slug,
        depth: 1,
        sortOrder: subOrder++,
      };

      if (isSubCat) {
        let serOrder = 0;
        for (const series of (child as SubCategoryNode).children) {
          yield {
            slug: series.slug,
            nameTr: series.nameTr,
            nameEn: series.nameEn,
            parentSlug: child.slug,
            depth: 2,
            sortOrder: serOrder++,
          };
        }
      }
    }
  }
}
