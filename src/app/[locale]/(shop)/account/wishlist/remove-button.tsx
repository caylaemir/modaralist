"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { removeFromWishlistAction } from "../actions";

export function WishlistRemoveButton({ slug }: { slug: string }) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await removeFromWishlistAction(slug);
      toast.success("Favorilerden çıkarıldı.");
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink disabled:opacity-50"
    >
      {pending ? "..." : "Favoriden çıkar"}
    </button>
  );
}
