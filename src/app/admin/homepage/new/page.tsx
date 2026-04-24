import Link from "next/link";
import { BlockForm, type BlockFormValues } from "../_components/block-form";

export const dynamic = "force-dynamic";

export default function NewBlockPage() {
  const initial: BlockFormValues = {
    type: "hero",
    sortOrder: 0,
    isActive: true,
    config: {},
  };

  return (
    <div>
      <header className="border-b border-line pb-8">
        <Link
          href="/admin/homepage"
          className="text-[10px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Ana sayfa
        </Link>
        <p className="mt-6 text-[10px] uppercase tracking-[0.4em] text-mist">
          — yeni blok
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Blok Oluştur</h1>
      </header>
      <div className="mt-10">
        <BlockForm initial={initial} />
      </div>
    </div>
  );
}
