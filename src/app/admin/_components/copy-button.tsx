"use client";

import { toast } from "sonner";

export function CopyButton({
  value,
  label = "Kopyala",
}: {
  value: string;
  label?: string;
}) {
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(value);
      toast.success("Panoya kopyalandı.");
    } catch {
      toast.error("Kopyalanamadı.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="border border-line px-3 py-1 text-xs"
    >
      {label}
    </button>
  );
}
