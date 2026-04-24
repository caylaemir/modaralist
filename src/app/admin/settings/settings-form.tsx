"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import type { SettingKey, SettingsMap } from "@/lib/settings";
import { SETTING_SECTIONS } from "@/lib/settings";
import { saveSettingsAction } from "./actions";

type Props = {
  initialValues: SettingsMap;
};

export function SettingsForm({ initialValues }: Props) {
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await saveSettingsAction(formData);
      if (res.ok) {
        toast.success("Ayarlar kaydedildi.");
      } else {
        toast.error(res.error ?? "Kaydedilemedi.");
      }
    });
  }

  return (
    <form action={onSubmit} className="space-y-16">
      {SETTING_SECTIONS.map((section) => (
        <section key={section.id} id={section.id}>
          <div className="border-t border-line pt-6">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              {section.eyebrow}
            </p>
            <h2 className="display mt-3 text-3xl leading-none">
              {section.title}
            </h2>
            <p className="mt-3 max-w-xl text-xs text-mist">
              {section.description}
            </p>
          </div>
          <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {section.fields.map((field) => (
              <Field
                key={field.key}
                field={field}
                value={initialValues[field.key] ?? ""}
              />
            ))}
          </div>
        </section>
      ))}

      <div className="sticky bottom-4 z-10 flex items-center justify-between border border-line bg-paper px-6 py-4 shadow-sm">
        <p className="text-[11px] uppercase tracking-[0.3em] text-mist">
          {pending ? "Kaydediliyor..." : "Tüm değişiklikler tek tuşta"}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-3 bg-ink px-6 py-3 text-[11px] uppercase tracking-[0.3em] text-paper disabled:opacity-50"
        >
          <span>{pending ? "Kaydediliyor..." : "Kaydet"}</span>
          <span>→</span>
        </button>
      </div>
    </form>
  );
}

function Field({
  field,
  value,
}: {
  field: {
    key: SettingKey;
    label: string;
    type: "text" | "textarea" | "email" | "tel" | "url" | "number" | "boolean";
    placeholder?: string;
    hint?: string;
  };
  value: string;
}) {
  const spansFull =
    field.type === "textarea" ||
    field.key === "site.description" ||
    field.key === "contact.address" ||
    field.key === "shop.announcementText";

  if (field.type === "boolean") {
    const checked = value === "true";
    return (
      <label className="flex items-start gap-4 md:col-span-2">
        <input
          type="checkbox"
          name={field.key}
          defaultChecked={checked}
          className="mt-1 size-4 appearance-none border border-line bg-paper checked:border-ink checked:bg-ink"
        />
        <div>
          <p className="text-[11px] uppercase tracking-[0.3em]">
            {field.label}
          </p>
          {field.hint ? (
            <p className="mt-1 text-xs text-mist">{field.hint}</p>
          ) : null}
        </div>
      </label>
    );
  }

  if (field.type === "textarea") {
    return (
      <div className={spansFull ? "md:col-span-2" : ""}>
        <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
          {field.label}
        </label>
        <textarea
          name={field.key}
          defaultValue={value}
          placeholder={field.placeholder}
          rows={3}
          className="mt-2 w-full resize-y border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
        />
        {field.hint ? (
          <p className="mt-1 text-[11px] text-mist">{field.hint}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className={spansFull ? "md:col-span-2" : ""}>
      <label className="text-[10px] uppercase tracking-[0.3em] text-mist">
        {field.label}
      </label>
      <input
        type={field.type === "number" ? "text" : field.type}
        inputMode={field.type === "number" ? "decimal" : undefined}
        name={field.key}
        defaultValue={value}
        placeholder={field.placeholder}
        className="mt-2 w-full border-b border-line bg-transparent py-2 text-sm outline-none focus:border-ink"
      />
      {field.hint ? (
        <p className="mt-1 text-[11px] text-mist">{field.hint}</p>
      ) : null}
    </div>
  );
}
