import type { Metadata, Viewport } from "next";
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
    default: "Modaralist — Marmara'da Tshirt, Sweatshirt, Eşofman, Şort",
    template: "%s · Modaralist",
  },
  description:
    "Modaralist — Marmara bölgesinde tshirt, sweatshirt, oversize, outdoor, polar, eşofman ve şort modelleri. İstanbul, Bursa, Kocaeli'ne hızlı kargo. Numaralı koleksiyonlar, sınırlı üretim.",
  keywords: [
    "tshirt",
    "t-shirt",
    "tişört",
    "sweatshirt",
    "oversize",
    "outdoor",
    "polar",
    "eşofman",
    "şort",
    "marmara",
    "istanbul",
    "bursa",
    "kocaeli",
    "online giyim",
    "streetwear",
  ],
  metadataBase: new URL("https://modaralist.shop"),
  applicationName: "Modaralist",
  alternates: {
    canonical: "/",
    languages: {
      tr: "/tr",
      en: "/en",
      "x-default": "/tr",
    },
  },
  appleWebApp: {
    capable: true,
    title: "Modaralist",
    statusBarStyle: "black-translucent",
  },
  openGraph: {
    siteName: "Modaralist",
    type: "website",
    locale: "tr_TR",
    alternateLocale: "en_US",
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    "geo.region": "TR-34",
    "geo.placename": "İstanbul, Marmara Bölgesi",
    "geo.position": "41.0082;28.9784",
    ICBM: "41.0082, 28.9784",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0a0a0a" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
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
    "@type": ["Organization", "OnlineStore"],
    name: settings?.["site.title"] || "Modaralist",
    url: base,
    logo: `${base}/logo.svg`,
    sameAs,
    description:
      "Marmara bölgesinde tshirt, sweatshirt, oversize, outdoor, polar, eşofman ve şort modelleri. Numaralı koleksiyonlar, sınırlı üretim.",
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Marmara Bölgesi, Türkiye",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "İstanbul",
      addressCountry: "TR",
      ...(settings?.["contact.address"]
        ? { streetAddress: settings["contact.address"] }
        : {}),
    },
    contactPoint: settings?.["contact.email"]
      ? {
          "@type": "ContactPoint",
          email: settings["contact.email"],
          contactType: "customer support",
          areaServed: "TR",
          availableLanguage: ["Turkish", "English"],
          ...(settings["contact.phone"]
            ? { telephone: settings["contact.phone"] }
            : {}),
        }
      : undefined,
  };

  // WebSite + SearchAction (sitelinks search box için)
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Modaralist",
    url: base,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${base}/${locale}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
    inLanguage: locale === "en" ? "en-US" : "tr-TR",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NextIntlClientProvider messages={messages} locale={locale}>
          <Providers>
            {children}
            <Toaster position="bottom-center" richColors />
            <Analytics />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
