import Link from "next/link";
import type { CouponType } from "@prisma/client";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TYPE_LABEL: Record<CouponType, string> = {
  PERCENT: "Yüzde",
  FIXED: "Sabit",
  FREE_SHIPPING: "Kargo",
};

function formatValue(type: CouponType, value: number) {
  if (type === "PERCENT") return `%${value}`;
  if (type === "FIXED") return formatPrice(value);
  return "—";
}

function formatDateCompact(d: Date | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(d);
}

export default async function AdminCouponsPage() {
  const coupons = await db.coupon
    .findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { usages: true } } },
    })
    .catch(() => []);

  const activeCount = coupons.filter((c) => c.isActive).length;
  const totalUsages = coupons.reduce((s, c) => s + c._count.usages, 0);

  return (
    <div>
      <header className="flex flex-wrap items-end justify-between gap-6 border-b border-line pb-8">
        <div>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — indirimler
          </p>
          <h1 className="display mt-3 text-5xl leading-none">Kuponlar</h1>
          <p className="mt-4 text-xs text-mist">
            {coupons.length} kupon · {activeCount} aktif · {totalUsages} toplam
            kullanım
          </p>
        </div>
        <Link
          href="/admin/coupons/new"
          className="inline-flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-90"
        >
          + Yeni Kupon
        </Link>
      </header>

      <div className="mt-10 overflow-x-auto border-t border-line">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[10px] uppercase tracking-[0.24em] text-mist">
              <th className="border-b border-line py-3 text-left font-medium">
                Kod
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Tip
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Değer
              </th>
              <th className="border-b border-line px-4 py-3 text-right font-medium">
                Kullanım
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Geçerlilik
              </th>
              <th className="border-b border-line px-4 py-3 text-left font-medium">
                Durum
              </th>
              <th className="border-b border-line py-3 text-right font-medium" />
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-20 text-center">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                    — boş
                  </p>
                  <p className="display mt-4 text-3xl italic text-mist">
                    Henüz kupon yok
                  </p>
                  <p className="mt-4 mx-auto max-w-md text-sm text-mist">
                    Drop kampanyası, ilk sipariş indirimi, ücretsiz kargo için
                    kod oluştur.
                  </p>
                  <Link
                    href="/admin/coupons/new"
                    className="mt-6 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
                  >
                    Yeni Kupon →
                  </Link>
                </td>
              </tr>
            ) : (
              coupons.map((c) => {
                const now = new Date();
                const expired = c.endsAt && c.endsAt < now;
                const notStarted = c.startsAt && c.startsAt > now;
                const status: "Aktif" | "Pasif" | "Bitti" | "Bekliyor" =
                  !c.isActive
                    ? "Pasif"
                    : expired
                      ? "Bitti"
                      : notStarted
                        ? "Bekliyor"
                        : "Aktif";
                const live = status === "Aktif";

                return (
                  <tr
                    key={c.id}
                    className="border-b border-line transition-colors hover:bg-bone/70"
                  >
                    <td className="py-4 pr-4">
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="font-mono text-sm uppercase"
                      >
                        {c.code}
                      </Link>
                    </td>
                    <td className="px-4 py-4 text-xs uppercase tracking-[0.2em] text-mist">
                      {TYPE_LABEL[c.type]}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {formatValue(c.type, Number(c.value))}
                    </td>
                    <td className="px-4 py-4 text-right tabular-nums">
                      {c._count.usages}
                      {c.maxUses ? (
                        <span className="ml-2 text-[10px] uppercase tracking-[0.2em] text-mist">
                          / {c.maxUses}
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-4 text-xs text-mist tabular-nums">
                      {formatDateCompact(c.startsAt)} —{" "}
                      {formatDateCompact(c.endsAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          live
                            ? "border-ink bg-ink text-paper"
                            : "border-line text-mist"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="py-4 pl-4 text-right">
                      <Link
                        href={`/admin/coupons/${c.id}`}
                        className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                      >
                        Düzenle →
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
