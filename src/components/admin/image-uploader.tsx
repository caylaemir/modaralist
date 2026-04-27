"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Cloudinary'ye direkt upload yapan drag-drop widget.
 *
 * Akis:
 * 1) /api/upload/sign'dan signature al (admin auth zorunlu)
 * 2) FormData'yi Cloudinary'nin /image/upload endpoint'ine POST et
 * 3) Donen secure_url'i onUploaded callback'i ile parent'a ilet
 *
 * Drag-drop + click-to-select + multi-file. Her dosya icin progress.
 * Hata olursa toast.error.
 */
export function ImageUploader({
  onUploaded,
  folder = "modaralist/products",
  multiple = true,
}: {
  onUploaded: (url: string) => void;
  folder?: string;
  multiple?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState<string[]>([]); // file names
  const inputRef = useRef<HTMLInputElement | null>(null);

  async function uploadOne(file: File) {
    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name}: sadece gorsel dosyasi`);
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error(`${file.name}: max 10 MB`);
      return;
    }

    setUploading((prev) => [...prev, file.name]);
    try {
      const sigRes = await fetch("/api/upload/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder }),
      });
      if (!sigRes.ok) {
        const err = await sigRes.json().catch(() => ({}));
        toast.error(err.error || "Imza alinamadi");
        return;
      }
      const sig = await sigRes.json();

      const fd = new FormData();
      fd.append("file", file);
      fd.append("api_key", sig.apiKey);
      fd.append("timestamp", String(sig.timestamp));
      fd.append("signature", sig.signature);
      fd.append("folder", sig.folder);
      // Cloudinary signature'a dahil olduklari icin BURADA da ayni gonderilmek
      // ZORUNDA (yoksa "Invalid Signature" hatasi)
      if (sig.maxFileSize) fd.append("max_file_size", String(sig.maxFileSize));
      if (sig.resourceType) fd.append("resource_type", sig.resourceType);

      const upRes = await fetch(
        `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`,
        { method: "POST", body: fd }
      );
      if (!upRes.ok) {
        toast.error(`${file.name}: yukleme basarisiz`);
        return;
      }
      const data = await upRes.json();
      if (data.secure_url) {
        onUploaded(data.secure_url);
        toast.success(`${file.name} yuklendi`);
      }
    } catch (err) {
      console.error("[upload]", err);
      toast.error(`${file.name}: hata`);
    } finally {
      setUploading((prev) => prev.filter((n) => n !== file.name));
    }
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    // Sirayla yukle (paralel Cloudinary rate limit'e takilabilir)
    for (const f of arr) {
      await uploadOne(f);
    }
  }

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          void handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center gap-2 border-2 border-dashed px-6 py-8 transition-colors ${
          isDragging ? "border-ink bg-bone" : "border-line bg-bone/40 hover:border-ink"
        }`}
      >
        <Upload className="size-5 text-mist" />
        <p className="text-[11px] uppercase tracking-[0.25em] text-mist">
          Dosya surukle veya tikla
        </p>
        <p className="text-[10px] text-mist">
          PNG / JPG / WEBP, max 10 MB · {multiple ? "coklu yukleme" : "tek dosya"}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          className="hidden"
          onChange={(e) => void handleFiles(e.target.files)}
        />
      </div>

      {uploading.length > 0 ? (
        <ul className="mt-3 space-y-1">
          {uploading.map((name) => (
            <li
              key={name}
              className="flex items-center justify-between gap-2 border border-line bg-paper px-3 py-2 text-xs"
            >
              <span className="truncate">{name}</span>
              <Loader2 className="size-3 shrink-0 animate-spin text-mist" />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

/**
 * Tek bir uploader + URL listesi combine — admin product-form'a takmaya hazir.
 */
export function ImageUploaderField({
  value,
  onChange,
  folder = "modaralist/products",
}: {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}) {
  return (
    <div className="space-y-3">
      <ImageUploader
        folder={folder}
        onUploaded={(url) => onChange([...value, url])}
      />
      {value.length > 0 ? (
        <ul className="grid grid-cols-3 gap-2 md:grid-cols-4">
          {value.map((url, i) => (
            <li key={i} className="group relative aspect-square overflow-hidden bg-bone">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                className="size-full object-cover"
              />
              <button
                type="button"
                onClick={() => onChange(value.filter((_, idx) => idx !== i))}
                className="absolute right-1 top-1 hidden size-6 place-items-center bg-paper/90 text-ink hover:bg-red-50 hover:text-red-600 group-hover:grid"
                aria-label="Sil"
              >
                <X className="size-3" />
              </button>
              <span className="absolute bottom-1 left-1 bg-ink/80 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.15em] text-paper">
                {i === 0 ? "ANA" : i === 1 ? "HOVER" : `#${i + 1}`}
              </span>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
