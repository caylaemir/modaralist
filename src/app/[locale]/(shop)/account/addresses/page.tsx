import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Reveal } from "@/components/shop/reveal";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user) return null;

  let addresses: Awaited<ReturnType<typeof db.address.findMany>> = [];
  try {
    addresses = await db.address.findMany({
      where: { userId: session.user.id },
      orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    });
  } catch {}

  return (
    <>
      <Reveal>
        <div className="flex items-end justify-between">
          <h2 className="display text-4xl md:text-5xl">Adreslerim.</h2>
          <button className="text-[11px] uppercase tracking-[0.3em] underline underline-offset-4">
            + Yeni Adres
          </button>
        </div>
      </Reveal>

      {addresses.length === 0 ? (
        <Reveal delay={0.2}>
          <div className="mt-16 border border-line bg-bone p-12 text-center">
            <p className="display text-3xl">Henüz adres eklemedin.</p>
            <p className="mt-4 text-sm text-mist">
              İlk siparişte sana sorulacak, ya da buradan önceden girebilirsin.
            </p>
          </div>
        </Reveal>
      ) : (
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {addresses.map((a) => (
            <div
              key={a.id}
              className="relative border border-line bg-bone p-6"
            >
              {a.isDefault && (
                <span className="absolute right-4 top-4 text-[10px] uppercase tracking-[0.3em] text-mist">
                  Varsayılan
                </span>
              )}
              <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
                {a.title ?? a.type}
              </p>
              <p className="mt-3 text-base">{a.fullName}</p>
              <p className="mt-1 text-sm text-mist">{a.phone}</p>
              <p className="mt-4 text-sm leading-relaxed">
                {a.street}
                <br />
                {a.district}, {a.city} {a.zip ?? ""}
              </p>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
