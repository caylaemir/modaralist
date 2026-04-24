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
    console.error("[admin:error]", error);
  }, [error]);

  return (
    <div className="px-10 py-20">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — admin hatası
      </p>
      <h1 className="display mt-4 text-4xl">Bir şey ters gitti.</h1>
      <p className="mt-4 text-sm text-mist">
        Sayfayı yüklerken hata oluştu.
        {error.digest ? (
          <span className="ml-2 font-mono text-[11px]">{error.digest}</span>
        ) : null}
      </p>
      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-3 border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em]"
      >
        Tekrar Dene
      </button>
    </div>
  );
}
