import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Indirim gecerli mi? — discountPrice null degil, > 0, ve basePrice'den dusuk.
 * (Admin form discountPrice'i bazen 0 olarak kaydediyor; 0 indirim degil.)
 */
export function hasValidDiscount(
  basePrice: number,
  discountPrice: number | null | undefined
): boolean {
  if (discountPrice == null) return false;
  if (discountPrice <= 0) return false;
  if (discountPrice >= basePrice) return false;
  return true;
}

/**
 * Sepete eklenen / gosterimde kullanilan etkin fiyat.
 * Indirim gecerli ise discountPrice, degilse basePrice.
 */
export function effectivePrice(
  basePrice: number,
  discountPrice: number | null | undefined
): number {
  return hasValidDiscount(basePrice, discountPrice) ? discountPrice! : basePrice;
}

export function formatPrice(
  amount: number,
  locale: "tr" | "en" = "tr",
  currency: "TRY" | "USD" | "EUR" = "TRY"
) {
  return new Intl.NumberFormat(locale === "tr" ? "tr-TR" : "en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ş/g, "s")
    .replace(/ç/g, "c")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
