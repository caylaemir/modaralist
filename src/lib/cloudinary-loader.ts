import type { ImageLoaderProps } from "next/image";

// Cloudinary loader — public/{folder}/{file.ext} yerine cloudinary public_id verirsen otomatik transform eder.
// Usage: <Image loader={cloudinaryLoader} src="modaralist/products/asymetric-drape-top-1" ... />
export function cloudinaryLoader({ src, width, quality }: ImageLoaderProps) {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud || src.startsWith("http")) {
    return src; // fallback: external/full URL
  }
  const params = [
    "f_auto",
    "c_fill",
    `w_${width}`,
    `q_${quality || "auto"}`,
  ].join(",");
  return `https://res.cloudinary.com/${cloud}/image/upload/${params}/${src}`;
}

export function cloudinaryUploadUrl() {
  const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  if (!cloud) throw new Error("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME tanımlı değil");
  return `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;
}
