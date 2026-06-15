"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import {
  createSizeChart,
  updateSizeChart,
  type SizeChartInput,
} from "@/server/actions/size-charts";

export type ChartFormCategory = {
  id: string;
  name: string;
  parentId: string | null;
};

export type ChartFormInitial = {
  id?: string;
  slug?: string;
  unit?: "cm" | "inch";
  isActive?: boolean;
  nameTr?: string;
  nameEn?: string;
  noteTr?: string | null;
  noteEn?: string | null;
  columns?: { key: string; labelTr: string; labelEn: string }[];
  rows?: { sizeCode: string; values: Record<string, string> }[];
  categoryIds?: string[];
};

type Column = { key: string; labelTr: string; labelEn: string };
type Row = { sizeCode: string; values: Record<string, string> };

export function ChartForm({
  mode,
  chartId,
  initial,
  categories,
}: {
  mode: "create" | "edit";
  chartId?: string;
  initial?: ChartFormInitial;
  categories: ChartFormCategory[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [slug, setSlug] = useState(initial?.slug ?? "");
  const [unit, setUnit] = useState<"cm" | "inch">(initial?.unit ?? "cm");
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [nameTr, setNameTr] = useState(initial?.nameTr ?? "");
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [noteTr, setNoteTr] = useState(initial?.noteTr ?? "");
  const [noteEn, setNoteEn] = useState(initial?.noteEn ?? "");
  const [columns, setColumns] = useState<Column[]>(
    initial?.columns ?? [
      { key: "gogus", labelTr: "Göğüs", labelEn: "Chest" },
      { key: "boy", labelTr: "Boy", labelEn: "Length" },
      { key: "kol", labelTr: "Kol", labelEn: "Sleeve" },
    ]
  );
  const [rows, setRows] = useState<Row[]>(
    initial?.rows ?? [
      { sizeCode: "XS", values: {} },
      { sizeCode: "S", values: {} },
      { sizeCode: "M", values: {} },
      { sizeCode: "L", values: {} },
      { sizeCode: "XL", values: {} },
    ]
  );
  const [categoryIds, setCategoryIds] = useState<string[]>(
    initial?.categoryIds ?? []
  );

  function addColumn() {
    const idx = columns.length + 1;
    setColumns([
      ...columns,
      { key: `kolon_${idx}`, labelTr: "Yeni", labelEn: "New" },
    ]);
  }

  function removeColumn(i: number) {
    const removedKey = columns[i].key;
    setColumns(columns.filter((_, idx) => idx !== i));
    // Bu kolonun degerlerini her satirdan da temizle
    setRows((rs) =>
      rs.map((r) => {
        const { [removedKey]: _, ...rest } = r.values;
        return { ...r, values: rest };
      })
    );
  }

  function updateColumn(i: number, patch: Partial<Column>) {
    setColumns(columns.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function addRow() {
    setRows([...rows, { sizeCode: "", values: {} }]);
  }

  function removeRow(i: number) {
    setRows(rows.filter((_, idx) => idx !== i));
  }

  function updateRowSize(i: number, sizeCode: string) {
    setRows(rows.map((r, idx) => (idx === i ? { ...r, sizeCode } : r)));
  }

  function updateRowValue(i: number, key: string, value: string) {
    setRows(
      rows.map((r, idx) =>
        idx === i ? { ...r, values: { ...r.values, [key]: value } } : r
      )
    );
  }

  function toggleCategory(id: string) {
    setCategoryIds((arr) =>
      arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id]
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: SizeChartInput = {
      slug: slug.trim(),
      unit,
      isActive,
      nameTr: nameTr.trim(),
      nameEn: nameEn.trim(),
      noteTr: noteTr.trim() || null,
      noteEn: noteEn.trim() || null,
      columns: columns.map((c) => ({
        key: c.key.trim(),
        labelTr: c.labelTr.trim(),
        labelEn: c.labelEn.trim(),
      })),
      rows: rows
        .filter((r) => r.sizeCode.trim().length > 0)
        .map((r) => ({ sizeCode: r.sizeCode.trim(), values: r.values })),
      categoryIds,
    };

    startTransition(async () => {
      try {
        if (mode === "edit" && chartId) {
          await updateSizeChart(chartId, payload);
          toast.success("Tablo güncellendi.");
        } else {
          await createSizeChart(payload);
          toast.success("Tablo oluşturuldu.");
        }
        router.push("/admin/size-charts");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kaydedilemedi.");
      }
    });
  }

  const inputCls =
    "w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink outline-none";
  const labelCls = "mb-1 block text-xs uppercase tracking-wider text-mist";

  // Kategorileri ata zincirine gore grupla — top-level + indent
  const tops = categories.filter((c) => c.parentId == null);

  function renderCategoryNode(node: ChartFormCategory, depth: number): React.ReactNode {
    const children = categories.filter((c) => c.parentId === node.id);
    const checked = categoryIds.includes(node.id);
    return (
      <div key={node.id}>
        <label
          className="flex cursor-pointer items-center gap-2 py-0.5 text-sm hover:text-ink"
          style={{ paddingLeft: depth * 16 }}
        >
          <input
            type="checkbox"
            checked={checked}
            onChange={() => toggleCategory(node.id)}
            className="size-3.5 shrink-0"
          />
          <span>{node.name}</span>
        </label>
        {children.map((c) => renderCategoryNode(c, depth + 1))}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      {/* --- Genel --- */}
      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">Genel</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Slug (benzersiz)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              placeholder="oversize-tisort"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>Birim</label>
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value as "cm" | "inch")}
              className={inputCls}
            >
              <option value="cm">cm</option>
              <option value="inch">inch</option>
            </select>
          </div>
          <div>
            <label className={labelCls}>TR Ad</label>
            <input
              type="text"
              value={nameTr}
              onChange={(e) => setNameTr(e.target.value)}
              required
              placeholder="Oversize Tişört"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>EN Ad</label>
            <input
              type="text"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              required
              placeholder="Oversize Tshirt"
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>TR Not (opsiyonel)</label>
            <input
              type="text"
              value={noteTr}
              onChange={(e) => setNoteTr(e.target.value)}
              placeholder="Arasında kaldıysan iki beden de olur — bedenine güven."
              className={inputCls}
            />
          </div>
          <div>
            <label className={labelCls}>EN Not (opsiyonel)</label>
            <input
              type="text"
              value={noteEn}
              onChange={(e) => setNoteEn(e.target.value)}
              placeholder="If you're between sizes — trust your instinct."
              className={inputCls}
            />
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="size-4 border border-line"
            />
            <label htmlFor="isActive" className="text-sm">
              Aktif (pasifse hiçbir yerde gösterilmez)
            </label>
          </div>
        </div>
      </section>

      {/* --- Kolonlar --- */}
      <section className="border border-line bg-paper p-6">
        <div className="flex items-center justify-between">
          <h2 className="caps-wide text-sm">Kolonlar (Ölçü Anahtarları)</h2>
          <button
            type="button"
            onClick={addColumn}
            className="inline-flex items-center gap-1 border border-line bg-bone px-3 py-1.5 text-xs hover:bg-line"
          >
            <Plus className="size-3" />
            Kolon Ekle
          </button>
        </div>
        <p className="mt-1 text-xs text-mist">
          <strong>Anahtar</strong> (örn. <code>gogus</code>) ürünün satır
          değerleriyle eşleşir. TR/EN ad müşteriye gösterilir.
        </p>
        <div className="mt-4 space-y-2">
          {columns.map((c, i) => (
            <div key={i} className="grid grid-cols-1 gap-2 md:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                type="text"
                value={c.key}
                onChange={(e) => updateColumn(i, { key: e.target.value })}
                placeholder="anahtar"
                className={inputCls + " font-mono"}
              />
              <input
                type="text"
                value={c.labelTr}
                onChange={(e) => updateColumn(i, { labelTr: e.target.value })}
                placeholder="TR Etiket"
                className={inputCls}
              />
              <input
                type="text"
                value={c.labelEn}
                onChange={(e) => updateColumn(i, { labelEn: e.target.value })}
                placeholder="EN Label"
                className={inputCls}
              />
              <button
                type="button"
                onClick={() => removeColumn(i)}
                className="shrink-0 border border-line bg-paper p-2 text-mist hover:text-red-600"
                aria-label="Kaldır"
              >
                <X className="size-3" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* --- Satirlar (Beden + Degerler) --- */}
      <section className="border border-line bg-paper p-6">
        <div className="flex items-center justify-between">
          <h2 className="caps-wide text-sm">Satırlar (Beden Değerleri)</h2>
          <button
            type="button"
            onClick={addRow}
            className="inline-flex items-center gap-1 border border-line bg-bone px-3 py-1.5 text-xs hover:bg-line"
          >
            <Plus className="size-3" />
            Satır Ekle
          </button>
        </div>
        <p className="mt-1 text-xs text-mist">
          Her satır bir beden (XS, S, M, ...). Hücrelere ölçü değeri yaz (örn.
          "84-88").
        </p>
        <div className="mt-4 overflow-x-auto border border-line">
          <table className="w-full text-xs">
            <thead className="border-b border-line bg-bone">
              <tr>
                <th className="px-3 py-2 text-left font-normal text-mist uppercase tracking-wider">
                  Beden
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="px-3 py-2 text-left font-normal text-mist uppercase tracking-wider"
                  >
                    {c.labelTr || c.key}
                  </th>
                ))}
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      value={r.sizeCode}
                      onChange={(e) => updateRowSize(i, e.target.value)}
                      placeholder="XS"
                      className="w-16 border border-line bg-paper px-2 py-1 text-center text-sm focus:border-ink outline-none"
                    />
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="px-2 py-1.5">
                      <input
                        type="text"
                        value={r.values[c.key] ?? ""}
                        onChange={(e) => updateRowValue(i, c.key, e.target.value)}
                        placeholder="84-88"
                        className="w-full border border-line bg-paper px-2 py-1 text-sm focus:border-ink outline-none"
                      />
                    </td>
                  ))}
                  <td className="px-2 py-1.5 text-right">
                    <button
                      type="button"
                      onClick={() => removeRow(i)}
                      className="border border-line bg-paper p-1.5 text-mist hover:text-red-600"
                      aria-label="Kaldır"
                    >
                      <X className="size-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* --- Kategoriler --- */}
      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">Kullanılacak Kategoriler</h2>
        <p className="mt-1 text-xs text-mist">
          Bu tablonun gözükeceği kategorileri seç. Bir ürünün ana kategorisi
          işaretlenirse o ürünün sayfasında bu tablo açılır. (Ek olarak: ata
          zincirinde de aranır — örn. "Oversize Tshirt"e bağlarsan onun
          altındaki tüm leaf'lerde de geçerli olur.)
        </p>
        <div className="mt-4 max-h-[420px] grid grid-cols-1 gap-x-6 gap-y-1 overflow-y-auto border border-line bg-bone/40 p-4 md:grid-cols-2">
          {tops.map((t) => renderCategoryNode(t, 0))}
        </div>
      </section>

      {/* --- Submit --- */}
      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-5 py-2 text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : mode === "edit" ? "Kaydet" : "Oluştur"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/size-charts")}
          className="border border-line px-4 py-2 text-sm hover:border-ink"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
