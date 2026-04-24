import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await auth();
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
      note: paymentSim ? "Simülasyon modu aktif" : hasIyzico ? "Bağlı" : "Key bekleniyor",
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
        <p className="mt-4 text-xs text-mist">
          Entegrasyon durumu, env bayrakları, hesap bilgileri.
        </p>
      </header>

      <section className="mt-14">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — hesap
        </p>
        <div className="mt-4 border-t border-line pt-5">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            Oturum
          </p>
          <p className="display mt-3 text-2xl leading-none">
            {session?.user?.name ?? "—"}
          </p>
          <p className="mt-2 font-mono text-xs text-mist">
            {session?.user?.email} · {session?.user?.role}
          </p>
        </div>
      </section>

      <section className="mt-14">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — entegrasyonlar
        </p>
        <ul className="mt-6">
          {integrations.map((i) => (
            <li
              key={i.name}
              className="flex items-center justify-between gap-6 border-t border-line py-5 last:border-b"
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
      </section>

      <section className="mt-14">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — bayraklar
        </p>
        <ul className="mt-6">
          <li className="flex items-center justify-between gap-6 border-t border-line py-5">
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
          </li>
        </ul>
      </section>
    </div>
  );
}
