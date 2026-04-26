"use client";

import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { useCart } from "@/stores/cart";
import { formatPrice } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import { Minus, Plus, X } from "lucide-react";
import { FreeShippingBar } from "./free-shipping-bar";
import { BundleDiscount } from "./bundle-discount";

export function CartDrawer({ locale }: { locale: "tr" | "en" }) {
  const t = useTranslations("Cart");
  const { lines, isOpen, close, setQuantity, remove, subtotal } = useCart();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-y-0 right-0 z-50 flex h-[100dvh] w-full max-w-md flex-col bg-paper"
          >
            <div className="flex items-center justify-between border-b border-line px-6 py-5">
              <h2 className="caps-wide text-sm">{t("title")}</h2>
              <button onClick={close} aria-label="Kapat">
                <X className="size-5" />
              </button>
            </div>

            {lines.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <p className="display text-3xl">{t("empty")}</p>
                <p className="text-sm text-mist">{t("emptyDescription")}</p>
                <Link
                  href="/shop"
                  onClick={close}
                  className="caps-wide mt-6 border border-ink px-6 py-3 text-xs hover:bg-ink hover:text-paper"
                >
                  {t("goToShop")}
                </Link>
              </div>
            ) : (
              <>
                <FreeShippingBar subtotal={subtotal()} locale={locale} />
                <BundleDiscount
                  lines={lines.map((l) => ({
                    variantId: l.variantId,
                    unitPrice: l.unitPrice,
                    quantity: l.quantity,
                  }))}
                  subtotal={subtotal()}
                  locale={locale}
                />
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  <ul className="space-y-6">
                    {lines.map((l) => (
                      <li key={l.variantId} className="flex gap-4">
                        <div className="relative size-24 shrink-0 overflow-hidden bg-sand">
                          {l.image && (
                            <Image
                              src={l.image}
                              alt={l.name}
                              fill
                              sizes="96px"
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <p className="text-sm">{l.name}</p>
                            <p className="eyebrow mt-1 text-mist">
                              {[l.size, l.color].filter(Boolean).join(" · ")}
                            </p>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 border border-line">
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(l.variantId, l.quantity - 1)
                                }
                                className="p-1.5"
                                aria-label="-"
                              >
                                <Minus className="size-3" />
                              </button>
                              <span className="min-w-6 text-center text-xs tabular-nums">
                                {l.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  setQuantity(l.variantId, l.quantity + 1)
                                }
                                className="p-1.5"
                                aria-label="+"
                              >
                                <Plus className="size-3" />
                              </button>
                            </div>
                            <p className="text-sm tabular-nums">
                              {formatPrice(l.unitPrice * l.quantity, locale)}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(l.variantId)}
                            className="eyebrow mt-1 self-start text-mist hover:text-ink"
                          >
                            {t("remove")}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="border-t border-line px-6 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
                  <div className="mb-4 flex items-center justify-between text-sm">
                    <span>{t("subtotal")}</span>
                    <span className="tabular-nums">
                      {formatPrice(subtotal(), locale)}
                    </span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={close}
                    className="caps-wide block w-full bg-ink py-4 text-center text-xs text-paper transition-opacity hover:opacity-90"
                  >
                    {t("checkout")}
                  </Link>
                </div>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
