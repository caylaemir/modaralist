export function Marquee({
  items,
  className = "",
}: {
  items: string[];
  className?: string;
}) {
  const doubled = [...items, ...items];
  return (
    <div
      className={`relative flex overflow-hidden border-y border-line bg-paper py-8 ${className}`}
    >
      <div className="animate-marquee flex shrink-0 items-center whitespace-nowrap motion-reduce:!animate-none">
        {doubled.map((item, i) => (
          <span
            key={i}
            className="display mx-8 text-[5vw] leading-none text-ink md:text-[3.5vw]"
          >
            {item}
            <span className="mx-8 text-mist">✻</span>
          </span>
        ))}
      </div>
    </div>
  );
}
