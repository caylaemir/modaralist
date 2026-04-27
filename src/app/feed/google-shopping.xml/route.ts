import { NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Google Merchant Center / Google Shopping urun feed'i.
 *
 * Format: RSS 2.0 + g: namespace (Google Shopping spec)
 * Docs: https://support.google.com/merchants/answer/7052112
 *
 * Setup:
 *  1. https://merchants.google.com 'a kayit ol (ucretsiz)
 *  2. Sitenizi ekleyin (modaralist.shop) — Search Console verification
 *  3. Products > Add products > Feed > Scheduled fetch
 *  4. URL: https://modaralist.shop/feed/google-shopping.xml
 *  5. Frequency: daily
 *  6. Onay sonrasi urunler Google Shopping'de listelenir (UCRETSIZ)
 *
 * Cron olarak Google bu URL'i gunde 1 kez ceker. Biz dinamik render
 * ediyoruz, her cek sirasinda DB'den fresh veri.
 *
 * Cache: 6 saat (urun degisikligi 6 saatte bir guncellenir — Google ne
 * olursa olsun gunde 1x cektigi icin yeterli, sunucu yuk dusuk)
 */
export const revalidate = 21600;

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";
const BRAND = "Modaralist";

// XML special chars escape
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const products = await db.product.findMany({
    where: { status: "PUBLISHED" },
    include: {
      translations: { where: { locale: "tr" } },
      images: { orderBy: { sortOrder: "asc" }, take: 5 },
      variants: {
        where: { isActive: true },
        include: { color: true, size: true },
      },
      category: { include: { translations: { where: { locale: "tr" } } } },
    },
  });

  const now = new Date().toUTCString();
  const items: string[] = [];

  for (const p of products) {
    const tr = p.translations[0];
    if (!tr) continue;
    const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
    const availability = totalStock > 0 ? "in stock" : "out of stock";
    const price = Number(p.basePrice).toFixed(2);
    const salePrice = p.discountPrice ? Number(p.discountPrice).toFixed(2) : null;
    const mainImage = p.images[0]?.url ?? "";
    const additionalImages = p.images.slice(1, 5).map((i) => i.url);
    const link = `${BASE}/tr/products/${p.slug}`;
    const description = (tr.description ?? tr.name ?? p.slug)
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 5000);
    const categoryName = p.category?.translations[0]?.name ?? "Apparel";

    // Google Product Categories (taxonomy) — giyim icin standart
    // https://www.google.com/basepages/producttype/taxonomy.tr-TR.txt
    // 'Giyim ve Aksesuar > Giyim' = 1604
    const googleCategory = "Giyim ve Aksesuar &gt; Giyim";

    items.push(`    <item>
      <g:id>${esc(p.slug)}</g:id>
      <g:title>${esc(tr.name)}</g:title>
      <g:description>${esc(description)}</g:description>
      <g:link>${esc(link)}</g:link>
      <g:image_link>${esc(mainImage)}</g:image_link>${additionalImages
        .map((url) => `\n      <g:additional_image_link>${esc(url)}</g:additional_image_link>`)
        .join("")}
      <g:availability>${availability}</g:availability>
      <g:price>${price} TRY</g:price>${
        salePrice
          ? `\n      <g:sale_price>${salePrice} TRY</g:sale_price>`
          : ""
      }
      <g:brand>${BRAND}</g:brand>
      <g:condition>new</g:condition>
      <g:identifier_exists>no</g:identifier_exists>
      <g:google_product_category>${googleCategory}</g:google_product_category>
      <g:product_type>${esc(categoryName)}</g:product_type>
      <g:shipping>
        <g:country>TR</g:country>
        <g:service>Standard</g:service>
        <g:price>0 TRY</g:price>
      </g:shipping>
    </item>`);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Modaralist — Streetwear &amp; Casual</title>
    <link>${BASE}</link>
    <description>Modaralist Marmara bölgesi premium streetwear ürün feed'i.</description>
    <language>tr-TR</language>
    <lastBuildDate>${now}</lastBuildDate>
${items.join("\n")}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=21600, s-maxage=21600",
    },
  });
}
