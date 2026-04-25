/**
 * TR'ye ozel validation + format helper'lari.
 * UI ve server-side beraber kullanir.
 */

/**
 * TC kimlik no algoritma kontrol — 11 haneli sayi + checksum.
 * Algoritma: ilk 9 hane belirli toplam ile 10. ve 11. haneyi belirler.
 */
export function isValidTCNo(raw: string): boolean {
  const tc = raw.replace(/\D/g, "");
  if (tc.length !== 11) return false;
  if (tc[0] === "0") return false;

  const digits = tc.split("").map(Number);
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  const tenth = (oddSum * 7 - evenSum) % 10;
  if (tenth < 0 || tenth !== digits[9]) return false;

  const eleventh = (oddSum + evenSum + digits[9]) % 10;
  return eleventh === digits[10];
}

/**
 * Telefon — TR formatına normalize. Girdi: "5551234567", "05551234567",
 * "+905551234567", "(555) 123 45 67" gibi. Cikti: "+90 555 123 45 67"
 * ya da invalid icin null.
 */
export function formatTRPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local = digits;
  if (local.startsWith("90")) local = local.slice(2);
  if (local.startsWith("0")) local = local.slice(1);
  if (local.length !== 10) return null;
  if (!local.startsWith("5")) return null; // mobil hat 5 ile başlar
  return `+90 ${local.slice(0, 3)} ${local.slice(3, 6)} ${local.slice(6, 8)} ${local.slice(8, 10)}`;
}

export function isValidTRPhone(raw: string): boolean {
  return formatTRPhone(raw) !== null;
}

/**
 * Kart numarası — gruplara ayır (4-4-4-4). Luhn kontrolu de yapar.
 */
export function formatCardNumber(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

export function isValidCardNumber(raw: string): boolean {
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  // Luhn algoritması
  let sum = 0;
  let alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    alt = !alt;
  }
  return sum % 10 === 0;
}

/** Email basit regex */
export function isValidEmail(raw: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw);
}

/** Posta kodu — TR 5 hane */
export function isValidTRZip(raw: string): boolean {
  return /^\d{5}$/.test(raw.replace(/\s/g, ""));
}
