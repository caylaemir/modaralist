"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteSizeChart } from "@/server/actions/size-charts";

export function DeleteChartButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(`"${name}" tablosunu silmek istediğine emin misin?`)) return;
    startTransition(async () => {
      try {
        await deleteSizeChart(id);
        toast.success("Tablo silindi.");
        router.push("/admin/size-charts");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Silinemedi.");
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="inline-flex items-center gap-2 border border-line bg-paper px-3 py-2 text-xs text-mist hover:border-red-600 hover:text-red-600 disabled:opacity-50"
    >
      <Trash2 className="size-3" />
      Sil
    </button>
  );
}
