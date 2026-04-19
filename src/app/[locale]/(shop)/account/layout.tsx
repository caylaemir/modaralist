import { redirect } from "next/navigation";
import { auth, signOut } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";
import { User, Package, MapPin, Heart, LogOut } from "lucide-react";

const NAV = [
  { href: "/account", label: "Panel", icon: User, exact: true },
  { href: "/account/orders", label: "Siparişlerim", icon: Package },
  { href: "/account/addresses", label: "Adreslerim", icon: MapPin },
  { href: "/account/wishlist", label: "Favorilerim", icon: Heart },
  { href: "/account/profile", label: "Profilim", icon: User },
];

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login?callbackUrl=/account");
  }

  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-24 pb-40 md:px-10 md:pt-40">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — hesabım
        </p>
        <h1 className="display mt-6 text-[10vw] leading-[0.95] md:text-[6vw]">
          Hoş geldin, {session.user.name?.split(" ")[0] ?? "misafir"}.
        </h1>
      </Reveal>

      <div className="mt-20 grid gap-16 md:grid-cols-12">
        <aside className="md:col-span-3">
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-3 border-b border-line py-4 text-sm transition-colors hover:text-ink"
              >
                <item.icon className="size-4 text-mist transition-colors group-hover:text-ink" />
                <span>{item.label}</span>
              </Link>
            ))}
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/" });
              }}
            >
              <button
                type="submit"
                className="group flex w-full items-center gap-3 border-b border-line py-4 text-sm text-mist transition-colors hover:text-ink"
              >
                <LogOut className="size-4" />
                Çıkış Yap
              </button>
            </form>
          </nav>
        </aside>
        <section className="md:col-span-9">{children}</section>
      </div>
    </div>
  );
}
