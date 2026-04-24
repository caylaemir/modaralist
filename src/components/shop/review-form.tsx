"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

export function ReviewForm({
  productSlug,
  isLoggedIn,
}: {
  productSlug: string;
  isLoggedIn: boolean;
}) {
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) {
      toast.error("Yorum bırakmak için giriş yapmalısın.");
      return;
    }
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
    <form onSubmit={onSubmit} className="border-t border-line py-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — değerlendirme
      </p>
      <h3 className="display mt-3 text-2xl">Bu ürün için yorum bırak</h3>

      {!isLoggedIn ? (
        <p className="mt-4 text-sm text-mist">
          Yorum bırakmak için{" "}
          <a
            href="/login"
            className="text-ink underline underline-offset-4"
          >
            giriş yap
          </a>
          .
        </p>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setRating(n)}
                aria-label={`${n} yıldız`}
                className={`text-3xl transition-colors ${
                  n <= rating ? "text-ink" : "text-line"
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
        </>
      )}
    </form>
  );
}
