"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  return (
    // Masaustunde gorsel cok buyuk gorunuyordu — max genislik ile sinirla,
    // sola yasla (yaninda urun bilgisi/sepet paneli oturuyor).
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-3 lg:mx-0">
      {images.map((src, i) => (
        <motion.div
          key={i}
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
