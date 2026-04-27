import "server-only";
import crypto from "node:crypto";

/**
 * Cron endpoint Bearer token kontrolu — timing-safe.
 *
 * Neden timing-safe: == ile karsilastirinca eslesen karakter sayisina gore
 * cevap suresi degisir. Saldirgan binlerce istek atip her karakteri tek tek
 * brute-force eder. timingSafeEqual sabit zamanda karsilastirir.
 */
export function verifyCronAuth(authHeader: string | null): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  if (!authHeader) return false;
  const expected = `Bearer ${secret}`;

  // Buffer.byteLength farkli ise direkt reddet (timingSafeEqual ayni uzunluk
  // ister, atilan string'lerin uzunlugu zaten gizli sayilmaz)
  const a = Buffer.from(authHeader);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
