import { auth } from "@/lib/auth";
import { Reveal } from "@/components/shop/reveal";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) return null;

  return (
    <>
      <Reveal>
        <h2 className="display text-4xl md:text-5xl">Profilim.</h2>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-16 grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
              Ad Soyad
            </p>
            <p className="mt-3 text-lg">{session.user.name ?? "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
              E-posta
            </p>
            <p className="mt-3 text-lg">{session.user.email}</p>
          </div>
        </div>

        <div className="mt-12 border-t border-line pt-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
            Şifre
          </p>
          <button className="mt-3 text-base underline underline-offset-4">
            Şifreyi Değiştir →
          </button>
        </div>

        <div className="mt-8 border-t border-line pt-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
            KVKK
          </p>
          <button className="mt-3 text-sm text-mist underline underline-offset-4">
            Verilerimi indir / hesabımı sil talebi
          </button>
        </div>
      </Reveal>
    </>
  );
}
