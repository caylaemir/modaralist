import { redirect } from "next/navigation";
import { Inter, Instrument_Serif } from "next/font/google";
import { Toaster } from "sonner";
import { auth } from "@/lib/auth";
import {
  Box,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Tags,
  Users,
  Palette,
  Settings,
  Mail,
  Ticket,
  Star,
  Home,
} from "lucide-react";
import { SidebarToggle } from "./_components/sidebar-toggle";
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

export const metadata = {
  title: "Modaralist Admin",
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      "max-video-preview": -1,
      "max-image-preview": "none" as const,
      "max-snippet": -1,
    },
  },
};

const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/categories", label: "Kategoriler", icon: Tags },
  { href: "/admin/collections", label: "Koleksiyonlar", icon: Box },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/customers", label: "Müşteriler", icon: Users },
  { href: "/admin/reviews", label: "Yorumlar", icon: Star },
  { href: "/admin/coupons", label: "Kuponlar", icon: Ticket },
  { href: "/admin/homepage", label: "Ana Sayfa", icon: Home },
  { href: "/admin/content", label: "İçerik", icon: Palette },
  { href: "/admin/newsletter", label: "Bülten", icon: Mail },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/tr/login?callbackUrl=/admin");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    redirect("/");
  }

  return (
    <html
      lang="tr"
      className={`${sans.variable} ${display.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-bone text-ink antialiased">
        {/* Mobile topbar */}
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-paper px-4 md:hidden">
          <SidebarToggle />
          <div className="flex items-center gap-2">
            <span className="display text-xl leading-none">modaralist</span>
            <span className="inline-flex h-4 items-center rounded-sm bg-ink px-1.5 text-[8px] font-medium uppercase tracking-[0.25em] text-paper">
              admin
            </span>
          </div>
        </header>

        <div className="flex min-h-screen">
          <aside className="admin-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-paper md:translate-x-0">
            <div className="hidden h-20 items-center gap-3 border-b border-line px-7 md:flex">
              <span className="display text-2xl leading-none">modaralist</span>
              <span className="inline-flex h-5 items-center rounded-sm bg-ink px-2 text-[9px] font-medium uppercase tracking-[0.25em] text-paper">
                admin
              </span>
            </div>
            <div className="flex h-14 items-center gap-3 border-b border-line px-6 md:hidden">
              <span className="display text-xl leading-none">modaralist</span>
              <span className="inline-flex h-4 items-center rounded-sm bg-ink px-1.5 text-[8px] font-medium uppercase tracking-[0.25em] text-paper">
                admin
              </span>
            </div>

            <nav className="flex-1 overflow-y-auto px-4 py-6">
              <p className="px-3 pb-3 text-[10px] uppercase tracking-[0.3em] text-mist">
                Yönetim
              </p>
              <ul className="flex flex-col gap-0.5">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      className="group flex items-center gap-3 rounded-sm px-3 py-2.5 text-[13px] text-mist transition-colors hover:bg-bone hover:text-ink"
                    >
                      <item.icon className="size-4 shrink-0" strokeWidth={1.5} />
                      <span>{item.label}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="border-t border-line px-7 py-5">
              <p className="truncate text-[11px] text-ink">
                {session.user.email}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.3em] text-mist">
                {session.user.role}
              </p>
            </div>
          </aside>

          <main className="flex-1 px-5 py-6 md:ml-64 md:px-10 md:py-10">
            {children}
          </main>
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
