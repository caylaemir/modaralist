import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AtSign } from "lucide-react";

export function Footer() {
  const t = useTranslations("Footer");

  return (
    <footer className="mt-32 border-t border-line bg-bone">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 md:grid-cols-4 md:px-10">
        <div>
          <Link href="/" className="display text-3xl">
            modaralist
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">
            Modern siluetler, numaralı koleksiyonlar, sınırlı üretim. Sezonsuz bir moda hikayesi.
          </p>
        </div>

        <div>
          <p className="eyebrow mb-5 text-mist">{t("drops")}</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/drops" className="hover:opacity-60">
                Tüm Koleksiyonlar
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5 text-mist">{t("information")}</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/about" className="hover:opacity-60">
                {t("aboutUs")}
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:opacity-60">
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/returns" className="hover:opacity-60">
                {t("returns")}
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:opacity-60">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/kvkk" className="hover:opacity-60">
                {t("kvkk")}
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5 text-mist">{t("followUs")}</p>
          <a
            href="https://instagram.com/modaralist"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-sm hover:opacity-60"
          >
            <AtSign className="size-4" />
            @modaralist
          </a>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-mist md:flex-row md:items-center md:px-10">
          <p>© {new Date().getFullYear()} Modaralist. Tüm hakları saklıdır.</p>
          <p className="caps-wide">Handcrafted in Turkey</p>
        </div>
      </div>
    </footer>
  );
}
