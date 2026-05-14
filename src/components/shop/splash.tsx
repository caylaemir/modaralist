"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const SPLASH_DURATION_MS = 2000;

export function Splash() {
  const [show, show_] = useState(true);

  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem("modaralist-splash");
    if (seen) {
      const close = window.setTimeout(() => show_(false), 0);
      return () => window.clearTimeout(close);
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      show_(false);
      sessionStorage.setItem("modaralist-splash", "1");
      document.body.style.overflow = "";
    }, SPLASH_DURATION_MS);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink motion-reduce:!hidden"
        >
          <motion.div
            initial={{ opacity: 1, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="flex w-[min(78vw,520px)] items-center justify-center"
          >
            <Image
              src="/brand/modaralist-lockup.png"
              alt="Modaralist"
              width={802}
              height={882}
              priority
              loading="eager"
              fetchPriority="high"
              sizes="(min-width: 768px) 520px, 78vw"
              className="h-auto max-h-[68vh] w-full object-contain invert"
            />
          </motion.div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.45 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-paper/50"
          >
            Numaralı Koleksiyonlar
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
