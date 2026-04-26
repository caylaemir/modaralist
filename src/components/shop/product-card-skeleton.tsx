/**
 * ProductCard ile ayni boyutlarda iskelet — loading.tsx'lerde grid icine konur.
 * Animasyon: pulse (Tailwind built-in).
 */
export function ProductCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="aspect-[3/4] w-full bg-sand" />
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="h-2 w-12 bg-sand" />
          <div className="mt-2 h-3 w-3/4 bg-sand" />
        </div>
        <div className="h-3 w-16 bg-sand" />
      </div>
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-16 md:grid-cols-4 md:gap-x-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
