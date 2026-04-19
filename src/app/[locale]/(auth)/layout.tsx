import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <header className="flex items-center justify-between border-b border-line px-6 py-5">
        <Link href="/" className="display text-2xl">
          modaralist
        </Link>
        <Link
          href="/"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Ana Sayfa
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-6 py-16">
        {children}
      </main>
    </div>
  );
}
