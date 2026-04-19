import { Link } from "@/i18n/navigation";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <p className="eyebrow text-mist">404</p>
      <h1 className="display mt-6 text-4xl md:text-6xl">
        Bu sayfa artık bir anı.
      </h1>
      <p className="mt-4 max-w-md text-mist">
        Aradığın şey ya taşındı ya da hiç var olmadı. Bir sonraki drop&apos;u kaçırmamak için ana sayfaya dön.
      </p>
      <Link
        href="/"
        className="mt-10 border border-ink px-8 py-3 text-sm uppercase tracking-widest transition-colors hover:bg-ink hover:text-paper"
      >
        Ana Sayfa
      </Link>
    </div>
  );
}
