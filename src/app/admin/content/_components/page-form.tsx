"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { createPageAction, updatePageAction, deletePageAction } from "../actions";

export type PageFormValues = {
  id?: string;
  slug: string;
  template: string;
  isPublished: boolean;
  tr: {
    title: string;
    slug: string;
    bodyHtml: string;
    seoTitle: string;
    seoDesc: string;
  };
  en: {
    title: string;
    slug: string;
    bodyHtml: string;
    seoTitle: string;
    seoDesc: string;
  };
};

export function PageForm({ initial }: { initial: PageFormValues }) {
  const [tab, setTab] = useState<"tr" | "en">("tr");
  const [pending, startTransition] = useTransition();
  const isEdit = !!initial.id;

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = isEdit
        ? await updatePageAction(initial.id!, formData)
        : await createPageAction(formData);
      if (res?.ok === false) {
        toast.error(res.error ?? "Kaydedilemedi.");
      } else if (isEdit) {
        toast.success("Güncellendi.");
      }
    });
  }

  function onDelete() {
    if (!initial.id) return;
    if (!confirm(`"${initial.tr.title || initial.slug}" sayfasını sil?`)) return;
    startTransition(async () => {
      await deletePageAction(initial.id!);
    });
  }

  return (
    <form action={onSubmit} className="space-y-16">
      <section>
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — sayfa
          </p>
          <h2 className="display mt-3 text-3xl leading-none">Temel</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Slug (URL anahtarı)
            </label>
            <input
              name="slug"
              defaultValue={initial.slug}
              required
              className="mt-2 w-full border-b border-line bg-transparent py-2 font-mono text-sm outline-none focus:border-ink"
              placeholder="about"
            />
            <p className="mt-1 text-[11px] text-mist">
              URL: /tr/pages/{initial.slug || "..."} — değiştirme önerilmez.
            </p>
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Şablon
            </label>
            <select
              name="template"
              defaultValue={initial.template || "default"}
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            >
              <option value="default">Standart sayfa</option>
              <option value="blog">Blog yazısı</option>
              <option value="manifesto">Manifesto / uzun metin</option>
            </select>
            <p className="mt-1 text-[11px] text-mist">
              <strong className="text-ink">Blog yazısı:</strong> /blog dizininde
              gösterilir, journal index'e otomatik girer. Slug'ı{" "}
              <span className="font-mono">blog-</span> ile başlayacak.
            </p>
          </div>
          <label className="flex items-start gap-4 md:col-span-2">
            <input
              type="checkbox"
              name="isPublished"
              defaultChecked={initial.isPublished}
              className="mt-1 size-4 appearance-none border border-line bg-paper checked:border-ink checked:bg-ink"
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em]">Yayında</p>
              <p className="mt-1 text-xs text-mist">
                Kapalı iken sadece admin görebilir.
              </p>
            </div>
          </label>
        </div>
      </section>

      <section>
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — içerik
          </p>
          <h2 className="display mt-3 text-3xl leading-none">Çeviriler</h2>
          <p className="mt-3 max-w-xl text-xs text-mist">
            TR ve EN içerikleri ayrı ayrı doldur. HTML destekler — başlık için{" "}
            <code className="font-mono text-[11px]">&lt;h2&gt;</code>, paragraf
            için <code className="font-mono text-[11px]">&lt;p&gt;</code>.
          </p>
        </div>

        <div className="mt-6 flex gap-2">
          {(["tr", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setTab(l)}
              className={`border px-4 py-2 text-[11px] uppercase tracking-[0.25em] transition-colors ${
                tab === l
                  ? "border-ink bg-ink text-paper"
                  : "border-line text-mist hover:border-ink hover:text-ink"
              }`}
            >
              {l === "tr" ? "Türkçe" : "English"}
            </button>
          ))}
        </div>

        {(["tr", "en"] as const).map((locale) => (
          <div
            key={locale}
            className={`mt-8 space-y-6 ${tab === locale ? "block" : "hidden"}`}
          >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Başlık
                </label>
                <input
                  name={`${locale}.title`}
                  defaultValue={initial[locale].title}
                  required
                  className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Dile özel slug
                </label>
                <input
                  name={`${locale}.slug`}
                  defaultValue={initial[locale].slug}
                  className="mt-2 w-full border-b border-line bg-transparent py-2 font-mono text-sm outline-none focus:border-ink"
                />
                <p className="mt-1 text-[11px] text-mist">
                  Boş bırakırsan başlıktan otomatik üretilir.
                </p>
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                Gövde (HTML)
              </label>
              <textarea
                name={`${locale}.bodyHtml`}
                defaultValue={initial[locale].bodyHtml}
                rows={16}
                className="mt-2 w-full resize-y border border-line bg-transparent p-4 font-mono text-sm outline-none focus:border-ink"
                placeholder={'<h2>Başlık</h2>\n<p>Paragraf...</p>'}
              />
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  SEO başlık
                </label>
                <input
                  name={`${locale}.seoTitle`}
                  defaultValue={initial[locale].seoTitle}
                  className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  SEO açıklama
                </label>
                <input
                  name={`${locale}.seoDesc`}
                  defaultValue={initial[locale].seoDesc}
                  className="mt-2 w-full border-b border-line bg-transparent py-2 outline-none focus:border-ink"
                />
              </div>
            </div>
          </div>
        ))}
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between border border-line bg-paper px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/content"
            className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            ← İçerik
          </Link>
          {isEdit ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="text-[11px] uppercase tracking-[0.3em] text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Sayfayı Sil
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          <span>{pending ? "Kaydediliyor..." : isEdit ? "Kaydet" : "Oluştur"}</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}
