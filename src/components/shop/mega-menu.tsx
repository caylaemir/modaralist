"use client";

import { useState, useRef, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

// Server tarafindan beslenen tree.
export type MegaCategory = {
  slug: string;
  name: string;
  // Birinci seviye children (sub-cat veya series)
  children: Array<{
    slug: string;
    name: string;
    // Ikinci seviye children (series — sadece sub-cat'in altinda olur)
    children: Array<{
      slug: string;
      name: string;
    }>;
  }>;
};

type Props = {
  categories: MegaCategory[];
  locale: "tr" | "en";
};

export function MegaMenu({ categories, locale }: Props) {
  const [openSlug, setOpenSlug] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Disinda tiklanirsa kapat
  useEffect(() => {
    if (!openSlug) return;
    function onPointerDown(e: PointerEvent) {
      const node = containerRef.current;
      if (node && !node.contains(e.target as Node)) {
        setOpenSlug(null);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [openSlug]);

  // ESC kapat
  useEffect(() => {
    if (!openSlug) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpenSlug(null);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [openSlug]);

  return (
    <div
      ref={containerRef}
      className="hidden items-center gap-7 md:flex"
      onMouseLeave={() => setOpenSlug(null)}
    >
      {categories.map((cat) => {
        const isOpen = openSlug === cat.slug;
        const hasChildren = cat.children.length > 0;
        // Tum dogrudan series mi yoksa sub-cat mi?
        // hasNestedSeries = en az bir cocuk kendi children'a sahipse
        const hasNestedSeries = cat.children.some(
          (c) => c.children.length > 0
        );

        return (
          <div
            key={cat.slug}
            className="relative"
            onMouseEnter={() => hasChildren && setOpenSlug(cat.slug)}
          >
            <Link
              href={`/shop/${cat.slug}`}
              onClick={() => setOpenSlug(null)}
              aria-haspopup={hasChildren ? "menu" : undefined}
              aria-expanded={isOpen}
              className={cn(
                "caps-wide block py-1 text-xs transition-opacity hover:opacity-60",
                isOpen ? "text-ink" : "text-ink"
              )}
            >
              {cat.name}
            </Link>

            {hasChildren && isOpen && (
              <div
                role="menu"
                className="fixed left-0 right-0 top-16 z-50 border-y border-line bg-paper shadow-sm md:top-20"
              >
                <div className="mx-auto max-w-[1600px] px-5 py-10 md:px-10">
                  {hasNestedSeries ? (
                    // Sub-cat'li yapilar (OVERSIZE, SWEATSHIRT) — her sub-cat bir sutun
                    <div className="grid gap-10 md:grid-cols-3">
                      {cat.children.map((sub) => (
                        <div key={sub.slug}>
                          <Link
                            href={`/shop/${sub.slug}`}
                            onClick={() => setOpenSlug(null)}
                            className="display block text-xl text-ink hover:opacity-60"
                          >
                            {sub.name}
                          </Link>
                          {sub.children.length > 0 && (
                            <ul className="mt-4 space-y-2">
                              {sub.children.map((s) => (
                                <li key={s.slug}>
                                  <Link
                                    href={`/shop/${s.slug}`}
                                    onClick={() => setOpenSlug(null)}
                                    className="text-sm text-mist transition-colors hover:text-ink"
                                  >
                                    {s.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          )}
                          <Link
                            href={`/shop/${sub.slug}`}
                            onClick={() => setOpenSlug(null)}
                            className="mt-4 inline-block border-b border-line pb-1 text-[10px] uppercase tracking-[0.3em] text-mist hover:border-ink hover:text-ink"
                          >
                            {locale === "en"
                              ? `View all ${sub.name}`
                              : `Tüm ${sub.name}`}
                          </Link>
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Direkt children (TISORT'un series'leri ya da ESOFMAN/SORT/OUTDOOR'un Erkek/Kadin'i)
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                        — {cat.name.toLowerCase()}
                      </p>
                      <div className="mt-4 grid gap-x-10 gap-y-2 md:grid-cols-3">
                        {cat.children.map((c) => (
                          <Link
                            key={c.slug}
                            href={`/shop/${c.slug}`}
                            onClick={() => setOpenSlug(null)}
                            className="text-sm text-ink transition-opacity hover:opacity-60"
                          >
                            {c.name}
                          </Link>
                        ))}
                      </div>
                      <Link
                        href={`/shop/${cat.slug}`}
                        onClick={() => setOpenSlug(null)}
                        className="mt-6 inline-block border-b border-line pb-1 text-[10px] uppercase tracking-[0.3em] text-mist hover:border-ink hover:text-ink"
                      >
                        {locale === "en"
                          ? `View all ${cat.name}`
                          : `Tüm ${cat.name}`}
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
