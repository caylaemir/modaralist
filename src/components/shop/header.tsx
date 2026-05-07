"use client";

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
// 'Menü', 'Kapat' gibi labellar Common namespace'inden gelir.
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useCart } from "@/stores/cart";
import { cn } from "@/lib/utils";
import { LocaleSwitcher } from "./locale-switcher";
import { MegaMenu, type MegaCategory } from "./mega-menu";

type Props = {
  categories: MegaCategory[];
};

export function Header({ categories }: Props) {
  const t = useTranslations("Nav");
  const tCommon = useTranslations("Common");
  const pathname = usePathname();
  const locale = useLocale() as "tr" | "en";
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openMobile, setOpenMobile] = useState<string | null>(null);
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
    setOpenMobile(null);
  }, [pathname]);

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
          className="grid size-11 place-items-center md:hidden"
          aria-label={tCommon("menu")}
        >
          <Menu className="size-5" />
        </button>

        {/* Desktop nav — 6 kategori mega-menu */}
        <MegaMenu categories={categories} locale={locale} />

        <Link
          href="/"
          className="display text-2xl tracking-tight md:text-3xl"
          aria-label="Modaralist"
        >
          modaralist
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          <LocaleSwitcher />
          <Link
            href="/search"
            className="hidden size-11 place-items-center md:grid"
            aria-label={t("search")}
          >
            <Search className="size-5" />
          </Link>
          <Link
            href="/account"
            className="hidden size-11 place-items-center md:grid"
            aria-label={t("account")}
          >
            <User className="size-5" />
          </Link>
          <button
            type="button"
            onClick={open}
            className="relative grid size-11 place-items-center"
            aria-label={t("cart")}
          >
            <ShoppingBag className="size-5" />
            {count > 0 && (
              <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-ink text-[10px] font-medium text-paper">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile drawer — accordion ile kategoriler */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 h-[100dvh] overflow-y-auto bg-paper pb-[env(safe-area-inset-bottom)] md:hidden">
          <div className="flex h-16 items-center justify-between px-5">
            <span className="display text-2xl">modaralist</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label={tCommon("close")}
            >
              <X className="size-5" />
            </button>
          </div>
          <nav className="flex flex-col gap-2 px-5 pt-6">
            {categories.map((cat) => {
              const expanded = openMobile === cat.slug;
              const hasChildren = cat.children.length > 0;
              return (
                <div key={cat.slug} className="border-b border-line py-3">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/shop/${cat.slug}`}
                      className="display text-3xl"
                    >
                      {cat.name}
                    </Link>
                    {hasChildren && (
                      <button
                        type="button"
                        onClick={() =>
                          setOpenMobile(expanded ? null : cat.slug)
                        }
                        className="text-2xl text-mist"
                        aria-label={expanded ? tCommon("close") : tCommon("open")}
                        aria-expanded={expanded}
                      >
                        {expanded ? "−" : "+"}
                      </button>
                    )}
                  </div>
                  {expanded && hasChildren && (
                    <div className="mt-3 space-y-3 pl-3">
                      {cat.children.map((sub) => (
                        <div key={sub.slug}>
                          <Link
                            href={`/shop/${sub.slug}`}
                            className="block text-base text-ink"
                          >
                            {sub.name}
                          </Link>
                          {sub.children.length > 0 && (
                            <ul className="mt-2 space-y-1.5 pl-3">
                              {sub.children.map((s) => (
                                <li key={s.slug}>
                                  <Link
                                    href={`/shop/${s.slug}`}
                                    className="text-sm text-mist"
                                  >
                                    {s.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <Link
              href="/account"
              className="caps-wide mt-8 text-xs"
            >
              {t("account")}
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
