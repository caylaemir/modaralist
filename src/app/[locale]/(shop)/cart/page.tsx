"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Minus, Plus, X } from "lucide-react";
import { motion } from "motion/react";

export default function CartPage() {
  const locale = useLocale() as "tr" | "en";
  const t = useTranslations("Cart");
  const { lines, setQuantity, remove, subtotal } = useCart();
  const total = subtotal();

  if (lines.length === 0) {
    return (
      <section className="mx-auto max-w-[1200px] px-5 py-32 text-center md:px-10 md:py-56">
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — sepet
        </p>
        <h1 className="display mt-8 text-[12vw] leading-[0.95] md:text-[6vw]">
          Sepetin şu an bomboş.
        </h1>
        <p className="mt-6 text-base text-mist">
          Seni bekleyen siluetlerle buluş.
        </p>
        <Link
          href="/shop"
          className="mt-12 inline-flex items-center gap-3 border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
        >
          {t("goToShop")} →
        </Link>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-[1600px] px-5 pt-24 pb-40 md:px-10 md:pt-40">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">— sepet</p>
      <h1 className="display mt-6 text-[12vw] leading-[0.95] md:text-[6vw]">
        {t("title")}.
      </h1>

      <div className="mt-20 grid gap-16 md:grid-cols-12">
        <ul className="md:col-span-8">
          {lines.map((l, i) => (
            <motion.li
              key={l.variantId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.8,
                delay: i * 0.05,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="grid grid-cols-[120px_1fr] gap-6 border-b border-line py-8 md:grid-cols-[180px_1fr_auto_auto] md:items-center md:gap-10"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-sand">
                {l.image && (
                  <Image
                    src={l.image}
                    alt={l.name}
                    fill
                    sizes="180px"
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <p className="text-base">{l.name}</p>
                <p className="mt-1 text-[10px] uppercase tracking-[0.3em] text-mist">
                  {[l.size, l.color].filter(Boolean).join(" · ")}
                </p>
                <p className="mt-3 text-sm tabular-nums md:hidden">
                  {formatPrice(l.unitPrice * l.quantity, locale)}
                </p>
                <div className="mt-4 flex items-center gap-4 md:hidden">
                  <div className="flex items-center border border-line">
                    <button
                      onClick={() => setQuantity(l.variantId, l.quantity - 1)}
                      className="p-2"
                    >
                      <Minus className="size-3" />
                    </button>
                    <span className="min-w-8 text-center text-xs tabular-nums">
                      {l.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(l.variantId, l.quantity + 1)}
                      className="p-2"
                    >
                      <Plus className="size-3" />
                    </button>
                  </div>
                  <button
                    onClick={() => remove(l.variantId)}
                    className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
                  >
                    {t("remove")}
                  </button>
                </div>
              </div>
              <div className="hidden items-center border border-line md:flex">
                <button
                  onClick={() => setQuantity(l.variantId, l.quantity - 1)}
                  className="p-2"
                >
                  <Minus className="size-3" />
                </button>
                <span className="min-w-10 text-center text-xs tabular-nums">
                  {l.quantity}
                </span>
                <button
                  onClick={() => setQuantity(l.variantId, l.quantity + 1)}
                  className="p-2"
                >
                  <Plus className="size-3" />
                </button>
              </div>
              <div className="hidden items-center gap-6 md:flex">
                <p className="min-w-24 text-right text-base tabular-nums">
                  {formatPrice(l.unitPrice * l.quantity, locale)}
                </p>
                <button
                  onClick={() => remove(l.variantId)}
                  className="text-mist hover:text-ink"
                  aria-label={t("remove")}
                >
                  <X className="size-4" />
                </button>
              </div>
            </motion.li>
          ))}
        </ul>

        <aside className="md:col-span-4">
          <div className="sticky top-28 border border-line bg-bone p-8">
            <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
              {t("orderSummary" as "title")}
            </p>
            <dl className="mt-8 space-y-4 text-sm">
              <div className="flex items-center justify-between">
                <dt>{t("subtotal")}</dt>
                <dd className="tabular-nums">{formatPrice(total, locale)}</dd>
              </div>
              <div className="flex items-center justify-between text-mist">
                <dt>{t("shipping")}</dt>
                <dd>Ödeme adımında hesaplanır</dd>
              </div>
              <div className="border-t border-line pt-4" />
              <div className="flex items-center justify-between text-base">
                <dt className="uppercase tracking-[0.2em]">{t("total")}</dt>
                <dd className="tabular-nums">{formatPrice(total, locale)}</dd>
              </div>
            </dl>
            <Link
              href="/checkout"
              className="mt-10 flex w-full items-center justify-between bg-ink px-6 py-4 text-[11px] uppercase tracking-[0.3em] text-paper transition-opacity hover:opacity-90"
            >
              <span>{t("checkout")}</span>
              <span>→</span>
            </Link>
            <Link
              href="/shop"
              className="mt-4 block text-center text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
            >
              Alışverişe devam et
            </Link>
          </div>
        </aside>
      </div>
    </section>
  );
}
