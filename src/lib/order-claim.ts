import { db } from "@/lib/db";

export function normalizeOrderEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function claimGuestOrdersForUser(args: {
  userId: string;
  email: string | null | undefined;
}) {
  const email = args.email ? normalizeOrderEmail(args.email) : "";
  if (!email) return { count: 0 };

  return db.order.updateMany({
    where: {
      userId: null,
      email: { equals: email, mode: "insensitive" },
    },
    data: { userId: args.userId },
  });
}
