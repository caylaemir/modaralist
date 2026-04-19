"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Link } from "@/i18n/navigation";

const KEY = "modaralist-cookies";

export function CookieBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const v = typeof window !== "undefined" && localStorage.getItem(KEY);
    if (!v) {
      const t = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  function decide(value: "all" | "essential") {
    localStorage.setItem(KEY, value);
    setShow(false);
    if (value === "all") {
      // Analytics scriptlerini buradan aktifleştir
      window.dispatchEvent(new CustomEvent("cookies-accepted-all"));
    }
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-4 bottom-4 z-40 md:inset-x-auto md:left-6 md:right-6 md:bottom-6"
        >
          <div className="mx-auto max-w-5xl border border-line bg-paper p-5 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.25)] md:flex md:items-center md:gap-8 md:p-6">
            <div className="flex-1">
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                Çerezler
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Modaralist deneyimini kişiselleştirmek ve site performansını
                anlamak için çerez kullanıyoruz.{" "}
                <Link
                  href="/privacy"
                  className="underline underline-offset-4 hover:no-underline"
                >
                  Ayrıntılar
                </Link>
                .
              </p>
            </div>
            <div className="mt-4 flex gap-3 md:mt-0 md:shrink-0">
              <button
                onClick={() => decide("essential")}
                className="border border-line px-5 py-3 text-[10px] uppercase tracking-[0.3em] hover:border-ink"
              >
                Sadece zorunlu
              </button>
              <button
                onClick={() => decide("all")}
                className="bg-ink px-5 py-3 text-[10px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
              >
                Tümünü Kabul Et
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
