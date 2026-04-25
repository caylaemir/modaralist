import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { db } from "@/lib/db";
import type { Locale } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const lang = (locale === "en" ? "en" : "tr") as Locale;

  const page = await db.page
    .findUnique({
      where: { slug },
      include: { translations: { where: { locale: lang } } },
    })
    .catch(() => null);

  if (!page || !page.isPublished) return { title: "Bulunamadı" };
  const tr = page.translations[0];
  return {
    title: tr?.seoTitle ?? tr?.title ?? page.slug,
    description: tr?.seoDesc ?? undefined,
  };
}

export default async function StaticPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as Locale;

  const page = await db.page
    .findUnique({
      where: { slug },
      include: { translations: { where: { locale: lang } } },
    })
    .catch(() => null);

  if (!page || !page.isPublished) notFound();

  // Eğer locale'de çeviri yoksa fallback: TR
  let tr = page.translations[0];
  if (!tr) {
    const fallback = await db.pageTranslation.findFirst({
      where: { pageId: page.id, locale: "tr" },
    });
    if (fallback) tr = fallback;
  }
  if (!tr) notFound();

  return (
    <main className="mx-auto max-w-3xl px-5 pt-24 pb-32 md:px-10 md:pt-40">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — {page.slug}
        </p>
      </Reveal>
      <Reveal delay={0.15}>
        <h1 className="display mt-6 text-[12vw] leading-[0.95] md:text-[5vw]">
          {tr.title}
        </h1>
      </Reveal>
      <Reveal delay={0.3}>
        <article
          className="prose-modaralist mt-12 text-base leading-relaxed text-ink"
          dangerouslySetInnerHTML={{ __html: tr.bodyHtml }}
        />
      </Reveal>
    </main>
  );
}
