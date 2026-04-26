"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";

export function Header() {
  const t = useTranslations("Nav");
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { itemCount, open } = useCart();
  const count = itemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const links = [
    { href: "/shop", label: t("shop") },
    { href: "/drops", label: t("drops") },
    { href: "/pages/about", label: t("about") },
    { href: "/pages/contact", label: t("contact") },
  ];

  const categories = [
    { slug: "tisort", label: "Tişört" },
    { slug: "sweatshirt", label: "Sweatshirt" },
    { slug: "oversize", label: "Oversize" },
    { slug: "outdoor-polar", label: "Outdoor Polar" },
    { slug: "esofman", label: "Eşofman" },
    { slug: "sort", label: "Şort" },
  ];

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b border-transparent bg-paper/80 backdrop-blur-md transition-colors duration-300",
        scrolled && "border-line/80 bg-paper/95"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-5 md:h-20 md:px-10">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="md:hidden"
          aria-label="Menü"
        >
          <Menu className="size-5" />
        </button>

        <nav className="hidden items-center gap-8 text-sm md:flex">
          {/* Mağaza dropdown — kategori shortcut'ları */}
          <div className="group relative">
            <Link
              href="/shop"
              className="caps-wide flex items-center gap-1 text-xs text-ink transition-opacity hover:opacity-60"
            >
              {t("shop")}
            </Link>
            <div className="invisible absolute left-1/2 top-full z-50 -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-hover:visible group-hover:opacity-100">
              <div className="min-w-[220px] border border-line bg-paper py-3 shadow-sm">
                <ul className="flex flex-col">
                  {categories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/shop/${c.slug}`}
                        className="block px-5 py-2 text-[13px] text-ink hover:bg-bone"
                      >
                        {c.label}
                      </Link>
                    </li>
                  ))}
                  <li className="mt-1 border-t border-line pt-1">
                    <Link
                      href="/shop"
                      className="block px-5 py-2 text-[11px] uppercase tracking-[0.25em] text-mist hover:text-ink"
                    >
                      Tüm Mağaza →
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="caps-wide text-xs text-ink transition-opacity hover:opacity-60"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/"
          className="display text-2xl tracking-tight md:text-3xl"
          aria-label="Modaralist"
        >
          modaralist
        </Link>

        <div className="flex items-center gap-4">
          <LocaleSwitcher />
          <button
            type="button"
            className="hidden md:block"
            aria-label={t("search")}
          >
            <Search className="size-5" />
          </button>
          <Link
            href="/account"
            className="hidden md:block"
            aria-label={t("account")}
          >
            <User className="size-5" />
          </Link>
          <button
            type="button"
            onClick={open}
            className="relative"
            aria-label={t("cart")}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute -right-2 -top-2 flex size-4 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-paper">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-paper md:hidden">
          <div className="flex h-16 items-center justify-between px-5">
            <span className="display text-2xl">modaralist</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Kapat"
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-6 px-5 pt-10">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="display text-4xl"
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-8 border-t border-line pt-8">
              <p className="caps-wide text-[10px] text-mist">Kategoriler</p>
              <ul className="mt-4 flex flex-col gap-3">
                {categories.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/shop/${c.slug}`}
                      className="text-base"
                    >
                      {c.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <Link href="/account" className="caps-wide mt-10 text-xs">
              {t("account")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
