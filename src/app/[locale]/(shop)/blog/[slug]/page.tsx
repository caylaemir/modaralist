import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import DOMPurify from "isomorphic-dompurify";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shop/reveal";
import { db } from "@/lib/db";
import type { Locale } from "@prisma/client";

export const revalidate = 3600;

// Blog yazi slug'i: /blog/post-x -> Page.slug = "blog-post-x"
// Boylece /pages/[slug] ile cakismaz, ayri namespace.
function toPageSlug(blogSlug: string) {
  return blogSlug.startsWith("blog-") ? blogSlug : `blog-${blogSlug}`;
}

async function loadPost(blogSlug: string, lang: Locale) {
  const pageSlug = toPageSlug(blogSlug);
  const page = await db.page
    .findUnique({
      where: { slug: pageSlug },
      include: { translations: { where: { locale: lang } } },
    })
    .catch(() => null);
  if (!page || !page.isPublished || page.template !== "blog") return null;

  let tr = page.translations[0];
  if (!tr) {
    const fb = await db.pageTranslation.findFirst({
      where: { pageId: page.id, locale: "tr" },
    });
    if (fb) tr = fb;
  }
  if (!tr) return null;
  return { page, tr };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}): Promise<Metadata> {
  const { slug, locale } = await params;
  const lang = (locale === "en" ? "en" : "tr") as Locale;
  const data = await loadPost(slug, lang);
  if (!data) return { title: "Bulunamadı" };

  return {
    title: `${data.tr.seoTitle ?? data.tr.title} | Modaralist Journal`,
    description: data.tr.seoDesc ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: data.tr.title,
      description: data.tr.seoDesc ?? undefined,
      type: "article",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  setRequestLocale(locale);
  const lang = (locale === "en" ? "en" : "tr") as Locale;
  const data = await loadPost(slug, lang);
  if (!data) notFound();

  const { page, tr } = data;

  // BlogPosting schema.org JSON-LD
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: tr.title,
    description: tr.seoDesc ?? undefined,
    datePublished: page.createdAt.toISOString(),
    dateModified: page.updatedAt.toISOString(),
    author: {
      "@type": "Organization",
      name: "Modaralist",
    },
    publisher: {
      "@type": "Organization",
      name: "Modaralist",
      url: "https://modaralist.shop",
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://modaralist.shop/${locale}/blog/${slug}`,
    },
  };

  // Diger blog yazilari (max 3 - related)
  const others = await db.page.findMany({
    where: {
      isPublished: true,
      template: "blog",
      slug: { not: page.slug },
    },
    orderBy: { updatedAt: "desc" },
    take: 3,
    include: { translations: { where: { locale: lang } } },
  });

  return (
    <main className="mx-auto max-w-3xl px-5 pt-20 pb-32 md:px-10 md:pt-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
      />

      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.3em] text-mist"
      >
        <Link href="/" className="hover:text-ink">
          Ana
        </Link>
        <span className="mx-2">·</span>
        <Link href="/blog" className="hover:text-ink">
          Journal
        </Link>
      </nav>

      <Reveal>
        <p className="mt-12 text-[10px] uppercase tracking-[0.4em] text-mist">
          {new Intl.DateTimeFormat(lang === "en" ? "en-US" : "tr-TR", {
            day: "2-digit",
            month: "long",
            year: "numeric",
          }).format(page.createdAt)}
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <h1 className="display mt-6 text-[12vw] leading-[0.95] md:text-[5.5vw]">
          {tr.title}
        </h1>
      </Reveal>

      <Reveal delay={0.3}>
        <article
          className="prose-modaralist mt-12 text-base leading-relaxed text-ink"
          dangerouslySetInnerHTML={{
            __html: DOMPurify.sanitize(tr.bodyHtml, {
              USE_PROFILES: { html: true },
              FORBID_TAGS: ["script", "iframe", "object", "embed", "form"],
              FORBID_ATTR: [
                "onerror",
                "onload",
                "onclick",
                "onmouseover",
                "onfocus",
                "onblur",
              ],
            }),
          }}
        />
      </Reveal>

      {others.length > 0 ? (
        <section className="mt-24 border-t border-line pt-12">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — devam et
          </p>
          <h2 className="display mt-4 text-2xl">
            {lang === "en" ? "More from Journal" : "Journal'dan daha fazla"}
          </h2>
          <ul className="mt-8 space-y-6">
            {others.map((o) => {
              const otr = o.translations[0];
              const otherSlug = o.slug.replace(/^blog-/, "");
              return (
                <li key={o.id}>
                  <Link
                    href={`/blog/${otherSlug}`}
                    className="group flex items-start justify-between gap-4 border-b border-line pb-6"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                        {new Intl.DateTimeFormat(
                          lang === "en" ? "en-US" : "tr-TR",
                          { day: "2-digit", month: "short", year: "numeric" }
                        ).format(o.updatedAt)}
                      </p>
                      <p className="display mt-2 text-xl group-hover:text-mist">
                        {otr?.title ?? o.slug}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-1 size-4 shrink-0 text-mist transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
