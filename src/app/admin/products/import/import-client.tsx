"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Upload, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { importProductsAction, type ImportResult } from "./actions";

export function ImportClient() {
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ImportResult | null>(null);

  function onFile(file: File | undefined) {
    if (!file) return;
    if (!file.name.endsWith(".csv")) {
      toast.error("Sadece .csv dosyasi");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Max 5 MB");
      return;
    }
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setCsvText(String(reader.result || ""));
    };
    reader.readAsText(file, "utf-8");
  }

  function onSubmit() {
    if (!csvText.trim()) {
      toast.error("Once CSV yukle veya yapistir");
      return;
    }
    startTransition(async () => {
      try {
        const r = await importProductsAction(csvText);
        setResult(r);
        if (r.created > 0) {
          toast.success(`${r.created} urun eklendi`);
        } else if (r.errors.length === 0) {
          toast.info("Yeni urun yok (hepsi mevcuttu)");
        } else {
          toast.error(`${r.errors.length} satir hatali`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  return (
    <section className="mt-10 border-t border-line pt-8">
      <h2 className="caps-wide text-sm">Yükle</h2>

      <label className="mt-4 flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed border-line bg-bone/40 px-6 py-10 transition-colors hover:border-ink">
        <Upload className="size-5 text-mist" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-mist">
          {fileName ?? "CSV dosyası seç"}
        </p>
        <input
          type="file"
          accept=".csv"
          className="hidden"
          onChange={(e) => onFile(e.target.files?.[0])}
        />
      </label>

      <details className="mt-6">
        <summary className="cursor-pointer text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink">
          ya da CSV'yi elden yapıştır →
        </summary>
        <textarea
          value={csvText}
          onChange={(e) => {
            setCsvText(e.target.value);
            setFileName(null);
          }}
          rows={12}
          placeholder="slug,categorySlug,basePrice,..."
          className="mt-3 w-full resize-y border border-line bg-paper p-4 font-mono text-xs outline-none focus:border-ink"
        />
      </details>

      <button
        type="button"
        onClick={onSubmit}
        disabled={pending || !csvText.trim()}
        className="mt-6 inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
      >
        {pending ? (
          <>
            <Loader2 className="size-3.5 animate-spin" />
            Yükleniyor...
          </>
        ) : (
          <>
            <Upload className="size-3.5" />
            İşle ve Yükle
          </>
        )}
      </button>

      {result ? (
        <div className="mt-8 border border-line bg-paper p-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — sonuç
          </p>
          <div className="mt-4 grid grid-cols-3 gap-6">
            <div>
              <p className="text-xs text-mist">Toplam satır</p>
              <p className="display mt-2 text-3xl tabular-nums">{result.total}</p>
            </div>
            <div>
              <p className="text-xs text-mist">Eklenen</p>
              <p
                className={`display mt-2 text-3xl tabular-nums ${
                  result.created > 0 ? "text-green-700" : ""
                }`}
              >
                {result.created}
              </p>
            </div>
            <div>
              <p className="text-xs text-mist">Atlanan / hatalı</p>
              <p
                className={`display mt-2 text-3xl tabular-nums ${
                  result.errors.length > 0 ? "text-amber-600" : ""
                }`}
              >
                {result.skipped + result.errors.length}
              </p>
            </div>
          </div>

          {result.skipped > 0 ? (
            <p className="mt-6 inline-flex items-center gap-2 text-[12px] text-mist">
              <CheckCircle2 className="size-3.5" />
              {result.skipped} satır zaten vardı, atlandı (idempotent).
            </p>
          ) : null}

          {result.errors.length > 0 ? (
            <div className="mt-6">
              <p className="inline-flex items-center gap-2 text-[12px] text-amber-700">
                <AlertCircle className="size-3.5" />
                {result.errors.length} satır eklenemedi:
              </p>
              <ul className="mt-3 space-y-1 text-[12px]">
                {result.errors.slice(0, 20).map((e, i) => (
                  <li key={i} className="font-mono text-amber-700">
                    Satır {e.row}: {e.message}
                  </li>
                ))}
                {result.errors.length > 20 ? (
                  <li className="text-mist">
                    ... ve {result.errors.length - 20} daha
                  </li>
                ) : null}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
