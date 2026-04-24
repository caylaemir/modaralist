import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale, getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { Toaster } from "sonner";
import { routing } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { Analytics } from "@/components/analytics";
import { getAllSettings } from "@/lib/settings";
import "../globals.css";

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const display = Instrument_Serif({
  variable: "--font-display",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Modaralist",
    template: "%s · Modaralist",
  },
  description:
    "Modaralist — modern siluetler, numaralı koleksiyonlar, sınırlı üretim.",
  metadataBase: new URL("https://modaralist.com"),
  openGraph: {
    siteName: "Modaralist",
    type: "website",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  setRequestLocale(locale);
  const [messages, settings] = await Promise.all([
    getMessages(),
    getAllSettings().catch(() => null),
  ]);

  const base =
    process.env.NEXT_PUBLIC_APP_URL || "https://modaralist.shop";

  const sameAs = [
    settings?.["social.instagram"],
    settings?.["social.tiktok"],
    settings?.["social.x"],
    settings?.["social.facebook"],
    settings?.["social.youtube"],
    settings?.["social.pinterest"],
  ].filter((s): s is string => !!s && s.startsWith("http"));

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings?.["site.title"] || "Modaralist",
    url: base,
    logo: `${base}/logo.svg`,
    sameAs,
    contactPoint: settings?.["contact.email"]
      ? {
          "@type": "ContactPoint",
          email: settings["contact.email"],
          contactType: "customer support",
          ...(settings["contact.phone"]
            ? { telephone: settings["contact.phone"] }
            : {}),
        }
      : undefined,
  };

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-paper text-ink antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            {children}
            <Toaster position="bottom-right" richColors />
            <Analytics />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
