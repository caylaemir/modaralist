"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { OrderStatus } from "@prisma/client";
import {
  updateOrderStatus,
  setShipmentTracking,
  cancelOrder,
  refundOrder,
} from "@/server/actions/orders";
import { ORDER_STATUS_LABELS, ORDER_STATUS_OPTIONS } from "../_lib";

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
  currentTracking: {
    carrier: string | null;
    trackingNumber: string | null;
    trackingUrl: string | null;
  } | null;
};

export function ActionsPanel({ orderId, currentStatus, currentTracking }: Props) {
  const [pending, startTransition] = useTransition();

  const [status, setStatus] = useState<OrderStatus>(currentStatus);
  const [note, setNote] = useState("");

  const [carrier, setCarrier] = useState(currentTracking?.carrier ?? "");
  const [trackingNumber, setTrackingNumber] = useState(
    currentTracking?.trackingNumber ?? ""
  );
  const [trackingUrl, setTrackingUrl] = useState(
    currentTracking?.trackingUrl ?? ""
  );

  function handleStatusSave() {
    startTransition(async () => {
      try {
        await updateOrderStatus(orderId, status, note || undefined);
        setNote("");
        toast.success("Sipariş durumu güncellendi.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Bir hata oluştu."
        );
      }
    });
  }

  function handleTrackingSave() {
    if (!carrier.trim() || !trackingNumber.trim()) {
      toast.error("Kargo firması ve takip numarası zorunlu.");
      return;
    }
    startTransition(async () => {
      try {
        await setShipmentTracking(orderId, {
          carrier: carrier.trim(),
          trackingNumber: trackingNumber.trim(),
          trackingUrl: trackingUrl.trim() || null,
        });
        toast.success("Kargo bilgisi kaydedildi.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Bir hata oluştu."
        );
      }
    });
  }

  function handleCancel() {
    if (!confirm("Bu siparişi iptal etmek istediğinize emin misiniz?")) return;
    const reason = prompt("İptal sebebi (opsiyonel):") ?? undefined;
    startTransition(async () => {
      try {
        await cancelOrder(orderId, reason || undefined);
        toast.success("Sipariş iptal edildi.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Bir hata oluştu."
        );
      }
    });
  }

  function handleRefund() {
    if (!confirm("Bu sipariş için iade başlatmak istediğinize emin misiniz?"))
      return;
    const reason = prompt("İade sebebi (opsiyonel):") ?? undefined;
    startTransition(async () => {
      try {
        await refundOrder(orderId, reason || undefined);
        toast.success("İade başlatıldı.");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Bir hata oluştu."
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded border border-line bg-paper p-5">
        <h3 className="caps-wide text-xs">Durum Güncelle</h3>
        <div className="mt-4 space-y-3">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
            className="w-full rounded border border-line bg-paper px-3 py-2 text-sm"
            disabled={pending}
          >
            {ORDER_STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {ORDER_STATUS_LABELS[s]}
              </option>
            ))}
          </select>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Not (opsiyonel)"
            rows={2}
            className="w-full rounded border border-line bg-paper px-3 py-2 text-sm"
            disabled={pending}
          />
          <button
            type="button"
            onClick={handleStatusSave}
            disabled={pending}
            className="w-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </section>

      <section className="rounded border border-line bg-paper p-5">
        <h3 className="caps-wide text-xs">Kargo Takip</h3>
        <div className="mt-4 space-y-3">
          <div>
            <label className="eyebrow mb-1 block text-mist">Firma</label>
            <input
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
              placeholder="Yurtiçi / Aras / MNG"
              className="w-full rounded border border-line bg-paper px-3 py-2 text-sm"
              disabled={pending}
            />
          </div>
          <div>
            <label className="eyebrow mb-1 block text-mist">Takip No</label>
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="123456789"
              className="w-full rounded border border-line bg-paper px-3 py-2 text-sm"
              disabled={pending}
            />
          </div>
          <div>
            <label className="eyebrow mb-1 block text-mist">
              Takip URL (ops.)
            </label>
            <input
              value={trackingUrl}
              onChange={(e) => setTrackingUrl(e.target.value)}
              placeholder="https://..."
              className="w-full rounded border border-line bg-paper px-3 py-2 text-sm"
              disabled={pending}
            />
          </div>
          <button
            type="button"
            onClick={handleTrackingSave}
            disabled={pending}
            className="w-full bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
          >
            Kaydet
          </button>
        </div>
      </section>

      <section className="rounded border border-line bg-paper p-5">
        <h3 className="caps-wide text-xs">Tehlikeli Bölge</h3>
        <div className="mt-4 space-y-2">
          <button
            type="button"
            onClick={handleCancel}
            disabled={pending}
            className="w-full border border-line px-4 py-2 text-sm disabled:opacity-50"
          >
            İptal Et
          </button>
          <button
            type="button"
            onClick={handleRefund}
            disabled={pending}
            className="w-full border border-line px-4 py-2 text-sm disabled:opacity-50"
          >
            İade Başlat
          </button>
        </div>
      </section>
    </div>
  );
}
