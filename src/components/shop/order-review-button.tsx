"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Star, X, Loader2, Check } from "lucide-react";
import { toast } from "sonner";

/**
 * Sipariş kalem yaninda 'Yorum Yaz' butonu + tiklanınca acılan inline modal.
 *
 * 3 durum:
 * - 'reviewable' → buton gosterilir
 * - 'reviewed' → 'Yorumun var' badge (bilgi)
 * - 'not-deliverable' → hicbir sey (PENDING/CANCELLED siparisler)
 */

type Props = {
  productSlug: string;
  productName: string;
  state: "reviewable" | "reviewed" | "not-deliverable";
};

export function OrderReviewButton({ productSlug, productName, state }: Props) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  // ESC ile kapat (pending degilse) — keyboard accessibility
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !pending) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, pending]);

  if (state === "not-deliverable") return null;

  if (state === "reviewed") {
    return (
      <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.25em] text-emerald-700">
        <Check className="size-3" /> Yorumladin
      </span>
    );
  }

  function submit() {
    if (rating < 1) {
      toast.error("Yıldız ver.");
      return;
    }
    startTransition(async () => {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug, rating, title, body }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(data.error ?? "Gönderilemedi.");
        return;
      }
      setDone(true);
      toast.success("Yorumun moderasyona gönderildi.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1.5 border-b border-ink pb-0.5 text-[10px] uppercase tracking-[0.25em] text-ink hover:text-mist"
      >
        <Star className="size-3" /> Yorum Yaz
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${productName} için yorum yaz`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 p-4 backdrop-blur-sm"
            onClick={(e) => {
              // Pending iken backdrop'a tiklama hicbir sey yapmasin
              // (gonder bastiktan sonra yanlislikla kapanmasin, race olmasin)
              if (pending) return;
              if (e.target === e.currentTarget) setOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.97 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="w-full max-w-md overflow-hidden rounded-xl border border-ink/10 bg-paper shadow-2xl"
            >
              <div className="flex items-start justify-between gap-3 border-b border-line bg-bone/40 px-6 py-4">
                <div className="min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    — yorum yaz
                  </p>
                  <p className="mt-1.5 truncate font-medium text-ink">
                    {productName}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  disabled={pending}
                  aria-label="Kapat"
                  className="text-mist hover:text-ink disabled:opacity-50"
                >
                  <X className="size-5" />
                </button>
              </div>

              <div className="p-6">
                {done ? (
                  <div className="py-6 text-center">
                    <Check className="mx-auto size-10 text-emerald-600" />
                    <p className="display mt-4 text-2xl italic">Teşekkürler.</p>
                    <p className="mt-2 text-sm text-mist">
                      Yorumun moderasyona alındı, onaylanınca yayınlanır.
                    </p>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="mt-6 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                    >
                      Kapat
                    </button>
                  </div>
                ) : (
                  <>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                      Puanın
                    </p>
                    <div className="mt-3 flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setRating(n)}
                          onMouseEnter={() => setHover(n)}
                          onMouseLeave={() => setHover(0)}
                          aria-label={`${n} yıldız`}
                          className={`text-3xl transition-colors ${
                            n <= (hover || rating) ? "text-ink" : "text-line"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>

                    <div className="mt-6">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                        Başlık (opsiyonel)
                      </label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={120}
                        placeholder="Kısa bir başlık"
                        className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
                      />
                    </div>

                    <div className="mt-5">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                        Yorum
                      </label>
                      <textarea
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        rows={4}
                        maxLength={2000}
                        placeholder="Deneyimini paylaş — kalite, beden, kumaş..."
                        className="mt-2 w-full resize-y border border-line bg-paper p-3 text-sm outline-none focus:border-ink"
                      />
                    </div>

                    <div className="mt-6 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setOpen(false)}
                        disabled={pending}
                        className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink disabled:opacity-50"
                      >
                        İptal
                      </button>
                      <button
                        type="button"
                        onClick={submit}
                        disabled={pending || rating === 0}
                        className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
                      >
                        {pending ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : null}
                        Gönder
                      </button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
