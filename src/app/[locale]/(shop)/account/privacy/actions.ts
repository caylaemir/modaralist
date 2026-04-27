"use server";

import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * KVKK madde 11 — kullanicinin tum verilerini JSON olarak indirir.
 * Sipariş items + addresses + reviews + wishlist + newsletter abonelikleri.
 *
 * Cikti: server action olarak donulemez (sayfa cevabi olur). Bu yuzden
 * bu fonksiyon /api/account/export route'unda cagrilir, oradan donulur.
 * Burada sadece "kullanicinin verisi olusturma" mantigi tutulur.
 */
export async function buildUserDataExport(userId: string) {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      locale: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!user) return null;

  const [orders, addresses, reviews, wishlist, newsletter] = await Promise.all([
    db.order.findMany({
      where: { userId },
      orderBy: { placedAt: "desc" },
      include: {
        items: {
          select: {
            productNameSnapshot: true,
            variantSnapshot: true,
            unitPrice: true,
            quantity: true,
            lineTotal: true,
          },
        },
        addresses: true,
      },
    }),
    db.address.findMany({ where: { userId } }),
    db.review.findMany({
      where: { userId },
      include: { product: { select: { slug: true } } },
    }),
    db.wishlistItem.findMany({
      where: { userId },
      include: { product: { select: { slug: true } } },
    }),
    db.newsletterSubscriber.findFirst({
      where: { email: user.email.toLowerCase() },
    }),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    user,
    orders,
    addresses,
    reviews,
    wishlist,
    newsletterSubscription: newsletter,
  };
}

/**
 * KVKK madde 11 — kullanicinin tum verilerini siler.
 *
 * Tamamen silmek istediklerimiz:
 * - User row + cascading: Account, Session, Address, WishlistItem, Review
 * - NewsletterSubscriber (email match)
 * - CollectionNotify (email match)
 *
 * Yasal sebeple TUTMAMIZ gerekenler:
 * - Order + OrderItem + OrderAddress (Türk Ticaret Kanunu — 10 yil saklama)
 *   Order.userId NULL'a ceker (anonimlestir), email'i 'deleted@modaralist.com'
 *   olarak update et
 * - Payment + Invoice (e-fatura yasal kayit, 10 yil)
 *
 * Yani "data delete" tam silme degil — anonimlestirme + KVKK uyumlu silme.
 */
export async function deleteAccountAction() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Yetkisiz");
  }
  const userId = session.user.id;
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { email: true },
  });
  if (!user) throw new Error("Kullanici bulunamadi");

  await db.$transaction([
    // Order'lari anonimlestir (yasal saklama gerekiyor)
    db.order.updateMany({
      where: { userId },
      data: {
        userId: null,
        email: `deleted-${userId.slice(0, 8)}@modaralist.com`,
        phone: null,
        notes: "Hesap silindi (KVKK).",
      },
    }),
    // Newsletter abonelik sil
    db.newsletterSubscriber.deleteMany({
      where: { email: user.email.toLowerCase() },
    }),
    // Drop notify abonelik sil
    db.collectionNotify.deleteMany({
      where: { email: user.email.toLowerCase() },
    }),
    // User'i sil — cascade ile Account, Session, Address, WishlistItem, Review silinir
    db.user.delete({ where: { id: userId } }),
  ]);

  await signOut({ redirectTo: "/?deleted=1" });
  redirect("/?deleted=1");
}
