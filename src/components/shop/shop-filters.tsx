"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { SlidersHorizontal, X } from "lucide-react";

export type ShopFilter = {
  category: string;
  sort: "new" | "price-asc" | "price-desc";
  inStockOnly: boolean;
  // Multi-select setleri (string[] olarak tutuldu — JSON-friendly)
  sizes: string[];
  colorCodes: string[];
  // Cinsiyet — Tag.code uzerinden ('kadin' | 'erkek' | 'unisex')
  gender: "all" | "kadin" | "erkek" | "unisex";
};

export function ShopFilters({
  value,
  onChange,
  total,
  categories,
  availableSizes,
  availableColors,
}: {
  value: ShopFilter;
  onChange: (v: ShopFilter) => void;
  total: number;
  categories: { slug: string; name: string }[];
  availableSizes: string[];
  availableColors: { code: string; name: string; hex: string }[];
}) {
  const [open, setOpen] = useState(false);

  const sortLabel = {
    new: "Yeni",
    "price-asc": "Fiyat: Artan",
    "price-desc": "Fiyat: Azalan",
  }[value.sort];

  // Aktif filtre sayisi (kategori 'all' degilse + her secili size/color/gender ek puan)
  const activeCount =
    (value.category !== "all" ? 1 : 0) +
    (value.gender !== "all" ? 1 : 0) +
    value.sizes.length +
    value.colorCodes.length +
    (value.inStockOnly ? 1 : 0);

  return (
    <>
      <div className="sticky top-16 z-20 -mx-5 mb-12 flex items-center justify-between border-y border-line bg-paper/90 px-5 py-4 backdrop-blur md:-mx-10 md:top-20 md:px-10">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-3 text-[11px] uppercase tracking-[0.3em]"
        >
          <SlidersHorizontal className="size-4" />
          Filtrele
          {activeCount > 0 ? (
            <span className="ml-1 grid size-5 place-items-center rounded-full bg-ink text-[10px] text-paper">
              {activeCount}
            </span>
          ) : null}
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
                  {categories.map((c) => (
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

                {/* Cinsiyet — radio (single select) */}
                <div className="mt-10 border-t border-line pt-6">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    Cinsiyet
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {[
                      { v: "all", label: "Hepsi" },
                      { v: "kadin", label: "Kadın" },
                      { v: "erkek", label: "Erkek" },
                      { v: "unisex", label: "Unisex" },
                    ].map((g) => (
                      <button
                        key={g.v}
                        onClick={() =>
                          onChange({
                            ...value,
                            gender: g.v as ShopFilter["gender"],
                          })
                        }
                        className={`border px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                          value.gender === g.v
                            ? "border-ink bg-ink text-paper"
                            : "border-line text-mist hover:border-ink hover:text-ink"
                        }`}
                      >
                        {g.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Beden — multi select */}
                {availableSizes.length > 0 ? (
                  <div className="mt-10 border-t border-line pt-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                      Beden
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableSizes.map((s) => {
                        const active = value.sizes.includes(s);
                        return (
                          <button
                            key={s}
                            onClick={() =>
                              onChange({
                                ...value,
                                sizes: active
                                  ? value.sizes.filter((x) => x !== s)
                                  : [...value.sizes, s],
                              })
                            }
                            className={`grid size-10 place-items-center border text-xs transition-colors ${
                              active
                                ? "border-ink bg-ink text-paper"
                                : "border-line text-mist hover:border-ink hover:text-ink"
                            }`}
                          >
                            {s}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : null}

                {/* Renk — multi select swatch'lar */}
                {availableColors.length > 0 ? (
                  <div className="mt-10 border-t border-line pt-6">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                      Renk
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {availableColors.map((c) => {
                        const active = value.colorCodes.includes(c.code);
                        return (
                          <button
                            key={c.code}
                            title={c.name}
                            onClick={() =>
                              onChange({
                                ...value,
                                colorCodes: active
                                  ? value.colorCodes.filter((x) => x !== c.code)
                                  : [...value.colorCodes, c.code],
                              })
                            }
                            className={`size-9 rounded-full border-2 transition-all ${
                              active
                                ? "border-ink ring-2 ring-ink/20 ring-offset-2"
                                : "border-line hover:border-ink"
                            }`}
                            style={{ backgroundColor: c.hex }}
                            aria-label={c.name}
                          />
                        );
                      })}
                    </div>
                  </div>
                ) : null}

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
                      sizes: [],
                      colorCodes: [],
                      gender: "all",
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
