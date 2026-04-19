"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { OrderStatus, ShipmentStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

// ---------- Auth guard ----------

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

// ---------- Schemas ----------

const orderStatusEnum = z.enum([
  "PENDING",
  "PAID",
  "PREPARING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
]);

const trackingSchema = z.object({
  carrier: z.string().min(1, "Kargo firması zorunlu"),
  trackingNumber: z.string().min(1, "Takip numarası zorunlu"),
  trackingUrl: z.string().url().optional().or(z.literal("")).nullable(),
});

// ---------- Actions ----------

export async function updateOrderStatus(
  orderId: string,
  newStatus: z.infer<typeof orderStatusEnum>,
  note?: string
) {
  const user = await requireStaff();

  const parsedStatus = orderStatusEnum.parse(newStatus);

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: parsedStatus as OrderStatus },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: parsedStatus as OrderStatus,
        note: note?.trim() || null,
        changedBy: user.email ?? user.id,
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function setShipmentTracking(
  orderId: string,
  input: z.infer<typeof trackingSchema>
) {
  const user = await requireStaff();

  const parsed = trackingSchema.parse(input);

  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { shipments: true },
  });
  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }

  const trackingUrl =
    parsed.trackingUrl && parsed.trackingUrl.length > 0
      ? parsed.trackingUrl
      : null;

  const existing = order.shipments[0];

  await db.$transaction(async (tx) => {
    if (existing) {
      await tx.shipment.update({
        where: { id: existing.id },
        data: {
          carrier: parsed.carrier,
          trackingNumber: parsed.trackingNumber,
          trackingUrl,
          status: ShipmentStatus.IN_TRANSIT,
          shippedAt: existing.shippedAt ?? new Date(),
        },
      });
    } else {
      await tx.shipment.create({
        data: {
          orderId,
          carrier: parsed.carrier,
          trackingNumber: parsed.trackingNumber,
          trackingUrl,
          status: ShipmentStatus.IN_TRANSIT,
          shippedAt: new Date(),
        },
      });
    }

    const nextOrderStatus: OrderStatus =
      order.status === OrderStatus.DELIVERED ||
      order.status === OrderStatus.CANCELLED ||
      order.status === OrderStatus.REFUNDED
        ? order.status
        : OrderStatus.SHIPPED;

    await tx.order.update({
      where: { id: orderId },
      data: {
        shippingStatus: ShipmentStatus.IN_TRANSIT,
        status: nextOrderStatus,
      },
    });

    if (order.status !== nextOrderStatus) {
      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: nextOrderStatus,
          note: `Kargo takip numarası girildi: ${parsed.carrier} ${parsed.trackingNumber}`,
          changedBy: user.email ?? user.id,
        },
      });
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function cancelOrder(orderId: string, reason?: string) {
  const user = await requireStaff();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }
  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("Sipariş zaten iptal edilmiş.");
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: { status: OrderStatus.CANCELLED },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: OrderStatus.CANCELLED,
        note: reason?.trim() || "Admin tarafından iptal edildi",
        changedBy: user.email ?? user.id,
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

export async function refundOrder(orderId: string, reason?: string) {
  const user = await requireStaff();

  const order = await db.order.findUnique({ where: { id: orderId } });
  if (!order) {
    throw new Error("Sipariş bulunamadı.");
  }
  if (order.status === OrderStatus.REFUNDED) {
    throw new Error("Sipariş zaten iade edilmiş.");
  }

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.REFUNDED,
        paymentStatus: "REFUNDED",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        fromStatus: order.status,
        toStatus: OrderStatus.REFUNDED,
        note: reason?.trim() || "Admin tarafından iade başlatıldı",
        changedBy: user.email ?? user.id,
      },
    });
  });

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
