"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { deleteProduct } from "@/server/actions/products";

export function DeleteProductButton({
  id,
  name,
  afterDeleteHref,
}: {
  id: string;
  name: string;
  afterDeleteHref?: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteProduct(id);
        toast.success(`"${name}" silindi.`);
        setOpen(false);
        if (afterDeleteHref) {
          router.push(afterDeleteHref);
        } else {
          router.refresh();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Silinemedi.");
      }
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 border border-line bg-paper px-2 py-1 text-xs text-red-600 hover:bg-red-50"
      >
        <Trash2 className="size-3" />
        Sil
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => !isPending && setOpen(false)}
        >
          <div
            className="w-full max-w-md border border-line bg-paper p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="display text-2xl">Ürünü sil?</h3>
            <p className="mt-2 text-sm text-mist">
              <span className="text-ink">{name}</span> kalıcı olarak silinecek.
              Tüm varyantlar, görseller ve çeviriler de silinir. Bu işlem geri
              alınamaz.
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="border border-line bg-paper px-4 py-2 text-sm text-ink hover:bg-bone disabled:opacity-50"
              >
                Vazgeç
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isPending}
                className="bg-red-600 px-4 py-2 text-sm text-paper hover:opacity-90 disabled:opacity-50"
              >
                {isPending ? "Siliniyor..." : "Evet, sil"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
