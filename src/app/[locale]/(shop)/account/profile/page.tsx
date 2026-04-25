import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Reveal } from "@/components/shop/reveal";
import {
  ProfileForm,
  PasswordForm,
  DeleteAccountButton,
} from "./profile-form";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/tr/login?callbackUrl=/account/profile");

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, email: true, phone: true },
  });

  return (
    <>
      <Reveal>
        <h2 className="display text-4xl md:text-5xl">Profilim.</h2>
      </Reveal>

      <Reveal delay={0.15}>
        <section className="mt-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — bilgiler
          </p>
          <h3 className="display mt-3 text-2xl">Kişisel</h3>
          <div className="mt-8">
            <ProfileForm
              initialName={user?.name ?? ""}
              initialEmail={user?.email ?? session.user.email ?? ""}
              initialPhone={user?.phone ?? ""}
            />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.25}>
        <section className="mt-20 border-t border-line pt-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — güvenlik
          </p>
          <h3 className="display mt-3 text-2xl">Şifre</h3>
          <div className="mt-8">
            <PasswordForm />
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.35}>
        <section className="mt-20 border-t border-line pt-10">
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            — tehlikeli alan
          </p>
          <h3 className="display mt-3 text-2xl">Hesap silme</h3>
          <p className="mt-4 max-w-xl text-sm text-mist">
            Hesabını silmek tüm sipariş geçmişini, kayıtlı adreslerini ve
            favorilerini geri alınamaz şekilde silecek. KVKK kapsamında bu hakkı
            istediğin zaman kullanabilirsin.
          </p>
          <div className="mt-6">
            <DeleteAccountButton />
          </div>
        </section>
      </Reveal>
    </>
  );
}
