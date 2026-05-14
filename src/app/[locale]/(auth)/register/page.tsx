"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import { useSearchParams } from "next/navigation";

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="w-full max-w-md" />}>
      <RegisterForm />
    </Suspense>
  );
}

function safeCallbackUrl(raw: string | null): string {
  if (!raw) return "/account";
  if (!raw.startsWith("/")) return "/account";
  if (raw.startsWith("//") || raw.startsWith("/\\")) return "/account";
  return raw;
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = safeCallbackUrl(params.get("callbackUrl"));
  const initialEmail = params.get("email") ?? "";
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email: normalizedEmail, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error ?? "Kayıt başarısız.");
        setLoading(false);
        return;
      }
      const signed = await signIn("credentials", {
        email: normalizedEmail,
        password,
        redirect: false,
      });
      setLoading(false);
      if (signed?.error) {
        toast.error("Otomatik giriş başarısız. Lütfen giriş sayfasını kullan.");
        router.push("/login");
        return;
      }
      toast.success("Hesabın oluşturuldu. Hoş geldin.");
      router.push(callbackUrl);
      router.refresh();
    } catch {
      setLoading(false);
      toast.error("Bir şeyler ters gitti.");
    }
  }

  return (
    <div className="w-full max-w-md">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — kayıt
      </p>
      <h1 className="display mt-4 text-5xl">Aramıza katıl.</h1>
      <p className="mt-4 text-sm text-mist">
        Drop'lara erken erişim, sipariş takibi, adres defteri.
      </p>
      {initialEmail ? (
        <div className="mt-8 border border-line bg-bone/50 p-5 text-sm leading-relaxed text-mist">
          Bu e-postayla oluşturduğun hesap, varsa misafir siparişlerini
          Siparişlerim alanına otomatik bağlar.
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="mt-12 space-y-6">
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Ad Soyad
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
          />
        </div>
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
            Şifre (en az 8 karakter)
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

        <button
          type="submit"
          disabled={loading}
          className="mt-4 flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          <span>{loading ? "Oluşturuluyor..." : "Hesap Oluştur"}</span>
          <span>→</span>
        </button>

        <p className="text-xs leading-relaxed text-mist">
          Devam ederek{" "}
          <Link
            href="/pages/membership"
            target="_blank"
            className="underline underline-offset-2"
          >
            Üyelik Sözleşmesi
          </Link>
          ,{" "}
          <Link
            href="/pages/kvkk"
            target="_blank"
            className="underline underline-offset-2"
          >
            KVKK Aydınlatma Metni
          </Link>{" "}
          ve{" "}
          <Link
            href="/pages/privacy"
            target="_blank"
            className="underline underline-offset-2"
          >
            Gizlilik Politikası
          </Link>
          'nı kabul etmiş olursun.
        </p>
      </form>

      <p className="mt-10 text-center text-sm text-mist">
        Zaten hesabın var mı?{" "}
        <Link
          href={`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`}
          className="text-ink underline underline-offset-4"
        >
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
