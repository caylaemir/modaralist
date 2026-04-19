"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

export function Splash() {
  const [show, show_] = useState(true);

  useEffect(() => {
    const seen = typeof window !== "undefined" && sessionStorage.getItem("modaralist-splash");
    if (seen) {
      show_(false);
      return;
    }
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => {
      show_(false);
      sessionStorage.setItem("modaralist-splash", "1");
      document.body.style.overflow = "";
    }, 2200);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = "";
    };
  }, []);

  const letters = "MODARALIST".split("");

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          exit={{ y: "-100%" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink"
        >
          <div className="flex overflow-hidden">
            {letters.map((l, i) => (
              <motion.span
                key={i}
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{
                  duration: 0.8,
                  ease: [0.22, 1, 0.36, 1],
                  delay: 0.2 + i * 0.05,
                }}
                className="display text-[14vw] leading-none text-paper md:text-[9vw]"
              >
                {l}
              </motion.span>
            ))}
          </div>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.6 }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-[0.4em] text-paper/50"
          >
            SS26 — Drop 01
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
