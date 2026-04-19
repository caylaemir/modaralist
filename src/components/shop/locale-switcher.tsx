"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTransition } from "react";

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  function switchTo(next: (typeof routing.locales)[number]) {
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="flex items-center gap-1 text-[11px] tracking-widest uppercase">
      {routing.locales.map((l, i) => (
        <span key={l} className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => switchTo(l)}
            className={
              l === locale
                ? "text-ink"
                : "text-mist transition-colors hover:text-ink"
            }
          >
            {l}
          </button>
          {i < routing.locales.length - 1 && (
            <span className="text-mist">/</span>
          )}
        </span>
      ))}
    </div>
  );
}
