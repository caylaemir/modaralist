"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";

/**
 * Mobil admin sidebar toggle.
 * <md ekranlarda hamburger menu gosterir.
 * Body'ye 'admin-sidebar-open' class'ı ekler/kaldırır.
 */
export function SidebarToggle() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    if (open) {
      root.classList.add("admin-sidebar-open");
      // Mobile'da overflow lock
      document.body.style.overflow = "hidden";
    } else {
      root.classList.remove("admin-sidebar-open");
      document.body.style.overflow = "";
    }
    return () => {
      root.classList.remove("admin-sidebar-open");
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      {/* Açma butonu — mobil topbar'da */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Menüyü aç"
        className="grid size-9 place-items-center border border-line bg-paper md:hidden"
      >
        <Menu className="size-4" strokeWidth={1.5} />
      </button>

      {/* Backdrop — açıkken */}
      {open ? (
        <button
          type="button"
          aria-label="Menüyü kapat"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden"
        />
      ) : null}

      {/* Kapatma butonu — sidebar açıkken */}
      {open ? (
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Menüyü kapat"
          className="fixed left-[256px] top-4 z-[60] grid size-9 place-items-center bg-paper md:hidden"
        >
          <X className="size-4" strokeWidth={1.5} />
        </button>
      ) : null}
    </>
  );
}
