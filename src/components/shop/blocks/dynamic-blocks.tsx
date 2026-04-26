import { Link } from "@/i18n/navigation";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";
import { Marquee } from "@/components/shop/marquee";
import { ProductCard } from "@/components/shop/product-card";
import { CategoriesSection } from "@/components/shop/categories-section";
import { BestSellers } from "@/components/shop/best-sellers";
import {
  getProduct,
  getBestSellingProducts,
  getCategoriesWithCover,
} from "@/lib/shop";
import type { HomepageBlockData } from "@/lib/homepage";

type Props = {
  blocks: HomepageBlockData[];
  locale: "tr" | "en";
};

export async function DynamicBlocks({ blocks, locale }: Props) {
  return (
    <>
      {await Promise.all(
        blocks.map(async (b) => {
          switch (b.type) {
            case "hero":
              return <HeroBlock key={b.id} config={b.config} />;
            case "marquee":
              return <MarqueeBlock key={b.id} config={b.config} />;
            case "featured":
              return (
                <FeaturedBlock
                  key={b.id}
                  config={b.config}
                  locale={locale}
                />
              );
            case "collection-card":
              return <CollectionCardBlock key={b.id} config={b.config} />;
            case "categories-grid":
              return (
                <CategoriesGridBlock
                  key={b.id}
                  config={b.config}
                  locale={locale}
                />
              );
            case "best-sellers":
              return (
                <BestSellersBlock
                  key={b.id}
                  config={b.config}
                  locale={locale}
                />
              );
            case "text":
              return <TextBlock key={b.id} config={b.config} />;
            default:
              return null;
          }
        })
      )}
    </>
  );
}

