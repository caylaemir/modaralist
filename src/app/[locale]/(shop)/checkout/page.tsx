"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Reveal } from "@/components/shop/reveal";
import { toast } from "sonner";
import { TR_CITIES } from "@/lib/tr-cities";

type Step = "contact" | "address" | "payment";

type Rates = { standard: number; express: number; freeOver: number };
const DEFAULT_RATES: Rates = { standard: 0, express: 89, freeOver: 0 };

export default function CheckoutPage() {
  const locale = useLocale() as "tr" | "en";
  const router = useRouter();
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: "",
    phone: "",
    fullName: "",
    tcNo: "",
    street: "",
    district: "",
    city: "İstanbul",
    zip: "",
    billingSame: true,
    shippingMethod: "standard" as "standard" | "express",
    cardHolder: "",
    cardNumber: "",
    expireMonth: "",
    expireYear: "",
    cvc: "",
    kvkkOk: false,
    distanceSalesOk: false,
  });

  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then((d) => {
        if (d?.shop) {
          setRates({
            standard: d.shop.shippingStandard ?? 0,
            express: d.shop.shippingExpress ?? 89,
            freeOver: d.shop.freeShippingOver ?? 0,
          });
        }
      })
      .catch(() => {});
  }, []);

  const sub = subtotal();
  const baseShipping =
    form.shippingMethod === "express" ? rates.express : rates.standard;
  const shippingCost =
    rates.freeOver > 0 &&
    sub >= rates.freeOver &&
    form.shippingMethod === "standard"
      ? 0
      : baseShipping;
  const total = sub + shippingCost;

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-5 py-40 text-center md:px-10">
        <p className="display text-4xl">Sepetin boş.</p>
        <p className="mt-4 text-sm text-mist">Önce bir parça seç.</p>
      </div>
    );
  }

  async function submitPayment(e: React.FormEvent) {
    e.preventDefault();
    if (!form.kvkkOk || !form.distanceSalesOk) {
      toast.error("Sözleşmeleri onaylaman gerekiyor.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines,
          customer: {
            email: form.email,
            phone: form.phone,
            fullName: form.fullName,
            tcNo: form.tcNo,
          },
          address: {
            street: form.street,
            district: form.district,
            city: form.city,
            zip: form.zip,
          },
          shippingMethod: form.shippingMethod,
          card: {
            cardHolder: form.cardHolder,
            cardNumber: form.cardNumber.replace(/\s/g, ""),
            expireMonth: form.expireMonth,
            expireYear: form.expireYear,
            cvc: form.cvc,
          },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error ?? "Ödeme başlatılamadı.");
        setLoading(false);
        return;
      }
      if (data.htmlContent) {
        // iyzico 3DS iframe HTML
        document.open();
        document.write(data.htmlContent);
        document.close();
        return;
      }
      clear();
      router.push(`/checkout/success?order=${data.orderNumber}`);
    } catch {
      toast.error("Beklenmedik bir hata oluştu.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-20 pb-32 md:px-10 md:pt-28">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — ödeme
        </p>
        <h1 className="display mt-4 text-4xl md:text-6xl">Son adım.</h1>
      </Reveal>

      <div className="mt-16 grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          {/* Step indicator */}
          <div className="mb-10 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em]">
            {(["contact", "address", "payment"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-3">
                <span
                  className={
                    step === s
                      ? "text-ink"
                      : ["contact", "address", "payment"].indexOf(step) > i
                        ? "text-mist line-through"
                        : "text-mist"
                  }
                >
                  0{i + 1} ·{" "}
                  {s === "contact"
                    ? "İletişim"
                    : s === "address"
                      ? "Teslimat"
                      : "Ödeme"}
                </span>
                {i < 2 && <span className="h-px w-10 bg-line" />}
              </div>
            ))}
          </div>

          {step === "contact" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("address");
              }}
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  E-posta
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Telefon
                </label>
                <input
                  type="tel"
                  required
                  autoComplete="tel"
                  inputMode="tel"
                  placeholder="+90 5xx xxx xx xx"
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                />
              </div>
              <button
                type="submit"
                className="mt-4 flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper"
              >
                <span>Devam Et</span>
                <span>→</span>
              </button>
            </form>
          )}

          {step === "address" && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setStep("payment");
              }}
              className="space-y-6"
            >
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={form.fullName}
                  onChange={(e) => set("fullName", e.target.value)}
                  className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    TC Kimlik No
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="off"
                    maxLength={11}
                    minLength={11}
                    required
                    value={form.tcNo}
                    onChange={(e) =>
                      set("tcNo", e.target.value.replace(/\D/g, ""))
                    }
                    className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    Şehir
                  </label>
                  <select
                    value={form.city}
                    autoComplete="address-level1"
                    onChange={(e) => set("city", e.target.value)}
                    className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                  >
                    {TR_CITIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    İlçe
                  </label>
                  <input
                    type="text"
                    required
                    autoComplete="address-level2"
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                    className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="postal-code"
                    value={form.zip}
                    onChange={(e) => set("zip", e.target.value)}
                    className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Adres
                </label>
                <textarea
                  required
                  rows={3}
                  autoComplete="street-address"
                  value={form.street}
                  onChange={(e) => set("street", e.target.value)}
                  className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                />
              </div>

              <div className="border-t border-line pt-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Kargo
                </p>
                <div className="mt-4 space-y-3">
                  {[
                    {
                      k: "standard",
                      label: "Standart — 2-4 iş günü",
                      price: rates.standard,
                      note:
                        rates.standard === 0
                          ? "Ücretsiz"
                          : rates.freeOver > 0 && sub >= rates.freeOver
                            ? "Ücretsiz (eşik aşıldı)"
                            : formatPrice(rates.standard, locale),
                    },
                    {
                      k: "express",
                      label: "Hızlı — ertesi iş günü",
                      price: rates.express,
                      note: formatPrice(rates.express, locale),
                    },
                  ].map((opt) => (
                    <label
                      key={opt.k}
                      className={`flex cursor-pointer items-center justify-between border p-4 transition-colors ${
                        form.shippingMethod === opt.k
                          ? "border-ink"
                          : "border-line"
                      }`}
                    >
                      <span className="flex items-center gap-3 text-sm">
                        <input
                          type="radio"
                          name="shipping"
                          checked={form.shippingMethod === opt.k}
                          onChange={() =>
                            set(
                              "shippingMethod",
                              opt.k as "standard" | "express"
                            )
                          }
                          className="accent-ink"
                        />
                        {opt.label}
                      </span>
                      <span className="tabular-nums text-sm">{opt.note}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("contact")}
                  className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                >
                  ← Geri
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-3 bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper"
                >
                  <span>Devam Et</span>
                  <span>→</span>
                </button>
              </div>
            </form>
          )}

          {step === "payment" && (
            <form onSubmit={submitPayment} className="space-y-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Kart bilgileri iyzico ile şifrelenir, sunucumuzda saklanmaz.
                </p>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Kart Üzerindeki İsim
                </label>
                <input
                  type="text"
                  required
                  autoComplete="cc-name"
                  value={form.cardHolder}
                  onChange={(e) => set("cardHolder", e.target.value)}
                  className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Kart Numarası
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  required
                  maxLength={19}
                  placeholder="0000 0000 0000 0000"
                  value={form.cardNumber}
                  onChange={(e) =>
                    set(
                      "cardNumber",
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 16)
                        .replace(/(.{4})/g, "$1 ")
                        .trim()
                    )
                  }
                  className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    Ay
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp-month"
                    maxLength={2}
                    required
                    placeholder="MM"
                    value={form.expireMonth}
                    onChange={(e) =>
                      set("expireMonth", e.target.value.replace(/\D/g, ""))
                    }
                    className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    Yıl
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp-year"
                    maxLength={4}
                    required
                    placeholder="YYYY"
                    value={form.expireYear}
                    onChange={(e) =>
                      set("expireYear", e.target.value.replace(/\D/g, ""))
                    }
                    className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    CVC
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    maxLength={4}
                    required
                    placeholder="***"
                    value={form.cvc}
                    onChange={(e) =>
                      set("cvc", e.target.value.replace(/\D/g, ""))
                    }
                    className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
                  />
                </div>
              </div>

              <div className="space-y-3 border-t border-line pt-6 text-xs leading-relaxed">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    checked={form.kvkkOk}
                    onChange={(e) => set("kvkkOk", e.target.checked)}
                    className="mt-0.5 size-4 accent-ink"
                  />
                  <span>
                    KVKK aydınlatma metnini okudum, kişisel verilerimin
                    işlenmesini onaylıyorum.
                  </span>
                </label>
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    required
                    checked={form.distanceSalesOk}
                    onChange={(e) =>
                      set("distanceSalesOk", e.target.checked)
                    }
                    className="mt-0.5 size-4 accent-ink"
                  />
                  <span>
                    Mesafeli Satış Sözleşmesi ve Ön Bilgilendirme Formunu okudum,
                    kabul ediyorum.
                  </span>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep("address")}
                  className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                >
                  ← Geri
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-3 bg-ink px-8 py-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
                >
                  <span>
                    {loading
                      ? "İşleniyor..."
                      : `${formatPrice(total, locale)} — Ödemeyi Tamamla`}
                  </span>
                  <span>→</span>
                </button>
              </div>
            </form>
          )}
        </div>

        <aside className="md:col-span-5 md:col-start-9">
          <div className="sticky top-28 border border-line bg-bone p-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              Sipariş Özeti
            </p>
            <ul className="mt-6 space-y-4">
              {lines.map((l) => (
                <li key={l.variantId} className="flex gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden bg-sand">
                    {l.image && (
                      <Image
                        src={l.image}
                        alt={l.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 items-start justify-between gap-2">
                    <div>
                      <p className="text-sm">{l.name}</p>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                        {[l.size, l.color].filter(Boolean).join(" · ")} · {l.quantity}
                      </p>
                    </div>
                    <p className="tabular-nums text-sm">
                      {formatPrice(l.unitPrice * l.quantity, locale)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <dl className="mt-8 space-y-3 border-t border-line pt-6 text-sm">
              <div className="flex justify-between">
                <dt>Ara Toplam</dt>
                <dd className="tabular-nums">{formatPrice(sub, locale)}</dd>
              </div>
              <div className="flex justify-between">
                <dt>Kargo</dt>
                <dd className="tabular-nums">
                  {shippingCost === 0 ? "Ücretsiz" : formatPrice(shippingCost, locale)}
                </dd>
              </div>
              <div className="flex justify-between border-t border-line pt-3 text-base">
                <dt className="uppercase tracking-[0.2em]">Toplam</dt>
                <dd className="tabular-nums">{formatPrice(total, locale)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
