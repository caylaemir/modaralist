"use client";

import { useId, useMemo, useState } from "react";
import { TR_CITIES } from "@/lib/tr-cities";

type Props = {
  name: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  placeholder?: string;
  className?: string;
};

export function CityInput({
  name,
  value,
  onChange,
  required,
  placeholder,
  className,
}: Props) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const suggestions = useMemo(() => {
    const q = value.trim().toLocaleLowerCase("tr-TR");
    if (!q) return TR_CITIES.slice(0, 8);
    return TR_CITIES.filter((c) =>
      c.toLocaleLowerCase("tr-TR").startsWith(q)
    ).slice(0, 8);
  }, [value]);

  return (
    <div className="relative">
      <input
        type="text"
        name={name}
        list={listId}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        required={required}
        placeholder={placeholder}
        autoComplete="address-level1"
        className={
          className ??
          "w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
        }
      />
      {open && suggestions.length > 0 ? (
        <ul className="absolute left-0 right-0 top-full z-20 mt-1 max-h-64 overflow-y-auto border border-line bg-paper shadow-sm">
          {suggestions.map((c) => (
            <li key={c}>
              <button
                type="button"
                onClick={() => {
                  onChange(c);
                  setOpen(false);
                }}
                className="block w-full px-4 py-2 text-left text-sm hover:bg-bone"
              >
                {c}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <datalist id={listId}>
        {TR_CITIES.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
    </div>
  );
}
