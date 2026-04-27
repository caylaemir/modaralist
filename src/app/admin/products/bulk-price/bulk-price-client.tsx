"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import {
  bulkPriceAction,
  type BulkPriceInput,
  type BulkPriceResult,
} from "./actions";

type CategoryOpt = {
  id: string;
  name: string;
  slug: string;
  productCount: number;
};

const OPS: Array<{
  value: BulkPriceInput["operation"];
  label: string;
  showValue: boolean;
  unit: string;
}> = [
  { value: "increase-percent", label: "Yüzdelik artır (zam)", showValue: true, unit: "%" },
  { value: "decrease-percent", label: "Yüzdelik azalt (indirim)", showValue: true, unit: "%" },
  { value: "increase-amount", label: "Sabit ekle (TL)", showValue: true, unit: "₺" },
  { value: "decrease-amount", label: "Sabit çıkar (TL)", showValue: true, unit: "₺" },
  { value: "set-fixed", label: "Sabit fiyata ayarla", showValue: true, unit: "₺" },
  { value: "reset-discount", label: "Tüm indirimleri kaldır (discountPrice = NULL)", showValue: false, unit: "" },
];

export function BulkPriceClient({ categories }: { categories: CategoryOpt[] }) {
  const [op, setOp] = useState<BulkPriceInput["operation"]>("increase-percent");
  const [value, setValue] = useState<string>("10");
  const [field, setField] = useState<BulkPriceInput["field"]>("basePrice");
  const [categoryId, setCategoryId] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<BulkPriceResult | null>(null);

  const opMeta = OPS.find((o) => o.value === op)!;

  function buildInput(preview: boolean): BulkPriceInput {
    return {
      operation: op,
      value: opMeta.showValue ? Number(value) || 0 : 0,
      field,
      filters: {
        ...(categoryId ? { categoryId } : {}),
        ...(status
          ? { status: status as "DRAFT" | "PUBLISHED" | "ARCHIVED" | "COMING_SOON" }
          : {}),
      },
      preview,
    };
  }

  function onPreview() {
    startTransition(async () => {
      try {
        const r = await bulkPriceAction(buildInput(true));
        setResult(r);
        if (r.changed === 0) {
          toast.info(`${r.total} urun bulundu, hicbir fiyat degismeyecek`);
        } else {
          toast.success(`Onizleme: ${r.changed}/${r.total} urun degisecek`);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  function onApply() {
    if (!result || result.changed === 0) {
      toast.error("Once onizleme yap");
      return;
    }
    if (
      !confirm(
        `${result.changed} ürünün fiyatı kalıcı olarak güncellenecek. Devam edilsin mi?`
      )
    ) {
      return;
    }
    startTransition(async () => {
      try {
        const r = await bulkPriceAction(buildInput(false));
        setResult(r);
        toast.success(`${r.applied} ürün güncellendi`);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Hata");
      }
    });
  }

  return (
    <div className="mt-10 space-y-10">
      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">Operasyon</h2>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              İşlem
            </label>
            <select
              value={op}
              onChange={(e) =>
                setOp(e.target.value as BulkPriceInput["operation"])
              }
              className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            >
              {OPS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          {opMeta.showValue ? (
            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                Değer ({opMeta.unit})
              </label>
              <input
                type="number"
                step="0.01"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
              />
            </div>
          ) : null}
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Hangi alan
            </label>
            <select
              value={field}
              onChange={(e) =>
                setField(e.target.value as BulkPriceInput["field"])
              }
              disabled={op === "reset-discount"}
              className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink disabled:opacity-50"
            >
              <option value="basePrice">Sadece normal fiyat</option>
              <option value="discountPrice">Sadece indirimli fiyat</option>
              <option value="both">İkisi birden</option>
            </select>
          </div>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">Filtre</h2>
        <p className="mt-2 text-[12px] text-mist">
          Boş bırakırsan TÜM ürünlere uygulanır. Önce küçük filtreyle test et.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Kategori
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="">— Tümü —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.productCount})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Durum
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-2 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
            >
              <option value="">— Tümü —</option>
              <option value="PUBLISHED">Sadece yayında</option>
              <option value="DRAFT">Sadece taslak</option>
              <option value="COMING_SOON">Sadece yakında</option>
              <option value="ARCHIVED">Sadece arşiv</option>
            </select>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onPreview}
          disabled={pending}
          className="inline-flex items-center gap-3 border border-ink bg-paper px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper disabled:opacity-50"
        >
          {pending && !result?.applied ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}
          Önizle
        </button>
        <button
          type="button"
          onClick={onApply}
          disabled={pending || !result || result.changed === 0 || result.applied > 0}
          className="inline-flex items-center gap-3 bg-red-600 px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-white hover:bg-red-700 disabled:opacity-40"
        >
          {pending && result ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : null}
          Uygula (geri alınamaz)
        </button>
      </div>

      {result ? (
        <section className="border border-line bg-paper p-6">
          <div className="flex items-baseline gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                {result.preview ? "— önizleme" : "— uygulandı"}
              </p>
              <p className="display mt-2 text-3xl tabular-nums">
                {result.changed}/{result.total} ürün
                {result.applied > 0 ? (
                  <span className="ml-3 text-green-700">
                    ✓ {result.applied} kaydedildi
                  </span>
                ) : null}
              </p>
            </div>
          </div>

          {result.warnings.length > 0 ? (
            <div className="mt-6 border border-amber-200 bg-amber-50 p-4 text-[12px]">
              <p className="inline-flex items-center gap-2 font-medium text-amber-800">
                <AlertCircle className="size-3.5" />
                {result.warnings.length} uyarı:
              </p>
              <ul className="mt-2 list-inside list-disc space-y-1 text-amber-700">
                {result.warnings.slice(0, 10).map((w, i) => (
                  <li key={i} className="font-mono">
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="mt-6 max-h-[500px] overflow-auto border border-line">
            <table className="w-full text-xs">
              <thead className="bg-bone text-[10px] uppercase tracking-[0.2em] text-mist">
                <tr>
                  <th className="border-b border-line px-3 py-2 text-left">Ürün</th>
                  <th className="border-b border-line px-3 py-2 text-right">
                    Eski Normal
                  </th>
                  <th className="border-b border-line px-3 py-2 text-right">
                    Yeni Normal
                  </th>
                  <th className="border-b border-line px-3 py-2 text-right">
                    Eski İndirim
                  </th>
                  <th className="border-b border-line px-3 py-2 text-right">
                    Yeni İndirim
                  </th>
                </tr>
              </thead>
              <tbody>
                {result.rows
                  .filter(
                    (r) =>
                      r.oldBasePrice !== r.newBasePrice ||
                      r.oldDiscountPrice !== r.newDiscountPrice
                  )
                  .slice(0, 100)
                  .map((r) => (
                    <tr
                      key={r.id}
                      className={`border-b border-line ${r.warning ? "bg-amber-50" : ""}`}
                    >
                      <td className="px-3 py-2">
                        <p className="truncate">{r.name}</p>
                        <p className="font-mono text-[10px] text-mist">{r.slug}</p>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-mist">
                        ₺{r.oldBasePrice.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        <strong>₺{r.newBasePrice.toFixed(2)}</strong>
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums text-mist">
                        {r.oldDiscountPrice != null
                          ? `₺${r.oldDiscountPrice.toFixed(2)}`
                          : "—"}
                      </td>
                      <td className="px-3 py-2 text-right tabular-nums">
                        {r.newDiscountPrice != null ? (
                          <strong>₺{r.newDiscountPrice.toFixed(2)}</strong>
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {result.rows.length > 100 ? (
              <p className="border-t border-line p-3 text-center text-[11px] text-mist">
                ... ve {result.rows.length - 100} daha
              </p>
            ) : null}
          </div>

          {result.applied > 0 ? (
            <p className="mt-6 inline-flex items-center gap-2 text-[12px] text-green-700">
              <CheckCircle2 className="size-3.5" />
              Değişiklikler kalıcı olarak kaydedildi.
            </p>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
