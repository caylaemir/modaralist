"use client";

import { useEffect, useState, useTransition } from "react";
import { Heart } from "lucide-react";
import { toast } from "sonner";

const LOCAL_KEY = "mdr:wishlist-cache";

function readCache(): Record<string, boolean> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(LOCAL_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
}

function writeCache(map: Record<string, boolean>) {
  try {
    window.localStorage.setItem(LOCAL_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

export function WishlistHeart({ slug }: { slug: string }) {
  const [active, setActive] = useState<boolean | null>(null);
  const [pending, startTransition] = useTransition();

  // İlk render'da cache'ten okuyup hızlı UI ver, ardından sunucudan teyit
  useEffect(() => {
    const cache = readCache();
    setActive(!!cache[slug]);
    fetch("/api/wishlist")
      .then((r) => r.json())
      .then((d) => {
        const slugs = (d.items as { slug: string }[] | undefined)?.map(
          (i) => i.slug
        ) ?? [];
        const isWishlisted = slugs.includes(slug);
        setActive(isWishlisted);
        writeCache({ ...cache, [slug]: isWishlisted });
      })
      .catch(() => {
        /* unauth ise active=false, OK */
      });
  }, [slug]);

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !active;
    setActive(next);
    startTransition(async () => {
      const res = await fetch("/api/wishlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: slug, action: "toggle" }),
      });
      if (res.status === 401) {
        setActive(false);
        toast.error("Önce giriş yap.");
        return;
      }
      if (!res.ok) {
        setActive(!next);
        toast.error("Kaydedilemedi.");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setActive(!!data.wishlisted);
      const cache = readCache();
      cache[slug] = !!data.wishlisted;
      writeCache(cache);
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      aria-label={active ? "Favorilerden çıkar" : "Favorilere ekle"}
      className="absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-paper/80 backdrop-blur transition-colors hover:bg-paper disabled:opacity-50"
    >
      <Heart
        className={`size-4 transition-colors ${
          active ? "fill-ink text-ink" : "text-ink"
        }`}
        strokeWidth={1.5}
      />
    </button>
  );
}
