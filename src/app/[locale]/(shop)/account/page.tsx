import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";
import { db } from "@/lib/db";
import { getAllSettings } from "@/lib/settings";
import { parseLoyaltyConfig } from "@/lib/loyalty";

export const dynamic = "force-dynamic";

export default async function AccountHome() {
  const session = await auth();

  // Loyalty hesabi (eger sistem aktifse)
  const settings = await getAllSettings();
  const loyaltyCfg = parseLoyaltyConfig(settings);
  const user = session?.user?.id
    ? await db.user.findUnique({
        where: { id: session.user.id },
        select: { loyaltyPoints: true },
      })
    : null;
  const points = user?.loyaltyPoints ?? 0;
  const tlValue = Math.round(points * loyaltyCfg.redeemValue * 100) / 100;

  const cards = [
    {
      title: "Siparişlerim",
      desc: "Tüm siparişlerin, durumları ve kargo takip numaraları.",
      href: "/account/orders",
    },
    {
      title: "Adreslerim",
      desc: "Teslimat ve fatura adreslerini buradan yönet.",
      href: "/account/addresses",
    },
    {
      title: "Favorilerim",
      desc: "Beğendiğin ama henüz kararını vermediğin parçalar.",
      href: "/account/wishlist",
    },
    {
      title: "Profilim",
      desc: "E-posta, şifre, dil tercihin.",
      href: "/account/profile",
    },
  ];

  return (
    <>
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          {session?.user?.email}
        </p>
        <h2 className="display mt-4 text-4xl md:text-5xl">
          Her şey tek yerde.
        </h2>
      </Reveal>

      {loyaltyCfg.enabled ? (
        <Reveal delay={0.15}>
          <div className="mt-12 border border-line bg-ink px-8 py-6 text-paper">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.4em] text-paper/60">
                  — sadakat puanın
                </p>
                <p className="display mt-3 text-5xl tabular-nums">
                  {points.toLocaleString("tr-TR")}{" "}
                  <span className="text-2xl text-paper/60">puan</span>
                </p>
              </div>
              <p className="text-sm text-paper/70">
                ≈{" "}
                <span className="tabular-nums text-paper">
                  ₺{tlValue.toLocaleString("tr-TR")}
                </span>{" "}
                indirim olarak kullanabilirsin
              </p>
            </div>
            {points < loyaltyCfg.minRedeem ? (
              <p className="mt-4 text-[11px] text-paper/60">
                Min {loyaltyCfg.minRedeem} puan birikince checkout'ta
                kullanabilirsin.
              </p>
            ) : null}
          </div>
        </Reveal>
      ) : null}

      <div className="mt-16 grid gap-6 md:grid-cols-2">
        {cards.map((c, i) => (
          <Reveal key={c.href} delay={i * 0.08}>
            <Link
              href={c.href}
              className="group flex h-full flex-col justify-between border border-line bg-bone p-8 transition-colors hover:border-ink"
            >
              <div>
                <h3 className="display text-2xl md:text-3xl">{c.title}</h3>
                <p className="mt-4 text-sm text-mist">{c.desc}</p>
              </div>
              <span className="mt-10 text-[10px] uppercase tracking-[0.3em]">
                Aç →
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </>
  );
}
