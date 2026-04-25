"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { bulkUpdateProductsAction, bulkDeleteProductsAction } from "../actions";

type Action = "publish" | "draft" | "archive" | "delete";

const ACTIONS: { value: Action; label: string }[] = [
  { value: "publish", label: "Yayına al" },
  { value: "draft", label: "Taslağa çek" },
  { value: "archive", label: "Arşivle" },
  { value: "delete", label: "Sil" },
];

export function BulkActions({ ids }: { ids: string[] }) {
  const [action, setAction] = useState<Action | "">("");
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  if (ids.length === 0) return null;

  function run() {
    if (!action) {
      toast.error("Bir aksiyon seç.");
      return;
    }
    if (action === "delete") {
      if (!confirm(`${ids.length} ürünü kalıcı olarak silmek istediğine emin misin?`)) {
        return;
      }
    }
    startTransition(async () => {
      const res =
        action === "delete"
          ? await bulkDeleteProductsAction(ids)
          : await bulkUpdateProductsAction(ids, action);
      if (res.ok) {
        toast.success(`${ids.length} ürün güncellendi.`);
        router.refresh();
      } else {
        toast.error(res.error ?? "İşlem başarısız.");
      }
    });
  }

  return (
    <div className="sticky bottom-4 z-10 mt-6 flex items-center justify-between border border-line bg-paper px-5 py-3 shadow-sm">
      <p className="text-[11px] uppercase tracking-[0.3em]">
        {ids.length} seçili
      </p>
      <div className="flex items-center gap-3">
        <select
          value={action}
          onChange={(e) => setAction(e.target.value as Action | "")}
          className="border-b border-line bg-transparent py-1 text-sm outline-none"
        >
          <option value="">— aksiyon seç</option>
          {ACTIONS.map((a) => (
            <option key={a.value} value={a.value}>
              {a.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={run}
          disabled={pending || !action}
          className="bg-ink px-4 py-2 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          {pending ? "..." : "Uygula"}
        </button>
      </div>
    </div>
  );
}
