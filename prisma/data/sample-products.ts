// Modaralist baslangic urunleri.
// Idempotent: scripts/import-sample-products.ts ile yuklenir.
// Admin gercek urunleri ekledikce bunlari silebilir veya degistirebilir.
//
// Tum gorseller Unsplash placeholder — admin Cloudinary uzerinden gercek
// brand fotograflariyla degistirebilir.
//
// Yapi (toplam 54 urun):
// - 6 top-level landing urunu (oversize, tshirt, sweatshirt, esofman,
//   sort, outdoor)
// - 42 series leaf urunu (oversize-tisort × 6 series, tshirt × 6 series,
//   sweatshirt-classic × 6 series, sweatshirt-kapsonlu × 6, sweatshirt-
//   fermuarli-kapsonlu × 6, oversize-sweatshirt × 6, oversize-kapsonlu × 6)
// - 6 Erkek/Kadin sub-cat leaf urunu (esofman/sort/outdoor × Erkek/Kadin)

export type SampleProduct = {
  slug: string;
  categorySlug: string;
  basePrice: number; // TRY
  colorCodes: string[]; // varolan Color.code (ink, bone, sand, clay)
  sizeCodes: string[]; // S, M, L, XL
  images: string[]; // 1-2 url, ilki ana, ikinci hover
  tr: { name: string; description: string; material: string; care: string };
  en: { name: string; description: string; material: string; care: string };
};

// Series tema kataloglari — her seri kendi gorsel + dilini tasir.
type SeriesTheme = {
  slug: string;
  trName: string;
  enName: string;
  trBlurb: string;
  enBlurb: string;
  image: string;
  hoverImage?: string;
  colorCodes: string[];
};

const SERIES_THEMES: Record<string, SeriesTheme> = {
  basic: {
    slug: "basic",
    trName: "Basic",
    enName: "Basic",
    trBlurb: "Sade, minimal, gardirobun temeli. Tek başına da katmanlı da çalışır.",
    enBlurb: "Plain, minimal, the foundation of the wardrobe. Solo or layered.",
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["ink", "bone", "sand"],
  },
  adventure: {
    slug: "adventure",
    trName: "Adventure",
    enName: "Adventure",
    trBlurb: "Outdoor için yapılmış — sert kullanıma, doğaya, harekete uygun.",
    enBlurb: "Built for outdoor — rough use, nature, movement.",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["ink", "clay", "sand"],
  },
  deniz: {
    slug: "deniz",
    trName: "Deniz",
    enName: "Sea",
    trBlurb: "Yaz, plaj, deniz tonları. Hafif kumaş, açık renkler.",
    enBlurb: "Summer, beach, sea tones. Light fabrics, open colors.",
    image:
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["bone", "sand"],
  },
  "street-wear": {
    slug: "street-wear",
    trName: "Street Wear",
    enName: "Street Wear",
    trBlurb: "Şehir için tasarlanmış — graffiti, sokak, hareket.",
    enBlurb: "Designed for the city — graffiti, street, movement.",
    image:
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["ink", "bone"],
  },
  "teddy-bear": {
    slug: "teddy-bear",
    trName: "Teddy Bear",
    enName: "Teddy Bear",
    trBlurb: "Yumuşak peluş doku. Sıcak, sarmalayan, evsel.",
    enBlurb: "Soft plush texture. Warm, enveloping, homely.",
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["bone", "clay", "sand"],
  },
  spor: {
    slug: "spor",
    trName: "Spor",
    enName: "Sport",
    trBlurb: "Performans odaklı — antrenman, koşu, yoga için.",
    enBlurb: "Performance-focused — training, running, yoga.",
    image:
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["ink", "bone"],
  },
};

// Tip bazli urun template'leri.
type ProductType = {
  trName: string;
  enName: string;
  basePrice: number;
  trMaterial: string;
  enMaterial: string;
  trCare: string;
  enCare: string;
};

