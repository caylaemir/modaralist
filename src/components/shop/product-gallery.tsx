"use client";

import Image from "next/image";
import { motion } from "motion/react";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  return (
    <div className="flex flex-col gap-3">
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
            sizes="(min-width: 1024px) 60vw, 100vw"
            className="object-cover"
          />
        </motion.div>
      ))}
    </div>
  );
}
