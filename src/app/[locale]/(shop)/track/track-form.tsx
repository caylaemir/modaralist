"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";

export function TrackForm({
  initialOrder,
  initialEmail,
}: {
  initialOrder: string;
  initialEmail: string;
}) {
  const [orderNumber, setOrderNumber] = useState(initialOrder);
  const [email, setEmail] = useState(initialEmail);
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({
      order: orderNumber.trim(),
      email: email.trim(),
    });
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          Sipariş No
        </label>
        <input
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          placeholder="MDR-2026-XXXXXXXX"
          required
          className="mt-2 w-full border-b border-line bg-transparent py-3 font-mono uppercase outline-none focus:border-ink"
        />
      </div>
      <div>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          E-posta
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="mt-2 w-full border-b border-line bg-transparent py-3 outline-none focus:border-ink"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
      >
        <span>{pending ? "Aranıyor..." : "Siparişi Sorgula"}</span>
        <span>→</span>
      </button>
    </form>
  );
}
