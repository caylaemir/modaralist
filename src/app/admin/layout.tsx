import { redirect } from "next/navigation";
import Link from "next/link";
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
} from "lucide-react";

export const metadata = {
  title: "Modaralist Admin",
};

const NAV = [
  { href: "/admin", label: "Panel", icon: LayoutDashboard },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/categories", label: "Kategoriler", icon: Tags },
  { href: "/admin/collections", label: "Koleksiyonlar", icon: Box },
  { href: "/admin/orders", label: "Siparişler", icon: ShoppingCart },
  { href: "/admin/customers", label: "Müşteriler", icon: Users },
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
    <div className="flex min-h-screen bg-[#fafafa] text-ink">
      <aside className="fixed inset-y-0 left-0 w-60 border-r border-line bg-paper">
        <div className="flex h-16 items-center border-b border-line px-6">
          <span className="display text-xl">modaralist</span>
          <span className="ml-2 rounded bg-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-paper">
            admin
          </span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded px-3 py-2 text-sm text-mist transition-colors hover:bg-bone hover:text-ink"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="absolute inset-x-3 bottom-4 border-t border-line pt-4">
          <p className="px-3 text-xs text-mist">{session.user.email}</p>
          <p className="mt-1 px-3 text-[10px] uppercase tracking-wider text-mist">
            {session.user.role}
          </p>
        </div>
      </aside>
      <main className="ml-60 flex-1 p-10">{children}</main>
    </div>
  );
}
