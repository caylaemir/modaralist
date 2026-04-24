"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

export function SearchInput({ initialQuery }: { initialQuery: string }) {
  const [value, setValue] = useState(initialQuery);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    startTransition(() => {
      router.push(`${pathname}?q=${encodeURIComponent(trimmed)}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="relative">
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="ürün adı, slug, açıklama..."
        autoFocus
        className="w-full border-b-2 border-ink bg-transparent pb-3 pr-10 text-2xl outline-none placeholder:text-mist md:text-3xl"
      />
      <button
        type="submit"
        disabled={isPending}
        className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink disabled:opacity-50"
      >
        {isPending ? "..." : "Ara →"}
      </button>
    </form>
  );
}
