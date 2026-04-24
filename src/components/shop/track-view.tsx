"use client";

import { useEffect } from "react";
import { pushRecentlyViewed } from "@/lib/recently-viewed";

/** Bir ürün detay sayfası açılınca recently-viewed listesine ekler. */
export function TrackView({ slug }: { slug: string }) {
  useEffect(() => {
    pushRecentlyViewed(slug);
  }, [slug]);
  return null;
}
