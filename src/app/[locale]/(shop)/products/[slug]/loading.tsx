// PDP iskelet — sol image + sag info kolonu, gallery thumbnail'lari.
export default function ProductLoading() {
  return (
    <div className="mx-auto max-w-[1600px] px-5 pt-12 pb-32 md:px-10 md:pt-20">
      <div className="grid gap-10 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-7">
          <div className="aspect-[4/5] w-full animate-pulse bg-sand" />
          <div className="mt-3 grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square animate-pulse bg-sand"
              />
            ))}
          </div>
        </div>
        <div className="md:col-span-5">
          <div className="animate-pulse space-y-6">
            <div className="h-2 w-20 bg-sand" />
            <div className="h-10 w-3/4 bg-sand md:h-14" />
            <div className="h-6 w-32 bg-sand" />
            <div className="space-y-2 pt-6">
              <div className="h-3 w-full bg-sand" />
              <div className="h-3 w-5/6 bg-sand" />
              <div className="h-3 w-4/6 bg-sand" />
            </div>
            <div className="space-y-3 pt-6">
              <div className="h-2 w-16 bg-sand" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="size-10 bg-sand" />
                ))}
              </div>
            </div>
            <div className="h-12 w-full bg-sand" />
          </div>
        </div>
      </div>
    </div>
  );
}
