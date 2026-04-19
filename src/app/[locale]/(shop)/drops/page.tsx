import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { Marquee } from "@/components/shop/marquee";
import { DEMO_COLLECTIONS } from "@/lib/demo-data";
import { ArrowUpRight } from "lucide-react";

export default async function DropsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <section className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-40">
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — koleksiyonlar
          </p>
        </Reveal>
        <SplitText
          text="her biri bir bölüm, her biri bir son."
          as="h1"
          className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
        />
        <Reveal delay={0.3}>
          <p className="mt-8 max-w-lg text-sm leading-relaxed text-mist">
            Drop bazlı üretim. Her bölüm belli bir süre satışta kalır, sonra arşive alınır. Kaçırma.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto mt-24 flex max-w-[1600px] flex-col gap-16 px-5 pb-32 md:mt-40 md:px-10">
        {DEMO_COLLECTIONS.map((c, i) => (
          <Reveal key={c.slug} delay={i * 0.1}>
            <Link
              href={`/drops/${c.slug}`}
              className="group relative block h-[80vh] min-h-[520px] w-full overflow-hidden bg-ink"
            >
              <div
                className="absolute inset-0 scale-100 bg-cover bg-center transition-transform duration-[2000ms] group-hover:scale-[1.04]"
                style={{ backgroundImage: `url('${c.heroImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/20 to-transparent" />
              <div className="relative z-10 flex h-full flex-col justify-between p-8 md:p-12">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-[0.4em] text-paper/80">
                    {c.status === "LIVE" ? "● Şu an satışta" : "○ Yakında"}
                  </p>
                  <p className="tabular-nums text-[10px] uppercase tracking-[0.3em] text-paper/60">
                    {String(i + 1).padStart(2, "0")} / {String(DEMO_COLLECTIONS.length).padStart(2, "0")}
                  </p>
                </div>

                <div>
                  <h2 className="display text-[10vw] leading-[0.95] text-paper md:text-[5.5vw]">
                    {c.name}
                  </h2>
                  <p className="mt-4 max-w-xl text-sm text-paper/70">{c.tagline}</p>
                  <span className="mt-8 inline-flex items-center gap-3 border-b border-paper pb-1 text-[11px] uppercase tracking-[0.3em] text-paper">
                    Koleksiyonu Gör
                    <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      <Marquee
        items={[
          "MODARALIST",
          "DROP BY DROP",
          "LIMITED",
          "MODARALIST",
          "UNRETURNING",
        ]}
      />
    </>
  );
}
