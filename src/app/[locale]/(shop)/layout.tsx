import { Header } from "@/components/shop/header";
import { Footer } from "@/components/shop/footer";
import { CartDrawer } from "@/components/shop/cart-drawer";
import { SmoothScroll } from "@/components/shop/smooth-scroll";
import { CookieBanner } from "@/components/shop/cookie-banner";
import { AnnouncementBanner } from "@/components/shop/announcement-banner";
import { MaintenanceGate } from "@/components/shop/maintenance-gate";
import { setRequestLocale } from "next-intl/server";

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
    </MaintenanceGate>
  );
}
