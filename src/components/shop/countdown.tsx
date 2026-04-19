"use client";

import { useEffect, useState } from "react";

function diff(target: Date) {
  const now = Date.now();
  const t = Math.max(0, target.getTime() - now);
  const days = Math.floor(t / (1000 * 60 * 60 * 24));
  const hours = Math.floor((t / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((t / (1000 * 60)) % 60);
  const seconds = Math.floor((t / 1000) % 60);
  return { days, hours, minutes, seconds, done: t <= 0 };
}

export function Countdown({
  target,
  className,
}: {
  target: string | Date;
  className?: string;
}) {
  const targetDate = typeof target === "string" ? new Date(target) : target;
  const [t, setT] = useState(() => diff(targetDate));

  useEffect(() => {
    const id = setInterval(() => setT(diff(targetDate)), 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  const parts: [string, number][] = [
    ["Gün", t.days],
    ["Saat", t.hours],
    ["Dk", t.minutes],
    ["Sn", t.seconds],
  ];

  return (
    <div className={`flex items-start gap-6 md:gap-10 ${className ?? ""}`}>
      {parts.map(([label, n]) => (
        <div key={label} className="flex flex-col">
          <span className="display text-5xl tabular-nums md:text-7xl">
            {String(n).padStart(2, "0")}
          </span>
          <span className="mt-2 text-[10px] uppercase tracking-[0.3em] text-mist">
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}
