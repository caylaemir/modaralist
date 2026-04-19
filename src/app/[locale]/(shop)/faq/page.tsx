import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { FaqAccordion } from "./faq-accordion";

export const metadata = { title: "Sık Sorulan Sorular" };

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-[1200px] px-5 pt-24 pb-40 md:px-10 md:pt-40">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — sık sorulanlar
        </p>
      </Reveal>
      <SplitText
        text="Yanıtlar."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3">
            <p className="text-lg leading-relaxed text-ink">
              Gönderi, iade, beden ve drop'larla ilgili en çok aldığımız
              sorular. Aradığını bulamazsan{" "}
              <a
                href="mailto:hello@modaralist.com"
                className="underline underline-offset-4 hover:no-underline"
              >
                hello@modaralist.com
              </a>
              {" "}üzerinden bize yaz.
            </p>
            <FaqAccordion />
          </div>
        </div>
      </Reveal>
    </article>
  );
}
