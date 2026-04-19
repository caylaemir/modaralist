"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  createCollection,
  updateCollection,
  type CollectionInput,
} from "@/server/actions/collections";

type ProductOption = { id: string; slug: string; name: string };

type CollectionLoaded = {
  id: string;
  slug: string;
  status: "UPCOMING" | "LIVE" | "SOLD_OUT" | "ARCHIVED";
  startsAt: Date | null;
  endsAt: Date | null;
  heroImageUrl: string | null;
  heroVideoUrl: string | null;
  themePrimary: string | null;
  themeAccent: string | null;
  sortOrder: number;
  translations: {
    locale: "tr" | "en";
    name: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    manifesto: string | null;
  }[];
  products: { productId: string }[];
};

export function CollectionForm({
  mode,
  collection,
  allProducts,
}: {
  mode: "create" | "edit";
  collection?: CollectionLoaded;
  allProducts: ProductOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const tr = collection?.translations.find((t) => t.locale === "tr");
  const en = collection?.translations.find((t) => t.locale === "en");

  const [slug, setSlug] = useState(collection?.slug ?? "");
  const [status, setStatus] = useState<CollectionLoaded["status"]>(
    collection?.status ?? "UPCOMING"
  );
  const [startsAt, setStartsAt] = useState(
    collection?.startsAt ? toLocalDatetime(collection.startsAt) : ""
  );
  const [endsAt, setEndsAt] = useState(
    collection?.endsAt ? toLocalDatetime(collection.endsAt) : ""
  );
  const [heroImageUrl, setHeroImageUrl] = useState(collection?.heroImageUrl ?? "");
  const [themePrimary, setThemePrimary] = useState(
    collection?.themePrimary ?? "#0a0a0a"
  );
  const [themeAccent, setThemeAccent] = useState(
    collection?.themeAccent ?? "#f5f2ed"
  );
  const [trName, setTrName] = useState(tr?.name ?? "");
  const [trSlug, setTrSlug] = useState(tr?.slug ?? "");
  const [trTagline, setTrTagline] = useState(tr?.tagline ?? "");
  const [trDescription, setTrDescription] = useState(tr?.description ?? "");
  const [enName, setEnName] = useState(en?.name ?? "");
  const [enSlug, setEnSlug] = useState(en?.slug ?? "");
  const [enTagline, setEnTagline] = useState(en?.tagline ?? "");
  const [enDescription, setEnDescription] = useState(en?.description ?? "");
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(
    new Set(collection?.products.map((p) => p.productId) ?? [])
  );

  function toggleProduct(id: string) {
    setSelectedProducts((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const input: CollectionInput = {
      slug,
      status,
      startsAt: startsAt ? new Date(startsAt) : null,
      endsAt: endsAt ? new Date(endsAt) : null,
      heroImageUrl: heroImageUrl || null,
      heroVideoUrl: null,
      themePrimary,
      themeAccent,
      sortOrder: 0,
      translations: [
        { locale: "tr", name: trName, slug: trSlug || slug, tagline: trTagline, description: trDescription, manifesto: null },
        { locale: "en", name: enName, slug: enSlug || slug, tagline: enTagline, description: enDescription, manifesto: null },
      ],
      productIds: Array.from(selectedProducts),
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createCollection(input);
          toast.success("Koleksiyon oluşturuldu.");
        } else if (collection) {
          await updateCollection(collection.id, input);
          toast.success("Koleksiyon güncellendi.");
        }
        router.push("/admin/collections");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kaydedilemedi.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-2 space-y-6">
        <section className="border border-line bg-paper p-6">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-mist">
            Genel
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="Slug (URL)">
              <input
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
                placeholder="ss26-chapter-one"
              />
            </Field>
            <Field label="Durum">
              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as CollectionLoaded["status"])
                }
                className="w-full border border-line px-3 py-2 text-sm"
              >
                <option value="UPCOMING">Yakında</option>
                <option value="LIVE">Yayında</option>
                <option value="SOLD_OUT">Tükendi</option>
                <option value="ARCHIVED">Arşiv</option>
              </select>
            </Field>
            <Field label="Başlangıç">
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Bitiş">
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Hero Görsel URL" full>
              <input
                value={heroImageUrl}
                onChange={(e) => setHeroImageUrl(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
                placeholder="https://..."
              />
            </Field>
            <Field label="Tema Rengi (birincil)">
              <input
                type="color"
                value={themePrimary}
                onChange={(e) => setThemePrimary(e.target.value)}
                className="h-10 w-full border border-line"
              />
            </Field>
            <Field label="Tema Rengi (aksan)">
              <input
                type="color"
                value={themeAccent}
                onChange={(e) => setThemeAccent(e.target.value)}
                className="h-10 w-full border border-line"
              />
            </Field>
          </div>
        </section>

        <section className="border border-line bg-paper p-6">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-mist">
            İçerik — Türkçe
          </h2>
          <div className="space-y-4">
            <Field label="Ad">
              <input
                required
                value={trName}
                onChange={(e) => setTrName(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Slug">
              <input
                value={trSlug}
                onChange={(e) => setTrSlug(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
                placeholder={slug}
              />
            </Field>
            <Field label="Tagline">
              <input
                value={trTagline}
                onChange={(e) => setTrTagline(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Açıklama">
              <textarea
                value={trDescription}
                onChange={(e) => setTrDescription(e.target.value)}
                rows={3}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </section>

        <section className="border border-line bg-paper p-6">
          <h2 className="mb-4 text-xs uppercase tracking-widest text-mist">
            Content — English
          </h2>
          <div className="space-y-4">
            <Field label="Name">
              <input
                required
                value={enName}
                onChange={(e) => setEnName(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Slug">
              <input
                value={enSlug}
                onChange={(e) => setEnSlug(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
                placeholder={slug}
              />
            </Field>
            <Field label="Tagline">
              <input
                value={enTagline}
                onChange={(e) => setEnTagline(e.target.value)}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
            <Field label="Description">
              <textarea
                value={enDescription}
                onChange={(e) => setEnDescription(e.target.value)}
                rows={3}
                className="w-full border border-line px-3 py-2 text-sm"
              />
            </Field>
          </div>
        </section>
      </div>

      <aside className="md:col-span-1 space-y-6">
        <section className="sticky top-4 border border-line bg-paper p-6">
          <h2 className="mb-3 text-xs uppercase tracking-widest text-mist">
            Ürünler
          </h2>
          <p className="mb-4 text-xs text-mist">
            Bu koleksiyona dahil edilecek ürünleri seç ({selectedProducts.size}{" "}
            seçili)
          </p>
          <div className="max-h-96 overflow-y-auto space-y-2 border-y border-line py-2">
            {allProducts.length === 0 ? (
              <p className="py-8 text-center text-xs text-mist">
                Önce ürün ekle
              </p>
            ) : (
              allProducts.map((p) => (
                <label
                  key={p.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-bone px-2 py-1.5"
                >
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(p.id)}
                    onChange={() => toggleProduct(p.id)}
                    className="size-4 accent-ink"
                  />
                  <span className="text-sm flex-1">{p.name}</span>
                </label>
              ))
            )}
          </div>

          <button
            type="submit"
            disabled={pending}
            className="mt-6 flex w-full items-center justify-center bg-ink px-4 py-3 text-xs uppercase tracking-widest text-paper disabled:opacity-50"
          >
            {pending
              ? "Kaydediliyor..."
              : mode === "create"
                ? "Oluştur"
                : "Güncelle"}
          </button>
        </section>
      </aside>
    </form>
  );
}

function Field({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={`flex flex-col gap-1.5 ${full ? "md:col-span-2" : ""}`}>
      <span className="text-[10px] uppercase tracking-widest text-mist">
        {label}
      </span>
      {children}
    </label>
  );
}

function toLocalDatetime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
