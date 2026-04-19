// Demo ürün verileri. Neon + Prisma bağlandığında bu dosya kaldırılır,
// yerini DB sorguları (src/server/products.ts gibi) alır.

export type DemoVariant = {
  id: string;
  size: string;
  color: string;
  stock: number;
};

export type DemoProduct = {
  slug: string;
  name: string;
  dropLabel: string;
  dropSlug: string;
  price: number;
  discountPrice?: number;
  images: string[];
  description: string;
  material: string;
  care: string;
  sizes: string[];
  colors: { code: string; name: string; hex: string }[];
  variants: DemoVariant[];
  categorySlug: string;
  tags: string[];
  soldOut?: boolean;
  comingSoon?: boolean;
};

export const CATEGORIES = [
  { slug: "all", name: "Tümü" },
  { slug: "tops", name: "Üst Giyim" },
  { slug: "bottoms", name: "Alt Giyim" },
  { slug: "dresses", name: "Elbise" },
  { slug: "outerwear", name: "Dış Giyim" },
  { slug: "knitwear", name: "Triko" },
];

const BASE_SIZES = ["XS", "S", "M", "L", "XL"];

const BASE_COLORS = [
  { code: "ink", name: "Ink", hex: "#0a0a0a" },
  { code: "bone", name: "Bone", hex: "#f5f2ed" },
  { code: "sand", name: "Sand", hex: "#d6c9b5" },
  { code: "clay", name: "Clay", hex: "#8a6e53" },
];

