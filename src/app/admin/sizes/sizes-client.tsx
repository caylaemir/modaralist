"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, X } from "lucide-react";
import {
  createSizeAction,
  updateSizeAction,
  deleteSizeAction,
} from "./actions";

type Row = {
  id: string;
  code: string;
  sortOrder: number;
  variantCount: number;
};

export function SizesClient({ initial }: { initial: Row[] }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function onCreate(fd: FormData) {
    startTransition(async () => {
      const res = await createSizeAction(fd);
      if (res.ok) {
        toast.success("Beden eklendi");
        setAdding(false);
        window.location.reload();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function onUpdate(id: string, fd: FormData) {
    startTransition(async () => {
      const res = await updateSizeAction(id, fd);
      if (res.ok) {
        toast.success("Güncellendi");
        setEditing(null);
        window.location.reload();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function onDelete(id: string, code: string) {
    if (!confirm(`"${code}" bedenini sil?`)) return;
    startTransition(async () => {
      const res = await deleteSizeAction(id);
      if (res.ok) {
        toast.success("Silindi");
        window.location.reload();
      } else {
        toast.error(res.error ?? "Silinemedi");
      }
    });
  }

  // Sonraki sortOrder onerisi (max + 1)
  const nextOrder = initial.length > 0 ? Math.max(...initial.map((r) => r.sortOrder)) + 1 : 0;

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between border-b border-line pb-4">
        <p className="text-[12px] text-mist">{initial.length} beden</p>
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
          >
            <Plus className="size-3" /> Yeni Beden
          </button>
        ) : null}
      </div>

      {adding ? (
        <form
          action={onCreate}
          className="mt-6 grid grid-cols-2 gap-3 border border-ink bg-bone p-5 md:grid-cols-3"
        >
          <FormField label="Kod" name="code" placeholder="XXL" required />
          <FormField
            label="Sıra"
            name="sortOrder"
            type="number"
            placeholder={String(nextOrder)}
            required
          />
          <div className="flex items-end gap-2">
            <button
              type="submit"
              disabled={pending}
              className="flex flex-1 items-center justify-center gap-2 bg-ink px-3 py-2 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
            >
              {pending ? <Loader2 className="size-3 animate-spin" /> : <Save className="size-3" />}
              Kaydet
            </button>
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="border border-line bg-paper p-2 text-mist hover:text-ink"
            >
              <X className="size-3.5" />
            </button>
          </div>
        </form>
      ) : null}

      <div className="mt-6 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead className="text-[10px] uppercase tracking-[0.24em] text-mist">
            <tr>
              <th className="border-b border-line px-4 py-3 text-left font-medium">Kod</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Sıra</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Variants</th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {initial.map((r) => {
              const isEditing = editing === r.id;
              if (isEditing) {
                return (
                  <tr key={r.id} className="border-b border-line bg-bone/40">
                    <td colSpan={4} className="px-4 py-3">
                      <form action={(fd) => onUpdate(r.id, fd)} className="grid grid-cols-2 gap-2 md:grid-cols-3">
                        <input name="code" defaultValue={r.code} className={inputCls} />
                        <input name="sortOrder" type="number" defaultValue={r.sortOrder} className={inputCls} />
                        <div className="flex gap-1">
                          <button
                            type="submit"
                            disabled={pending}
                            className="flex-1 bg-ink px-2 py-1.5 text-[10px] uppercase tracking-[0.25em] text-paper disabled:opacity-50"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditing(null)}
                            className="border border-line p-1.5 text-mist"
                          >
                            <X className="size-3" />
                          </button>
                        </div>
                      </form>
                    </td>
                  </tr>
                );
              }
              return (
                <tr key={r.id} className="border-b border-line transition-colors hover:bg-bone/40">
                  <td className="px-4 py-3 font-mono">{r.code}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-mist">{r.sortOrder}</td>
                  <td className="px-4 py-3 text-right tabular-nums text-mist">{r.variantCount}</td>
                  <td className="py-3 pr-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => setEditing(r.id)}
                        className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                      >
                        Düzenle
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(r.id, r.code)}
                        disabled={pending || r.variantCount > 0}
                        className="text-mist hover:text-red-600 disabled:opacity-30"
                        title={r.variantCount > 0 ? "Varyantlar kullanıyor" : "Sil"}
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const inputCls =
  "w-full border border-line bg-paper px-2 py-1.5 text-xs outline-none focus:border-ink";

function FormField({
  label,
  name,
  placeholder,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-mist">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={`mt-1.5 ${inputCls}`}
      />
    </label>
  );
}
