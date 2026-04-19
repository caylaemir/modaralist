"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

async function requireStaff() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Oturum açmanız gerekiyor.");
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    throw new Error("Bu işlem için yetkiniz yok.");
  }
  return session.user;
}

/**
 * KVKK uyumlu anonimleştirme.
 * Kullanıcıyı silmek yerine kimlik bilgilerini temizler,
 * sipariş geçmişi korunur (muhasebe / garanti için).
 */
export async function anonymizeCustomer(userId: string) {
  await requireStaff();

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new Error("Müşteri bulunamadı.");
  }
  if (user.role !== "CUSTOMER") {
    throw new Error("Sadece müşteri hesapları anonimleştirilebilir.");
  }

  const anonEmail = `deleted-${user.id}@anonymized.local`;

  await db.$transaction(async (tx) => {
    await tx.address.deleteMany({ where: { userId } });
    await tx.account.deleteMany({ where: { userId } });
    await tx.session.deleteMany({ where: { userId } });
    await tx.user.update({
      where: { id: userId },
      data: {
        email: anonEmail,
        passwordHash: null,
        name: "(silindi)",
        phone: null,
        image: null,
        emailVerified: null,
      },
    });
  });

  revalidatePath("/admin/customers");
  revalidatePath(`/admin/customers/${userId}`);
  return { ok: true };
}
