"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";

function ResetPasswordForm() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const email = params.get("email") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const missing = !token || !email;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Şifre en az 8 karakter olmalı.");
      return;
    }
    if (password !== confirm) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Sıfırlama başarısız.");
        return;
      }
      setDone(true);
      toast.success("Şifren güncellendi. Giriş yapabilirsin.");
    } catch {
      toast.error("Beklenmedik bir hata oluştu.");
    } finally {
      setLoading(false);
    }
  }

  if (missing) {
    return (
      <div className="w-full max-w-md">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — bağlantı geçersiz
        </p>
        <h1 className="display mt-4 text-5xl">Bağlantı çalışmıyor.</h1>
        <p className="mt-6 text-sm text-mist">
          Bu sıfırlama bağlantısı eksik veya bozuk. Yenisini talep et.
        </p>
        <Link
          href="/forgot-password"
          className="mt-10 inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
        >
          ← Yeni bağlantı iste
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="w-full max-w-md">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — tamamlandı
        </p>
        <h1 className="display mt-4 text-5xl">Şifren güncellendi.</h1>
        <p className="mt-6 text-sm text-mist">
          Artık yeni şifrenle giriş yapabilirsin.
        </p>
        <Link
          href="/login"
          className="mt-10 inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
        >
          → Giriş sayfasına git
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — yeni şifre
      </p>
      <h1 className="display mt-4 text-5xl">Yeni şifre belirle.</h1>
      <p className="mt-4 text-sm text-mist">
        {email} için yeni bir şifre seç.
      </p>

      <form onSubmit={onSubmit} className="mt-12 space-y-6">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Yeni Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
          />
          <p className="mt-2 text-[11px] text-mist">En az 8 karakter.</p>
        </div>

        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Şifre Tekrar
          </label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            minLength={8}
            autoComplete="new-password"
            className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          <span>{loading ? "Güncelleniyor..." : "Şifreyi Güncelle"}</span>
          <span>→</span>
        </button>

        <p className="text-center text-sm text-mist">
          <Link href="/login" className="text-ink underline underline-offset-4">
            Giriş sayfasına dön
          </Link>
        </p>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
