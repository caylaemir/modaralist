import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import { Reveal } from "@/components/shop/reveal";

export default async function AccountHome() {
  const session = await auth();

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