function mkVariants(slug: string, sizes: string[], colors: { code: string; name: string; hex: string }[]) {
  const v: DemoVariant[] = [];
  for (const color of colors) {
    for (const size of sizes) {
      v.push({
        id: `${slug}-${color.code}-${size.toLowerCase()}`,
        size,
        color: color.name,
        stock: Math.floor(Math.random() * 6),
      });
    }
  }
  return v;
}

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    slug: "asymetric-drape-top",
    name: "Asymetric Drape Top",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 2490,
    images: [
      "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "Asimetrik omuz hattı ve doğal düşen drape. Gün içi-gece geçişinde tek parçayla duruş kuran, ince ama şeffaf olmayan yapıdan. Eteğin önü kısa, arkası uzun asimetrik bir harekete yazık.",
    material: "%100 viskon",
    care: "30°C elde yıkama. Çamaşır suyu kullanma. Ütü düşük ısıda.",
    sizes: BASE_SIZES.slice(0, 4),
    colors: [BASE_COLORS[0], BASE_COLORS[1]],
    variants: mkVariants("asymetric-drape-top", BASE_SIZES.slice(0, 4), [
      BASE_COLORS[0],
      BASE_COLORS[1],
    ]),
    categorySlug: "tops",
    tags: ["new"],
  },
  {
    slug: "linen-wide-leg",
    name: "Linen Wide Leg Trousers",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 1890,
    images: [
      "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "Yüksek bel, geniş kesim, doğal keten. Vücudu sıkmadan bırakan, ama yapısını koruyan bir düşüş. Sezon boyu giyilebilir taban parça.",
    material: "%100 keten",
    care: "30°C makinede yıkama. Ütü orta ısıda.",
    sizes: BASE_SIZES,
    colors: [BASE_COLORS[1], BASE_COLORS[2]],
    variants: mkVariants("linen-wide-leg", BASE_SIZES, [BASE_COLORS[1], BASE_COLORS[2]]),
    categorySlug: "bottoms",
    tags: ["bestseller"],
  },
  {
    slug: "cotton-slip-dress",
    name: "Cotton Slip Dress",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 2190,
    images: [
      "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "Bias kesim pamuklu slip. Spagetti askılar, vücuda yumuşak temas, hafif midi boy. Bir gömleğin altında katmanlı, tek başına akşam.",
    material: "%100 pamuk",
    care: "30°C elde yıkama. Şekli bozulmadan kurut.",
    sizes: BASE_SIZES.slice(0, 4),
    colors: [BASE_COLORS[0], BASE_COLORS[2]],
    variants: mkVariants("cotton-slip-dress", BASE_SIZES.slice(0, 4), [BASE_COLORS[0], BASE_COLORS[2]]),
    categorySlug: "dresses",
    tags: ["new"],
  },
  {
    slug: "sheer-mesh-top",
    name: "Sheer Mesh Top",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 1590,
    images: [
      "https://images.unsplash.com/photo-1550639525-c97d455acf70?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "İnce mesh yapı, uzun kollu, vücuda oturan kesim. Tek başına yaz, katmanlı kış.",
    material: "%85 poliamid, %15 elastan",
    care: "30°C elde yıkama. Kurutucu kullanma.",
    sizes: BASE_SIZES.slice(0, 3),
    colors: [BASE_COLORS[0]],
    variants: mkVariants("sheer-mesh-top", BASE_SIZES.slice(0, 3), [BASE_COLORS[0]]),
    categorySlug: "tops",
    tags: ["limited"],
    soldOut: true,
  },
  {
    slug: "raw-edge-blazer",
    name: "Raw Edge Blazer",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 3290,
    images: [
      "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "Dikişsiz, ham kesim yakalar. Hafif yünlü kumaş. Erkek kesimi — ofiste biraz fazla, sokakta tam yerinde.",
    material: "%70 yün, %30 viskon",
    care: "Yalnızca kuru temizleme.",
    sizes: BASE_SIZES,
    colors: [BASE_COLORS[0], BASE_COLORS[3]],
    variants: mkVariants("raw-edge-blazer", BASE_SIZES, [BASE_COLORS[0], BASE_COLORS[3]]),
    categorySlug: "outerwear",
    tags: ["new"],
  },
  {
    slug: "knit-column",
    name: "Merino Column Knit",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 2790,
    images: [
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "Yumuşak merino örgü, yüksek boyun, uzun kesim. Vücudu sarar ama sıkmaz. Sezon kapanış parçası.",
    material: "%100 merino yün",
    care: "Elde yıkama. Düz kurut.",
    sizes: BASE_SIZES.slice(0, 4),
    colors: [BASE_COLORS[1], BASE_COLORS[2], BASE_COLORS[3]],
    variants: mkVariants("knit-column", BASE_SIZES.slice(0, 4), [BASE_COLORS[1], BASE_COLORS[2], BASE_COLORS[3]]),
    categorySlug: "knitwear",
    tags: ["bestseller"],
  },
  {
    slug: "wool-overcoat",
    name: "Wool Overcoat",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 4890,
    images: [
      "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1400&q=85",
      "https://images.unsplash.com/photo-1520975954732-35dd22299614?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "Uzun yün palto, saklı cepler, double-breasted. Dropun en statement parçası.",
    material: "%80 yün, %20 kaşmir",
    care: "Yalnızca kuru temizleme.",
    sizes: BASE_SIZES,
    colors: [BASE_COLORS[0], BASE_COLORS[3]],
    variants: mkVariants("wool-overcoat", BASE_SIZES, [BASE_COLORS[0], BASE_COLORS[3]]),
    categorySlug: "outerwear",
    tags: ["limited"],
  },
  {
    slug: "silk-scarf-top",
    name: "Silk Scarf Top",
    dropLabel: "Drop 01",
    dropSlug: "ss26-chapter-one",
    price: 1790,
    images: [
      "https://images.unsplash.com/photo-1475180098004-ca77a66827be?auto=format&fit=crop&w=1400&q=85",
    ],
    description:
      "Fular-bluz hibrit parça. Bele bağlanır, arkada dökülür. Restoran-plaj-ofis — hepsinde sizin olur.",
    material: "%100 ipek",
    care: "Kuru temizleme. Buharla düzelt.",
    sizes: ["Tek Beden"],
    colors: [BASE_COLORS[1], BASE_COLORS[2]],
    variants: mkVariants("silk-scarf-top", ["Tek Beden"], [BASE_COLORS[1], BASE_COLORS[2]]),
    categorySlug: "tops",
    tags: ["new"],
  },
];

export const DEMO_COLLECTIONS = [
  {
    slug: "ss26-chapter-one",
    name: "SS26 — Chapter One",
    tagline: "Where stillness meets movement.",
    description:
      "İlk bölüm. Akıp giden bir sezon değil — bir nefes. Viskon ve keten kumaşlar, ham kesim yakalar, şeffaf katmanlar. Sekiz parça, sınırlı üretim.",
    heroImage:
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2400&q=85",
    startsAt: "2026-03-01T12:00:00Z",
    endsAt: "2026-06-30T23:59:59Z",
    status: "LIVE" as const,
    productSlugs: [
      "asymetric-drape-top",
      "linen-wide-leg",
      "cotton-slip-dress",
      "sheer-mesh-top",
      "raw-edge-blazer",
      "knit-column",
      "wool-overcoat",
      "silk-scarf-top",
    ],
  },
  {
    slug: "ss26-chapter-two",
    name: "SS26 — Chapter Two",
    tagline: "In between the quiet.",
    description:
      "İkinci bölüm haziran ortasında açılıyor. Daha katmanlı, daha gece. Sayaç başladı.",
    heroImage:
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=2400&q=85",
    startsAt: "2026-06-15T12:00:00Z",
    endsAt: "2026-09-30T23:59:59Z",
    status: "UPCOMING" as const,
    productSlugs: [],
  },
];

export function getProduct(slug: string) {
  return DEMO_PRODUCTS.find((p) => p.slug === slug);
}

export function getCollection(slug: string) {
  return DEMO_COLLECTIONS.find((c) => c.slug === slug);
}

export function getCollectionProducts(slug: string) {
  const c = getCollection(slug);
  if (!c) return [];
  return c.productSlugs
    .map((s) => DEMO_PRODUCTS.find((p) => p.slug === s))
    .filter(Boolean) as DemoProduct[];
}

export function getRelatedProducts(slug: string, limit = 4) {
  const current = getProduct(slug);
  if (!current) return [];
  return DEMO_PRODUCTS.filter(
    (p) => p.slug !== slug && p.categorySlug === current.categorySlug
  ).slice(0, limit);
}
