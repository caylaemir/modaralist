import { NextRequest, NextResponse } from "next/server";
import crypto from "node:crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendShipmentUpdateEmail } from "@/lib/order-emails";

// Kargo scripti bu endpoint'e istek atacak.
// Header: x-shipping-secret
// Body: { orderNumber, trackingNumber, carrier, status, trackingUrl? }

// Sabit zamanli karsilastirma — `!==` eslesen karakter sayisina gore sure
// degistirir, bu da gizli token'in karakter karakter brute-force'una izin verir.
function secretMatches(provided: string | null, expected: string | undefined): boolean {
  if (!expected || !provided) return false;
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

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
  if (!secretMatches(req.headers.get("x-shipping-secret"), process.env.SHIPPING_WEBHOOK_SECRET)) {
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

  const order = await db.order.findUnique({
    where: { orderNumber },
    include: { shipments: true },
  });
  if (!order) {
    return NextResponse.json({ error: "order not found" }, { status: 404 });
  }

  const existing = order.shipments.find((s) => s.id === `${order.id}-default`);
  const shouldNotify =
    status === "IN_TRANSIT" &&
    Boolean(trackingNumber) &&
    (!existing ||
      existing.status !== "IN_TRANSIT" ||
      existing.carrier !== carrier ||
      existing.trackingNumber !== trackingNumber ||
      (existing.trackingUrl ?? null) !== (trackingUrl ?? null));

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

  if (shouldNotify && trackingNumber) {
    try {
      await sendShipmentUpdateEmail({
        orderId: order.id,
        carrier,
        trackingNumber,
        trackingUrl,
      });
    } catch (err) {
      console.error("[shipping-webhook] shipment email failed", err);
    }
  }

  return NextResponse.json({ ok: true });
}
