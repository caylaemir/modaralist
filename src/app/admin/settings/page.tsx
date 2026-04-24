import { auth } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const [session, settings] = await Promise.all([auth(), getAllSettings()]);

  const paymentSim = process.env.PAYMENT_SIMULATION_MODE === "true";
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasIyzico = !!process.env.IYZICO_API_KEY;
  const hasCloudinary = !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const hasShippingSecret = !!process.env.SHIPPING_WEBHOOK_SECRET;

  const integrations: Array<{
    name: string;
    key: string;
    connected: boolean;
    note: string;
  }> = [
    {
      name: "Cloudinary",
      key: "Fotoğraf storage + CDN",
      connected: hasCloudinary,
      note: hasCloudinary ? "Bağlı" : "Env key eksik",
    },
    {
      name: "iyzico",
      key: "3DS ödeme",
      connected: hasIyzico,
      note: paymentSim
        ? "Simülasyon modu aktif"
        : hasIyzico
          ? "Bağlı"
          : "Key bekleniyor",
    },
    {
      name: "Resend",
      key: "Transactional email",
      connected: hasResend,
      note: hasResend ? "Bağlı" : "Key bekleniyor — mail gönderilmiyor",
    },
    {
      name: "Kargo webhook",
      key: "POST /api/webhooks/shipping",
      connected: hasShippingSecret,
      note: hasShippingSecret ? "Secret tanımlı" : "Secret eksik",
    },
    {
      name: "Nilvera e-Arşiv",
      key: "Otomatik fatura",
      connected: false,
      note: "Sonraki aşama",
    },
  ];

  return (
    <div>
      <header className="border-b border-line pb-8">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — ayarlar
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Sistem Ayarları</h1>
        <p className="mt-4 max-w-xl text-xs text-mist">
          Markadan iletişime, mağaza ayarlarından yasal bilgiye kadar tüm site
          ayarları burada. Değişiklikler her yerde anında yansır.
        </p>
      </header>

      <aside className="mt-10 border-t border-line pt-6">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — hızlı geçiş
        </p>
        <nav className="mt-4 flex flex-wrap gap-3">
          {[
            { id: "brand", label: "Marka" },
            { id: "contact", label: "İletişim" },
            { id: "social", label: "Sosyal" },
            { id: "shop", label: "Mağaza" },
            { id: "banner", label: "Duyuru" },
            { id: "legal", label: "Yasal" },
            { id: "integrations", label: "Entegrasyonlar" },
            { id: "account", label: "Hesap" },
          ].map((link) => (
            <a
              key={link.id}
              href={`#${link.id}`}
              className="border border-line px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] text-mist hover:border-ink hover:text-ink"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </aside>

      <div className="mt-16">
        <SettingsForm initialValues={settings} />
      </div>

      <section id="integrations" className="mt-20">
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — entegrasyonlar
          </p>
          <h2 className="display mt-3 text-3xl leading-none">
            Bağlı Servisler
          </h2>
          <p className="mt-3 max-w-xl text-xs text-mist">
            Bu servisler env değişkeniyle yapılandırılır; bağlantı durumunu
            buradan izle. Canlı deploy için eksik olan entegrasyonları tamamla.
          </p>
        </div>
        <ul className="mt-8">
          {integrations.map((i) => (
            <li
              key={i.name}
              className="flex items-start justify-between gap-6 border-t border-line py-5 last:border-b"
            >
              <div>
                <p className="text-sm">{i.name}</p>
                <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-mist">
                  {i.key}
                </p>
              </div>
              <div className="text-right">
                <span
                  className={`inline-block border px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                    i.connected
                      ? "border-ink bg-ink text-paper"
                      : "border-line text-mist"
                  }`}
                >
                  {i.connected ? "Bağlı" : "Eksik"}
                </span>
                <p className="mt-2 text-xs text-mist">{i.note}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="mt-6 border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            bayrak
          </p>
          <div className="mt-3 flex items-start justify-between gap-6">
            <div>
              <p className="text-sm">Ödeme Simülasyonu</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-mist">
                PAYMENT_SIMULATION_MODE
              </p>
              <p className="mt-2 max-w-md text-xs text-mist">
                Aktifken sipariş iyzico&apos;ya gitmeden direkt PAID olarak
                kaydedilir. Canlıya çıkmadan önce kapatılmalı (env&apos;de{" "}
                <code className="font-mono">false</code>).
              </p>
            </div>
            <span
              className={`inline-block border px-3 py-1 text-[10px] uppercase tracking-[0.25em] ${
                paymentSim
                  ? "border-amber-600 bg-amber-50 text-amber-700"
                  : "border-line text-mist"
              }`}
            >
              {paymentSim ? "Aktif" : "Kapalı"}
            </span>
          </div>
        </div>
      </section>

      <section id="account" className="mt-16">
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — hesap
          </p>
          <h2 className="display mt-3 text-3xl leading-none">Oturum</h2>
        </div>
        <div className="mt-6 border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Giriş yapan
          </p>
          <p className="display mt-3 text-2xl leading-none">
            {session?.user?.name ?? "—"}
          </p>
          <p className="mt-2 font-mono text-xs text-mist">
            {session?.user?.email} · {session?.user?.role}
          </p>
        </div>
      </section>
    </div>
  );
}
