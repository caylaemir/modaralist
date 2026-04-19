"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        toast.error(j.error ?? "Kayıt başarısız.");
        setLoading(false);
        return;
      }
      const signed = await signIn("credentials", {
        email,
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
      router.push("/account");
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
          <Link href="/kvkk" className="underline underline-offset-2">
            KVKK aydınlatma metnini
          </Link>{" "}
          ve{" "}
          <Link href="/terms" className="underline underline-offset-2">
            kullanım şartlarını
          </Link>{" "}
          kabul etmiş olursun.
        </p>
      </form>

      <p className="mt-10 text-center text-sm text-mist">
        Zaten hesabın var mı?{" "}
        <Link href="/login" className="text-ink underline underline-offset-4">
          Giriş yap
        </Link>
      </p>
    </div>
  );
}
