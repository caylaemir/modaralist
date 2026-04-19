import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";

export const metadata = { title: "Hakkımızda" };

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <article className="mx-auto max-w-[1200px] px-5 pt-24 pb-40 md:px-10 md:pt-40">
      <Reveal>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — hakkımızda
        </p>
      </Reveal>
      <SplitText
        text="Az ama öz. Sezon yerine bölüm."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3">
            <section className="space-y-6 text-base leading-relaxed text-mist">
              <p className="text-lg text-ink">
                Modaralist, Türkiye'de tasarlanıp üretilen, drop temelli bir
                moda evidir. Sezon mantığını bırakıp numaralı bölümlerle
                ilerliyoruz: Drop 01, Drop 02, Drop 03. Her bölüm sınırlı
                sayıda üretiliyor, tükendiğinde bir daha basılmıyor.
              </p>

              <p>
                Hikaye küçük bir atölyede başladı. Hızlı modanın yarattığı
                gürültüden uzaklaşmak, kıyafetle kurulan ilişkiyi yeniden
                düşünmek istedik. Bol koleksiyon, sonsuz indirim ve sürekli
                yenilenme döngüsü yerine; az sayıda, iyi düşünülmüş parçalar
                üretmeyi tercih ettik. Bir tişörtün kesiminden yıkama sonrası
                tuşesine kadar her aşamayı kendimiz denedik, sonra bıraktık.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">Felsefe</h2>
              <p>
                Moda, tüketim hızını hayat hızının önüne geçirdiğinde anlamını
                yitiriyor. Biz bunun tersini savunuyoruz: az parça, uzun
                kullanım, samimi bir tavır. Her drop bir önceki ile konuşsun,
                dolabında birikerek hikâye oluştursun istiyoruz.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">Üretim</h2>
              <p>
                Tüm ürünlerimiz İstanbul ve çevresindeki seçilmiş atölyelerde
                üretiliyor. Uzun soluklu ilişkiler kurduğumuz, işçilik
                koşullarını yerinde gördüğümüz, çalışanının emeğini adil
                karşılıkla buluşturan iş ortaklarıyla çalışıyoruz. Kullandığımız
                kumaşların büyük bölümü organik veya geri dönüştürülmüş
                sertifikalı malzemelerden oluşuyor.
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>Sınırlı sayıda üretim, stok yığını yok.</li>
                <li>İstanbul'da yerel atölyelerde dikim.</li>
                <li>Organik pamuk, geri dönüştürülmüş iplik önceliği.</li>
                <li>OEKO-TEX sertifikalı boyama süreçleri.</li>
                <li>Geri dönüştürülebilir, minimal ambalaj.</li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">Drop ne demek?</h2>
              <p>
                Drop, sezon yerine tanımladığımız numaralı bölüm. Her drop
                kendi başına bir bütün — tek bir konuyu, tek bir paletle
                anlatır. Piyasaya girdikten sonra stok bitene kadar yayında
                kalır, bir daha aynı şekilde basılmaz. Bu yüzden bir parçayı
                beğendiğinde beklememek gerekir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">Sözümüz</h2>
              <p>
                Modaralist, yavaş moda inancıyla kurulmuş bir markadır.
                Müşterisine satış hedefiyle değil, dolabına girdikten sonra
                yıllarca yanında kalacak bir parça bırakma hedefiyle yaklaşır.
                Sade, dayanıklı, iyi kesilmiş — bize göre moda bu kadar.
              </p>
            </section>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
