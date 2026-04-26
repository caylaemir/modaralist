"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  createBlockAction,
  updateBlockAction,
  deleteBlockAction,
} from "../actions";

export type BlockFormValues = {
  id?: string;
  type: string;
  sortOrder: number;
  isActive: boolean;
  config: Record<string, unknown>;
};

const BLOCK_TYPES = [
  {
    key: "hero",
    label: "Hero",
    description: "Ana sayfa karşılama bölümü — başlık, alt metin, CTA.",
    example: {
      eyebrow: "— drop 01",
      title: "Numaralı, sınırlı, seni bekliyor.",
      subtitle: "Her drop bir sezonluk hikâye anlatır.",
      ctaLabel: "Mağazaya git",
      ctaHref: "/shop",
    },
  },
  {
    key: "marquee",
    label: "Marquee",
    description: "Kayan şerit yazı.",
    example: { text: "drop 01 · bahar 2026 · sınırlı üretim" },
  },
  {
    key: "featured",
    label: "Featured Products",
    description: "Seçili ürünlerin slug listesi.",
    example: {
      title: "Seçtiğimiz parçalar",
      slugs: ["asymetric-drape-top", "linen-wide-leg"],
    },
  },
  {
    key: "collection-card",
    label: "Collection Card",
    description: "Koleksiyon/drop tanıtım kartı.",
    example: {
      collectionSlug: "drop-01",
      title: "Drop 01",
      description: "Bahar — numaralı üretim.",
      ctaHref: "/drops/drop-01",
    },
  },
  {
    key: "categories-grid",
    label: "Kategoriler Grid",
    description:
      "Aktif kategorileri animasyonlu kart grid'i olarak gösterir. Kapak otomatik (kategori banner'ı veya ilk ürünün görseli).",
    example: {
      eyebrow: "— kategoriler",
      title: "ne arıyorsun?",
      subtitle:
        "Tişört, sweatshirt, oversize, outdoor — istediğin parçaya tek tıkla ulaş.",
      ctaLabel: "Tüm mağaza",
      ctaHref: "/shop",
      limit: 7,
    },
  },
  {
    key: "best-sellers",
    label: "Çok Satanlar",
    description:
      "Son N gündeki PAID siparişlerin satış toplamına göre en çok satan ürünler. Hiç satış yoksa fallback olarak en yeni ürünleri gösterir.",
    example: {
      eyebrow: "— en çok satanlar",
      title: "herkesin tercihi.",
      subtitle: "Müşterilerin en çok seçtiği parçalar.",
      ctaLabel: "Tümünü gör",
      ctaHref: "/shop",
      badgeLabel: "Çok satan",
      limit: 8,
      withinDays: 90,
    },
  },
  {
    key: "text",
    label: "Text Block",
    description: "Metin veya manifesto bloğu.",
    example: {
      eyebrow: "— manifesto",
      body: "Modaralist, fast fashion'a karşı sessiz bir isyandır.",
    },
  },
];

export function BlockForm({ initial }: { initial: BlockFormValues }) {
  const [pending, startTransition] = useTransition();
  const isEdit = !!initial.id;

  const [type, setType] = useState(initial.type);
  const [configText, setConfigText] = useState(() =>
    JSON.stringify(initial.config ?? {}, null, 2)
  );

  const activeTypeMeta = useMemo(
    () => BLOCK_TYPES.find((t) => t.key === type),
    [type]
  );

  function insertExample() {
    if (!activeTypeMeta) return;
    setConfigText(JSON.stringify(activeTypeMeta.example, null, 2));
  }

  function onSubmit(formData: FormData) {
    // config'i state'ten override et (textarea value'su stale olabilir)
    formData.set("config", configText);
    startTransition(async () => {
      const res = isEdit
        ? await updateBlockAction(initial.id!, formData)
        : await createBlockAction(formData);
      if (res?.ok === false) {
        toast.error(res.error ?? "Kaydedilemedi.");
      } else if (isEdit) {
        toast.success("Güncellendi.");
      }
    });
  }

  function onDelete() {
    if (!initial.id) return;
    if (!confirm(`Bu ${type} bloğunu sil?`)) return;
    startTransition(async () => {
      await deleteBlockAction(initial.id!);
    });
  }

  return (
    <form action={onSubmit} className="space-y-16">
      <section>
        <div className="border-t border-line pt-6">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — blok tipi
          </p>
          <h2 className="display mt-3 text-3xl leading-none">Tip & Sıra</h2>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Tip
            </label>
            <select
              name="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            >
              {BLOCK_TYPES.map((t) => (
                <option key={t.key} value={t.key}>
                  {t.label}
                </option>
              ))}
              <option value="custom">Özel</option>
            </select>
            {activeTypeMeta ? (
              <p className="mt-2 text-[11px] text-mist">
                {activeTypeMeta.description}
              </p>
            ) : null}
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Sıra
            </label>
            <input
              name="sortOrder"
              defaultValue={initial.sortOrder}
              type="number"
              className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
            />
            <p className="mt-2 text-[11px] text-mist">
              Küçük numara önce gösterilir.
            </p>
          </div>
          <label className="flex items-start gap-4 md:col-span-2">
            <input
              type="checkbox"
              name="isActive"
              defaultChecked={initial.isActive}
              className="mt-1 size-4 appearance-none border border-line bg-paper checked:border-ink checked:bg-ink"
            />
            <div>
              <p className="text-[11px] uppercase tracking-[0.3em]">Aktif</p>
              <p className="mt-1 text-xs text-mist">
                Pasif iken ana sayfada görünmez.
              </p>
            </div>
          </label>
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between border-t border-line pt-6">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              — config
            </p>
            <h2 className="display mt-3 text-3xl leading-none">İçerik (JSON)</h2>
            <p className="mt-3 max-w-xl text-xs text-mist">
              Blok'un render'ı bu JSON'u okur. Tipine uygun alanları doldur.
              &quot;Örnek doldur&quot; butonu başlangıç için hazır şablon koyar.
            </p>
          </div>
          {activeTypeMeta ? (
            <button
              type="button"
              onClick={insertExample}
              className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
            >
              Örnek doldur →
            </button>
          ) : null}
        </div>

        <textarea
          name="config"
          value={configText}
          onChange={(e) => setConfigText(e.target.value)}
          rows={18}
          className="mt-6 w-full resize-y border border-line bg-transparent p-4 font-mono text-xs outline-none focus:border-ink"
        />
      </section>

      <div className="sticky bottom-4 z-10 flex items-center justify-between border border-line bg-paper px-6 py-4 shadow-sm">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/homepage"
            className="text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            ← Ana sayfa
          </Link>
          {isEdit ? (
            <button
              type="button"
              onClick={onDelete}
              disabled={pending}
              className="text-[11px] uppercase tracking-[0.3em] text-red-600 hover:text-red-800 disabled:opacity-50"
            >
              Sil
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
