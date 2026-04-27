"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Plus, Sparkles, X, Loader2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { createProduct, updateProduct } from "@/server/actions/products";
import { ImageUploader } from "@/components/admin/image-uploader";

// ---------- Form schema (mirrors server schema but client-friendly) ----------

const formSchema = z.object({
  slug: z
    .string()
    .min(1, "Slug zorunlu")
    .regex(/^[a-z0-9-]+$/, "Sadece küçük harf, rakam ve tire"),
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED", "COMING_SOON"]),
  categoryId: z.string().optional(),
  basePrice: z.coerce.number().min(0),
  discountPrice: z
    .union([z.coerce.number().min(0), z.literal("")])
    .optional()
    .transform((v) => (v === "" || v == null ? null : Number(v))),
  taxRate: z.coerce.number().min(0).max(100),
  lowStockLimit: z.coerce.number().int().min(0),
  trName: z.string().min(1, "TR ad zorunlu"),
  trDescription: z.string().optional().nullable(),
  trMaterial: z.string().optional().nullable(),
  trCare: z.string().optional().nullable(),
  enName: z.string().min(1, "EN ad zorunlu"),
  enDescription: z.string().optional().nullable(),
  enMaterial: z.string().optional().nullable(),
  enCare: z.string().optional().nullable(),
  images: z
    .array(
      z.object({
        url: z.string().url("Geçerli URL girin"),
      })
    )
    .default([]),
  selectedColorIds: z.array(z.string()).default([]),
  selectedSizeIds: z.array(z.string()).default([]),
  // stockMatrix: object keyed by `${colorId}:${sizeId}` — OR `nocolor:${sizeId}` / `${colorId}:nosize` / "nocolor:nosize"
  stockMatrix: z.record(z.string(), z.coerce.number().int().min(0)).default({}),
});

type FormValues = z.input<typeof formSchema>;
type FormOutput = z.output<typeof formSchema>;

// ---------- Props ----------

export type ProductFormCategory = {
  id: string;
  name: string;
};

export type ProductFormColor = {
  id: string;
  code: string;
  hex: string;
  nameTr: string;
};

export type ProductFormSize = {
  id: string;
  code: string;
};

export type ProductFormInitial = {
  id?: string;
  slug?: string;
  status?: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "COMING_SOON";
  categoryId?: string | null;
  basePrice?: number;
  discountPrice?: number | null;
  taxRate?: number;
  lowStockLimit?: number;
  tr?: {
    name?: string;
    description?: string | null;
    material?: string | null;
    care?: string | null;
  };
  en?: {
    name?: string;
    description?: string | null;
    material?: string | null;
    care?: string | null;
  };
  images?: { url: string }[];
  variants?: {
    sizeId: string | null;
    colorId: string | null;
    stock: number;
  }[];
};

