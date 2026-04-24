import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { formatPrice } from "@/lib/utils";
import { CouponForm, type CouponFormValues } from "../_components/coupon-form";

export const dynamic = "force-dynamic";

function toLocalDatetimeInput(d: Date | null): string {
  if (!d) return "";
  // datetime-local expects: YYYY-MM-DDTHH:MM
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditCouponPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const coupon = await db.coupon
    .findUnique({
      where: { id },
      include: {
        usages: {
          include: {
            order: { select: { orderNumber: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    })
    .catch(() => null);

  if (!coupon) notFound();

  const initial: CouponFormValues = {
    id: coupon.id,
    code: coupon.code,
    type: coupon.type,
    value: String(Number(coupon.value)),
    minSubtotal: coupon.minSubtotal ? String(Number(coupon.minSubtotal)) : "",
    maxUses: coupon.maxUses ? String(coupon.maxUses) : "",
    perUserLimit: coupon.perUserLimit ? String(coupon.perUserLimit) : "",
    startsAt: toLocalDatetimeInput(coupon.startsAt),
    endsAt: toLocalDatetimeInput(coupon.endsAt),
    isActive: coupon.isActive,
  };

  const dateFmt = new Intl.DateTimeFormat("tr-TR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div>
      <header className="border-b border-line pb-8">
        <Link
          href="/admin/coupons"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Kuponlar
        </Link>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
          {coupon.code}
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Kupon Düzenle</h1>
      </header>

      <div className="mt-10">
        <CouponForm initial={initial} />
      </div>

      {coupon.usages.length > 0 ? (
        <section className="mt-20">
          <div className="border-t border-line pt-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — kullanımlar
            </p>
            <h2 className="display mt-3 text-3xl leading-none">Geçmiş</h2>
            <p className="mt-3 text-xs text-mist">
              Son {coupon.usages.length} kullanım gösteriliyor.
            </p>
          </div>
          <ul className="mt-6">
            {coupon.usages.map((u) => (
              <li
                key={u.id}
                className="flex items-start justify-between gap-6 border-t border-line py-5 last:border-b"
              >
                <div>
                  <p className="font-mono text-xs">{u.order.orderNumber}</p>
                  <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-mist">
                    {u.order.email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="tabular-nums">
                    -{formatPrice(Number(u.discountAmount))}
                  </p>
                  <p className="mt-1 text-[11px] text-mist tabular-nums">
                    {dateFmt.format(u.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
