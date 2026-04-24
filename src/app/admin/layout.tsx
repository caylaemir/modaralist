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
} from "lucide-react";
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
  { href: "/admin/coupons", label: "Kuponlar", icon: Ticket },
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
        <div className="flex min-h-screen">
          <aside className="fixed inset-y-0 left-0 flex w-64 flex-col border-r border-line bg-paper">
            <div className="flex h-20 items-center gap-3 border-b border-line px-7">
              <span className="display text-2xl leading-none">modaralist</span>
              <span className="inline-flex h-5 items-center rounded-sm bg-ink px-2 text-[9px] font-medium uppercase tracking-[0.25em] text-paper">
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

          <main className="ml-64 flex-1 px-10 py-10">{children}</main>
        </div>
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  );
}
