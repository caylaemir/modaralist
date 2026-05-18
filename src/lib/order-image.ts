/**
 * Bir order item icin gosterilecek urun gorselini sec.
 * Oncelik: 1) o varyantin renginin gorseli, 2) renksiz/genel gorsel,
 * 3) urunun ilk gorseli. Hicbiri yoksa null.
 *
 * Hem server hem client component'ten cagrilabilir (saf fonksiyon, DB yok).
 */
export function pickOrderItemImage(
  images: { url: string; colorId: string | null }[],
  variantColorId: string | null
): string | null {
  if (variantColorId) {
    const m = images.find((i) => i.colorId === variantColorId);
    if (m) return m.url;
  }
  const shared = images.find((i) => i.colorId === null);
  if (shared) return shared.url;
  return images[0]?.url ?? null;
}
