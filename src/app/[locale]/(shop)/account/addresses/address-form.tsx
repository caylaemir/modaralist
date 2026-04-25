"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { CityInput } from "@/components/shop/city-input";
import {
  createAddressAction,
  updateAddressAction,
  deleteAddressAction,
  setDefaultAddressAction,
} from "../actions";

export type AddressValues = {
  id?: string;
  title: string;
  fullName: string;
  phone: string;
  city: string;
  district: string;
  street: string;
  zip: string;
  isDefault: boolean;
};

export function AddressFormPanel({
  initial,
  onClose,
}: {
  initial: AddressValues;
  onClose: () => void;
}) {
  const [city, setCity] = useState(initial.city);
  const [pending, startTransition] = useTransition();
  const isEdit = !!initial.id;

  function onSubmit(formData: FormData) {
    formData.set("city", city);
    startTransition(async () => {
      const res = isEdit
        ? await updateAddressAction(initial.id!, formData)
        : await createAddressAction(formData);
      if (res.ok) {
        toast.success(isEdit ? "Adres güncellendi." : "Adres eklendi.");
        onClose();
      } else {
        toast.error(res.error ?? "Kaydedilemedi.");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-5 border border-line bg-paper p-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">Etiket</label>
        <input
          name="title"
          defaultValue={initial.title}
          placeholder="Ev, ofis, vs (opsiyonel)"
          className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">Ad Soyad</label>
        <input
          name="fullName"
          defaultValue={initial.fullName}
          required
          minLength={2}
          className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">Telefon</label>
        <input
          name="phone"
          defaultValue={initial.phone}
          required
          type="tel"
          className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">İl</label>
        <div className="mt-2">
          <CityInput
            name="city-display"
            value={city}
            onChange={setCity}
            required
          />
        </div>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">İlçe</label>
        <input
          name="district"
          defaultValue={initial.district}
          required
          className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
        />
      </div>
      <div className="md:col-span-2">
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">Açık adres</label>
        <textarea
          name="street"
          defaultValue={initial.street}
          required
          minLength={5}
          rows={2}
          className="mt-2 w-full resize-y border-b border-line bg-transparent py-2 outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">Posta kodu</label>
        <input
          name="zip"
          defaultValue={initial.zip}
          className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
        />
      </div>
      <label className="flex items-center gap-3 md:col-span-2">
        <input
          type="checkbox"
          name="isDefault"
          defaultChecked={initial.isDefault}
          className="size-4 appearance-none border border-line bg-paper checked:border-ink checked:bg-ink"
        />
        <span className="text-sm">Varsayılan adres olsun</span>
      </label>
      <div className="flex items-center gap-4 md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Adres Ekle"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          Vazgeç
        </button>
      </div>
    </form>
  );
}

export function AddressItemActions({
  id,
  isDefault,
  onEdit,
}: {
  id: string;
  isDefault: boolean;
  onEdit: () => void;
}) {
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm("Bu adresi sil?")) return;
    startTransition(async () => {
      await deleteAddressAction(id);
      toast.success("Silindi.");
    });
  }
  function onSetDefault() {
    startTransition(async () => {
      await setDefaultAddressAction(id);
      toast.success("Varsayılan olarak işaretlendi.");
    });
  }

  return (
    <div className="flex items-center gap-4">
      <button
        type="button"
        onClick={onEdit}
        className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
      >
        Düzenle
      </button>
      {!isDefault ? (
        <button
          type="button"
          onClick={onSetDefault}
          disabled={pending}
          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink disabled:opacity-50"
        >
          Varsayılan yap
        </button>
      ) : null}
      <button
        type="button"
        onClick={onDelete}
        disabled={pending}
        className="text-[11px] uppercase tracking-[0.3em] text-red-600 hover:text-red-800 disabled:opacity-50"
      >
        Sil
      </button>
    </div>
  );
}

export function AddAddressButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-[11px] uppercase tracking-[0.3em] underline underline-offset-4"
    >
      + Yeni Adres
    </button>
  );
}
