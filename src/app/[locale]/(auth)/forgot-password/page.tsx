"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      setSent(true);
      toast.success("E-postanı kontrol et.");
    } catch {
      toast.error("Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — şifremi unuttum
      </p>
      <h1 className="display mt-4 text-5xl">
        {sent ? "E-posta yoldа." : "Hatırlatma gönderelim."}
      </h1>

      {sent ? (
        <>
          <p className="mt-6 text-sm text-mist">
            {email} adresine sıfırlama bağlantısı gönderdik. Gelmediyse spam
            klasörüne bak.
          </p>
          <Link
            href="/login"
            className="mt-10 inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
          >
            ← Giriş sayfasına dön
          </Link>
        </>
      ) : (
        <form onSubmit={onSubmit} className="mt-12 space-y-6">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              E-posta
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-4 flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
          >
            <span>{loading ? "Gönderiliyor..." : "Sıfırlama Bağlantısı Gönder"}</span>
            <span>→</span>
          </button>

          <p className="text-center text-sm text-mist">
            <Link href="/login" className="text-ink underline underline-offset-4">
              Giriş sayfasına dön
            </Link>
          </p>
        </form>
      )}
    </div>
  );
}
