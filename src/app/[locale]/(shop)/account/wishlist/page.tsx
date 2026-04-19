import { Reveal } from "@/components/shop/reveal";

export default function WishlistPage() {
  return (
    <>
      <Reveal>
        <h2 className="display text-4xl md:text-5xl">Favorilerim.</h2>
      </Reveal>
      <Reveal delay={0.2}>
        <div className="mt-16 border border-line bg-bone p-12 text-center">
          <p className="display text-3xl">Listen sessiz.</p>
          <p className="mt-4 text-sm text-mist">
            Gözüne takılanları kalp ikonuyla buraya ekle.
          </p>
        </div>
      </Reveal>
    </>
  );
}
