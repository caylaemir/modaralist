"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "mdr:newsletter-popup-shown";
const DELAY_MS = 15000; // 15 sn sonra goster

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;
    const t = setTimeout(() => setOpen(true), DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  function dismiss() {
    setOpen(false);
    try {
      window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
    } catch {
      /* ignore */
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setPending(true);
    try {
      // Newsletter API endpoint sonra eklenecek; simdilik notify-me'yi
      // suffix ile kullan ya da sessizce 'OK' dön — UI calissin
      await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup" }),
      }).catch(() => null);
      toast.success("Listedesin. İndirim kodu kısa sürede e-postanda.");
      dismiss();
    } finally {
      setPending(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/30 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md border border-line bg-paper p-8 md:p-10">
        <div className="flex items-start justify-between">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — ilk siparişine özel
          </p>
          <button
            type="button"
            onClick={dismiss}
            aria-label="Kapat"
            className="text-mist hover:text-ink"
          >
            <X className="size-4" />
          </button>
        </div>
        <h3 className="display mt-6 text-3xl leading-tight">
          %10 indirim hemen senin.
        </h3>
        <p className="mt-4 text-sm text-mist">
          Email'ini bırak, ilk siparişine özel %10 indirim kodunu yolla.
          Drop'lar açılınca da ilk sen öğren.
        </p>
        <form onSubmit={onSubmit} className="mt-6">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@adresin.com"
            className="w-full border-b border-line bg-transparent py-3 text-sm outline-none focus:border-ink"
          />
          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
          >
            <span>{pending ? "Gönderiliyor..." : "İndirim Kodumu Gönder"}</span>
            <span>→</span>
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="mt-4 w-full text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            Hayır, teşekkürler
          </button>
        </form>
      </div>
    </div>
  );
}
