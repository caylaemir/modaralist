import type { ReactNode } from "react";

export function StatusBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded border border-line px-2 py-0.5 text-[10px] uppercase tracking-wider">
      {children}
    </span>
  );
}
