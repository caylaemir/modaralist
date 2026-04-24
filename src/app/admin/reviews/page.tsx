import Link from "next/link";
import { db } from "@/lib/db";
import { ReviewActions } from "./_components/review-actions";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ status?: string }>;

const STATUS_FILTERS = [
  { key: "all", label: "Tümü" },
  { key: "PENDING", label: "Bekliyor" },
  { key: "APPROVED", label: "Onaylı" },
  { key: "REJECTED", label: "Reddedildi" },
] as const;

const STATUS_LABEL: Record<string, string> = {
  PENDING: "Bekliyor",
  APPROVED: "Onaylı",
  REJECTED: "Reddedildi",
};

function Stars({ rating }: { rating: number }) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="tabular-nums" aria-label={`${rounded}/5`}>
      {"★".repeat(rounded)}
      <span className="text-mist">{"★".repeat(5 - rounded)}</span>
    </span>
  );
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const filterKey = sp.status ?? "all";

  const where =
    filterKey === "all" ? {} : { status: filterKey.toUpperCase() };

  const [reviews, pendingCount, approvedCount, rejectedCount] =
    await Promise.all([
      db.review
        .findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            product: {
              include: {
                translations: { where: { locale: "tr" } },
              },
            },
            user: { select: { name: true, email: true } },
          },
        })
        .catch(() => []),
      db.review.count({ where: { status: "PENDING" } }).catch(() => 0),
      db.review.count({ where: { status: "APPROVED" } }).catch(() => 0),
      db.review.count({ where: { status: "REJECTED" } }).catch(() => 0),
    ]);

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
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — moderasyon
        </p>
        <h1 className="display mt-3 text-5xl leading-none">
          Değerlendirmeler
        </h1>
        <p className="mt-4 text-xs text-mist">
          {pendingCount} bekliyor · {approvedCount} onaylı · {rejectedCount}{" "}
          reddedildi
        </p>
      </header>

      <section className="mt-10">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — durum
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {STATUS_FILTERS.map((f) => {
            const active = filterKey === f.key;
            return (
              <Link
                key={f.key}
                href={`/admin/reviews?status=${f.key}`}
                className={`border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                  active
                    ? "border-ink bg-ink text-paper"
                    : "border-line text-mist hover:border-ink hover:text-ink"
                }`}
              >
                {f.label}
              </Link>
            );
          })}
        </div>
      </section>

      {reviews.length === 0 ? (
        <div className="mt-16 border-t border-line py-20 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — boş
          </p>
          <p className="display mt-4 text-3xl italic text-mist">
            Değerlendirme yok
          </p>
          <p className="mt-4 text-sm text-mist">
            Yeni yorumlar burada moderasyon için listelenecek.
          </p>
        </div>
      ) : (
        <ul className="mt-10">
          {reviews.map((r) => {
            const tr = r.product.translations[0];
            return (
              <li
                key={r.id}
                className="border-t border-line py-8 last:border-b"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <Stars rating={r.rating} />
                      <span
                        className={`inline-block border px-2 py-1 text-[10px] uppercase tracking-[0.2em] ${
                          r.status === "APPROVED"
                            ? "border-ink bg-ink text-paper"
                            : r.status === "REJECTED"
                              ? "border-line text-mist line-through"
                              : "border-amber-600 text-amber-700"
                        }`}
                      >
                        {STATUS_LABEL[r.status] ?? r.status}
                      </span>
                      <span className="text-[11px] uppercase tracking-[0.25em] text-mist">
                        {dateFmt.format(r.createdAt)}
                      </span>
                    </div>
                    {r.title ? (
                      <p className="mt-3 font-medium">{r.title}</p>
                    ) : null}
                    {r.body ? (
                      <p className="mt-2 text-sm text-mist">{r.body}</p>
                    ) : null}
                    <div className="mt-4 flex flex-wrap items-center gap-4 text-[11px] uppercase tracking-[0.25em] text-mist">
                      <Link
                        href={`/admin/products/${r.productId}`}
                        className="hover:text-ink"
                      >
                        {tr?.name ?? r.product.slug}
                      </Link>
                      <span>·</span>
                      <Link
                        href={`/admin/customers/${r.userId}`}
                        className="hover:text-ink"
                      >
                        {r.user.name ?? r.user.email}
                      </Link>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <ReviewActions id={r.id} status={r.status} />
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
