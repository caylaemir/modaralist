import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { db } from "@/lib/db";
import type { Locale } from "@prisma/client";

export const revalidate = 600; // 10 dk

export const metadata: Metadata = {
  title: "Journal — Modaralist",
  description:
    "Modaralist Journal — drop'ların ardındaki hikaye, stil rehberleri, koleksiyon notları.",
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as Locale;

  // Page modelinde template="blog" olanlar
  const posts = await db.page.findMany({
    where: { isPublished: true, template: "blog" },
    orderBy: { updatedAt: "desc" },
    include: {
      translations: { where: { locale: lang } },
    },
  });

  return (
    <main className="mx-auto max-w-[1600px] px-5 pt-20 pb-32 md:px-10 md:pt-28">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — journal
        </p>
      </Reveal>
      <SplitText
        text={lang === "en" ? "stories." : "yazılar."}
        as="h1"
        className="display mt-6 text-[14vw] leading-[0.95] md:text-[8vw]"
      />
      <Reveal delay={0.3}>
        <p className="mt-8 max-w-xl text-base leading-relaxed text-mist md:text-lg">
          {lang === "en"
            ? "The story behind the drops, style guides, and collection notes."
            : "Drop'ların ardındaki hikaye, stil rehberleri, koleksiyon notları."}
        </p>
      </Reveal>

      {posts.length === 0 ? (
        <div className="mt-24 border-t border-line pt-16 text-center">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — boş
          </p>
          <p className="display mt-6 text-3xl italic text-mist">
            Henüz yazı yok
          </p>
          <p className="mt-4 text-sm text-mist">
            İlk yazı yakında.
          </p>
        </div>
      ) : (
        <ul className="mt-20 grid gap-x-6 gap-y-16 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((p, i) => {
            const tr = p.translations[0];
            const title = tr?.title ?? p.slug;
            const excerpt = tr?.seoDesc ?? "";
            return (
              <li key={p.id}>
                <Link
                  href={`/blog/${p.slug.replace(/^blog-/, "")}`}
                  className="group block"
                >
                  <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                    {String(i + 1).padStart(2, "0")} ·{" "}
                    {new Intl.DateTimeFormat(lang === "en" ? "en-US" : "tr-TR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    }).format(p.updatedAt)}
                  </p>
                  <h2 className="display mt-4 text-3xl leading-tight transition-colors group-hover:text-mist">
                    {title}
                  </h2>
                  {excerpt ? (
                    <p className="mt-3 text-sm leading-relaxed text-mist">
                      {excerpt}
                    </p>
                  ) : null}
                  <span className="mt-4 inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-ink">
                    {lang === "en" ? "Read" : "Oku"}
                    <ArrowUpRight className="size-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
