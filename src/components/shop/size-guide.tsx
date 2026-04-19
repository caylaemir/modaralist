"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";

const SIZE_CHART = [
  { size: "XS", bust: "80-84", waist: "60-64", hip: "86-90" },
  { size: "S", bust: "84-88", waist: "64-68", hip: "90-94" },
  { size: "M", bust: "88-92", waist: "68-72", hip: "94-98" },
  { size: "L", bust: "92-96", waist: "72-76", hip: "98-102" },
  { size: "XL", bust: "96-100", waist: "76-80", hip: "102-106" },
];

export function SizeGuide() {
  const [open, setOpen] = useState(false);

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
              className="fixed left-1/2 top-1/2 z-50 w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 bg-paper p-8 md:p-12"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    Beden Tablosu
                  </p>
                  <h3 className="display mt-3 text-3xl">Ölçüler cm cinsinden.</h3>
                </div>
                <button onClick={() => setOpen(false)} aria-label="Kapat">
                  <X className="size-5" />
                </button>
              </div>

              <table className="mt-10 w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-[10px] uppercase tracking-[0.3em] text-mist">
                    <th className="py-3 text-left font-normal">Beden</th>
                    <th className="py-3 text-left font-normal">Göğüs</th>
                    <th className="py-3 text-left font-normal">Bel</th>
                    <th className="py-3 text-left font-normal">Kalça</th>
                  </tr>
                </thead>
                <tbody>
                  {SIZE_CHART.map((r) => (
                    <tr key={r.size} className="border-b border-line">
                      <td className="py-3 font-medium">{r.size}</td>
                      <td className="py-3 tabular-nums text-mist">{r.bust}</td>
                      <td className="py-3 tabular-nums text-mist">{r.waist}</td>
                      <td className="py-3 tabular-nums text-mist">{r.hip}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-6 text-xs text-mist">
                Arasında kaldıysan, iki beden de olur — bedenine güven.
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
