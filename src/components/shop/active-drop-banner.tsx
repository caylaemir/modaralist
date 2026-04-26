import { Link } from "@/i18n/navigation";
import { db } from "@/lib/db";
import { Reveal } from "./reveal";
import { Countdown } from "./countdown";
import { ArrowUpRight } from "lucide-react";

/**
 * Aktif drop varsa anasayfada büyük countdown banner.
 * Önce LIVE drop'a, yoksa UPCOMING'e bakar.
 * Hiçbiri yoksa render etmez.
 */
export async function ActiveDropBanner({ locale = "tr" }: { locale?: "tr" | "en" }) {
  const now = new Date();

  const [live, upcoming] = await Promise.all([
    db.collection
      .findFirst({
        where: { status: "LIVE", endsAt: { gt: now } },
        orderBy: { endsAt: "asc" },
        include: {
          translations: { where: { locale } },
        },
      })
      .catch(() => null),
    db.collection
      .findFirst({
        where: {
          status: "UPCOMING",
          startsAt: { gt: now },
        },
        orderBy: { startsAt: "asc" },
        include: {
          translations: { where: { locale } },
        },
      })
      .catch(() => null),
  ]);

  const drop = upcoming ?? live;
  if (!drop) return null;

  const isUpcoming = !!upcoming;
  const target = isUpcoming ? drop.startsAt : drop.endsAt;
  if (!target) return null;

  const tr = drop.translations[0];
  const heroBg = drop.heroImageUrl
    ? { backgroundImage: `url('${drop.heroImageUrl}')` }
    : { background: "linear-gradient(135deg, #2a2a2a 0%, #0a0a0a 100%)" };

  return (
    <section className="relative h-[80vh] min-h-[480px] w-full overflow-hidden bg-ink">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={heroBg}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 py-10 md:px-10 md:py-14">
        <div>
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-paper/80">
              {isUpcoming ? "○ Yakında — drop açılışına" : "● Şu an satışta — drop kapanışına"}
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 className="display mt-4 max-w-3xl text-[10vw] leading-[0.95] text-paper md:text-[5vw]">
              {tr?.name ?? drop.slug}
            </h2>
          </Reveal>
          {tr?.tagline ? (
            <Reveal delay={0.2}>
              <p className="mt-4 max-w-xl text-base text-paper/80 md:text-lg">
                {tr.tagline}
              </p>
            </Reveal>
          ) : null}
        </div>

        <Reveal delay={0.3}>
          <div className="flex flex-wrap items-end justify-between gap-6 border-t border-paper/20 pt-8">
            <Countdown target={target.toISOString()} />
            <Link
              href={`/drops/${drop.slug}`}
              className="inline-flex items-center gap-3 border-b border-paper pb-2 text-[11px] uppercase tracking-[0.3em] text-paper hover:opacity-80"
            >
              {isUpcoming ? "Drop'a git" : "Hemen al"}
              <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
