"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";

export function NotifyMe({
  collectionSlug,
  productSlug,
}: {
  collectionSlug?: string;
  productSlug?: string;
}) {
  const locale = useLocale() as "tr" | "en";
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      const res = await fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, collectionSlug, productSlug, locale }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Kaydedilemedi.");
        return;
      }
      setSent(true);
      toast.success(
        data.alreadySubscribed
          ? "Zaten listedeydin."
          : "Listedesin. Drop açıldığında haber vereceğiz."
      );
    } catch {
      toast.error("Bir şeyler ters gitti.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <div className="border-b border-paper/40 pb-3 text-[11px] uppercase tracking-[0.3em] text-paper">
        ✓ Listedesin — drop açılınca ilk sen öğreneceksin.
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex items-end gap-4 border-b border-paper/40 pb-3"
    >
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta adresin"
        className="w-full bg-transparent text-lg text-paper outline-none placeholder:text-paper/40"
      />
      <button
        type="submit"
        disabled={loading}
        className="shrink-0 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-70 disabled:opacity-50"
      >
        {loading ? "..." : "Haber Ver"}
      </button>
    </form>
  );
}
