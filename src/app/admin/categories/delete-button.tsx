"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { deleteCategory } from "@/server/actions/categories";

export function DeleteCategoryButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onDelete() {
    if (!confirm(`"${name}" kategorisini silmek istediğine emin misin?`)) {
      return;
    }
    startTransition(async () => {
      try {
        await deleteCategory(id);
        toast.success("Kategori silindi.");
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Silme başarısız.";
        toast.error(msg);
      }
    });
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      className="border border-line px-3 py-1 text-xs hover:border-ink disabled:opacity-50"
    >
      {pending ? "Siliniyor..." : "Sil"}
    </button>
  );
}