function HeroBlock({ config }: { config: Record<string, unknown> }) {
  const eyebrow = (config.eyebrow as string) ?? "";
  const title = (config.title as string) ?? "";
  const subtitle = (config.subtitle as string) ?? "";
  const ctaLabel = (config.ctaLabel as string) ?? "";
  const ctaHref = (config.ctaHref as string) ?? "/shop";
  const imageUrl = (config.imageUrl as string) ?? "";

  return (
    <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink">
      {imageUrl ? (
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-20 md:px-10 md:pb-32">
        {eyebrow ? (
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-paper/70">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        {title ? (
          <SplitText
            text={title}
            as="h2"
            className="display mt-6 max-w-4xl text-[10vw] leading-[0.95] text-paper md:text-[6vw]"
          />
        ) : null}
        {subtitle ? (
          <Reveal delay={0.4}>
            <p className="mt-6 max-w-xl text-base text-paper/70 md:text-lg">
              {subtitle}
            </p>
          </Reveal>
        ) : null}
        {ctaLabel ? (
          <Reveal delay={0.5}>
            <Link
              href={ctaHref}
              className="mt-12 inline-flex items-center gap-3 border-b border-paper pb-2 text-[11px] uppercase tracking-[0.35em] text-paper"
            >
              {ctaLabel} <ArrowUpRight className="size-4" />
            </Link>
          </Reveal>
        ) : null}
      </div>
    </section>
  );
}

function MarqueeBlock({ config }: { config: Record<string, unknown> }) {
  const items =
    (config.items as string[] | undefined) ??
    (typeof config.text === "string"
      ? config.text.split(/\s*[·•|,]\s*/).filter(Boolean)
      : []);
  if (items.length === 0) return null;
  return <Marquee items={items} />;
}

async function FeaturedBlock({
  config,
  locale,
}: {
  config: Record<string, unknown>;
  locale: "tr" | "en";
}) {
  const eyebrow = (config.eyebrow as string) ?? "— seçim";
  const title = (config.title as string) ?? "";
  const subtitle = (config.subtitle as string) ?? "";
  const ctaLabel = (config.ctaLabel as string) ?? "";
  const ctaHref = (config.ctaHref as string) ?? "/shop";
  const slugs = (config.slugs as string[] | undefined) ?? [];

  if (slugs.length === 0) return null;

  const products = (
    await Promise.all(slugs.map((slug) => getProduct(slug, locale)))
  ).filter((p): p is NonNullable<typeof p> => p !== null);

  if (products.length === 0) return null;

  return (
    <section className="mx-auto max-w-[1600px] px-5 py-24 md:px-10 md:py-40">
      {(title || subtitle) && (
        <div className="mb-16 grid gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <Reveal>
              <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
                {eyebrow}
              </p>
            </Reveal>
            {title ? (
              <SplitText
                text={title}
                as="h2"
                className="display mt-6 text-[10vw] leading-[0.95] md:text-[6vw]"
              />
            ) : null}
          </div>
          {(subtitle || ctaLabel) && (
            <div className="md:col-span-4">
              <Reveal delay={0.3}>
                {subtitle ? (
                  <p className="max-w-sm text-sm leading-relaxed text-mist">
                    {subtitle}
                  </p>
                ) : null}
                {ctaLabel ? (
                  <Link
                    href={ctaHref}
                    className="mt-6 inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.35em]"
                  >
                    {ctaLabel} <ArrowUpRight className="size-4" />
                  </Link>
                ) : null}
              </Reveal>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
        {products.map((p, i) => (
          <ProductCard
            key={p.slug}
            product={{
              slug: p.slug,
              name: p.name,
              dropLabel: p.dropLabel ?? "",
              price: p.price,
              image: p.images[0] ?? "",
              hoverImage: p.hoverImage ?? undefined,
              soldOut: p.soldOut,
            }}
            locale={locale}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

function CollectionCardBlock({ config }: { config: Record<string, unknown> }) {
  const eyebrow = (config.eyebrow as string) ?? "";
  const title = (config.title as string) ?? "";
  const description = (config.description as string) ?? "";
  const imageUrl = (config.imageUrl as string) ?? "";
  const ctaLabel = (config.ctaLabel as string) ?? "Koleksiyonu gör";
  const ctaHref =
    (config.ctaHref as string) ??
    (config.collectionSlug
      ? `/drops/${config.collectionSlug as string}`
      : "/drops");

  return (
    <section className="relative h-[100svh] min-h-[620px] w-full overflow-hidden bg-ink">
      {imageUrl ? (
        <div
          className="absolute inset-0 scale-105 bg-cover bg-center"
          style={{ backgroundImage: `url('${imageUrl}')` }}
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-5 pb-20 md:px-10 md:pb-32">
        {eyebrow ? (
          <Reveal>
            <p className="text-[10px] uppercase tracking-[0.4em] text-paper/70">
              {eyebrow}
            </p>
          </Reveal>
        ) : null}
        {title ? (
          <SplitText
            text={title}
            as="h3"
            className="display mt-6 max-w-4xl text-[10vw] leading-[0.95] text-paper md:text-[6vw]"
          />
        ) : null}
        {description ? (
          <Reveal delay={0.4}>
            <p className="mt-6 max-w-xl text-base text-paper/70">{description}</p>
          </Reveal>
        ) : null}
        <Reveal delay={0.5}>
          <Link
            href={ctaHref}
            className="mt-12 inline-flex items-center gap-3 border-b border-paper pb-2 text-[11px] uppercase tracking-[0.35em] text-paper"
          >
            {ctaLabel} <ArrowUpRight className="size-4" />
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

async function CategoriesGridBlock({
  config,
  locale,
}: {
  config: Record<string, unknown>;
  locale: "tr" | "en";
}) {
  const limit = typeof config.limit === "number" ? config.limit : 7;
  const categories = await getCategoriesWithCover(locale, limit);
  if (categories.length === 0) return null;

  return (
    <CategoriesSection
      categories={categories}
      locale={locale}
      eyebrow={config.eyebrow as string | undefined}
      title={config.title as string | undefined}
      subtitle={config.subtitle as string | undefined}
      ctaLabel={config.ctaLabel as string | undefined}
      ctaHref={(config.ctaHref as string | undefined) ?? "/shop"}
    />
  );
}

async function BestSellersBlock({
  config,
  locale,
}: {
  config: Record<string, unknown>;
  locale: "tr" | "en";
}) {
  const limit = typeof config.limit === "number" ? config.limit : 8;
  const withinDays =
    typeof config.withinDays === "number" ? config.withinDays : 90;
  const products = await getBestSellingProducts(locale, limit, withinDays);
  if (products.length === 0) return null;

  return (
    <BestSellers
      locale={locale}
      eyebrow={config.eyebrow as string | undefined}
      title={config.title as string | undefined}
      subtitle={config.subtitle as string | undefined}
      ctaLabel={config.ctaLabel as string | undefined}
      ctaHref={(config.ctaHref as string | undefined) ?? "/shop"}
      badgeLabel={config.badgeLabel as string | undefined}
      products={products.map((p) => ({
        slug: p.slug,
        name: p.name,
        dropLabel: p.dropLabel ?? "",
        price: p.price,
        image: p.images[0] ?? "",
        hoverImage: p.hoverImage ?? undefined,
        soldOut: p.soldOut,
      }))}
    />
  );
}

function TextBlock({ config }: { config: Record<string, unknown> }) {
  const eyebrow = (config.eyebrow as string) ?? "";
  const title = (config.title as string) ?? "";
  const body = (config.body as string) ?? "";

  return (
    <section className="mx-auto max-w-3xl px-5 py-24 md:px-10 md:py-32">
      {eyebrow ? (
        <Reveal>
          <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
            {eyebrow}
          </p>
        </Reveal>
      ) : null}
      {title ? (
        <Reveal delay={0.15}>
          <h2 className="display mt-6 text-[8vw] leading-[1] md:text-[3.5vw]">
            {title}
          </h2>
        </Reveal>
      ) : null}
      {body ? (
        <Reveal delay={0.3}>
          <p className="mt-8 text-base leading-relaxed text-mist">{body}</p>
        </Reveal>
      ) : null}
    </section>
  );
}
