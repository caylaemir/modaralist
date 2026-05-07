// Modaralist baslangic urunleri — her top-level kategoriye 1 adet.
// Idempotent: scripts/import-sample-products.ts ile yuklenir.
// Admin gercek urunleri ekledikce bunlari silebilir veya degistirebilir.
//
// Tum gorseller Unsplash placeholder — admin Cloudinary uzerinden gercek
// brand fotograflariyla degistirebilir.

export type SampleProduct = {
  slug: string;
  categorySlug: string; // top-level slug (oversize, tshirt, sweatshirt, vs.)
  basePrice: number; // TRY
  colorCodes: string[]; // varolan Color.code'lari (ink, bone, sand, clay)
  sizeCodes: string[]; // S, M, L, XL
  images: string[]; // 1-2 url, ilki ana, ikinci hover
  tr: { name: string; description: string; material: string; care: string };
  en: { name: string; description: string; material: string; care: string };
};

export const SAMPLE_PRODUCTS: SampleProduct[] = [
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
      description:
        "Geniş kalıp, düşük omuz, hafif boxy fit. Sert yıkanmış pamuklu örme. Günlük rahatlık + sokak silüeti.",
      material: "%100 organik pamuk · 220 gsm",
      care: "30°C tersten yıkayın. Düşük ısıda ütüleyin. Beyazlatıcı kullanmayın.",
    },
    en: {
      name: "Oversize Tshirt",
      description:
        "Wide cut, dropped shoulders, slight boxy fit. Heavy-washed cotton knit. Everyday comfort + street silhouette.",
      material: "100% organic cotton · 220 gsm",
      care: "Wash inside out at 30°C. Iron low. Do not bleach.",
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
      description:
        "Klasik kesim, regular fit. Pamuk dokuma, dökümlü ama yapısını koruyan kumaş. Tek başına da katmanlı da.",
      material: "%100 pamuk · 180 gsm",
      care: "30°C yıkayın. Çamaşır makinesinde kurutmayın.",
    },
    en: {
      name: "Basic Tshirt",
      description:
        "Classic cut, regular fit. Woven cotton, drapes well but holds its shape. Solo or layered.",
      material: "100% cotton · 180 gsm",
      care: "Machine wash at 30°C. Do not tumble dry.",
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
      description:
        "Klasik bisiklet yaka, içi şardonlu. Düşük omuz, geniş manşet. Sezon geçişlerinin ana parçası.",
      material: "%80 pamuk %20 polyester · 320 gsm fleece",
      care: "30°C tersten yıkayın. Düz kurutun.",
    },
    en: {
      name: "Crewneck Sweatshirt",
      description:
        "Classic crewneck, brushed interior. Dropped shoulder, wide cuff. The transitional season staple.",
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
      description:
        "Beli lastikli, paça lastikli, klasik jogger kesim. Şardonlu içlik. Sokakta da evde de.",
      material: "%85 pamuk %15 polyester · 280 gsm",
      care: "30°C yıkayın. Düz kurutun. Düşük ısıda ütüleyin.",
    },
    en: {
      name: "Jogger Sweatpants",
      description:
        "Elastic waist, cuffed ankle, classic jogger cut. Brushed interior. Street or home — works either way.",
      material: "85% cotton, 15% polyester · 280 gsm",
      care: "Machine wash at 30°C. Lay flat to dry. Iron low.",
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
      description:
        "Yumuşak pamuk fleece, beli ip kordonlu, yan cep. Diz üstü uzunluk. Yaz aylarının düşmeyen parçası.",
      material: "%100 pamuk fleece · 240 gsm",
      care: "30°C yıkayın. Düşük ısıda ütüleyin.",
    },
    en: {
      name: "Cotton Shorts",
      description:
        "Soft cotton fleece, drawstring waist, side pockets. Above-knee length. Summer go-to.",
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
      description:
        "Su itici dış kumaş, kanguru cep, ayarlanabilir kapüşon. Hafif yağmur ve şehir günlerine. Outdoor serisinin ana parçası.",
      material: "%100 polyester (geri dönüştürülmüş) · DWR kaplı",
      care: "Kuru temizleme önerilir. Yıkamaktan kaçının.",
    },
    en: {
      name: "Outdoor Anorak",
      description:
        "Water-repellent shell, kangaroo pocket, adjustable hood. Light rain and city days. Outdoor series staple.",
      material: "100% recycled polyester · DWR-coated",
      care: "Dry clean recommended. Avoid washing.",
    },
  },
];
