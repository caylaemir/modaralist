import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import DOMPurify from "isomorphic-dompurify";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";
import { FaqAccordion } from "@/components/shop/faq-accordion";
import { db } from "@/lib/db";
import { FAQS_TR, FAQS_EN, faqJsonLd } from "@/lib/faq";
import type { Locale } from "@prisma/client";

// Slug -> insan-okunur baslik (breadcrumb + eyebrow icin).
// page.template != "default" ozel layout (faq) icin fallback'tir.
const LEGAL_SLUGS = new Set([
  "privacy",
  "kvkk",
  "terms",
  "distance-sales",
  "membership",
  "returns",
]);

// Statik sayfalar nadiren degisir — 1 saat cache.
// Admin actions revalidatePath cagiriyor, anlik update OK.
export const revalidate = 3600;

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

  // SSS sayfasinda accordion + FAQPage JSON-LD ek olarak basilir
  const isFaq = slug === "faq" || slug === "sss";
  const isLegal = LEGAL_SLUGS.has(slug);
  const faqs = isFaq ? (lang === "en" ? FAQS_EN : FAQS_TR) : [];

  const updatedAt = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "tr-TR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(page.updatedAt);

  return (
    <main className="mx-auto max-w-3xl px-5 pt-20 pb-32 md:px-10 md:pt-32">
      {isFaq && faqs.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd(faqs)) }}
        />
      ) : null}

      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="text-[11px] uppercase tracking-[0.3em] text-mist"
      >
        <Link href="/" className="hover:text-ink">
          {lang === "en" ? "Home" : "Ana"}
        </Link>
        <span className="mx-2">·</span>
        <span className="text-ink">{tr.title}</span>
      </nav>

      <Reveal>
        <p className="mt-10 text-[10px] uppercase tracking-[0.4em] text-mist">
          — {isLegal ? (lang === "en" ? "legal" : "yasal metin") : page.slug}
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <h1
          className={
            isLegal
              ? "display mt-5 text-3xl leading-tight md:text-5xl"
              : "display mt-6 text-[12vw] leading-[0.95] md:text-[5vw]"
          }
        >
          {tr.title}
        </h1>
      </Reveal>

      {isLegal ? (
        <Reveal delay={0.25}>
          <p className="mt-6 text-[11px] uppercase tracking-[0.3em] text-mist">
            {lang === "en" ? "Last updated" : "Son güncelleme"} ·{" "}
            <span className="text-ink">{updatedAt}</span>
          </p>
        </Reveal>
      ) : null}

      <Reveal delay={0.3}>
        <article
          className={
            isLegal
              ? "prose-modaralist mt-12 border-t border-line pt-12"
              : "prose-modaralist mt-12 text-base leading-relaxed text-ink"
          }
          dangerouslySetInnerHTML={{
            // STAFF/ADMIN icerikci script enjekte etmesin diye sanitize.
            // <script>, <iframe>, on*, javascript:* yasak.
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

      {isLegal ? (
        <Reveal delay={0.4}>
          <aside className="mt-16 border-t border-line pt-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — {lang === "en" ? "questions" : "soru veya talep"}
            </p>
            <p className="mt-4 text-sm leading-relaxed text-ink-soft">
              {lang === "en"
                ? "For any questions or requests regarding this document, please reach us at "
                : "Bu metinle ilgili soru veya talepleriniz için bize "}
              <a
                href="mailto:admin@modaralist.com"
                className="font-medium text-ink underline underline-offset-2 hover:opacity-60"
              >
                admin@modaralist.com
              </a>
              {lang === "en" ? "." : " adresinden ulaşabilirsiniz."}
            </p>
            <div className="mt-8 flex flex-wrap gap-2">
              {[
                { slug: "privacy", tr: "Gizlilik", en: "Privacy" },
                { slug: "kvkk", tr: "KVKK", en: "KVKK" },
                { slug: "terms", tr: "Kullanıcı Sözleşmesi", en: "Terms" },
                { slug: "distance-sales", tr: "Mesafeli Satış", en: "Distance Sales" },
                { slug: "membership", tr: "Üyelik Sözleşmesi", en: "Membership" },
                { slug: "returns", tr: "İade & Değişim", en: "Returns" },
              ]
                .filter((p) => p.slug !== slug)
                .map((p) => (
                  <Link
                    key={p.slug}
                    href={`/pages/${p.slug}`}
                    className="border border-line bg-paper px-3 py-2 text-[11px] uppercase tracking-[0.25em] text-mist transition-colors hover:border-ink hover:text-ink"
                  >
                    {lang === "en" ? p.en : p.tr}
                  </Link>
                ))}
            </div>
          </aside>
        </Reveal>
      ) : null}

      {isFaq && faqs.length > 0 ? (
        <Reveal delay={0.4}>
          <FaqAccordion items={faqs} />
        </Reveal>
      ) : null}
    </main>
  );
}
