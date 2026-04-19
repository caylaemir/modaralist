"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { slugify } from "@/lib/utils";
import {
  createCategory,
  updateCategory,
  type CategoryInput,
} from "@/server/actions/categories";

const formSchema = z.object({
  slug: z.string().min(1, "Slug zorunlu"),
  parentId: z.string().optional(),
  bannerUrl: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
  isActive: z.boolean().default(true),
  nameTr: z.string().min(1, "TR ad zorunlu"),
  slugTr: z.string().min(1, "TR slug zorunlu"),
  descriptionTr: z.string().optional(),
  seoTitleTr: z.string().optional(),
  seoDescTr: z.string().optional(),
  nameEn: z.string().min(1, "EN ad zorunlu"),
  slugEn: z.string().min(1, "EN slug zorunlu"),
  descriptionEn: z.string().optional(),
  seoTitleEn: z.string().optional(),
  seoDescEn: z.string().optional(),
});

type FormValues = z.input<typeof formSchema>;

export type ParentOption = { id: string; name: string };

type InitialValues = {
  id?: string;
  slug: string;
  parentId: string | null;
  bannerUrl: string | null;
  sortOrder: number;
  isActive: boolean;
  nameTr: string;
  slugTr: string;
  descriptionTr: string | null;
  seoTitleTr: string | null;
  seoDescTr: string | null;
  nameEn: string;
  slugEn: string;
  descriptionEn: string | null;
  seoTitleEn: string | null;
  seoDescEn: string | null;
};

export function CategoryForm({
  initial,
  parents,
  mode,
}: {
  initial?: InitialValues;
  parents: ParentOption[];
  mode: "create" | "edit";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      slug: initial?.slug ?? "",
      parentId: initial?.parentId ?? "",
      bannerUrl: initial?.bannerUrl ?? "",
      sortOrder: initial?.sortOrder ?? 0,
      isActive: initial?.isActive ?? true,
      nameTr: initial?.nameTr ?? "",
      slugTr: initial?.slugTr ?? "",
      descriptionTr: initial?.descriptionTr ?? "",
      seoTitleTr: initial?.seoTitleTr ?? "",
      seoDescTr: initial?.seoDescTr ?? "",
      nameEn: initial?.nameEn ?? "",
      slugEn: initial?.slugEn ?? "",
      descriptionEn: initial?.descriptionEn ?? "",
      seoTitleEn: initial?.seoTitleEn ?? "",
      seoDescEn: initial?.seoDescEn ?? "",
    },
  });

  const nameTr = watch("nameTr");

  function autofillSlugs() {
    const base = slugify(nameTr || "");
    if (!base) return;
    if (!getValues("slug")) setValue("slug", base, { shouldDirty: true });
    if (!getValues("slugTr")) setValue("slugTr", base, { shouldDirty: true });
    if (!getValues("slugEn")) setValue("slugEn", base, { shouldDirty: true });
  }

  const onSubmit = handleSubmit((values) => {
    const payload: CategoryInput = {
      slug: values.slug,
      parentId: values.parentId ? values.parentId : null,
      bannerUrl: values.bannerUrl || null,
      sortOrder: Number(values.sortOrder) || 0,
      isActive: values.isActive,
      translations: [
        {
          locale: "tr",
          name: values.nameTr,
          slug: values.slugTr,
          description: values.descriptionTr || null,
          seoTitle: values.seoTitleTr || null,
          seoDesc: values.seoDescTr || null,
        },
        {
          locale: "en",
          name: values.nameEn,
          slug: values.slugEn,
          description: values.descriptionEn || null,
          seoTitle: values.seoTitleEn || null,
          seoDesc: values.seoDescEn || null,
        },
      ],
    };

    startTransition(async () => {
      try {
        if (mode === "edit" && initial?.id) {
          await updateCategory(initial.id, payload);
          toast.success("Kategori güncellendi.");
        } else {
          await createCategory(payload);
          toast.success("Kategori oluşturuldu.");
        }
        router.push("/admin/categories");
        router.refresh();
      } catch (err) {
        const msg = err instanceof Error ? err.message : "İşlem başarısız.";
        toast.error(msg);
      }
    });
  });

  const inputCls =
    "w-full border border-line bg-paper px-3 py-2 text-sm focus:border-ink outline-none";
  const labelCls = "mb-1 block text-xs uppercase tracking-wider text-mist";
  const errCls = "mt-1 text-xs text-red-600";

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">Genel</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Slug (benzersiz)</label>
            <input className={inputCls} {...register("slug")} />
            {errors.slug && <p className={errCls}>{errors.slug.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Üst Kategori</label>
            <select className={inputCls} {...register("parentId")}>
              <option value="">— Kök —</option>
              {parents.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>Banner URL</label>
            <input className={inputCls} {...register("bannerUrl")} />
          </div>
          <div>
            <label className={labelCls}>Sıra</label>
            <input
              type="number"
              className={inputCls}
              {...register("sortOrder")}
            />
          </div>
          <div className="flex items-center gap-2 md:col-span-2">
            <input
              type="checkbox"
              id="isActive"
              className="size-4 border border-line"
              {...register("isActive")}
            />
            <label htmlFor="isActive" className="text-sm">
              Aktif
            </label>
          </div>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <div className="flex items-center justify-between">
          <h2 className="caps-wide text-sm">Türkçe (TR)</h2>
          <button
            type="button"
            onClick={autofillSlugs}
            className="border border-line px-3 py-1 text-xs hover:border-ink"
          >
            Slug'ları TR ad'dan türet
          </button>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Ad</label>
            <input className={inputCls} {...register("nameTr")} />
            {errors.nameTr && <p className={errCls}>{errors.nameTr.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input className={inputCls} {...register("slugTr")} />
            {errors.slugTr && <p className={errCls}>{errors.slugTr.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Açıklama</label>
            <textarea
              rows={3}
              className={inputCls}
              {...register("descriptionTr")}
            />
          </div>
          <div>
            <label className={labelCls}>SEO Başlık</label>
            <input className={inputCls} {...register("seoTitleTr")} />
          </div>
          <div>
            <label className={labelCls}>SEO Açıklama</label>
            <input className={inputCls} {...register("seoDescTr")} />
          </div>
        </div>
      </section>

      <section className="border border-line bg-paper p-6">
        <h2 className="caps-wide text-sm">English (EN)</h2>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className={labelCls}>Name</label>
            <input className={inputCls} {...register("nameEn")} />
            {errors.nameEn && <p className={errCls}>{errors.nameEn.message}</p>}
          </div>
          <div>
            <label className={labelCls}>Slug</label>
            <input className={inputCls} {...register("slugEn")} />
            {errors.slugEn && <p className={errCls}>{errors.slugEn.message}</p>}
          </div>
          <div className="md:col-span-2">
            <label className={labelCls}>Description</label>
            <textarea
              rows={3}
              className={inputCls}
              {...register("descriptionEn")}
            />
          </div>
          <div>
            <label className={labelCls}>SEO Title</label>
            <input className={inputCls} {...register("seoTitleEn")} />
          </div>
          <div>
            <label className={labelCls}>SEO Description</label>
            <input className={inputCls} {...register("seoDescEn")} />
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="bg-ink px-4 py-2 text-sm text-paper disabled:opacity-50"
        >
          {pending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="border border-line px-4 py-2 text-sm hover:border-ink"
        >
          İptal
        </button>
      </div>
    </form>
  );
}
