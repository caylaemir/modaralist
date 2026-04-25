"use client";

import { useState } from "react";
import { BulkActions } from "./bulk-actions";

/**
 * Wrapper'da useState ile secili id'leri tutar, child'a callback verir.
 * Children: render-prop pattern — selected/toggle/clear fonksiyonlarini alir.
 */
export function SelectableTable({
  allIds,
  children,
}: {
  allIds: string[];
  children: (api: {
    selected: Set<string>;
    isSelected: (id: string) => boolean;
    toggle: (id: string) => void;
    toggleAll: () => void;
    allSelected: boolean;
    clear: () => void;
  }) => React.ReactNode;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const isSelected = (id: string) => selected.has(id);
  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const toggleAll = () => {
    setSelected((s) => {
      if (s.size === allIds.length) return new Set();
      return new Set(allIds);
    });
  };
  const allSelected = selected.size === allIds.length && allIds.length > 0;
  const clear = () => setSelected(new Set());

  return (
    <>
      {children({ selected, isSelected, toggle, toggleAll, allSelected, clear })}
      <BulkActions ids={Array.from(selected)} />
    </>
  );
}
