import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Reveal } from "@/components/shop/reveal";
import { AddressesClient } from "./addresses-client";

export const dynamic = "force-dynamic";

export default async function AddressesPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/tr/login?callbackUrl=/account/addresses");

  const addresses = await db.address.findMany({
    where: { userId: session.user.id },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: {
      id: true,
      title: true,
      fullName: true,
      phone: true,
      city: true,
      district: true,
      street: true,
      zip: true,
      isDefault: true,
    },
  });

  return (
    <>
      <Reveal>
        <h2 className="display text-4xl md:text-5xl">Adreslerim.</h2>
      </Reveal>
      <Reveal delay={0.15}>
        <div className="mt-12">
          <AddressesClient addresses={addresses} />
        </div>
      </Reveal>
    </>
  );
}
