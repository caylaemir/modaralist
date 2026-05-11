"use client";

import { useMemo } from "react";
import Image from "next/image";
import { motion } from "motion/react";

export function ProductGallery({
  images,
  sharedImages,
  colorImages,
  selectedColor,
  alt,
}: {
  images: string[];
  // Renge atanmamis genel gorseller
  sharedImages?: string[];
  // colorCode -> o renge atanmis gorseller
  colorImages?: Record<string, string[]>;
  // Su an secili renk kodu (urun aksiyonlarindan gelir)
  selectedColor?: string | null;
  alt: string;
}) {
  // Secili rengin kendine ait gorselleri varsa: o gorseller + varsa genel
  // gorseller. Yoksa ama baska renklerin gorselleri tanimliysa: sadece genel
  // gorseller. Hic renk-gorseli yoksa: tum gorseller (geriye uyumlu).
  const displayed = useMemo(() => {
    const dedupe = (arr: string[]) => Array.from(new Set(arr));
    const forColor = selectedColor ? colorImages?.[selectedColor] : undefined;
    if (forColor && forColor.length > 0) {
      return dedupe([...forColor, ...(sharedImages ?? [])]);
    }
    const hasAnyColorImages =
      colorImages != null && Object.keys(colorImages).length > 0;
    if (hasAnyColorImages && sharedImages && sharedImages.length > 0) {
      return sharedImages;
    }
    return images;
  }, [selectedColor, colorImages, sharedImages, images]);

  return (
    // Masaustunde gorsel cok buyuk gorunuyordu — max genislik ile sinirla,
    // sola yasla (yaninda urun bilgisi/sepet paneli oturuyor).
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3 lg:mx-0">
      {displayed.map((src, i) => (
        <motion.div
          key={`${src}-${i}`}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="relative aspect-[3/4] w-full overflow-hidden bg-sand"
        >
          <Image
            src={src}
            alt={`${alt} ${i + 1}`}
            fill
            priority={i === 0}
            sizes="(min-width: 1024px) 640px, 100vw"
            className="object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}
