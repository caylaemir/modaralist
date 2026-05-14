"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import { useSession } from "next-auth/react";
import { Link, useRouter } from "@/i18n/navigation";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Reveal } from "@/components/shop/reveal";
import { toast } from "sonner";
import { TR_CITIES } from "@/lib/tr-cities";
import { calculateBundleDiscount, type BundleConfig } from "@/lib/cart-bundle";

type Step = "contact" | "address" | "payment";

type Rates = { standard: number; express: number; freeOver: number };
const DEFAULT_RATES: Rates = { standard: 0, express: 89, freeOver: 0 };
type PaytrWindow = Window & {
  iFrameResize?: (options: Record<string, unknown>, selector: string) => void;
};

export default function CheckoutPage() {
  const locale = useLocale() as "tr" | "en";
  const router = useRouter();
  const { status: sessionStatus } = useSession();
  const { lines, subtotal, clear } = useCart();
  const [step, setStep] = useState<Step>("contact");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [paytrFrameUrl, setPaytrFrameUrl] = useState<string | null>(null);
  const [paytrOrderNumber, setPaytrOrderNumber] = useState<string | null>(null);
  const [paytrScriptReady, setPaytrScriptReady] = useState(false);

  // Kupon state
  const [couponInput, setCouponInput] = useState("");
  const [couponPending, setCouponPending] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    freeShipping: boolean;
    fullPriceOnly: boolean;
  } | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
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
    kvkkOk: false,
    distanceSalesOk: false,
  });

  const [rates, setRates] = useState<Rates>(DEFAULT_RATES);
  // Paket (bundle) indirim ayarlari — /api/public-config'ten gelir.
  // Sipariş özetinde "Paket indirimi" satiri ve toplam icin kullanilir
  // (server tarafi /api/checkout zaten ayni hesabi yapar).
  const [bundleConfig, setBundleConfig] = useState<BundleConfig | null>(null);
  useEffect(() => {
    fetch("/api/public-config")
      .then((r) => r.json())
      .then(async (d) => {
        if (d?.bundle) {
          setBundleConfig({
            enabled: d.bundle.enabled,
            minSubtotal: d.bundle.minSubtotal,
            tier2Discount: d.bundle.tier2Discount,
            tier3Discount: d.bundle.tier3Discount,
          });
        }
        if (d?.shop) {
          // A/B test (H8): kullanici 'B' variant cookie'sine atanmissa
          // freeShippingOverB esigini kullan (free-shipping-bar ile birebir
          // ayni mantik). Boylece bardaki esik = checkout'taki esik.
          let chosenFreeOver = d.shop.freeShippingOver ?? 0;
          if (d.shop.freeShippingAB && (d.shop.freeShippingOverB ?? 0) > 0) {
            const { getOrAssignVariant } = await import("@/lib/ab-test");
            const variant = getOrAssignVariant("free-shipping");
            if (variant === "B") chosenFreeOver = d.shop.freeShippingOverB;
          }
          setRates({
            standard: d.shop.shippingStandard ?? 0,
            express: d.shop.shippingExpress ?? 89,
            freeOver: chosenFreeOver,
          });
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!paytrFrameUrl || !paytrScriptReady) return;
    (window as PaytrWindow).iFrameResize?.({}, "#paytriframe");
  }, [paytrFrameUrl, paytrScriptReady]);

  const sub = subtotal();
  const baseShipping =
    form.shippingMethod === "express" ? rates.express : rates.standard;
  const thresholdShipping =
    rates.freeOver > 0 &&
    sub >= rates.freeOver &&
    form.shippingMethod === "standard"
      ? 0
      : baseShipping;
  // Kupon FREE_SHIPPING ise kargo bedava
  const shippingCost = appliedCoupon?.freeShipping ? 0 : thresholdShipping;
  const couponDiscount = appliedCoupon?.discountAmount ?? 0;
  // Paket indirimi — sepetteki en ucuz parçaya, tier'a göre (2 / 3+ ürün).
  // /api/checkout server tarafında aynı hesabı yapıp tahsil eder; burada
  // sadece sipariş özetinde göstermek için tekrar hesaplıyoruz.
  const bundleResult =
    bundleConfig && bundleConfig.enabled
      ? calculateBundleDiscount(
          lines.map((l) => ({
            variantId: l.variantId,
            unitPrice: l.unitPrice,
            quantity: l.quantity,
          })),
          sub,
          bundleConfig
        )
      : null;
  const bundleDiscount = bundleResult?.applied ? bundleResult.discountAmount : 0;
  const total = Math.max(0, sub + shippingCost - couponDiscount - bundleDiscount);

  async function applyCoupon() {
    setCouponError(null);
    if (!couponInput.trim()) {
      setCouponError("Kod giriniz");
      return;
    }
    setCouponPending(true);
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotal: sub,
          lines: lines.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setCouponError(data?.error ?? "Kod geçersiz");
        return;
      }
      setAppliedCoupon({
        code: data.coupon.code,
        discountAmount: data.discountAmount,
        freeShipping: data.freeShipping,
        fullPriceOnly: Boolean(data.coupon.fullPriceOnly),
      });
      setCouponInput("");
      toast.success(`Kupon uygulandı: ${data.coupon.code}`);
    } catch {
      setCouponError("Bağlantı hatası");
    } finally {
      setCouponPending(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
    setCouponError(null);
  }

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function resetPaytrFrame() {
    setPaytrFrameUrl(null);
    setPaytrOrderNumber(null);
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
    setFormError(null);
    if (!form.kvkkOk || !form.distanceSalesOk) {
      const msg = "KVKK ve Mesafeli Satış sözleşmelerini onaylaman gerekiyor.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    if (form.tcNo.length !== 11) {
      const msg = "TC Kimlik No 11 hane olmalı.";
      setFormError(msg);
      toast.error(msg);
      return;
    }
    resetPaytrFrame();
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
          locale,
          couponCode: appliedCoupon?.code,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.error ?? "Ödeme başlatılamadı.";
        setFormError(msg);
        toast.error(msg);
        setLoading(false);
        return;
      }
      if (data.iframeUrl) {
        setPaytrFrameUrl(data.iframeUrl);
        setPaytrOrderNumber(data.orderNumber ?? null);
        toast.success("PAYTR güvenli ödeme ekranı hazır.");
        setLoading(false);
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
              {sessionStatus === "unauthenticated" ? (
                <div className="border border-line bg-bone/50 p-5">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    Hesapla daha kolay
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-mist">
                    Kayıt olursan siparişlerini Siparişlerim'den takip eder,
                    adreslerini tekrar yazmadan alışveriş yaparsın. Misafir
                    devam edersen takip bağlantısını e-postayla göndeririz.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-4 text-[11px] uppercase tracking-[0.25em]">
                    <Link
                      href="/register?callbackUrl=/checkout"
                      className="border-b border-ink pb-1"
                    >
                      Hesap Oluştur
                    </Link>
                    <Link
                      href="/login?callbackUrl=/checkout"
                      className="border-b border-line pb-1 text-mist hover:text-ink"
                    >
                      Giriş Yap
                    </Link>
                  </div>
                </div>
              ) : null}
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
            paytrFrameUrl ? (
              <div className="space-y-6">
                <Script
                  id="paytr-iframe-resizer"
                  src="https://www.paytr.com/js/iframeResizer.min.js?v2"
                  strategy="afterInteractive"
                  onLoad={() => setPaytrScriptReady(true)}
                />
                <div className="flex flex-col gap-4 border border-line bg-paper p-5 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                      PAYTR güvenli ödeme
                    </p>
                    <p className="mt-2 text-sm text-mist">
                      Kart bilgilerini yalnızca PAYTR ekranında girersin; Modaralist
                      kart numarası veya CVC saklamaz.
                    </p>
                    {paytrOrderNumber ? (
                      <p className="mt-2 font-mono text-[11px] text-mist">
                        Sipariş: {paytrOrderNumber}
                      </p>
                    ) : null}
                  </div>
                  <Image
                    src="/brand/paytr-logo.svg"
                    alt="PayTR"
                    width={160}
                    height={28}
                    className="h-8 w-auto shrink-0"
                  />
                </div>
                <div className="overflow-hidden border border-line bg-paper">
                  <iframe
                    id="paytriframe"
                    src={paytrFrameUrl}
                    title="PAYTR güvenli ödeme formu"
                    className="block min-h-[760px] w-full"
                    frameBorder={0}
                    scrolling="no"
                    onLoad={() =>
                      (window as PaytrWindow).iFrameResize?.(
                        {},
                        "#paytriframe"
                      )
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={resetPaytrFrame}
                  className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                >
                  ← Bilgileri düzenle
                </button>
              </div>
            ) : (
              <form onSubmit={submitPayment} className="space-y-6">
                <div className="border border-line bg-paper p-5">
                  <div className="flex items-center justify-between gap-5">
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                        PAYTR güvenli ödeme
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-mist">
                        Devam ettiğinde PAYTR iFrame ödeme ekranı açılır. Kart
                        bilgileri Modaralist sunucularından geçmez.
                      </p>
                    </div>
                    <Image
                      src="/brand/paytr-logo.svg"
                      alt="PayTR"
                      width={160}
                      height={28}
                      className="h-8 w-auto shrink-0"
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
                      <a
                        href="/pages/kvkk"
                        target="_blank"
                        rel="noopener"
                        className="underline underline-offset-2"
                      >
                        KVKK Aydınlatma Metni
                      </a>
                      'ni okudum, kişisel verilerimin işlenmesini onaylıyorum.
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
                      <a
                        href="/pages/distance-sales"
                        target="_blank"
                        rel="noopener"
                        className="underline underline-offset-2"
                      >
                        Mesafeli Satış Sözleşmesi
                      </a>{" "}
                      ve Ön Bilgilendirme Formu'nu okudum, kabul ediyorum.
                    </span>
                  </label>
                </div>

                {formError ? (
                  <div
                    role="alert"
                    className="border-l-4 border-red-600 bg-red-50 px-4 py-3 text-sm text-red-800"
                  >
                    <p className="font-medium">Ödeme tamamlanamadı</p>
                    <p className="mt-1 text-[13px]">{formError}</p>
                  </div>
                ) : null}

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
                        : `${formatPrice(total, locale)} — PAYTR ile Öde`}
                    </span>
                    <span>→</span>
                  </button>
                </div>
              </form>
            )
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
            {/* Kupon kodu */}
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                İndirim Kodu
              </p>
              {appliedCoupon ? (
                <div className="mt-3 flex items-center justify-between border border-ink bg-paper px-3 py-2">
                  <div className="min-w-0">
                    <p className="font-mono text-[12px]">{appliedCoupon.code}</p>
                    <p className="mt-0.5 text-[10px] text-mist">
                      {appliedCoupon.freeShipping
                        ? "Ücretsiz kargo"
                        : `-${formatPrice(appliedCoupon.discountAmount, locale)}`}
                    </p>
                    {appliedCoupon.fullPriceOnly ? (
                      <p className="mt-0.5 text-[10px] text-mist">
                        İndirimsiz ürünlerde
                      </p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-[10px] uppercase tracking-[0.25em] text-mist hover:text-red-600"
                  >
                    Kaldır
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          void applyCoupon();
                        }
                      }}
                      placeholder="KOD GİR"
                      maxLength={40}
                      className="flex-1 border border-line bg-paper px-3 py-2 text-sm font-mono uppercase outline-none focus:border-ink"
                    />
                    <button
                      type="button"
                      onClick={() => void applyCoupon()}
                      disabled={couponPending || !couponInput.trim()}
                      className="bg-ink px-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
                    >
                      {couponPending ? "..." : "Uygula"}
                    </button>
                  </div>
                  {couponError ? (
                    <p className="mt-2 text-[11px] text-red-600">{couponError}</p>
                  ) : null}
                </div>
              )}
            </div>

            <dl className="mt-6 space-y-3 border-t border-line pt-6 text-sm">
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
              {bundleDiscount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>Paket indirimi (%{bundleResult?.discountPercent})</dt>
                  <dd className="tabular-nums">
                    -{formatPrice(bundleDiscount, locale)}
                  </dd>
                </div>
              ) : null}
              {couponDiscount > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <dt>Kupon ({appliedCoupon?.code})</dt>
                  <dd className="tabular-nums">
                    -{formatPrice(couponDiscount, locale)}
                  </dd>
                </div>
              ) : null}
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