const PRODUCT_TYPES: Record<string, ProductType> = {
  "oversize-tisort": {
    trName: "Oversize Tshirt",
    enName: "Oversize T-Shirt",
    basePrice: 690,
    trMaterial: "%100 organik pamuk · 220 gsm",
    enMaterial: "100% organic cotton · 220 gsm",
    trCare: "30°C tersten yıkayın. Düşük ısıda ütüleyin.",
    enCare: "Wash inside out at 30°C. Iron low.",
  },
  "oversize-sweatshirt": {
    trName: "Oversize Sweatshirt",
    enName: "Oversize Sweatshirt",
    basePrice: 1090,
    trMaterial: "%80 pamuk %20 polyester · 320 gsm fleece",
    enMaterial: "80% cotton, 20% polyester · 320 gsm fleece",
    trCare: "30°C tersten yıkayın. Düz kurutun.",
    enCare: "Wash inside out at 30°C. Lay flat to dry.",
  },
  "oversize-kapsonlu": {
    trName: "Oversize Kapsonlu",
    enName: "Oversize Hoodie",
    basePrice: 1190,
    trMaterial: "%80 pamuk %20 polyester · 350 gsm fleece",
    enMaterial: "80% cotton, 20% polyester · 350 gsm fleece",
    trCare: "30°C tersten yıkayın. Düz kurutun.",
    enCare: "Wash inside out at 30°C. Lay flat to dry.",
  },
  tshirt: {
    trName: "Tshirt",
    enName: "T-Shirt",
    basePrice: 490,
    trMaterial: "%100 pamuk · 180 gsm",
    enMaterial: "100% cotton · 180 gsm",
    trCare: "30°C yıkayın. Düz kurutun.",
    enCare: "Machine wash at 30°C. Lay flat to dry.",
  },
  "sweatshirt-classic": {
    trName: "Sweatshirt",
    enName: "Sweatshirt",
    basePrice: 990,
    trMaterial: "%80 pamuk %20 polyester · 320 gsm fleece",
    enMaterial: "80% cotton, 20% polyester · 320 gsm fleece",
    trCare: "30°C tersten yıkayın. Düz kurutun.",
    enCare: "Wash inside out at 30°C. Lay flat to dry.",
  },
  "sweatshirt-kapsonlu": {
    trName: "Kapsonlu Sweatshirt",
    enName: "Hoodie",
    basePrice: 1090,
    trMaterial: "%80 pamuk %20 polyester · 350 gsm fleece",
    enMaterial: "80% cotton, 20% polyester · 350 gsm fleece",
    trCare: "30°C tersten yıkayın. Düz kurutun.",
    enCare: "Wash inside out at 30°C. Lay flat to dry.",
  },
  "sweatshirt-fermuarli-kapsonlu": {
    trName: "Fermuarli Kapsonlu",
    enName: "Zip Hoodie",
    basePrice: 1190,
    trMaterial: "%80 pamuk %20 polyester · 350 gsm fleece",
    enMaterial: "80% cotton, 20% polyester · 350 gsm fleece",
    trCare: "30°C yıkayın. Fermuarı kapatarak yıkayın.",
    enCare: "Machine wash at 30°C. Close the zipper before washing.",
  },
};

const GENDER_TYPES: Record<string, ProductType & { image: string; hoverImage?: string; colorCodes: string[] }> = {
  "esofman-erkek": {
    trName: "Erkek Eşofman",
    enName: "Men's Sweatpants",
    basePrice: 890,
    trMaterial: "%85 pamuk %15 polyester · 280 gsm",
    enMaterial: "85% cotton, 15% polyester · 280 gsm",
    trCare: "30°C yıkayın. Düz kurutun.",
    enCare: "Machine wash at 30°C. Lay flat to dry.",
    image:
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["ink", "bone"],
  },
  "esofman-kadin": {
    trName: "Kadın Eşofman",
    enName: "Women's Sweatpants",
    basePrice: 890,
    trMaterial: "%85 pamuk %15 polyester · 280 gsm",
    enMaterial: "85% cotton, 15% polyester · 280 gsm",
    trCare: "30°C yıkayın. Düz kurutun.",
    enCare: "Machine wash at 30°C. Lay flat to dry.",
    image:
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["bone", "sand"],
  },
  "sort-erkek": {
    trName: "Erkek Şort",
    enName: "Men's Shorts",
    basePrice: 590,
    trMaterial: "%100 pamuk fleece · 240 gsm",
    enMaterial: "100% cotton fleece · 240 gsm",
    trCare: "30°C yıkayın. Düşük ısıda ütüleyin.",
    enCare: "Machine wash at 30°C. Iron low.",
    image:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["ink", "bone", "sand"],
  },
  "sort-kadin": {
    trName: "Kadın Şort",
    enName: "Women's Shorts",
    basePrice: 590,
    trMaterial: "%100 pamuk fleece · 240 gsm",
    enMaterial: "100% cotton fleece · 240 gsm",
    trCare: "30°C yıkayın. Düşük ısıda ütüleyin.",
    enCare: "Machine wash at 30°C. Iron low.",
    image:
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["bone", "sand"],
  },
  "outdoor-erkek": {
    trName: "Erkek Outdoor",
    enName: "Men's Outdoor",
    basePrice: 1490,
    trMaterial: "%100 polyester (geri dönüştürülmüş) · DWR kaplı",
    enMaterial: "100% recycled polyester · DWR-coated",
    trCare: "Kuru temizleme önerilir.",
    enCare: "Dry clean recommended.",
    image:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["ink", "clay"],
  },
  "outdoor-kadin": {
    trName: "Kadın Outdoor",
    enName: "Women's Outdoor",
    basePrice: 1490,
    trMaterial: "%100 polyester (geri dönüştürülmüş) · DWR kaplı",
    enMaterial: "100% recycled polyester · DWR-coated",
    trCare: "Kuru temizleme önerilir.",
    enCare: "Dry clean recommended.",
    image:
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=85",
    hoverImage:
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
    colorCodes: ["clay", "bone"],
  },
};

