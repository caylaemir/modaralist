"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[shop:error]", error);
  }, [error]);

  return (
    <div className="mx-auto max-w-2xl px-5 py-40 text-center md:px-10 md:py-56">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — bir şey ters gitti
      </p>
      <h1 className="display mt-8 text-[10vw] leading-[0.95] md:text-[6vw]">
        Sessizlik bozuldu.
      </h1>
      <p className="mt-8 text-sm text-mist">
        Bir hata oluştu. Tekrar dener misin?
        {error.digest ? (
          <span className="mt-2 block font-mono text-[11px]">
            {error.digest}
          </span>
        ) : null}
      </p>
      <button
        onClick={reset}
        className="mt-12 inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper"
      >
        Tekrar Dene <span>→</span>
      </button>
    </div>
  );
}
