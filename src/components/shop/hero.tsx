"use client";

import { motion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export function Hero() {
  const t = useTranslations("Home");

  return (
    <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden bg-bone">
      <div className="absolute inset-0">
        <div
          className="size-full bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=2000&q=80')",
          }}
        />
        <div className="absolute inset-0 bg-ink/20" />
      </div>

      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-between px-5 py-10 md:px-10 md:py-16">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="eyebrow text-paper/80"
        >
          Drop 01 — SS26
        </motion.p>

        <div className="flex flex-col items-start gap-10">
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="display max-w-4xl text-5xl leading-[1.05] text-paper md:text-8xl"
          >
            {t("heroHeadline")}
            <br />
            <span className="text-paper/70">{t("heroSubline")}</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.6 }}
          >
            <Link
              href="/shop"
              className="caps-wide inline-flex items-center gap-3 border border-paper px-8 py-4 text-xs text-paper transition-colors hover:bg-paper hover:text-ink"
            >
              {t("shopAll")}
              <span aria-hidden>→</span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
