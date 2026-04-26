import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { SmoothScroll } from "@/components/shop/smooth-scroll";
import { CookieBanner } from "@/components/shop/cookie-banner";
import { AnnouncementBanner } from "@/components/shop/announcement-banner";
import { MaintenanceGate } from "@/components/shop/maintenance-gate";
import { NewsletterPopup } from "@/components/shop/newsletter-popup";
import { WhatsAppButton } from "@/components/shop/whatsapp-button";
import { setRequestLocale } from "next-intl/server";

// Settings/auth/db sorgulari layout'ta — tum shop sayfalari dinamik
// (statik prerender 'Expected a suspended thenable' hatasi veriyordu)
export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <MaintenanceGate>
      <SmoothScroll />
      <AnnouncementBanner />
      <Header />
      <main>{children}</main>
      <Footer />
      <CartDrawer locale={locale as "tr" | "en"} />
      <CookieBanner />
      <NewsletterPopup />
      <WhatsAppButton />
    </MaintenanceGate>
  );
}
