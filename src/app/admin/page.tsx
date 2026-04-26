import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import type { OrderStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { ORDER_STATUS_LABELS, formatDateTimeTR } from "./orders/_lib";
import { SalesChart } from "./_components/sales-chart";

export const dynamic = "force-dynamic";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
      {children}
    </p>
  );
}

function StatCell({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warn";
}) {
  return (
    <div className="border-t border-line pt-5">
      <Eyebrow>{label}</Eyebrow>
      <p
        className={`display mt-4 text-5xl leading-none tabular-nums ${
          tone === "warn" ? "text-amber-600" : ""
        }`}
      >
        {value}
      </p>
      <p className="mt-3 text-[11px] text-mist">{hint ?? " "}</p>
    </div>
  );
}

function SecondaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-4">
      <Eyebrow>{label}</Eyebrow>
      <p className="display mt-3 text-3xl leading-none tabular-nums">{value}</p>
    </div>
  );
}

export default async function AdminDashboard() {
  const todayStart = startOfToday();
  const pendingShipmentStatuses: OrderStatus[] = ["PAID", "PREPARING"];
  const thirtyDaysAgo = new Date(todayStart.getTime() - 29 * 86400_000);

  const [
    todayOrderCount,
    todayRevenueAgg,
    pendingShipmentCount,
    lowStockCount,
    publishedProductCount,
    activeDropCount,
    totalCustomerCount,
    recentOrders,
    recentCustomers,
    last30Orders,
    topProducts,
  ] = await Promise.all([
    db.order.count({ where: { placedAt: { gte: todayStart } } }),
    db.order.aggregate({
      where: {
        placedAt: { gte: todayStart },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      _sum: { grandTotal: true },
    }),
    db.order.count({
      where: { status: { in: pendingShipmentStatuses } },
    }),
    // Dusuk stok = variant.stock < product.lowStockLimit
    // Prisma where icinde direkt karsilastirma yok — raw SQL ile sayiyoruz
    db.$queryRaw<{ count: bigint }[]>`
      SELECT COUNT(*)::bigint AS count
      FROM "ProductVariant" v
      JOIN "Product" p ON p.id = v."productId"
      WHERE v."isActive" = true
        AND p.status = 'PUBLISHED'
        AND v.stock < p."lowStockLimit"
    `.then((r) => Number(r[0]?.count ?? 0)),
    db.product.count({ where: { status: "PUBLISHED" } }),
    db.collection.count({
      where: { status: { in: ["UPCOMING", "LIVE"] } },
    }),
    db.user.count({ where: { role: "CUSTOMER" } }),
    db.order.findMany({
      orderBy: { placedAt: "desc" },
      take: 5,
      select: {
        id: true,
        orderNumber: true,
        email: true,
        grandTotal: true,
        status: true,
        placedAt: true,
      },
    }),
    db.user.findMany({
      where: { role: "CUSTOMER" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, name: true, email: true, createdAt: true },
    }),
    // Son 30 gün siparişler — chart için günlük gruplama (memory)
    db.order.findMany({
      where: {
        placedAt: { gte: thirtyDaysAgo },
        status: { notIn: ["CANCELLED", "REFUNDED"] },
      },
      select: { placedAt: true, grandTotal: true },
    }),
    // Top 5 ürün (son 30 günde sipariş kalemi sayısına göre)
    db.orderItem.groupBy({
      by: ["productNameSnapshot"],
      where: {
        order: {
          placedAt: { gte: thirtyDaysAgo },
          status: { notIn: ["CANCELLED", "REFUNDED"] },
        },
      },
      _sum: { quantity: true, lineTotal: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  // Dusuk stok ureunler (variant -> product), top 8 widget icin
  const lowStockVariants = await db.$queryRaw<
    {
      variantId: string;
      productId: string;
      productSlug: string;
      productName: string;
      sizeCode: string | null;
      colorName: string | null;
      stock: number;
      lowStockLimit: number;
    }[]
  >`
    SELECT
      v.id AS "variantId",
      p.id AS "productId",
      p.slug AS "productSlug",
      COALESCE(pt.name, p.slug) AS "productName",
      s.code AS "sizeCode",
      c."nameTr" AS "colorName",
      v.stock,
      p."lowStockLimit"
    FROM "ProductVariant" v
    JOIN "Product" p ON p.id = v."productId"
    LEFT JOIN "ProductTranslation" pt ON pt."productId" = p.id AND pt.locale = 'tr'::"Locale"
    LEFT JOIN "Size" s ON s.id = v."sizeId"
    LEFT JOIN "Color" c ON c.id = v."colorId"
    WHERE v."isActive" = true
      AND p.status = 'PUBLISHED'
      AND v.stock < p."lowStockLimit"
    ORDER BY v.stock ASC, p."updatedAt" DESC
    LIMIT 8
  `;

  // Daily aggregation for chart
  const dailyMap = new Map<string, { revenue: number; orders: number }>();
  for (let i = 0; i < 30; i++) {
    const d = new Date(thirtyDaysAgo.getTime() + i * 86400_000);
    const key = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    dailyMap.set(key, { revenue: 0, orders: 0 });
  }
  for (const o of last30Orders) {
    const d = new Date(o.placedAt);
    const key = `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}`;
    const entry = dailyMap.get(key);
    if (entry) {
      entry.revenue += Number(o.grandTotal);
      entry.orders += 1;
    }
  }
  const chartPoints = Array.from(dailyMap.entries()).map(([date, v]) => ({
    date,
    revenue: v.revenue,
    orders: v.orders,
  }));

  const todayRevenue = Number(todayRevenueAgg._sum.grandTotal ?? 0);

  const todayLabel = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(todayStart);

  return (
    <div>
      <header>
        <Eyebrow>— yönetim</Eyebrow>
        <h1 className="display mt-3 text-5xl leading-none">Panel</h1>
        <p className="mt-4 max-w-xl text-sm text-mist">
          Bugünün özeti ve işletmenin nabzı. Siparişler, stok ve yeni kayıtlar
          tek ekranda.
        </p>
      </header>

      <section className="mt-14">
        <div className="grid grid-cols-2 gap-x-8 gap-y-6 md:grid-cols-4">
          <StatCell
            label="Bugünkü Sipariş"
            value={String(todayOrderCount)}
            hint={todayLabel}
          />
          <StatCell
            label="Bugünkü Ciro"
            value={formatPrice(todayRevenue, "tr")}
            hint="İptal/iade hariç"
          />
          <StatCell
            label="Bekleyen Kargo"
            value={String(pendingShipmentCount)}
            hint="Ödenen + hazırlanan"
          />
          <StatCell
            label="Düşük Stok"
            value={String(lowStockCount)}
            hint="Variant.stock < Product.lowStockLimit"
            tone={lowStockCount > 0 ? "warn" : "default"}
          />
        </div>
      </section>

      <section className="mt-16">
        <Eyebrow>— genel durum</Eyebrow>
        <div className="mt-6 grid grid-cols-1 gap-x-8 gap-y-4 md:grid-cols-3">
          <SecondaryStat label="Yayında Ürün" value={String(publishedProductCount)} />
          <SecondaryStat label="Aktif Drop" value={String(activeDropCount)} />
          <SecondaryStat label="Toplam Müşteri" value={String(totalCustomerCount)} />
        </div>
      </section>

      <section className="mt-16">
        <Eyebrow>— ciro trendi</Eyebrow>
        <div className="mt-3">
          <SalesChart points={chartPoints} />
        </div>
      </section>

      {lowStockVariants.length > 0 ? (
        <section className="mt-16">
          <div className="flex items-end justify-between border-t border-line pt-5">
            <div>
              <Eyebrow>— stok azalan</Eyebrow>
              <h2 className="display mt-3 text-2xl leading-none">
                Düşük stok varyantları
              </h2>
              <p className="mt-2 text-[11px] text-mist">
                Variant stok eşik altında — yeniden üretim/satın alma kararı için.
              </p>
            </div>
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink hover:text-mist"
            >
              Ürünleri yönet
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </Link>
          </div>
          <ul className="mt-6">
            {lowStockVariants.map((v) => (
              <li
                key={v.variantId}
                className="border-t border-line last:border-b"
              >
                <Link
                  href={`/admin/products/${v.productId}`}
                  className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-bone/60"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm">{v.productName}</p>
                    <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-mist">
                      {[v.sizeCode, v.colorName].filter(Boolean).join(" · ") || "—"}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`tabular-nums text-sm ${
                        v.stock === 0 ? "text-red-600" : "text-amber-600"
                      }`}
                    >
                      {v.stock} adet
                    </p>
                    <p className="text-[11px] tabular-nums text-mist">
                      eşik: {v.lowStockLimit}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {topProducts.length > 0 ? (
        <section className="mt-16">
          <Eyebrow>— en çok satan</Eyebrow>
          <h2 className="display mt-3 text-2xl leading-none">Top 5 ürün (30 gün)</h2>
          <ul className="mt-6">
            {topProducts.map((p, i) => (
              <li
                key={p.productNameSnapshot}
                className="flex items-center justify-between gap-4 border-t border-line py-4 last:border-b text-sm"
              >
                <div className="flex items-center gap-4 min-w-0 flex-1">
                  <span className="display text-2xl tabular-nums text-mist">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="truncate">{p.productNameSnapshot}</span>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular-nums">
                    {p._sum.quantity ?? 0} adet
                  </p>
                  <p className="text-[11px] tabular-nums text-mist">
                    {formatPrice(Number(p._sum.lineTotal ?? 0), "tr")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-16 grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div>
          <div className="flex items-end justify-between border-t border-line pt-5">
            <div>
              <Eyebrow>— son siparişler</Eyebrow>
              <h2 className="display mt-3 text-2xl leading-none">Son siparişler</h2>
            </div>
            <Link
              href="/admin/orders"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink hover:text-mist"
            >
              Tümünü gör
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-6">
            {recentOrders.length === 0 ? (
              <p className="border-t border-line py-10 text-center text-sm text-mist">
                Henüz sipariş yok.
              </p>
            ) : (
              <ul className="text-sm">
                {recentOrders.map((o) => (
                  <li key={o.id} className="border-t border-line last:border-b">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="flex items-center justify-between gap-4 py-4 transition-colors hover:bg-bone/60"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline gap-3">
                          <span className="font-mono text-xs">{o.orderNumber}</span>
                          <span className="text-[10px] uppercase tracking-[0.25em] text-mist">
                            {ORDER_STATUS_LABELS[o.status]}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-mist">
                          {o.email} · {formatDateTimeTR(o.placedAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right tabular-nums">
                        {formatPrice(Number(o.grandTotal), "tr")}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-end justify-between border-t border-line pt-5">
            <div>
              <Eyebrow>— yeni müşteriler</Eyebrow>
              <h2 className="display mt-3 text-2xl leading-none">Son kayıtlar</h2>
            </div>
            <Link
              href="/admin/customers"
              className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink hover:text-mist"
            >
              Tümünü gör
              <ArrowUpRight className="size-3.5" strokeWidth={1.5} />
            </Link>
          </div>

          <div className="mt-6">
            {recentCustomers.length === 0 ? (
              <p className="border-t border-line py-10 text-center text-sm text-mist">
                Henüz müşteri kaydı yok.
              </p>
            ) : (
              <ul className="text-sm">
                {recentCustomers.map((u) => (
                  <li
                    key={u.id}
                    className="flex items-center justify-between gap-4 border-t border-line py-4 last:border-b"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate">{u.name ?? "—"}</p>
                      <p className="mt-1 truncate font-mono text-xs text-mist">
                        {u.email}
                      </p>
                    </div>
                    <span className="shrink-0 text-[10px] uppercase tracking-[0.25em] text-mist">
                      {formatDateTimeTR(u.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
