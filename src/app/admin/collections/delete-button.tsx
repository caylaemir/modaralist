"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { deleteCollection } from "@/server/actions/collections";

export function DeleteCollectionButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function onClick() {
    if (!confirm(`"${name}" koleksiyonunu silmek istediğinden emin misin?`)) return;
    startTransition(async () => {
      try {
        await deleteCollection(id);
        toast.success("Koleksiyon silindi.");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Silinemedi.");
      }
    });
  }

  return (
    <button
      onClick={onClick}
      disabled={pending}
      className="border border-line bg-paper p-1.5 text-mist hover:border-red-400 hover:text-red-600 disabled:opacity-50"
      aria-label="Sil"
    >
      <Trash2 className="size-4" />
    </button>
  );
}
