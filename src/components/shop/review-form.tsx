"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Link } from "@/i18n/navigation";

export type ReviewState =
  | "can-review"
  | "not-logged-in"
  | "not-purchased"
  | "already-reviewed";

export function ReviewForm({
  productSlug,
  state,
}: {
  productSlug: string;
  /** Server-side belirlenir: kullanici yorum yazabilir mi? */
  state: ReviewState;
}) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (state !== "can-review") return;
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
      toast.success(data.message ?? "Yorum gönderildi.");
    });
  }

  if (done) {
    return (
      <div className="border-t border-line py-10 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — alındı
        </p>
        <p className="display mt-4 text-2xl italic">
          Yorumun moderasyon sırasına alındı.
        </p>
        <p className="mt-3 text-sm text-mist">
          Onaylandıktan sonra ürün sayfasında görünecek.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-line py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — değerlendirme
      </p>
      <h3 className="display mt-3 text-2xl">Bu ürün için yorum bırak</h3>

      {state === "not-logged-in" ? (
        <div className="mt-4 border border-line bg-bone/40 p-5">
          <p className="text-sm text-ink">
            Yorum yazmak için <strong>giriş yap</strong>. Yorumu sadece bu
            ürünü satın aldıysan bırakabilirsin.
          </p>
          <Link
            href="/login"
            className="mt-4 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
          >
            Giriş Yap →
          </Link>
        </div>
      ) : state === "not-purchased" ? (
        <div className="mt-4 border border-line bg-bone/40 p-5">
          <p className="text-sm text-ink">
            Yorum yazmak için bu ürünü <strong>satın almış olman gerekiyor</strong>.
            Bu sayede yorumlar gerçek müşterilerden gelir.
          </p>
          <p className="mt-3 text-[12px] text-mist">
            Bu ürünü daha önce sipariş ettiysen siparişlerin altından da yorum
            bırakabilirsin.
          </p>
          <Link
            href="/account/orders"
            className="mt-4 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
          >
            Siparişlerim →
          </Link>
        </div>
      ) : state === "already-reviewed" ? (
        <div className="mt-4 border border-line bg-bone/40 p-5">
          <p className="text-sm text-ink">
            Bu ürün için zaten bir yorumun var. Aynı ürüne birden fazla yorum
            yazılamaz.
          </p>
        </div>
      ) : (
        <form onSubmit={onSubmit}>
          <div className="mt-6 flex items-center gap-1">
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

          <div className="mt-6 grid grid-cols-1 gap-4">
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                Başlık (opsiyonel)
              </label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={120}
                className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
                placeholder="Yorumun için kısa bir başlık"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                Yorum
              </label>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={4}
                maxLength={2000}
                className="mt-2 w-full resize-y border border-line bg-transparent p-3 text-sm outline-none focus:border-ink"
                placeholder="Deneyimini paylaş..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={pending || rating === 0}
            className="mt-6 inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
          >
            {pending ? "Gönderiliyor..." : "Gönder"} <span>→</span>
          </button>
        </form>
      )}
    </div>
  );
}
