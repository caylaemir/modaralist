/**
 * Inline SVG sparkline-style sales chart. Recharts/etc. eklemeden,
 * server component, sadece veri alir cizer.
 */
type Point = { date: string; revenue: number; orders: number };

export function SalesChart({ points }: { points: Point[] }) {
  if (points.length === 0) {
    return (
      <div className="border-t border-line py-12 text-center">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — boş
        </p>
        <p className="display mt-3 text-2xl italic text-mist">
          Henüz sipariş verisi yok
        </p>
      </div>
    );
  }

  const W = 800;
  const H = 220;
  const PAD_X = 24;
  const PAD_Y = 20;
  const max = Math.max(...points.map((p) => p.revenue), 1);
  const xStep = (W - PAD_X * 2) / Math.max(points.length - 1, 1);

  const coords = points.map((p, i) => {
    const x = PAD_X + i * xStep;
    const y = H - PAD_Y - (p.revenue / max) * (H - PAD_Y * 2);
    return { x, y, ...p };
  });

  const pathD = coords
    .map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`))
    .join(" ");

  const fillD =
    pathD +
    ` L ${coords[coords.length - 1].x} ${H - PAD_Y} L ${coords[0].x} ${H - PAD_Y} Z`;

  const totalRevenue = points.reduce((s, p) => s + p.revenue, 0);
  const totalOrders = points.reduce((s, p) => s + p.orders, 0);

  return (
    <div className="border-t border-line pt-6">
      <div className="flex items-end justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — son {points.length} gün
          </p>
          <p className="display mt-3 text-3xl tabular-nums">
            ₺{Math.round(totalRevenue).toLocaleString("tr-TR")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            sipariş
          </p>
          <p className="display mt-3 text-3xl tabular-nums">{totalOrders}</p>
        </div>
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="mt-6 h-56 w-full"
        preserveAspectRatio="none"
      >
        <path d={fillD} fill="#0a0a0a" fillOpacity="0.06" />
        <path d={pathD} fill="none" stroke="#0a0a0a" strokeWidth="1.5" />
        {coords.map((c) => (
          <circle
            key={c.date}
            cx={c.x}
            cy={c.y}
            r="2.5"
            fill="#0a0a0a"
          />
        ))}
      </svg>

      <div className="mt-2 flex justify-between text-[10px] uppercase tracking-[0.25em] text-mist">
        <span>{points[0]?.date}</span>
        <span>{points[points.length - 1]?.date}</span>
      </div>
    </div>
  );
}
