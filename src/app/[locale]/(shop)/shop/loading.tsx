import { ProductGridSkeleton } from "@/components/shop/product-card-skeleton";

export default function ShopLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-20 pb-32 md:px-10 md:pt-28">
      <div className="mb-12 animate-pulse">
        <div className="h-2 w-24 bg-sand" />
        <div className="mt-6 h-12 w-2/3 bg-sand md:h-20 md:w-1/2" />
      </div>
      <ProductGridSkeleton count={12} />
    </div>
  );
}
