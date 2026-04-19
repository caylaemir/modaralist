import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";

// Kargo scripti bu endpoint'e istek atacak.
// Header: x-shipping-secret
// Body: { orderNumber, trackingNumber, carrier, status, trackingUrl? }

const bodySchema = z.object({
  orderNumber: z.string(),
  trackingNumber: z.string().optional(),
  carrier: z.string(),
  trackingUrl: z.string().url().optional(),
  status: z.enum([
    "PENDING",
    "LABEL_CREATED",
    "IN_TRANSIT",
    "DELIVERED",
    "RETURNED",
  ]),
});

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-shipping-secret");
  if (!secret || secret !== process.env.SHIPPING_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const json = await req.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid payload", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { orderNumber, trackingNumber, carrier, trackingUrl, status } =
    parsed.data;

  const order = await db.order.findUnique({ where: { orderNumber } });
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  await db.shipment.upsert({
    where: { id: `${order.id}-default` }, // pratik olarak ilk shipment
    update: {
      trackingNumber,
      carrier,
      trackingUrl,
      status,
      ...(status === "IN_TRANSIT" ? { shippedAt: new Date() } : {}),
      ...(status === "DELIVERED" ? { deliveredAt: new Date() } : {}),
    },
    create: {
      id: `${order.id}-default`,
      orderId: order.id,
      carrier,
      trackingNumber,
      trackingUrl,
      status,
    },
  });

  await db.order.update({
    where: { id: order.id },
    data: {
      shippingStatus: status,
      ...(status === "DELIVERED" ? { status: "DELIVERED" } : {}),
      ...(status === "IN_TRANSIT" && order.status === "PREPARING"
        ? { status: "SHIPPED" }
        : {}),
    },
  });

  return NextResponse.json({ ok: true });
}
