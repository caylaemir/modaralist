export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-6">
        <div className="size-2 animate-pulse rounded-full bg-ink" />
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          yükleniyor
        </p>
      </div>
    </div>
  );
}
