import { notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { BlockForm, type BlockFormValues } from "../_components/block-form";

export const dynamic = "force-dynamic";

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const block = await db.homepageBlock
    .findUnique({ where: { id } })
    .catch(() => null);

  if (!block) notFound();

  const initial: BlockFormValues = {
    id: block.id,
    type: block.type,
    sortOrder: block.sortOrder,
    isActive: block.isActive,
    config:
      (block.config && typeof block.config === "object"
        ? (block.config as Record<string, unknown>)
        : {}) ?? {},
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
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.25em] text-mist">
          {block.type} · #{block.sortOrder}
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Blok Düzenle</h1>
      </header>
      <div className="mt-10">
        <BlockForm initial={initial} />
      </div>
    </div>
  );
}
