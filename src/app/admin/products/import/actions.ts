"use server";

import { revalidatePath } from "next/cache";
import DOMPurify from "isomorphic-dompurify";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

// CSV'den gelen text alanlarini sanitize eder. Stored XSS koruma:
// kullanici sonradan urun aciklamasini HTML render eden bir yere koyarsa
// (rich text editor, blog excerpt vs.), <script>/<iframe>/on* enjekte
// edilemez. CSV formula injection icin: =/+/-/@ ile baslayan hucreyi
// nötrleyici tek tirnakla başlat.
function sanitize(s: string): string {
  if (!s) return s;
  // CSV formula prefix neutralization (Excel injection koruma)
  const trimmed = s.trim();
  const formulaPrefix = trimmed.length > 0 && /^[=+\-@\t\r]/.test(trimmed);
  const safe = formulaPrefix ? `'${trimmed}` : trimmed;
  // HTML tag/attribute strip — sadece duz metin/temel inline format kalir
  return DOMPurify.sanitize(safe, {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["script", "iframe", "object", "embed", "form", "style"],
    FORBID_ATTR: [
      "onerror",
      "onload",
      "onclick",
      "onmouseover",
      "onfocus",
      "onblur",
      "onchange",
      "onsubmit",
    ],
  });
}

/**
 * CSV satirlarini parse edip db'ye yazar — toplu urun import.
 *
 * Beklenen format (1. satir header):
 *   slug,categorySlug,basePrice,discountPrice,status,trName,enName,
 *   trDescription,enDescription,trMaterial,enMaterial,trCare,enCare,images
 *
 * - status default DRAFT (publish'i admin sonra yapar)
 * - discountPrice bos olabilir
 * - categorySlug zorunlu (bos olursa reddedilir)
 * - images: pipe-separated URL'ler (https://a.jpg|https://b.jpg)
 * - trName/enName zorunlu, digerleri opsiyonel
 *
 * Slug zaten varsa o satir SKIP edilir (idempotent — ayni dosyayi
 * tekrar yuklemek hata vermez, sadece yeni urunleri ekler).
 */

type ImportRow = {
  slug: string;
  categorySlug: string;
  basePrice: string;
  discountPrice: string;
  status: string;
  trName: string;
  enName: string;
  trDescription: string;
  enDescription: string;
  trMaterial: string;
  enMaterial: string;
  trCare: string;
  enCare: string;
  images: string;
};

export type ImportResult = {
  total: number;
  created: number;
  skipped: number;
  errors: { row: number; message: string }[];
};

