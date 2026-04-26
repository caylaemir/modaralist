"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2400&q=85",
    caption: "Chapter I — Stillness",
  },
  {
    src: "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2400&q=85",
    caption: "Chapter II — Drift",
  },
  {
    src: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?auto=format&fit=crop&w=2400&q=85",
    caption: "Chapter III — Silhouette",
  },
  {
    src: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=2400&q=85",
    caption: "Chapter IV — Form",
  },
];

export function Hero() {
  const t = useTranslations("Home");
  const [i, setI] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setI((v) => (v + 1) % SLIDES.length), 5200);
    return () => clearInterval(id);
  }, []);

  const words = t("heroHeadline").split(" ");
  const sub = t("heroSubline").split(" ");

  return (
    <section className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-ink">
      <AnimatePresence mode="sync">
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div
            className="size-full bg-cover bg-center"
            style={{ backgroundImage: `url('${SLIDES[i].src}')` }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink/30 via-transparent to-ink/60" />
        </motion.div>
      </AnimatePresence>

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 py-10 md:px-10 md:py-14">
        <div className="flex items-start justify-between">
          <motion.p
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="text-[10px] uppercase tracking-[0.35em] text-paper/80"
          >
            SS26 — Drop 01
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-paper/80"
          >
            <span className="tabular-nums">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="h-px w-12 bg-paper/40" />
            <span className="tabular-nums">
              {String(SLIDES.length).padStart(2, "0")}
            </span>
          </motion.div>
        </div>

        <div>
          <h1 className="display max-w-5xl text-[clamp(3rem,14vw,9rem)] leading-[0.92] text-paper md:text-[clamp(4rem,9vw,11rem)]">
            <span className="block">
              {words.map((w, wi) => (
                <span
                  key={wi}
                  className="inline-flex overflow-hidden"
                  style={{ marginRight: "0.2em" }}
                >
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.2 + wi * 0.06,
                    }}
                    className="inline-block"
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
            <span className="block text-paper/60">
              {sub.map((w, wi) => (
                <span
                  key={wi}
                  className="inline-flex overflow-hidden"
                  style={{ marginRight: "0.2em" }}
                >
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.9,
                      ease: [0.22, 1, 0.36, 1],
                      delay: 0.5 + wi * 0.06,
                    }}
                    className="inline-block"
                  >
                    {w}
                  </motion.span>
                </span>
              ))}
            </span>
          </h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: [0.22, 1, 0.36, 1] }}
            className="mt-10 flex flex-wrap items-end justify-between gap-6"
          >
            <Link
              href="/shop"
              className="group flex items-center gap-4 border-b border-paper pb-2 text-[11px] uppercase tracking-[0.35em] text-paper"
            >
              <span>{t("shopAll")}</span>
              <ArrowUpRight className="size-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
            <AnimatePresence mode="wait">
              <motion.p
                key={i}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.6 }}
                className="text-[10px] uppercase tracking-[0.35em] text-paper/60"
              >
                {SLIDES[i].caption}
              </motion.p>
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
