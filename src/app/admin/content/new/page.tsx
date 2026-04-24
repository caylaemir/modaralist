import Link from "next/link";
import { PageForm, type PageFormValues } from "../_components/page-form";

export const dynamic = "force-dynamic";

export default function NewPageContent() {
  const initial: PageFormValues = {
    slug: "",
    template: "default",
    isPublished: false,
    tr: { title: "", slug: "", bodyHtml: "", seoTitle: "", seoDesc: "" },
    en: { title: "", slug: "", bodyHtml: "", seoTitle: "", seoDesc: "" },
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
        <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-mist">
          — yeni sayfa
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Sayfa Oluştur</h1>
        <p className="mt-4 max-w-xl text-xs text-mist">
          Hakkımızda, iletişim, KVKK gibi statik sayfalar için. Slug URL'de
          görünür; tr/en içerikleri ayrı doldur.
        </p>
      </header>

      <div className="mt-10">
        <PageForm initial={initial} />
      </div>
    </div>
  );
}
