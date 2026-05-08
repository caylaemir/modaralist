/**
 * Bir tarih icin sezonun slug'ini doner.
 * Mart-Mayis -> ilkbahar
 * Haziran-Agustos -> yaz
 * Eylul-Kasim -> sonbahar
 * Aralik-Subat -> kis (yili: Aralik => bu yil, Ocak/Subat => onceki yil)
 *
 * Admin urun eklerken koleksiyon secmezse default olarak bu kullanilir
 * (server-side createProduct/updateProduct mantigi).
 */
export function seasonalCollectionSlugForDate(date: Date): string {
  const month = date.getMonth() + 1; // 1-12
  const year = date.getFullYear();

  if (month >= 3 && month <= 5) return `ilkbahar-${year}`;
  if (month >= 6 && month <= 8) return `yaz-${year}`;
  if (month >= 9 && month <= 11) return `sonbahar-${year}`;
  // Aralik-Subat
  if (month === 12) return `kis-${year}`;
  // Ocak / Subat: bir onceki kis
  return `kis-${year - 1}`;
}
