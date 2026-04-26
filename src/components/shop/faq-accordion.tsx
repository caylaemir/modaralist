"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Minus } from "lucide-react";
import type { FaqItem } from "@/lib/faq";

/**
 * SSS accordion — Q tikla, A acilir/kapanir.
 * Animasyonlar: chevron rotate, height auto open/close.
 */
export function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <div className="mt-12 border-t border-line">
      {items.map((item, i) => {
        const isOpen = openIdx === i;
        return (
          <div key={i} className="border-b border-line">
            <button
              type="button"
              onClick={() => setOpenIdx(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-start justify-between gap-6 py-6 text-left transition-colors hover:bg-bone/40"
            >
              <span className="text-base font-medium text-ink md:text-lg">
                {item.question}
              </span>
              <span
                className="mt-1 grid size-6 shrink-0 place-items-center text-mist"
                aria-hidden
              >
                {isOpen ? (
                  <Minus className="size-4" />
                ) : (
                  <Plus className="size-4" />
                )}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-12 text-sm leading-relaxed text-mist md:text-base">
                    {item.answer}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
