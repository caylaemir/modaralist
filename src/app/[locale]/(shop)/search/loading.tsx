import { ProductGridSkeleton } from "@/components/shop/product-card-skeleton";

export default function SearchLoading() {
  return (
    <section className="mx-auto max-w-[1600px] px-5 pt-24 md:px-10 md:pt-40">
      <div className="animate-pulse">
        <div className="h-2 w-20 bg-sand" />
        <div className="mt-6 h-12 w-2/3 bg-sand md:h-20 md:w-1/2" />
        <div className="mt-12 h-10 w-full max-w-2xl bg-sand" />
      </div>
      <div className="mt-20">
        <ProductGridSkeleton count={8} />
      </div>
    </section>
  );
}
