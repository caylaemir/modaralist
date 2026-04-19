"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { toast } from "sonner";

export function Newsletter() {
  const t = useTranslations("Home");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      // TODO: /api/newsletter endpoint
      await new Promise((r) => setTimeout(r, 600));
      toast.success("Aboneliğin alındı.");
      setEmail("");
    } catch {
      toast.error("Bir şeyler ters gitti. Tekrar dener misin?");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="bg-ink text-paper">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-24 md:grid-cols-2 md:px-10 md:py-32">
        <div>
          <p className="eyebrow text-paper/60">{t("newsletterSubtitle")}</p>
          <h2 className="display mt-4 text-5xl md:text-7xl">
            {t("newsletterTitle")}
          </h2>
        </div>
        <form
          onSubmit={onSubmit}
          className="flex items-end gap-4 self-end border-b border-paper/40 pb-3"
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("newsletterEmail")}
            className="w-full bg-transparent text-lg outline-none placeholder:text-paper/40"
          />
          <button
            type="submit"
            disabled={loading}
            className="caps-wide shrink-0 text-xs tracking-widest transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            {loading ? "..." : t("newsletterSubmit")}
          </button>
        </form>
      </div>
    </section>
  );
}
