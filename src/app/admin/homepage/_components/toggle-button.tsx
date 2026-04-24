"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { toggleBlockAction } from "../actions";

export function ToggleBlockButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const [pending, startTransition] = useTransition();

  function onClick() {
    startTransition(async () => {
      await toggleBlockAction(id);
      toast.success(isActive ? "Pasifleştirildi." : "Aktifleştirildi.");
    });
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={pending}
      className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] transition-colors disabled:opacity-50 ${
        isActive
          ? "border-ink bg-ink text-paper hover:opacity-80"
          : "border-line text-mist hover:border-ink hover:text-ink"
      }`}
    >
      {isActive ? "Aktif" : "Pasif"}
    </button>
  );
}
