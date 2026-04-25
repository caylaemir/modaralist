import { auth } from "@/lib/auth";
import { getAllSettings } from "@/lib/settings";

export async function MaintenanceGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getAllSettings();
  const isMaintenance = settings["shop.maintenanceMode"] === "true";

  if (!isMaintenance) return <>{children}</>;

  // Admin/STAFF bakim modu da olsa siteye girebilir
  const session = await auth();
  if (session?.user?.role === "ADMIN" || session?.user?.role === "STAFF") {
    return (
      <>
        <div className="bg-amber-50 text-amber-900">
          <div className="mx-auto max-w-[1600px] px-5 py-2.5 text-center text-[11px] uppercase tracking-[0.3em] md:px-10">
            ⚠ bakım modu aktif — sadece admin görüyor
          </div>
        </div>
        {children}
      </>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-5 text-center md:px-10">
      <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
        — bakım
      </p>
      <h1 className="display mt-6 text-[10vw] leading-[0.95] md:text-[6vw]">
        Yakında döneceğiz.
      </h1>
      <p className="mt-8 max-w-md text-sm text-mist">
        Modaralist şu an bakımda. Birazdan tekrar açık olacağız. Sabrın için
        teşekkürler.
      </p>
    </main>
  );
}
