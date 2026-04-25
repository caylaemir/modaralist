import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Phone, MapPin, Mail } from "lucide-react";
import { getAllSettings } from "@/lib/settings";
import { CATEGORY_SEO_TR } from "@/lib/category-seo";

export async function Footer() {
  const [t, settings] = await Promise.all([
    getTranslations("Footer"),
    getAllSettings(),
  ]);

  const socials = [
    { url: settings["social.instagram"], label: "Instagram" },
    { url: settings["social.tiktok"], label: "TikTok" },
    { url: settings["social.x"], label: "X" },
    { url: settings["social.facebook"], label: "Facebook" },
    { url: settings["social.youtube"], label: "YouTube" },
    { url: settings["social.pinterest"], label: "Pinterest" },
  ].filter((s) => s.url && s.url.trim().length > 0);

  return (
    <footer className="mt-32 border-t border-line bg-bone">
      <div className="mx-auto grid max-w-[1600px] gap-12 px-5 py-20 md:grid-cols-4 md:px-10">
        <div>
          <Link href="/" className="display text-3xl">
            {settings["site.title"] || "modaralist"}
          </Link>
          <p className="mt-6 max-w-xs text-sm leading-relaxed text-mist">
            {settings["site.description"] ||
              "Modern siluetler, numaralı koleksiyonlar, sınırlı üretim."}
          </p>
        </div>

        <div>
          <p className="eyebrow mb-5 text-mist">Kategoriler</p>
          <ul className="space-y-3 text-sm">
            {Object.values(CATEGORY_SEO_TR).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/shop/${c.slug}`}
                  className="hover:opacity-60"
                  title={`${c.name} modelleri — Marmara'ya hızlı kargo`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/shop"
                className="text-mist underline-offset-4 hover:text-ink hover:underline"
              >
                Tüm Mağaza
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5 text-mist">{t("drops")}</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/drops" className="hover:opacity-60">
                Tüm Koleksiyonlar
              </Link>
            </li>
            <li>
              <Link href="/track" className="hover:opacity-60">
                Sipariş Takibi
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:opacity-60">
                Ara
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-5 text-mist">{t("information")}</p>
          <ul className="space-y-3 text-sm">
            <li>
              <Link href="/pages/about" className="hover:opacity-60">
                {t("aboutUs")}
              </Link>
            </li>
            <li>
              <Link href="/pages/contact" className="hover:opacity-60">
                {t("contact")}
              </Link>
            </li>
            <li>
              <Link href="/pages/returns" className="hover:opacity-60">
                {t("returns")}
              </Link>
            </li>
            <li>
              <Link href="/pages/privacy" className="hover:opacity-60">
                {t("privacy")}
              </Link>
            </li>
            <li>
              <Link href="/pages/kvkk" className="hover:opacity-60">
                {t("kvkk")}
              </Link>
            </li>
            <li>
              <Link href="/pages/terms" className="hover:opacity-60">
                Kullanım Koşulları
              </Link>
            </li>
            <li>
              <Link href="/pages/distance-sales" className="hover:opacity-60">
                Mesafeli Satış
              </Link>
            </li>
            <li>
              <Link href="/pages/faq" className="hover:opacity-60">
                SSS
              </Link>
            </li>
          </ul>
        </div>

        <div>
          {(settings["contact.email"] ||
            settings["contact.phone"] ||
            settings["contact.address"]) && (
            <>
              <p className="eyebrow mb-5 text-mist">İletişim</p>
              <ul className="space-y-3 text-sm">
                {settings["contact.email"] ? (
                  <li>
                    <a
                      href={`mailto:${settings["contact.email"]}`}
                      className="inline-flex items-center gap-2 hover:opacity-60"
                    >
                      <Mail className="size-3.5" />
                      {settings["contact.email"]}
                    </a>
                  </li>
                ) : null}
                {settings["contact.phone"] ? (
                  <li>
                    <a
                      href={`tel:${settings["contact.phone"].replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-2 hover:opacity-60"
                    >
                      <Phone className="size-3.5" />
                      {settings["contact.phone"]}
                    </a>
                  </li>
                ) : null}
                {settings["contact.address"] ? (
                  <li className="inline-flex items-start gap-2 text-mist">
                    <MapPin className="mt-0.5 size-3.5 shrink-0" />
                    <span>{settings["contact.address"]}</span>
                  </li>
                ) : null}
              </ul>
            </>
          )}
          {socials.length > 0 ? (
            <div className={settings["contact.email"] ? "mt-8" : ""}>
              <p className="eyebrow mb-4 text-mist">{t("followUs")}</p>
              <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {socials.map(({ url, label }) => (
                  <li key={label}>
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:opacity-60"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-[1600px] flex-col items-start justify-between gap-3 px-5 py-6 text-xs text-mist md:flex-row md:items-center md:px-10">
          <p>
            © {new Date().getFullYear()} {settings["site.title"] || "Modaralist"}.{" "}
            Tüm hakları saklıdır.
            {settings["legal.companyName"] ? (
              <span className="ml-3">{settings["legal.companyName"]}</span>
            ) : null}
          </p>
          <p className="caps-wide">Handcrafted in Turkey</p>
        </div>
      </div>
    </footer>
  );
}
