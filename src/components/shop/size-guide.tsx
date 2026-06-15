"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

export type SizeGuideChart = {
  unit: string;
  name: string;
  note: string | null;
  columns: { key: string; label: string }[];
  rows: { sizeCode: string; values: Record<string, string> }[];
};

export function SizeGuide({ chart }: { chart: SizeGuideChart | null }) {
  const [open, setOpen] = useState(false);

  // Chart tanimli degilse buton hic gozukmesin (sessizce kaybol).
  if (!chart || chart.columns.length === 0 || chart.rows.length === 0) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-[11px] uppercase tracking-[0.3em] underline underline-offset-4 hover:no-underline"
      >
        Beden Tablosu
      </button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,640px)] max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto bg-paper p-8 md:p-12"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    Beden Tablosu
                  </p>
                  <h3 className="display mt-3 text-3xl">
                    Ölçüler {chart.unit} cinsinden.
                  </h3>
                  {chart.name ? (
                    <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-mist">
                      {chart.name}
                    </p>
                  ) : null}
                </div>
                <button onClick={() => setOpen(false)} aria-label="Kapat">
                  <X className="size-5" />
                </button>
              </div>

              <table className="mt-10 w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-[10px] uppercase tracking-[0.3em] text-mist">
                    <th className="py-3 text-left font-normal">Beden</th>
                    {chart.columns.map((c) => (
                      <th
                        key={c.key}
                        className="py-3 text-left font-normal"
                      >
                        {c.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {chart.rows.map((r) => (
                    <tr key={r.sizeCode} className="border-b border-line">
                      <td className="py-3 font-medium">{r.sizeCode}</td>
                      {chart.columns.map((c) => (
                        <td
                          key={c.key}
                          className="py-3 tabular-nums text-mist"
                        >
                          {r.values[c.key] ?? "—"}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>

              {chart.note ? (
                <p className="mt-6 text-xs text-mist">{chart.note}</p>
              ) : null}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
