import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { PageForm, type PageFormValues } from "../_components/page-form";

export const dynamic = "force-dynamic";

export default async function EditPageContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const page = await db.page
    .findUnique({
      where: { id },
      include: { translations: true },
    })
    .catch(() => null);

  if (!page) notFound();

  const tr = page.translations.find((t) => t.locale === "tr");
  const en = page.translations.find((t) => t.locale === "en");

  const initial: PageFormValues = {
    id: page.id,
    slug: page.slug,
    template: page.template,
    isPublished: page.isPublished,
    tr: {
      title: tr?.title ?? "",
      slug: tr?.slug ?? "",
      bodyHtml: tr?.bodyHtml ?? "",
      seoTitle: tr?.seoTitle ?? "",
      seoDesc: tr?.seoDesc ?? "",
    },
    en: {
      title: en?.title ?? "",
      slug: en?.slug ?? "",
      bodyHtml: en?.bodyHtml ?? "",
      seoTitle: en?.seoTitle ?? "",
      seoDesc: en?.seoDesc ?? "",
    },
  };

  return (
    <div>
      <header className="border-b border-line pb-8">
        <Link
          href="/admin/content"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← İçerik
        </Link>
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
          {page.slug}
        </p>
        <h1 className="display mt-3 text-5xl leading-none">
          {tr?.title ?? page.slug}
        </h1>
      </header>

      <div className="mt-10">
        <PageForm initial={initial} />
      </div>
    </div>
  );
}
