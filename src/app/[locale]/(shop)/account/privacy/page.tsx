import { Reveal } from "@/components/shop/reveal";
import { PrivacyClient } from "./privacy-client";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/account/privacy");

  return (
    <div>
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — gizlilik / kvkk
        </p>
        <h2 className="display mt-4 text-3xl md:text-4xl">
          Verilerin senin.
        </h2>
        <p className="mt-4 max-w-2xl text-sm text-mist">
          KVKK madde 11 gereği hesabınla ilişkili tüm veriyi indirebilir veya
          silebilirsin. Sipariş + fatura kayıtları yasal saklama gereği 10 yıl
          sistemde kalır ama anonimleştirilir (isim/e-posta/telefon kalkar).
        </p>
      </Reveal>

      <Reveal delay={0.2}>
        <PrivacyClient userEmail={session.user.email ?? ""} />
      </Reveal>
    </div>
  );
}
