import Link from "next/link";
import { CouponForm, type CouponFormValues } from "../_components/coupon-form";

export const dynamic = "force-dynamic";

export default function NewCouponPage() {
  const initial: CouponFormValues = {
    code: "",
    type: "PERCENT",
    value: "",
    minSubtotal: "",
    maxUses: "",
    perUserLimit: "",
    startsAt: "",
    endsAt: "",
    isActive: true,
  };

  return (
    <div>
      <header className="border-b border-line pb-8">
        <Link
          href="/admin/coupons"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Kuponlar
        </Link>
        <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-mist">
          — yeni kupon
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Kupon Oluştur</h1>
      </header>
      <div className="mt-10">
        <CouponForm initial={initial} />
      </div>
    </div>
  );
}
