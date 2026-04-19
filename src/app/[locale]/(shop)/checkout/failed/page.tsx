import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";

export default async function CheckoutFailed({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;

  return (
    <div className="mx-auto max-w-2xl px-5 py-40 text-center md:px-10 md:py-56">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — ödeme başarısız
        </p>
        <h1 className="display mt-8 text-[10vw] leading-[0.95] md:text-[6vw]">
          Bu sefer olmadı.
        </h1>
        <p className="mt-8 max-w-md mx-auto text-base leading-relaxed text-mist">
          Ödemen tamamlanamadı. Sepetin duruyor — kart bilgilerini kontrol edip
          tekrar deneyebilirsin.{" "}
          {reason ? <span className="block mt-2 text-xs">Kod: {reason}</span> : null}
        </p>
        <div className="mt-12 flex justify-center gap-6">
          <Link
            href="/checkout"
            className="border border-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper"
          >
            Tekrar Dene
          </Link>
          <Link
            href="/cart"
            className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            Sepete Dön →
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
