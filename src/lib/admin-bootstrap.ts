import "server-only";
import { db } from "@/lib/db";

/**
 * Cinsiyet etiketleri (kadin/erkek/unisex) yoksa otomatik yarat.
 * Admin urun formunda 'Cinsiyet' radio'su her zaman calissin diye
 * — tag setup'i blocker olmasin.
 *
 * Idempotent: var olan kayitlari ezmez.
 * Cagrildigi yerler: admin/products/new + admin/products/[id]
 */
export async function ensureGenderTags() {
  const codes = [
    { code: "kadin", labelTr: "Kadın", labelEn: "Women" },
    { code: "erkek", labelTr: "Erkek", labelEn: "Men" },
    { code: "unisex", labelTr: "Unisex", labelEn: "Unisex" },
  ];
  await Promise.all(
    codes.map((c) =>
      db.productTag.upsert({
        where: { code: c.code },
        update: {},
        create: c,
      })
    )
  );
}
