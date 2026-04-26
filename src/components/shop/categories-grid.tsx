"use client";

import Image from "next/image";
import { motion } from "motion/react";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import type { CategoryWithCover } from "@/lib/shop";

export function CategoriesGrid({
  categories,
  locale = "tr",
}: {
  categories: CategoryWithCover[];
  locale?: "tr" | "en";
}) {
  if (categories.length === 0) return null;

  // En cok 7 kategori — geri kalanlari "Tum kategoriler" link'i
  const main = categories.slice(0, 7);

  return (
    <div
      className={`grid gap-3 ${
        main.length === 7
          ? "grid-cols-2 md:grid-cols-4 lg:grid-cols-7"
          : main.length >= 5
            ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
            : main.length >= 3
              ? "grid-cols-2 md:grid-cols-3"
              : "grid-cols-2"
      }`}
    >
      {main.map((c, i) => (
        <CategoryTile key={c.slug} category={c} index={i} locale={locale} />
      ))}
    </div>
  );
}

function CategoryTile({
  category,
  index,
  locale,
}: {
  category: CategoryWithCover;
  index: number;
  locale: "tr" | "en";
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
        delay: Math.min(index * 0.07, 0.5),
      }}
    >
      <Link
        href={`/shop/${category.slug}`}
        className="group relative block aspect-[3/4] overflow-hidden bg-sand"
      >
        {category.coverImage ? (
          <Image
            src={category.coverImage}
            alt={category.name}
            fill
            sizes="(min-width: 1024px) 14vw, (min-width: 640px) 25vw, 50vw"
            className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
          />
        ) : (
          <div className="size-full bg-gradient-to-br from-bone via-sand to-bone" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent transition-opacity duration-500 group-hover:from-ink/95" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 md:p-5">
          <div>
            <p className="display text-2xl leading-none text-paper md:text-3xl">
              {category.name}
            </p>
            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-paper/70">
              {category.productCount}{" "}
              {locale === "tr" ? "parça" : "items"}
            </p>
          </div>
          <span
            aria-hidden
            className="grid size-8 place-items-center rounded-full bg-paper/10 text-paper backdrop-blur-sm transition-all duration-300 group-hover:bg-paper group-hover:text-ink"
          >
            <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}
