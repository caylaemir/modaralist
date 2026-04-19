import { PrismaClient, ProductStatus, CollectionStatus, Locale } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

async function main() {
  console.log("→ seeding...");

  // Admin
  const adminEmail = "admin@modaralist.com";
  const adminPass = "modaralist-admin-2026"; // prod'da değiştir
  const adminHash = await bcrypt.hash(adminPass, 10);
  await db.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Modaralist Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  });
  console.log(`✓ admin: ${adminEmail} / ${adminPass}`);

  // Colors
  const colors = await Promise.all(
    [
      { code: "ink", hex: "#0a0a0a", nameTr: "Siyah", nameEn: "Ink" },
      { code: "bone", hex: "#f5f2ed", nameTr: "Krem", nameEn: "Bone" },
      { code: "sand", hex: "#d6c9b5", nameTr: "Kum", nameEn: "Sand" },
      { code: "clay", hex: "#8a6e53", nameTr: "Kil", nameEn: "Clay" },
    ].map((c) =>
      db.color.upsert({ where: { code: c.code }, update: {}, create: c })
    )
  );

  // Sizes
  const sizes = await Promise.all(
    ["XS", "S", "M", "L", "XL"].map((code, i) =>
      db.size.upsert({
        where: { code },
        update: {},
        create: { code, sortOrder: i },
      })
    )
  );

  // Categories
  const categoriesData = [
    { slug: "tops", nameTr: "Üst Giyim", nameEn: "Tops" },
    { slug: "bottoms", nameTr: "Alt Giyim", nameEn: "Bottoms" },
    { slug: "dresses", nameTr: "Elbise", nameEn: "Dresses" },
    { slug: "outerwear", nameTr: "Dış Giyim", nameEn: "Outerwear" },
    { slug: "knitwear", nameTr: "Triko", nameEn: "Knitwear" },
  ];
  const categoryMap = new Map<string, string>();
  for (const c of categoriesData) {
    const cat = await db.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        slug: c.slug,
        translations: {
          create: [
            { locale: "tr", name: c.nameTr, slug: c.slug },
            { locale: "en", name: c.nameEn, slug: c.slug },
          ],
        },
      },
    });
    categoryMap.set(c.slug, cat.id);
  }

  // Collection (drop)
  const collection = await db.collection.upsert({
    where: { slug: "ss26-chapter-one" },
    update: {},
    create: {
      slug: "ss26-chapter-one",
      status: CollectionStatus.LIVE,
      startsAt: new Date("2026-03-01T12:00:00Z"),
      endsAt: new Date("2026-06-30T23:59:59Z"),
      heroImageUrl:
        "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2400&q=85",
      themePrimary: "#0a0a0a",
      themeAccent: "#f5f2ed",
      translations: {
        create: [
          {
            locale: "tr",
            name: "SS26 — Birinci Bölüm",
            tagline: "Durgunluğun hareketle buluştuğu yer.",
            description:
              "İlk bölüm. Akıp giden bir sezon değil — bir nefes. Viskon ve keten kumaşlar, ham kesim yakalar, şeffaf katmanlar.",
            slug: "ss26-birinci-bolum",
          },
          {
            locale: "en",
            name: "SS26 — Chapter One",
            tagline: "Where stillness meets movement.",
            description:
              "The first chapter. Not a passing season — a breath. Viscose and linen, raw edges, sheer layers.",
            slug: "ss26-chapter-one",
          },
        ],
      },
    },
  });

  // Products
  const products = [
    {
      slug: "asymetric-drape-top",
      nameTr: "Asimetrik Drape Bluz",
      nameEn: "Asymetric Drape Top",
      descriptionTr:
        "Asimetrik omuz hattı ve doğal düşen drape. İnce ama şeffaf olmayan viskon yapı.",
      descriptionEn:
        "Asymmetric shoulder line, natural drape. Lightweight but not sheer viscose.",
      basePrice: 2490,
      category: "tops",
      images: [
        "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=1400&q=85",
        "https://images.unsplash.com/photo-1495121605193-b116b5b9c5fe?auto=format&fit=crop&w=1400&q=85",
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["ink", "bone"],
    },
    {
      slug: "linen-wide-leg",
      nameTr: "Keten Geniş Paça Pantolon",
      nameEn: "Linen Wide Leg Trousers",
      descriptionTr: "Yüksek bel, geniş kesim, %100 keten.",
      descriptionEn: "High waist, wide leg, 100% linen.",
      basePrice: 1890,
      category: "bottoms",
      images: [
        "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?auto=format&fit=crop&w=1400&q=85",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["bone", "sand"],
    },
    {
      slug: "cotton-slip-dress",
      nameTr: "Pamuklu Slip Elbise",
      nameEn: "Cotton Slip Dress",
      descriptionTr: "Bias kesim pamuklu slip. Spagetti askılar, hafif midi boy.",
      descriptionEn: "Bias-cut cotton slip. Spaghetti straps, midi length.",
      basePrice: 2190,
      category: "dresses",
      images: [
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1400&q=85",
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["ink", "sand"],
    },
    {
      slug: "raw-edge-blazer",
      nameTr: "Ham Kesim Blazer",
      nameEn: "Raw Edge Blazer",
      descriptionTr: "Dikişsiz, ham kesim yakalar. Yünlü-viskon karışımı kumaş.",
      descriptionEn: "Seamless raw edges. Wool-viscose blend.",
      basePrice: 3290,
      category: "outerwear",
      images: [
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&w=1400&q=85",
      ],
      sizes: ["XS", "S", "M", "L", "XL"],
      colors: ["ink", "clay"],
    },
    {
      slug: "knit-column",
      nameTr: "Merino Uzun Triko",
      nameEn: "Merino Column Knit",
      descriptionTr: "Yumuşak merino örgü, yüksek boyun, uzun kesim.",
      descriptionEn: "Soft merino knit, high neck, column silhouette.",
      basePrice: 2790,
      category: "knitwear",
      images: [
        "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1400&q=85",
      ],
      sizes: ["XS", "S", "M", "L"],
      colors: ["bone", "sand", "clay"],
    },
    {
      slug: "wool-overcoat",
      nameTr: "Yün Palto",
      nameEn: "Wool Overcoat",
      descriptionTr: "Uzun yün palto, double-breasted. Drop'un statement parçası.",
      descriptionEn: "Long wool overcoat, double-breasted. The statement piece.",
      basePrice: 4890,
      category: "outerwear",
      images: [
        "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=1400&q=85",
      ],
      sizes: ["S", "M", "L", "XL"],
      colors: ["ink", "clay"],
    },
  ];

  for (const p of products) {
    const existing = await db.product.findUnique({ where: { slug: p.slug } });
    if (existing) continue;

    const created = await db.product.create({
      data: {
        slug: p.slug,
        status: ProductStatus.PUBLISHED,
        publishedAt: new Date(),
        basePrice: p.basePrice,
        taxRate: 20,
        currency: "TRY",
        categoryId: categoryMap.get(p.category),
        translations: {
          create: [
            {
              locale: "tr" as Locale,
              name: p.nameTr,
              description: p.descriptionTr,
              material: "%100 Doğal",
              care: "Yıkama talimatına uyunuz.",
              slug: p.slug,
            },
            {
              locale: "en" as Locale,
              name: p.nameEn,
              description: p.descriptionEn,
              material: "100% Natural",
              care: "Follow care instructions.",
              slug: p.slug,
            },
          ],
        },
        images: {
          create: p.images.map((url, i) => ({
            url,
            alt: p.nameTr,
            sortOrder: i,
            isHover: i === 1,
          })),
        },
        variants: {
          create: p.colors.flatMap((colorCode) =>
            p.sizes.map((sizeCode) => ({
              sku: `${p.slug}-${colorCode}-${sizeCode}`.toUpperCase(),
              sizeId: sizes.find((s) => s.code === sizeCode)!.id,
              colorId: colors.find((c) => c.code === colorCode)!.id,
              stock: Math.floor(Math.random() * 6) + 2,
            }))
          ),
        },
      },
    });

    await db.collectionProduct.create({
      data: { collectionId: collection.id, productId: created.id },
    });
    console.log(`✓ product: ${p.slug}`);
  }

  console.log("✓ seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
