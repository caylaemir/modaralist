"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save, X, FileText } from "lucide-react";
import {
  createKbAction,
  updateKbAction,
  deleteKbAction,
} from "./actions";

type Row = {
  id: string;
  title: string;
  content: string;
  keywords: string;
  isActive: boolean;
  sortOrder: number;
  updatedAt: Date;
};

export function KnowledgeClient({ initial }: { initial: Row[] }) {
  const [pending, startTransition] = useTransition();
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  function onCreate(fd: FormData) {
    startTransition(async () => {
      const res = await createKbAction(fd);
      if (res.ok) {
        toast.success("Bilgi eklendi");
        setAdding(false);
        window.location.reload();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function onUpdate(id: string, fd: FormData) {
    startTransition(async () => {
      const res = await updateKbAction(id, fd);
      if (res.ok) {
        toast.success("Güncellendi");
        setEditing(null);
        window.location.reload();
      } else {
        toast.error(res.error ?? "Hata");
      }
    });
  }

  function onDelete(id: string, title: string) {
    if (!confirm(`"${title}" silinsin?`)) return;
    startTransition(async () => {
      const res = await deleteKbAction(id);
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
      <div className="flex items-center justify-between border-b border-line pb-4">
        <p className="text-[12px] text-mist">
          {initial.length} bilgi · {initial.filter((r) => r.isActive).length} aktif
        </p>
        {!adding ? (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="inline-flex items-center gap-2 bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
          >
            <Plus className="size-3" /> Yeni Bilgi
          </button>
        ) : null}
      </div>

      {adding ? (
        <KbForm
          onSubmit={onCreate}
          onCancel={() => setAdding(false)}
          pending={pending}
        />
      ) : null}

      <div className="mt-6 space-y-3">
        {initial.map((r) => {
          const isEditing = editing === r.id;
          if (isEditing) {
            return (
              <KbForm
                key={r.id}
                initial={r}
                onSubmit={(fd) => onUpdate(r.id, fd)}
                onCancel={() => setEditing(null)}
                pending={pending}
              />
            );
          }
          return (
            <article
              key={r.id}
              className={`border bg-paper p-5 transition-colors ${
                r.isActive ? "border-line" : "border-line/50 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <FileText className="size-3.5 shrink-0 text-mist" />
                    <h3 className="text-base font-medium text-ink">{r.title}</h3>
                    {!r.isActive ? (
                      <span className="border border-line px-1.5 py-0.5 text-[9px] uppercase tracking-[0.2em] text-mist">
                        pasif
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-mist">
                    {r.content}
                  </p>
                  {r.keywords ? (
                    <p className="mt-2 text-[10px] text-mist">
                      <span className="uppercase tracking-[0.25em]">anahtar:</span>{" "}
                      <span className="font-mono">{r.keywords}</span>
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditing(r.id)}
                    className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                  >
                    Düzenle
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(r.id, r.title)}
                    disabled={pending}
                    className="text-mist hover:text-red-600 disabled:opacity-30"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>

    </div>
  );
}

function KbForm({
  initial,
  onSubmit,
  onCancel,
  pending,
}: {
  initial?: Row;
  onSubmit: (fd: FormData) => void;
  onCancel: () => void;
  pending: boolean;
}) {
  return (
    <form
      action={onSubmit}
      className="my-4 border-2 border-ink bg-bone/40 p-5 space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Başlık <span className="text-red-600">*</span>
          </label>
          <input
            type="text"
            name="title"
            defaultValue={initial?.title}
            required
            placeholder="Örn: Kargo Süreci"
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            İçerik <span className="text-red-600">*</span>
          </label>
          <textarea
            name="content"
            defaultValue={initial?.content}
            required
            rows={6}
            placeholder="Kargolarımız Aras Kargo ile gönderilir. Marmara bölgesinde 1-2 iş günü, diğer illerde 2-4 iş günü içinde teslim edilir. Her sipariş için takip numarası SMS ve email ile iletilir..."
            className="mt-1.5 w-full resize-y border border-line bg-paper px-3 py-2 text-sm leading-relaxed outline-none focus:border-ink"
          />
          <p className="mt-1.5 text-[11px] text-mist">
            Markdown destekli değil — düz metin yaz. Selo bunu özetleyerek
            müşteriye iletecek, çok uzun yazma (5-15 cümle ideal).
          </p>
        </div>
        <div className="md:col-span-2">
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Anahtar Kelimeler (virgülle)
          </label>
          <input
            type="text"
            name="keywords"
            defaultValue={initial?.keywords}
            placeholder="kargo, ücret, fiyat, ne kadar, kaç tl"
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <p className="mt-1.5 text-[11px] text-mist">
            Müşterinin sorabileceği farklı kelimeleri yaz. Eşleşme şansını
            artırır. Boş bırakırsan sadece başlık + içerik üzerinden aranır.
          </p>
        </div>
        <div>
          <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Sıra
          </label>
          <input
            type="number"
            name="sortOrder"
            defaultValue={initial?.sortOrder ?? 0}
            className="mt-1.5 w-full border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-ink"
          />
          <p className="mt-1.5 text-[11px] text-mist">
            Küçük sayı önce görünür (admin listede).
          </p>
        </div>
        <div>
          <label className="mt-7 flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial?.isActive ?? true}
              className="size-4 accent-ink"
            />
            Aktif (Selo bu bilgiye erişebilir)
          </label>
        </div>
      </div>
      <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
        <button
          type="button"
          onClick={onCancel}
          disabled={pending}
          className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          <X className="mr-1 inline size-3" /> İptal
        </button>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 bg-ink px-5 py-2.5 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          {pending ? (
            <Loader2 className="size-3 animate-spin" />
          ) : (
            <Save className="size-3" />
          )}
          Kaydet
        </button>
      </div>
    </form>
  );
}
