"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, X, Sparkles } from "lucide-react";
import {
  createTagAction,
  updateTagAction,
  deleteTagAction,
} from "./actions";

type Row = {
  id: string;
  code: string;
  labelTr: string;
  labelEn: string;
  productCount: number;
};

type Suggested = { code: string; labelTr: string; labelEn: string };

export function TagsClient({
  initial,
  suggested,
}: {
  initial: Row[];
  suggested: Suggested[];
}) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function onCreate(fd: FormData) {
    startTransition(async () => {
      const res = await createTagAction(fd);
      if (res.ok) {
        toast.success("Etiket eklendi");
        setAdding(false);
        window.location.reload();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function quickAdd(s: Suggested) {
    const fd = new FormData();
    fd.set("code", s.code);
    fd.set("labelTr", s.labelTr);
    fd.set("labelEn", s.labelEn);
    startTransition(async () => {
      const res = await createTagAction(fd);
      if (res.ok) {
        toast.success(`${s.labelTr} eklendi`);
        window.location.reload();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function onUpdate(id: string, fd: FormData) {
    startTransition(async () => {
      const res = await updateTagAction(id, fd);
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
    if (!confirm(`"${code}" etiketini sil?`)) return;
    startTransition(async () => {
      const res = await deleteTagAction(id);
      if (res.ok) {
        toast.success("Silindi");
        window.location.reload();
      } else {
        toast.error(res.error ?? "Silinemedi");
      }
    });
  }

  return (
    <div className="mt-10">
      {suggested.length > 0 ? (
        <section className="mb-8 border border-line bg-bone/40 p-5">
          <div className="flex items-start gap-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-mist" />
            <div className="flex-1">
              <p className="text-[11px] uppercase tracking-[0.3em] text-mist">
                hizli ekle — sik kullanilan etiketler
              </p>
              <p className="mt-1.5 text-[12px] text-mist">
                Aşağıdaki etiketler tek tıkla eklenir. Cinsiyet filtresi için
                kadın/erkek/unisex'i öneririz.
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {suggested.map((s) => (
                  <button
                    key={s.code}
                    type="button"
                    onClick={() => quickAdd(s)}
                    disabled={pending}
                    className="inline-flex items-center gap-1.5 border border-ink bg-paper px-3 py-1.5 text-[11px] uppercase tracking-[0.25em] hover:bg-ink hover:text-paper disabled:opacity-50"
                  >
                    <Plus className="size-3" /> {s.labelTr}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <div className="flex items-center justify-between border-b border-line pb-4">
        <p className="text-[12px] text-mist">{initial.length} etiket</p>
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
          >
            <Plus className="size-3" /> Yeni Etiket
          </button>
        ) : null}
      </div>

      {adding ? (
        <form
          action={onCreate}
          className="mt-6 grid grid-cols-2 gap-3 border border-ink bg-bone p-5 md:grid-cols-4"
        >
          <FormField label="Kod" name="code" placeholder="kadin" required />
          <FormField label="Türkçe" name="labelTr" placeholder="Kadın" required />
          <FormField label="English" name="labelEn" placeholder="Women" required />
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
              <th className="border-b border-line px-4 py-3 text-left font-medium">TR</th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">EN</th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">Ürün</th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {initial.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-sm text-mist">
                  Henüz etiket yok. Yukarıdan hızlı ekle veya yeni oluştur.
                </td>
              </tr>
            ) : (
              initial.map((r) => {
                const isEditing = editing === r.id;
                if (isEditing) {
                  return (
                    <tr key={r.id} className="border-b border-line bg-bone/40">
                      <td colSpan={5} className="px-4 py-3">
                        <form
                          action={(fd) => onUpdate(r.id, fd)}
                          className="grid grid-cols-2 gap-2 md:grid-cols-4"
                        >
                          <input name="code" defaultValue={r.code} className={inputCls} />
                          <input name="labelTr" defaultValue={r.labelTr} className={inputCls} />
                          <input name="labelEn" defaultValue={r.labelEn} className={inputCls} />
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
                    <td className="px-4 py-3 font-mono text-[12px]">{r.code}</td>
                    <td className="px-4 py-3">{r.labelTr}</td>
                    <td className="px-4 py-3 text-mist">{r.labelEn}</td>
                    <td className="px-4 py-3 text-right tabular-nums text-mist">{r.productCount}</td>
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
                          disabled={pending || r.productCount > 0}
                          className="text-mist hover:text-red-600 disabled:opacity-30"
                          title={r.productCount > 0 ? "Ürünler kullanıyor" : "Sil"}
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
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
  required,
}: {
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="text-[10px] uppercase tracking-[0.25em] text-mist">{label}</span>
      <input
        name={name}
        type="text"
        placeholder={placeholder}
        required={required}
        className={`mt-1.5 ${inputCls}`}
      />
    </label>
  );
}