// Basit CSV parser — virgulle ayrilmis, tirnakli alanlari destekler.
// Karmasik kacis (escape) durumlari icin papaparse kullanmadik;
// admin kontrollu CSV oldugu icin minimum viable parser yetiyor.
function parseCsv(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  return lines.map((line) => {
    const cells: string[] = [];
    let current = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const c = line[i];
      if (c === '"') {
        if (inQuotes && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (c === "," && !inQuotes) {
        cells.push(current);
        current = "";
      } else {
        current += c;
      }
    }
    cells.push(current);
    return cells.map((s) => s.trim());
  });
}

export async function importProductsAction(
  csvText: string
): Promise<ImportResult> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    throw new Error("Yetkisiz");
  }

  const rows = parseCsv(csvText);
  if (rows.length < 2) {
    throw new Error("CSV bos veya sadece header");
  }

  const header = rows[0].map((h) => h.toLowerCase().trim());
  const required = ["slug", "categoryslug", "baseprice", "trname", "enname"];
  for (const r of required) {
    if (!header.includes(r)) {
      throw new Error(`Eksik kolon: ${r}`);
    }
  }

  const idx = (key: string) => header.indexOf(key.toLowerCase());
  const result: ImportResult = {
    total: rows.length - 1,
    created: 0,
    skipped: 0,
    errors: [],
  };

  // Kategorileri onbellekle (her satirda tekrar sorgulama)
  const categories = await db.category.findMany({
    select: { id: true, slug: true },
  });
  const catBySlug = new Map(categories.map((c) => [c.slug, c.id]));

  for (let r = 1; r < rows.length; r++) {
    const cells = rows[r];
    try {
      const row: ImportRow = {
        slug: cells[idx("slug")] ?? "",
        categorySlug: cells[idx("categoryslug")] ?? "",
        basePrice: cells[idx("baseprice")] ?? "",
        discountPrice: idx("discountprice") >= 0 ? (cells[idx("discountprice")] ?? "") : "",
        status: idx("status") >= 0 ? (cells[idx("status")] ?? "DRAFT") : "DRAFT",
        trName: cells[idx("trname")] ?? "",
        enName: cells[idx("enname")] ?? "",
        trDescription: idx("trdescription") >= 0 ? (cells[idx("trdescription")] ?? "") : "",
        enDescription: idx("endescription") >= 0 ? (cells[idx("endescription")] ?? "") : "",
        trMaterial: idx("trmaterial") >= 0 ? (cells[idx("trmaterial")] ?? "") : "",
        enMaterial: idx("enmaterial") >= 0 ? (cells[idx("enmaterial")] ?? "") : "",
        trCare: idx("trcare") >= 0 ? (cells[idx("trcare")] ?? "") : "",
        enCare: idx("encare") >= 0 ? (cells[idx("encare")] ?? "") : "",
        images: idx("images") >= 0 ? (cells[idx("images")] ?? "") : "",
      };

      if (!row.slug || !/^[a-z0-9-]+$/.test(row.slug)) {
        result.errors.push({
          row: r + 1,
          message: "Slug eksik veya gecersiz (sadece kucuk harf/rakam/tire)",
        });
        continue;
      }

      const categoryId = catBySlug.get(row.categorySlug);
      if (!categoryId) {
        result.errors.push({
          row: r + 1,
          message: `Kategori bulunamadi: ${row.categorySlug}`,
        });
        continue;
      }

      const basePrice = Number(row.basePrice);
      if (!Number.isFinite(basePrice) || basePrice < 0) {
        result.errors.push({
          row: r + 1,
          message: `Gecersiz fiyat: ${row.basePrice}`,
        });
        continue;
      }
      const discountPrice = row.discountPrice
        ? Number(row.discountPrice)
        : null;

      const existing = await db.product.findUnique({
        where: { slug: row.slug },
        select: { id: true },
      });
      if (existing) {
        result.skipped++;
        continue;
      }

      const status = ["DRAFT", "PUBLISHED", "ARCHIVED", "COMING_SOON"].includes(
        row.status.toUpperCase()
      )
        ? (row.status.toUpperCase() as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "COMING_SOON")
        : "DRAFT";

      const imageUrls = row.images
        ? row.images.split("|").map((u) => u.trim()).filter(Boolean)
        : [];

      await db.product.create({
        data: {
          slug: row.slug,
          status,
          categoryId,
          basePrice,
          discountPrice,
          translations: {
            create: [
              {
                locale: "tr",
                name: sanitize(row.trName) || row.slug,
                slug: row.slug,
                description: row.trDescription ? sanitize(row.trDescription) : null,
                material: row.trMaterial ? sanitize(row.trMaterial) : null,
                care: row.trCare ? sanitize(row.trCare) : null,
              },
              {
                locale: "en",
                name: sanitize(row.enName) || sanitize(row.trName) || row.slug,
                slug: row.slug,
                description: row.enDescription ? sanitize(row.enDescription) : null,
                material: row.enMaterial ? sanitize(row.enMaterial) : null,
                care: row.enCare ? sanitize(row.enCare) : null,
              },
            ],
          },
          images:
            imageUrls.length > 0
              ? {
                  create: imageUrls.map((url, i) => ({
                    url,
                    sortOrder: i,
                    isHover: i === 1,
                  })),
                }
              : undefined,
        },
      });
      result.created++;
    } catch (err) {
      result.errors.push({
        row: r + 1,
        message: err instanceof Error ? err.message : "Bilinmeyen hata",
      });
    }
  }

  revalidatePath("/admin/products");
  return result;
}
