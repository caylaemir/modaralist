"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

async function requireStaff() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    throw new Error("Yetkisiz");
  }
}

export async function setReviewStatusAction(
  id: string,
  status: "APPROVED" | "REJECTED" | "PENDING"
): Promise<{ ok: boolean }> {
  await requireStaff();
  await db.review.update({
    where: { id },
    data: { status },
  });
  revalidatePath("/admin/reviews");
  return { ok: true };
}

export async function deleteReviewAction(id: string): Promise<{ ok: boolean }> {
  await requireStaff();
  await db.review.delete({ where: { id } });
  revalidatePath("/admin/reviews");
  return { ok: true };
}
