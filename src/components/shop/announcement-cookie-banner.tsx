// Cookie consent kategorileri — granular toggle.
// Eski cookie-banner.tsx tek 'kabul/red' veriyor; bu yeni versiyon
// functional/analytics/marketing ayri ayri seciyor.
//
// localStorage anahtarlar:
//   mdr:cookie-consent = '{"analytics":bool,"marketing":bool,"timestamp":int}'
//   mdr:cookie-consent-version = '1' (ileride versiyon yukseltirsek tekrar sor)
"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "mdr:cookie-consent";
const VERSION_KEY = "mdr:cookie-consent-version";
const VERSION = "1";

type Consent = {
  functional: true; // her zaman aktif (zorunlu)
  analytics: boolean;
  marketing: boolean;
  timestamp: number;
};

export function getCookieConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  try {
    if (window.localStorage.getItem(VERSION_KEY) !== VERSION) return null;
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Consent) : null;
  } catch {
    return null;
  }
}

export function CookieBannerAdvanced() {
  const [open, setOpen] = useState(false);
  const [advanced, setAdvanced] = useState(false);
  const [analytics, setAnalytics] = useState(true);
  const [marketing, setMarketing] = useState(true);

  useEffect(() => {
    if (!getCookieConsent()) setOpen(true);
  }, []);

  function save(consent: Omit<Consent, "timestamp">) {
    const full: Consent = { ...consent, timestamp: Date.now() };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(full));
      window.localStorage.setItem(VERSION_KEY, VERSION);
    } catch {
      /* ignore */
    }
    setOpen(false);
    // Sayfayı reload — analytics scriptleri consent'e göre ateşlensin
    window.location.reload();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-paper">
      <div className="mx-auto max-w-4xl px-5 py-6 md:px-10">
        {!advanced ? (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="text-sm text-mist max-w-2xl">
              Sitenin çalışması için zorunlu çerezleri kullanırız. Analytics ve
              pazarlama çerezleri için izin vermek istersen seçebilirsin.{" "}
              <a
                href="/pages/kvkk"
                className="text-ink underline underline-offset-4"
              >
                Detay
              </a>
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setAdvanced(true)}
                className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
              >
                Ayarla
              </button>
              <button
                onClick={() =>
                  save({ functional: true, analytics: false, marketing: false })
                }
                className="border border-line px-4 py-2 text-[11px] uppercase tracking-[0.3em] hover:border-ink"
              >
                Sadece Zorunlu
              </button>
              <button
                onClick={() =>
                  save({ functional: true, analytics: true, marketing: true })
                }
                className="bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
              >
                Hepsini Kabul Et
              </button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — çerez tercihleri
            </p>
            <h3 className="display mt-3 text-2xl">Hangi çerezlere izin verirsin?</h3>
            <ul className="mt-6 space-y-4">
              <li className="flex items-start gap-4 border-t border-line pt-4">
                <input
                  type="checkbox"
                  checked
                  disabled
                  className="mt-1 size-4 appearance-none border border-line bg-ink"
                />
                <div className="flex-1">
                  <p className="font-medium">Zorunlu</p>
                  <p className="mt-1 text-xs text-mist">
                    Sepet, oturum, ödeme akışı için zorunlu. Devre dışı bırakılamaz.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 border-t border-line pt-4">
                <input
                  type="checkbox"
                  checked={analytics}
                  onChange={(e) => setAnalytics(e.target.checked)}
                  className="mt-1 size-4 appearance-none border border-line checked:border-ink checked:bg-ink"
                />
                <div className="flex-1">
                  <p className="font-medium">Analitik</p>
                  <p className="mt-1 text-xs text-mist">
                    Site kullanımını anonim ölçmek için (GA4). Kişisel bilgi
                    paylaşılmaz.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-4 border-t border-line pt-4">
                <input
                  type="checkbox"
                  checked={marketing}
                  onChange={(e) => setMarketing(e.target.checked)}
                  className="mt-1 size-4 appearance-none border border-line checked:border-ink checked:bg-ink"
                />
                <div className="flex-1">
                  <p className="font-medium">Pazarlama</p>
                  <p className="mt-1 text-xs text-mist">
                    Sosyal medya retargeting (Meta Pixel, TikTok Pixel) ve
                    kişiselleştirilmiş kampanya için.
                  </p>
                </div>
              </li>
            </ul>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setAdvanced(false)}
                className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
              >
                ← Geri
              </button>
              <button
                onClick={() =>
                  save({ functional: true, analytics, marketing })
                }
                className="bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
              >
                Kaydet
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
