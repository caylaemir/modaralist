"use client";

import { useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import type { CouponType } from "@prisma/client";
import {
  createCouponAction,
  updateCouponAction,
  deleteCouponAction,
} from "../actions";

export type CouponFormValues = {
  id?: string;
  code: string;
  type: CouponType;
  value: string;
  minSubtotal: string;
  maxUses: string;
  perUserLimit: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
};

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENT: "Yüzde (%)",
  FIXED: "Sabit tutar (₺)",
  FREE_SHIPPING: "Ücretsiz kargo",
};

export function CouponForm({ initial }: { initial: CouponFormValues }) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!initial.id;

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = isEdit
        ? await updateCouponAction(initial.id!, formData)
        : await createCouponAction(formData);
      if (res?.ok === false) {
        toast.error(res.error ?? "Kaydedilemedi.");
      } else if (isEdit) {
        toast.success("Güncellendi.");
      }
    });
  }

  function onDelete() {
    if (!initial.id) return;
    if (!confirm(`"${initial.code}" kuponunu sil?`)) return;
    startTransition(async () => {
      await deleteCouponAction(initial.id!);
    });
  }

  return (
    <form action={onSubmit} className="space-y-16">
      <section>
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — kod
          </p>
          <h2 className="display mt-3 text-3xl leading-none">Kupon</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Kod
            </label>
            <input
              name="code"
              defaultValue={initial.code}
              required
              minLength={3}
              maxLength={32}
              className="mt-2 w-full border-b border-line bg-transparent py-2 font-mono text-sm uppercase outline-none focus:border-ink"
              placeholder="DROP01"
            />
            <p className="mt-1 text-[11px] text-mist">
              Büyük harfe dönüştürülür. Müşteri checkout&apos;ta bu kodu girer.
            </p>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Tip
            </label>
            <select
              name="type"
              defaultValue={initial.type}
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            >
              {(Object.keys(TYPE_LABEL) as CouponType[]).map((t) => (
                <option key={t} value={t}>
                  {TYPE_LABEL[t]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Değer
            </label>
            <input
              name="value"
              defaultValue={initial.value}
              type="text"
              inputMode="decimal"
              required
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
              placeholder="10"
            />
            <p className="mt-1 text-[11px] text-mist">
              Yüzde için 10 = %10. Sabit için ₺ cinsinden. Ücretsiz kargoda 0
              bırak.
            </p>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Min sepet tutarı (₺)
            </label>
            <input
              name="minSubtotal"
              defaultValue={initial.minSubtotal}
              type="text"
              inputMode="decimal"
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
              placeholder="opsiyonel"
            />
          </div>
        </div>
      </section>

      <section>
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — limit
          </p>
          <h2 className="display mt-3 text-3xl leading-none">Kullanım</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Toplam kullanım limiti
            </label>
            <input
              name="maxUses"
              defaultValue={initial.maxUses}
              type="text"
              inputMode="numeric"
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
              placeholder="opsiyonel — boş=sınırsız"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Kullanıcı başı limit
            </label>
            <input
              name="perUserLimit"
              defaultValue={initial.perUserLimit}
              type="text"
              inputMode="numeric"
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
              placeholder="opsiyonel"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Başlangıç
            </label>
            <input
              name="startsAt"
              defaultValue={initial.startsAt}
              type="datetime-local"
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Bitiş
            </label>
            <input
              name="endsAt"
              defaultValue={initial.endsAt}
              type="datetime-local"
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
          </div>
          <label className="flex items-start gap-4 md:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial.isActive}
              className="mt-1 size-4 appearance-none border border-line bg-paper checked:border-ink checked:bg-ink"
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em]">Aktif</p>
              <p className="mt-1 text-xs text-mist">
                Pasif iken checkout&apos;ta reddedilir.
              </p>
            </div>
          </label>
        </div>
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between border border-line bg-paper px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/coupons"
            className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            ← Kuponlar
          </Link>
          {isEdit ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="text-[11px] uppercase tracking-[0.3em] text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Sil
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          <span>{pending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Oluştur"}</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}
