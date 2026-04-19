"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";
import { CATEGORIES } from "@/lib/demo-data";

export type ShopFilter = {
  category: string;
  sort: "new" | "price-asc" | "price-desc";
  inStockOnly: boolean;
};

export function ShopFilters({
  value,
  onChange,
  total,
}: {
  value: ShopFilter;
  onChange: (v: ShopFilter) => void;
  total: number;
}) {
  const [open, setOpen] = useState(false);

  const sortLabel = {
    new: "Yeni",
    "price-asc": "Fiyat: Artan",
    "price-desc": "Fiyat: Azalan",
  }[value.sort];

  return (
    <>
      <div className="sticky top-16 z-20 -mx-5 mb-12 flex items-center justify-between border-y border-line bg-paper/90 px-5 py-4 backdrop-blur md:-mx-10 md:top-20 md:px-10">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em]"
        >
          <SlidersHorizontal className="size-4" />
          Filtrele
        </button>
        <p className="text-[11px] uppercase tracking-[0.3em] text-mist">
          {total} parça
        </p>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.3em]">
          <span className="hidden text-mist md:inline">Sıralama:</span>
          <select
            value={value.sort}
            onChange={(e) =>
              onChange({ ...value, sort: e.target.value as ShopFilter["sort"] })
            }
            className="bg-transparent uppercase tracking-[0.3em] outline-none"
          >
            <option value="new">Yeni</option>
            <option value="price-asc">Fiyat ↑</option>
            <option value="price-desc">Fiyat ↓</option>
          </select>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed inset-y-0 left-0 z-50 flex w-full max-w-sm flex-col bg-paper"
            >
              <div className="flex items-center justify-between border-b border-line px-6 py-5">
                <h3 className="text-[11px] uppercase tracking-[0.3em]">
                  Filtrele
                </h3>
                <button onClick={() => setOpen(false)}>
                  <X className="size-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Kategori
                </p>
                <ul className="mt-4 space-y-3">
                  {CATEGORIES.map((c) => (
                    <li key={c.slug}>
                      <button
                        onClick={() => onChange({ ...value, category: c.slug })}
                        className={`display text-3xl transition-opacity ${
                          value.category === c.slug
                            ? "opacity-100"
                            : "opacity-40 hover:opacity-70"
                        }`}
                      >
                        {c.name}
                      </button>
                    </li>
                  ))}
                </ul>

                <div className="mt-10 border-t border-line pt-6">
                  <label className="flex items-center gap-3 text-sm">
                    <input
                      type="checkbox"
                      checked={value.inStockOnly}
                      onChange={(e) =>
                        onChange({ ...value, inStockOnly: e.target.checked })
                      }
                      className="size-4 accent-ink"
                    />
                    Sadece stoktakiler
                  </label>
                </div>
              </div>

              <div className="border-t border-line p-6">
                <button
                  onClick={() => {
                    onChange({
                      category: "all",
                      sort: "new",
                      inStockOnly: false,
                    });
                  }}
                  className="mr-4 text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                >
                  Temizle
                </button>
                <button
                  onClick={() => setOpen(false)}
                  className="inline-flex flex-1 items-center justify-center bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper"
                >
                  Uygula — {sortLabel}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
