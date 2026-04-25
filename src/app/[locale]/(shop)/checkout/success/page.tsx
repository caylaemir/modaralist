import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";

export const dynamic = "force-dynamic";

export default async function CheckoutSuccess({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-5 py-40 text-center md:px-10 md:py-56">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — tamamlandı
        </p>
        <h1 className="display mt-8 text-[10vw] leading-[0.95] md:text-[6vw]">
          Hoş geldin drop'a.
        </h1>
        <p className="mt-8 max-w-md text-base leading-relaxed text-mist mx-auto">
          Siparişin alındı{order ? ` — referans ${order}` : ""}. Onay e-postası yolda. Kargolanınca tekrar haber vereceğiz.
        </p>
        <div className="mt-12 flex justify-center gap-6">
          <Link
            href="/account/orders"
            className="border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper"
          >
            Siparişlerim
          </Link>
          <Link
            href="/shop"
            className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            Alışverişe Devam →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
