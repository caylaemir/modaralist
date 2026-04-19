"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") || "/account";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      toast.error("E-posta veya şifre hatalı.");
      return;
    }
    toast.success("Hoş geldin.");
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — giriş
      </p>
      <h1 className="display mt-4 text-5xl">Tekrar hoş geldin.</h1>
      <p className="mt-4 text-sm text-mist">
        Siparişlerin, adreslerin ve favorilerin seni bekliyor.
      </p>

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
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Şifre
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
          />
        </div>

        <div className="flex items-center justify-between">
          <Link
            href="/forgot-password"
            className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            Şifremi unuttum
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          <span>{loading ? "Giriş yapılıyor..." : "Giriş Yap"}</span>
          <span>→</span>
        </button>
      </form>

      <div className="mt-10 flex items-center gap-4 text-[10px] uppercase tracking-[0.3em] text-mist">
        <span className="h-px flex-1 bg-line" />
        veya
        <span className="h-px flex-1 bg-line" />
      </div>

      <button
        onClick={() => signIn("google", { callbackUrl })}
        className="mt-6 flex w-full items-center justify-center gap-3 border border-line px-6 py-4 text-[11px] uppercase tracking-[0.3em] hover:border-ink"
      >
        Google ile devam et
      </button>

      <p className="mt-10 text-center text-sm text-mist">
        Hesabın yok mu?{" "}
        <Link href="/register" className="text-ink underline underline-offset-4">
          Hemen oluştur
        </Link>
      </p>
    </div>
  );
}
