"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  updateProfileAction,
  changePasswordAction,
  deleteAccountAction,
} from "../actions";

export function ProfileForm({
  initialName,
  initialEmail,
  initialPhone,
}: {
  initialName: string;
  initialEmail: string;
  initialPhone: string;
}) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await updateProfileAction(formData);
      if (res.ok) toast.success("Profil güncellendi.");
      else toast.error(res.error ?? "Güncellenemedi.");
    });
  }

  return (
    <form action={onSubmit} className="grid gap-6 md:grid-cols-2">
      <div className="md:col-span-2">
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          Ad Soyad
        </label>
        <input
          name="name"
          defaultValue={initialName}
          required
          minLength={2}
          className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          E-posta
        </label>
        <input
          value={initialEmail}
          disabled
          className="mt-2 w-full border-b border-line bg-transparent py-3 text-mist outline-none"
        />
        <p className="mt-1 text-[11px] text-mist">
          E-posta değiştirme henüz aktif değil.
        </p>
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          Telefon
        </label>
        <input
          name="phone"
          defaultValue={initialPhone}
          type="tel"
          className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
        />
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : "Kaydet"} <span>→</span>
        </button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [pending, startTransition] = useTransition();
  const [done, setDone] = useState(false);

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await changePasswordAction(formData);
      if (res.ok) {
        setDone(true);
        toast.success("Şifre değiştirildi.");
      } else {
        toast.error(res.error ?? "Şifre değiştirilemedi.");
      }
    });
  }

  return (
    <form action={onSubmit} className="grid gap-6 md:grid-cols-2">
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          Mevcut şifre
        </label>
        <input
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          Yeni şifre
        </label>
        <input
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
        />
        <p className="mt-1 text-[11px] text-mist">En az 8 karakter.</p>
      </div>
      <div className="md:col-span-2">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-3 border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {pending ? "Değiştiriliyor..." : done ? "✓ Değiştirildi" : "Şifreyi Değiştir"}
        </button>
      </div>
    </form>
  );
}

export function DeleteAccountButton() {
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (
      !confirm(
        "Hesabını kalıcı olarak silmek üzeresin. Tüm sipariş geçmişin, adreslerin ve favorilerin silinecek. Devam et?"
      )
    ) {
      return;
    }
    startTransition(async () => {
      await deleteAccountAction();
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-[11px] uppercase tracking-[0.3em] text-red-600 hover:text-red-800 disabled:opacity-50"
    >
      {pending ? "Siliniyor..." : "Hesabımı kalıcı olarak sil"}
    </button>
  );
}
