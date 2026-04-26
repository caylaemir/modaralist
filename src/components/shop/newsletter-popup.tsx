"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { toast } from "sonner";

const STORAGE_KEY = "mdr:newsletter-popup-shown";

type PopupConfig = {
  enabled: boolean;
  delaySeconds: number;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  discountCode: string;
};

const DEFAULT_CONFIG: PopupConfig = {
  enabled: true,
  delaySeconds: 15,
  eyebrow: "— ilk siparişine özel",
  title: "%10 indirim hemen senin.",
  subtitle:
    "Email'ini bırak, ilk siparişine özel %10 indirim kodunu yolla. Drop'lar açılınca da ilk sen öğren.",
  ctaLabel: "İndirim Kodumu Gönder",
  discountCode: "",
};

export function NewsletterPopup() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [config, setConfig] = useState<PopupConfig | null>(null);
  const [done, setDone] = useState(false);

  // Settings'ten config çek
  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then((d) => {
        if (d?.popup) setConfig({ ...DEFAULT_CONFIG, ...d.popup });
        else setConfig(DEFAULT_CONFIG);
      })
      .catch(() => setConfig(DEFAULT_CONFIG));
  }, []);

  // Config geldiğinde + popup gösterilebiliyorsa zamanlayıcı kur
  useEffect(() => {
    if (!config) return;
    if (!config.enabled) return;
    if (typeof window === "undefined") return;
    if (window.localStorage.getItem(STORAGE_KEY)) return;

    // NaN/negatif/0'a karsi guvenli — fallback 15s
    const safeDelay = Number.isFinite(config.delaySeconds) && config.delaySeconds > 0
      ? config.delaySeconds
      : 15;
    const t = setTimeout(() => setOpen(true), safeDelay * 1000);
    return () => clearTimeout(t);
  }, [config]);

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
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "popup" }),
      });
      if (res.status === 429) {
        toast.error("Çok fazla deneme. Birkaç dakika sonra tekrar dene.");
        return;
      }
      if (!res.ok) {
        toast.error("Kaydedilemedi. Lütfen tekrar dene.");
        return;
      }
      setDone(true);
      try {
        window.localStorage.setItem(STORAGE_KEY, String(Date.now()));
      } catch {
        /* ignore */
      }
      toast.success("Listedesin. İndirim kodu kısa sürede e-postanda.");
    } catch {
      toast.error("Bağlantı hatası. Tekrar dene.");
    } finally {
      setPending(false);
    }
  }

  if (!open || !config) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-ink/30 backdrop-blur-sm md:items-center">
      <div className="w-full max-w-md border border-line bg-paper p-8 md:p-10">
        <div className="flex items-start justify-between">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            {config.eyebrow}
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
        <h3 className="display mt-6 text-3xl leading-tight">{config.title}</h3>
        <p className="mt-4 text-sm text-mist">{config.subtitle}</p>

        {done ? (
          <div className="mt-8 border-t border-line pt-6 text-center">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              ✓ kayıt alındı
            </p>
            {config.discountCode ? (
              <>
                <p className="mt-3 text-sm">İndirim kodun:</p>
                <p className="display mt-3 select-all text-3xl tabular-nums">
                  {config.discountCode}
                </p>
                <p className="mt-3 text-[11px] text-mist">
                  Checkout&apos;ta uygula. Email&apos;ine de gönderdik.
                </p>
              </>
            ) : (
              <p className="mt-3 text-sm text-mist">
                İndirim kodun email&apos;inde — kısa süre içinde gelir.
              </p>
            )}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
            >
              Alışverişe devam →
            </button>
          </div>
        ) : (
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
              <span>{pending ? "Gönderiliyor..." : config.ctaLabel}</span>
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
        )}
      </div>
    </div>
  );
}
