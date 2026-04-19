import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { ContactForm } from "./contact-form";

export const metadata = { title: "İletişim" };

export default async function ContactPage({
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
          — iletişim
        </p>
      </Reveal>
      <SplitText
        text="Seni duymak istiyoruz."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-4 md:col-start-3">
            <section className="space-y-10 text-base leading-relaxed text-mist">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Yazışma
                </p>
                <a
                  href="mailto:hello@modaralist.com"
                  className="mt-2 block text-lg text-ink transition-opacity hover:opacity-60"
                >
                  hello@modaralist.com
                </a>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Telefon
                </p>
                <a
                  href="tel:+902120000000"
                  className="mt-2 block text-lg text-ink transition-opacity hover:opacity-60"
                >
                  +90 212 000 00 00
                </a>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Çalışma saatleri
                </p>
                <p className="mt-2 text-ink">Hafta içi 10:00 — 18:00</p>
                <p className="text-mist">Cumartesi 11:00 — 16:00</p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Stüdyo
                </p>
                <p className="mt-2 text-ink">
                  Karaköy, Beyoğlu
                  <br />
                  İstanbul, Türkiye
                </p>
              </div>

              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                  Sosyal
                </p>
                <p className="mt-2 space-x-4 text-ink">
                  <a
                    href="https://instagram.com/modaralist"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity hover:opacity-60"
                  >
                    Instagram
                  </a>
                  <a
                    href="https://tiktok.com/@modaralist"
                    target="_blank"
                    rel="noreferrer"
                    className="transition-opacity hover:opacity-60"
                  >
                    TikTok
                  </a>
                </p>
                <p className="mt-1 text-mist">@modaralist</p>
              </div>
            </section>
          </div>

          <div className="md:col-span-5">
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Form
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