const SERIES_PARENT_TYPES = [
  "oversize-tisort",
  "oversize-sweatshirt",
  "oversize-kapsonlu",
  "tshirt",
  "sweatshirt-classic",
  "sweatshirt-kapsonlu",
  "sweatshirt-fermuarli-kapsonlu",
];

// 6 adet top-level landing urunu — kategori ana sayfasinda gozukur.
const TOP_LEVEL_LANDING: SampleProduct[] = [
  {
    slug: "oversize-tshirt",
    categorySlug: "oversize",
    basePrice: 690,
    colorCodes: ["ink", "bone"],
    sizeCodes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?auto=format&fit=crop&w=1200&q=85",
    ],
    tr: {
      name: "Oversize Tshirt",
      description: "Geniş kalıp, düşük omuz, hafif boxy fit. Sert yıkanmış pamuklu örme.",
      material: "%100 organik pamuk · 220 gsm",
      care: "30°C tersten yıkayın. Düşük ısıda ütüleyin.",
    },
    en: {
      name: "Oversize Tshirt",
      description: "Wide cut, dropped shoulders, slight boxy fit. Heavy-washed cotton knit.",
      material: "100% organic cotton · 220 gsm",
      care: "Wash inside out at 30°C. Iron low.",
    },
  },
  {
    slug: "klasik-tshirt",
    categorySlug: "tshirt",
    basePrice: 490,
    colorCodes: ["ink", "bone", "sand"],
    sizeCodes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1503341504253-dff4815485f1?auto=format&fit=crop&w=1200&q=85",
    ],
    tr: {
      name: "Basic Tshirt",
      description: "Klasik kesim, regular fit. Pamuk dokuma, yapısını koruyan kumaş.",
      material: "%100 pamuk · 180 gsm",
      care: "30°C yıkayın. Düz kurutun.",
    },
    en: {
      name: "Basic Tshirt",
      description: "Classic cut, regular fit. Woven cotton, holds its shape.",
      material: "100% cotton · 180 gsm",
      care: "Machine wash at 30°C. Lay flat to dry.",
    },
  },
  {
    slug: "crewneck-sweatshirt",
    categorySlug: "sweatshirt",
    basePrice: 990,
    colorCodes: ["ink", "sand"],
    sizeCodes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?auto=format&fit=crop&w=1200&q=85",
    ],
    tr: {
      name: "Crewneck Sweatshirt",
      description: "Klasik bisiklet yaka, içi şardonlu. Sezon geçişlerinin ana parçası.",
      material: "%80 pamuk %20 polyester · 320 gsm fleece",
      care: "30°C tersten yıkayın. Düz kurutun.",
    },
    en: {
      name: "Crewneck Sweatshirt",
      description: "Classic crewneck, brushed interior. The transitional season staple.",
      material: "80% cotton, 20% polyester · 320 gsm fleece",
      care: "Wash inside out at 30°C. Lay flat to dry.",
    },
  },
  {
    slug: "jogger-esofman",
    categorySlug: "esofman",
    basePrice: 890,
    colorCodes: ["ink", "bone"],
    sizeCodes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1517438476312-10d79c077509?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1571945153237-4929e783af4a?auto=format&fit=crop&w=1200&q=85",
    ],
    tr: {
      name: "Jogger Eşofman",
      description: "Beli lastikli, paça lastikli, klasik jogger kesim. Şardonlu içlik.",
      material: "%85 pamuk %15 polyester · 280 gsm",
      care: "30°C yıkayın. Düz kurutun.",
    },
    en: {
      name: "Jogger Sweatpants",
      description: "Elastic waist, cuffed ankle, classic jogger cut. Brushed interior.",
      material: "85% cotton, 15% polyester · 280 gsm",
      care: "Machine wash at 30°C. Lay flat to dry.",
    },
  },
  {
    slug: "pamuklu-sort",
    categorySlug: "sort",
    basePrice: 590,
    colorCodes: ["ink", "bone", "sand"],
    sizeCodes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?auto=format&fit=crop&w=1200&q=85",
    ],
    tr: {
      name: "Pamuklu Şort",
      description: "Yumuşak pamuk fleece, beli ip kordonlu, yan cep. Diz üstü uzunluk.",
      material: "%100 pamuk fleece · 240 gsm",
      care: "30°C yıkayın. Düşük ısıda ütüleyin.",
    },
    en: {
      name: "Cotton Shorts",
      description: "Soft cotton fleece, drawstring waist, side pockets. Above-knee length.",
      material: "100% cotton fleece · 240 gsm",
      care: "Machine wash at 30°C. Iron low.",
    },
  },
  {
    slug: "outdoor-anorak",
    categorySlug: "outdoor",
    basePrice: 1490,
    colorCodes: ["ink", "clay"],
    sizeCodes: ["S", "M", "L", "XL"],
    images: [
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=1200&q=85",
      "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=1200&q=85",
    ],
    tr: {
      name: "Outdoor Anorak",
      description: "Su itici dış kumaş, kanguru cep, ayarlanabilir kapüşon.",
      material: "%100 polyester (geri dönüştürülmüş) · DWR kaplı",
      care: "Kuru temizleme önerilir.",
    },
    en: {
      name: "Outdoor Anorak",
      description: "Water-repellent shell, kangaroo pocket, adjustable hood.",
      material: "100% recycled polyester · DWR-coated",
      care: "Dry clean recommended.",
    },
  },
];