export function ProductForm({
  mode,
  productId,
  categories,
  colors,
  sizes,
  initial,
}: {
  mode: "create" | "edit";
  productId?: string;
  categories: ProductFormCategory[];
  colors: ProductFormColor[];
  sizes: ProductFormSize[];
  initial?: ProductFormInitial;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const defaultSelectedColors =
    initial?.variants
      ?.map((v) => v.colorId)
      .filter((v): v is string => !!v)
      .filter((v, i, arr) => arr.indexOf(v) === i) ?? [];

  const defaultSelectedSizes =
    initial?.variants
      ?.map((v) => v.sizeId)
      .filter((v): v is string => !!v)
      .filter((v, i, arr) => arr.indexOf(v) === i) ?? [];

  const defaultStockMatrix: Record<string, number> = {};
  initial?.variants?.forEach((v) => {
    const key = `${v.colorId ?? "nocolor"}:${v.sizeId ?? "nosize"}`;
    defaultStockMatrix[key] = v.stock;
  });

  const { register, handleSubmit, watch, setValue, control, formState } =
    useForm<FormValues>({
      resolver: zodResolver(formSchema),
      defaultValues: {
        slug: initial?.slug ?? "",
        status: initial?.status ?? "DRAFT",
        categoryId: initial?.categoryId ?? "",
        basePrice: initial?.basePrice ?? 0,
        discountPrice: initial?.discountPrice ?? "",
        taxRate: initial?.taxRate ?? 20,
        lowStockLimit: initial?.lowStockLimit ?? 3,
        trName: initial?.tr?.name ?? "",
        trDescription: initial?.tr?.description ?? "",
        trMaterial: initial?.tr?.material ?? "",
        trCare: initial?.tr?.care ?? "",
        enName: initial?.en?.name ?? "",
        enDescription: initial?.en?.description ?? "",
        enMaterial: initial?.en?.material ?? "",
        enCare: initial?.en?.care ?? "",
        images: initial?.images ?? [],
        selectedColorIds: defaultSelectedColors,
        selectedSizeIds: defaultSelectedSizes,
        stockMatrix: defaultStockMatrix,
      },
    });

  const imagesField = useFieldArray({ control, name: "images" });

  const selectedColorIds = watch("selectedColorIds") ?? [];
  const selectedSizeIds = watch("selectedSizeIds") ?? [];
  const trName = watch("trName");
  const slugValue = watch("slug");

  const selectedColors = useMemo(
    () => colors.filter((c) => selectedColorIds.includes(c.id)),
    [colors, selectedColorIds]
  );
  const selectedSizes = useMemo(
    () => sizes.filter((s) => selectedSizeIds.includes(s.id)),
    [sizes, selectedSizeIds]
  );

  // Variant cells to render — cartesian or degenerate
  const variantCells = useMemo(() => {
    const rows =
      selectedColors.length > 0
        ? selectedColors.map((c) => ({
            id: c.id,
            label: c.nameTr,
            hex: c.hex,
          }))
        : [{ id: "nocolor", label: "—", hex: null as string | null }];
    const cols =
      selectedSizes.length > 0
        ? selectedSizes.map((s) => ({ id: s.id, label: s.code }))
        : [{ id: "nosize", label: "—" }];
    return { rows, cols };
  }, [selectedColors, selectedSizes]);

  function autoSlug() {
    if (trName) setValue("slug", slugify(trName), { shouldValidate: true });
  }

  const [aiPending, setAiPending] = useState(false);
  async function aiFill() {
    if (!trName || trName.trim().length < 2) {
      toast.error("Önce TR ürün adını yaz");
      return;
    }
    const categoryId = watch("categoryId");
    const categoryName = categories.find((c) => c.id === categoryId)?.name;

    setAiPending(true);
    try {
      const res = await fetch("/api/admin/ai/product-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: trName,
          categoryName: categoryName ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data?.error ?? "AI üretimi başarısız");
        return;
      }
      // Bos olmayan alanlari koru — overwrite YAPMA, kullanici yazdiysa saygi
      const fillIfEmpty = (key: keyof FormValues, value: string | undefined) => {
        if (!value) return;
        const current = (watch(key) as string | undefined) ?? "";
        if (current.trim().length === 0) {
          setValue(key, value as never, { shouldDirty: true });
        }
      };
      fillIfEmpty("trDescription", data.trDescription);
      fillIfEmpty("enDescription", data.enDescription);
      fillIfEmpty("trMaterial", data.trMaterial);
      fillIfEmpty("enMaterial", data.enMaterial);
      fillIfEmpty("trCare", data.trCare);
      fillIfEmpty("enCare", data.enCare);
      // EN ad icin: TR adina cevirisini cikarmak yerine TR'yi kullaniciya bırak
      // (urun adlari genelde marka/seri-spesifik, AI'nin yorumlamasi yanliyabilir)
      toast.success("AI ile dolduruldu (boş alanlar)");
    } catch {
      toast.error("Bağlantı hatası");
    } finally {
      setAiPending(false);
    }
  }

  function onSubmit(values: FormValues) {
    const parsed = formSchema.parse(values) as FormOutput;

    // Build variants from the matrix
    const variants: Array<{
      sku: string;
      colorId: string | null;
      sizeId: string | null;
      stock: number;
      isActive: boolean;
    }> = [];

    const colorRows =
      selectedColors.length > 0
        ? selectedColors.map((c) => ({
            id: c.id,
            code: c.code,
          }))
        : [{ id: null as string | null, code: "std" }];
    const sizeCols =
      selectedSizes.length > 0
        ? selectedSizes.map((s) => ({ id: s.id, code: s.code }))
        : [{ id: null as string | null, code: "onesize" }];

    for (const c of colorRows) {
      for (const s of sizeCols) {
        const key = `${c.id ?? "nocolor"}:${s.id ?? "nosize"}`;
        const stock = Number(parsed.stockMatrix[key] ?? 0);
        const sku = `${parsed.slug}-${c.code}-${s.code}`.toUpperCase();
        variants.push({
          sku,
          colorId: c.id,
          sizeId: s.id,
          stock,
          isActive: true,
        });
      }
    }

    const payload = {
      slug: parsed.slug,
      status: parsed.status,
      categoryId: parsed.categoryId ? parsed.categoryId : null,
      basePrice: parsed.basePrice,
      discountPrice: parsed.discountPrice ?? null,
      taxRate: parsed.taxRate,
      currency: "TRY",
      lowStockLimit: parsed.lowStockLimit,
      translations: [
        {
          locale: "tr" as const,
          name: parsed.trName,
          description: parsed.trDescription ?? null,
          material: parsed.trMaterial ?? null,
          care: parsed.trCare ?? null,
          seoTitle: null,
          seoDesc: null,
          slug: parsed.slug,
        },
        {
          locale: "en" as const,
          name: parsed.enName,
          description: parsed.enDescription ?? null,
          material: parsed.enMaterial ?? null,
          care: parsed.enCare ?? null,
          seoTitle: null,
          seoDesc: null,
          slug: parsed.slug,
        },
      ],
      images: parsed.images.map((img, i) => ({
        url: img.url,
        alt: null,
        sortOrder: i,
        isHover: i === 1,
      })),
      variants,
    };

    startTransition(async () => {
      try {
        if (mode === "create") {
          await createProduct(payload);
          toast.success("Ürün oluşturuldu.");
          router.push("/admin/products");
        } else if (mode === "edit" && productId) {
          await updateProduct(productId, payload);
          toast.success("Ürün güncellendi.");
          router.refresh();
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Kayıt başarısız.");
      }
    });
  }

  const inputCls =
    "w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink outline-none";
  const labelCls = "text-xs uppercase tracking-wider text-mist";

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-8"
      noValidate
    >
      {/* --------- Core --------- */}
      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">Temel Bilgiler</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Slug *</label>
            <div className="mt-1 flex gap-2">
              <input
                type="text"
                {...register("slug")}
                className={inputCls}
                placeholder="urun-slug"
              />
              <button
                type="button"
                onClick={autoSlug}
                className="shrink-0 border border-line bg-bone px-3 py-2 text-xs text-ink hover:bg-line"
              >
                Otomatik
              </button>
            </div>
            {formState.errors.slug ? (
              <p className="mt-1 text-xs text-red-600">
                {formState.errors.slug.message}
              </p>
            ) : (
              <p className="mt-1 text-xs text-mist">
                URL'de görünecek: /{slugValue || "..."}
              </p>
            )}
          </div>

          <div>
            <label className={labelCls}>Durum *</label>
            <select {...register("status")} className={`${inputCls} mt-1`}>
              <option value="DRAFT">Taslak</option>
              <option value="PUBLISHED">Yayında</option>
              <option value="COMING_SOON">Yakında</option>
              <option value="ARCHIVED">Arşiv</option>
            </select>
          </div>

          <div>
            <label className={labelCls}>Kategori</label>
            <select
              {...register("categoryId")}
              className={`${inputCls} mt-1`}
            >
              <option value="">— Seçin —</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className={labelCls}>Fiyat (TRY) *</label>
              <input
                type="number"
                step="0.01"
                {...register("basePrice")}
                className={`${inputCls} mt-1`}
              />
              {formState.errors.basePrice ? (
                <p className="mt-1 text-xs text-red-600">
                  {formState.errors.basePrice.message}
                </p>
              ) : null}
            </div>
            <div>
              <label className={labelCls}>İndirim</label>
              <input
                type="number"
                step="0.01"
                {...register("discountPrice")}
                className={`${inputCls} mt-1`}
                placeholder="—"
              />
            </div>
            <div>
              <label className={labelCls}>KDV %</label>
              <input
                type="number"
                step="0.01"
                {...register("taxRate")}
                className={`${inputCls} mt-1`}
              />
            </div>
          </div>

          <div>
            <label className={labelCls}>Düşük Stok Eşiği</label>
            <input
              type="number"
              step="1"
              {...register("lowStockLimit")}
              className={`${inputCls} mt-1`}
            />
          </div>
        </div>
      </section>

      {/* --------- TR --------- */}
      <section className="border border-line bg-paper p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <h2 className="caps-wide text-sm">Türkçe İçerik</h2>
            <span className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-mist">
              tr
            </span>
          </div>
          <button
            type="button"
            onClick={aiFill}
            disabled={aiPending}
            title="TR + EN açıklama, materyal, bakım, SEO alanlarını AI ile doldurur (boş olanları)"
            className="inline-flex items-center gap-2 border border-ink bg-bone px-3 py-1.5 text-xs hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {aiPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              <Sparkles className="size-3" />
            )}
            {aiPending ? "Üretiliyor..." : "AI ile Doldur"}
          </button>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>Ad *</label>
            <input
              type="text"
              {...register("trName")}
              className={`${inputCls} mt-1`}
            />
            {formState.errors.trName ? (
              <p className="mt-1 text-xs text-red-600">
                {formState.errors.trName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelCls}>Açıklama</label>
            <textarea
              rows={4}
              {...register("trDescription")}
              className={`${inputCls} mt-1`}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Malzeme</label>
              <input
                type="text"
                {...register("trMaterial")}
                className={`${inputCls} mt-1`}
              />
            </div>
            <div>
              <label className={labelCls}>Bakım</label>
              <input
                type="text"
                {...register("trCare")}
                className={`${inputCls} mt-1`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------- EN --------- */}
      <section className="border border-line bg-paper p-6">
        <div className="flex items-center gap-2">
          <h2 className="caps-wide text-sm">English Content</h2>
          <span className="border border-line px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-mist">
            en
          </span>
        </div>
        <div className="mt-4 space-y-4">
          <div>
            <label className={labelCls}>Name *</label>
            <input
              type="text"
              {...register("enName")}
              className={`${inputCls} mt-1`}
            />
            {formState.errors.enName ? (
              <p className="mt-1 text-xs text-red-600">
                {formState.errors.enName.message}
              </p>
            ) : null}
          </div>
          <div>
            <label className={labelCls}>Description</label>
            <textarea
              rows={4}
              {...register("enDescription")}
              className={`${inputCls} mt-1`}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className={labelCls}>Material</label>
              <input
                type="text"
                {...register("enMaterial")}
                className={`${inputCls} mt-1`}
              />
            </div>
            <div>
              <label className={labelCls}>Care</label>
              <input
                type="text"
                {...register("enCare")}
                className={`${inputCls} mt-1`}
              />
            </div>
          </div>
        </div>
      </section>

      {/* --------- Images --------- */}
      <section className="border border-line bg-paper p-6">
        <div className="flex items-center justify-between">
          <h2 className="caps-wide text-sm">Görseller</h2>
          <button
            type="button"
            onClick={() => imagesField.append({ url: "" })}
            className="inline-flex items-center gap-1 border border-line bg-bone px-3 py-1.5 text-xs text-ink hover:bg-line"
          >
            <Plus className="size-3" />
            URL ekle
          </button>
        </div>
        <p className="mt-1 text-xs text-mist">
          Cloudinary'ye dosya sürükle veya URL elden ekle. İlk görsel <strong>ana</strong>,
          ikinci görsel <strong>hover</strong>.
        </p>

        <div className="mt-4">
          <ImageUploader
            multiple
            onUploaded={(url) => imagesField.append({ url })}
          />
        </div>

        <div className="mt-4 space-y-2">
          {imagesField.fields.length === 0 ? (
            <p className="text-sm text-mist">Henüz görsel yok.</p>
          ) : (
            imagesField.fields.map((f, i) => (
              <div key={f.id} className="flex items-center gap-2">
                <span className="w-6 shrink-0 text-xs text-mist">{i + 1}.</span>
                <input
                  type="url"
                  {...register(`images.${i}.url` as const)}
                  className={inputCls}
                  placeholder="https://..."
                />
                <button
                  type="button"
                  onClick={() => imagesField.remove(i)}
                  className="shrink-0 border border-line bg-paper p-2 text-mist hover:text-red-600"
                  aria-label="Kaldır"
                >
                  <X className="size-3" />
                </button>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --------- Variants --------- */}
      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">Varyantlar</h2>
        <p className="mt-1 text-xs text-mist">
          Renkler ve bedenleri seçin, her kombinasyon için stok girin.
        </p>

        {/* Colors */}
        <div className="mt-4">
          <p className={labelCls}>Renkler</p>
          <Controller
            control={control}
            name="selectedColorIds"
            render={({ field }) => (
              <div className="mt-2 flex flex-wrap gap-2">
                {colors.map((c) => {
                  const checked = field.value?.includes(c.id) ?? false;
                  return (
                    <label
                      key={c.id}
                      className={[
                        "inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-xs",
                        checked
                          ? "border-ink bg-ink text-paper"
                          : "border-line bg-paper text-ink hover:bg-bone",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(field.value ?? []);
                          if (e.target.checked) next.add(c.id);
                          else next.delete(c.id);
                          field.onChange(Array.from(next));
                        }}
                      />
                      <span
                        className="inline-block size-3 rounded-full border border-line"
                        style={{ backgroundColor: c.hex }}
                      />
                      {c.nameTr}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Sizes */}
        <div className="mt-4">
          <p className={labelCls}>Bedenler</p>
          <Controller
            control={control}
            name="selectedSizeIds"
            render={({ field }) => (
              <div className="mt-2 flex flex-wrap gap-2">
                {sizes.map((s) => {
                  const checked = field.value?.includes(s.id) ?? false;
                  return (
                    <label
                      key={s.id}
                      className={[
                        "inline-flex cursor-pointer items-center justify-center border px-3 py-1.5 text-xs w-14",
                        checked
                          ? "border-ink bg-ink text-paper"
                          : "border-line bg-paper text-ink hover:bg-bone",
                      ].join(" ")}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={(e) => {
                          const next = new Set(field.value ?? []);
                          if (e.target.checked) next.add(s.id);
                          else next.delete(s.id);
                          field.onChange(Array.from(next));
                        }}
                      />
                      {s.code}
                    </label>
                  );
                })}
              </div>
            )}
          />
        </div>

        {/* Stock matrix */}
        <div className="mt-6">
          <p className={labelCls}>Stok Matrisi</p>
          <div className="mt-2 overflow-x-auto border border-line">
            <table className="w-full text-xs">
              <thead className="border-b border-line bg-bone">
                <tr>
                  <th className="px-3 py-2 text-left font-normal text-mist uppercase tracking-wider">
                    Renk / Beden
                  </th>
                  {variantCells.cols.map((col) => (
                    <th
                      key={col.id}
                      className="px-3 py-2 text-center font-normal text-mist uppercase tracking-wider"
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {variantCells.rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-line last:border-0"
                  >
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {row.hex ? (
                          <span
                            className="inline-block size-3 rounded-full border border-line"
                            style={{ backgroundColor: row.hex }}
                          />
                        ) : null}
                        <span>{row.label}</span>
                      </div>
                    </td>
                    {variantCells.cols.map((col) => {
                      const key = `${row.id}:${col.id}`;
                      return (
                        <td key={col.id} className="px-2 py-1.5">
                          <input
                            type="number"
                            step="1"
                            min={0}
                            {...register(`stockMatrix.${key}` as const)}
                            className="w-full border border-line bg-paper px-2 py-1 text-center text-sm focus:border-ink outline-none"
                            defaultValue={0}
                          />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* --------- Submit --------- */}
      <div className="flex items-center justify-end gap-3 border-t border-line pt-6">
        <button
          type="button"
          onClick={() => router.push("/admin/products")}
          className="border border-line bg-paper px-4 py-2 text-sm text-ink hover:bg-bone"
        >
          İptal
        </button>
        <button
          type="submit"
          disabled={isPending || formState.isSubmitting}
          className="bg-ink px-5 py-2 text-sm text-paper hover:opacity-90 disabled:opacity-50"
        >
          {isPending
            ? "Kaydediliyor..."
            : mode === "create"
              ? "Oluştur"
              : "Değişiklikleri Kaydet"}
        </button>
      </div>
    </form>
  );
}
