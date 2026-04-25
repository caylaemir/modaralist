import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { Reveal } from "@/components/shop/reveal";
import { ProductCard } from "@/components/shop/product-card";
import { Link } from "@/i18n/navigation";
import { WishlistRemoveButton } from "./remove-button";

export const dynamic = "force-dynamic";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/tr/login?callbackUrl=/account/wishlist");

  const { locale } = await params;
  const lang = (locale === "en" ? "en" : "tr") as "tr" | "en";

  const items = await db.wishlistItem.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      product: {
        include: {
          translations: { where: { locale: lang } },
          images: { orderBy: { sortOrder: "asc" }, take: 2 },
          variants: { where: { isActive: true }, select: { stock: true } },
        },
      },
    },
  });

  return (
    <>
      <Reveal>
        <div className="flex items-end justify-between">
          <h2 className="display text-4xl md:text-5xl">Favorilerim.</h2>
          <p className="text-[11px] uppercase tracking-[0.3em] text-mist">
            {items.length} parça
          </p>
        </div>
      </Reveal>

      {items.length === 0 ? (
        <Reveal delay={0.2}>
          <div className="mt-16 border border-line bg-bone p-12 text-center">
            <p className="display text-3xl">Listen sessiz.</p>
            <p className="mt-4 text-sm text-mist">
              Gözüne takılanları kalp ikonuyla buraya ekle.
            </p>
            <Link
              href="/shop"
              className="mt-8 inline-block border-b border-ink pb-1 text-[11px] uppercase tracking-[0.3em]"
            >
              Mağazaya git →
            </Link>
          </div>
        </Reveal>
      ) : (
        <div className="mt-16 grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-3 md:gap-x-6">
          {items.map((it) => {
            const tr = it.product.translations[0];
            const img = it.product.images[0];
            const hover = it.product.images[1];
            const totalStock = it.product.variants.reduce(
              (s, v) => s + v.stock,
              0
            );
            const price = it.product.discountPrice
              ? Number(it.product.discountPrice)
              : Number(it.product.basePrice);
            return (
              <div key={it.id} className="relative">
                <ProductCard
                  product={{
                    slug: it.product.slug,
                    name: tr?.name ?? it.product.slug,
                    dropLabel: "",
                    price,
                    image: img?.url ?? "",
                    hoverImage: hover?.url,
                    soldOut: totalStock === 0,
                  }}
                  locale={lang}
                  index={0}
                />
                <div className="mt-3">
                  <WishlistRemoveButton slug={it.product.slug} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