// 42 series leaf urunu — her tip × 6 series.
function buildSeriesProducts(): SampleProduct[] {
  const out: SampleProduct[] = [];
  const seriesSlugs = ["basic", "adventure", "deniz", "street-wear", "teddy-bear", "spor"];

  for (const typeSlug of SERIES_PARENT_TYPES) {
    const tp = PRODUCT_TYPES[typeSlug];
    if (!tp) continue;
    for (const seriesSlug of seriesSlugs) {
      const theme = SERIES_THEMES[seriesSlug];
      if (!theme) continue;
      const leafSlug = `${typeSlug}-${seriesSlug}`;
      out.push({
        slug: leafSlug,
        categorySlug: leafSlug,
        basePrice: tp.basePrice,
        colorCodes: theme.colorCodes,
        sizeCodes: ["S", "M", "L", "XL"],
        images: theme.hoverImage ? [theme.image, theme.hoverImage] : [theme.image],
        tr: {
          name: `${tp.trName} — ${theme.trName}`,
          description: theme.trBlurb,
          material: tp.trMaterial,
          care: tp.trCare,
        },
        en: {
          name: `${tp.enName} — ${theme.enName}`,
          description: theme.enBlurb,
          material: tp.enMaterial,
          care: tp.enCare,
        },
      });
    }
  }
  return out;
}

// 6 Erkek/Kadin leaf urunu.
function buildGenderProducts(): SampleProduct[] {
  const out: SampleProduct[] = [];
  for (const [leafSlug, tp] of Object.entries(GENDER_TYPES)) {
    out.push({
      slug: leafSlug,
      categorySlug: leafSlug,
      basePrice: tp.basePrice,
      colorCodes: tp.colorCodes,
      sizeCodes: ["S", "M", "L", "XL"],
      images: tp.hoverImage ? [tp.image, tp.hoverImage] : [tp.image],
      tr: {
        name: tp.trName,
        description: "Klasik kesim, günlük kullanım için. Yumuşak dokulu, dayanıklı.",
        material: tp.trMaterial,
        care: tp.trCare,
      },
      en: {
        name: tp.enName,
        description: "Classic cut for everyday use. Soft texture, durable.",
        material: tp.enMaterial,
        care: tp.enCare,
      },
    });
  }
  return out;
}

// Toplam: 6 (top) + 42 (series) + 6 (gender) = 54 urun.
export const SAMPLE_PRODUCTS: SampleProduct[] = [
  ...TOP_LEVEL_LANDING,
  ...buildSeriesProducts(),
  ...buildGenderProducts(),
];
