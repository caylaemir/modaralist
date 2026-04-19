import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";

export const metadata = { title: "İade ve Değişim" };

export default async function ReturnsPage({
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
          — iade ve değişim
        </p>
      </Reveal>
      <SplitText
        text="Fikrini değiştirmeye hakkın var."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3">
            <section className="space-y-6 text-base leading-relaxed text-mist">
              <p className="text-lg text-ink">
                Aldığın parçayı elinde denemen, dolabınla konuşturmanı istiyoruz.
                Beğenmediğinde ya da bedeni tutmadığında iade ve değişim süreci
                olabildiğince basit olacak şekilde tasarlandı.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                14 günlük cayma hakkı
              </h2>
              <p>
                Siparişin sana ulaştığı tarihten itibaren 14 gün içinde hiçbir
                gerekçe göstermeksizin iade hakkına sahipsin. Bu süre 6502 sayılı
                Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler
                Yönetmeliği kapsamında garanti altındadır.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                İade koşulları
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ürün kullanılmamış olmalı.</li>
                <li>
                  Etiketleri kesilmemiş, orijinal ambalajı bozulmamış olmalı.
                </li>
                <li>
                  Yıkanmamış, ütülenmemiş, parfüm veya koku almamış olmalı.
                </li>
                <li>
                  Fatura ve iade formu gönderiye eklenmiş olmalı (e-arşivde
                  kayıt yeterlidir).
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                Kargo ücretsiz
              </h2>
              <p>
                İlk 14 gün içindeki iade gönderileri anlaşmalı kargomuz
                üzerinden ücretsizdir. İade kodu ile en yakın şubeye bırakman
                yeterli. Anlaşmalı olmayan bir kargo firması tercih edersen
                gönderim ücreti tarafına aittir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                İade nasıl başlatılır?
              </h2>
              <ol className="list-decimal pl-6 space-y-2">
                <li>
                  <a
                    href="mailto:hello@modaralist.com"
                    className="text-ink underline-offset-4 hover:underline"
                  >
                    hello@modaralist.com
                  </a>{" "}
                  adresine sipariş numaran ile birlikte iade talebini yaz.
                </li>
                <li>
                  Sana iade kodunu ve anlaşmalı kargo bilgilerini e-posta ile
                  gönderelim.
                </li>
                <li>
                  Ürünü orijinal paketi, etiketleri ve faturası ile birlikte
                  hazırla.
                </li>
                <li>
                  En yakın kargo şubesine iade kodunu söyleyerek teslim et.
                </li>
                <li>
                  Paket stüdyomuza ulaşıp kontrol edildikten sonra iade
                  süreci başlar.
                </li>
              </ol>

              <h2 className="display mt-12 text-2xl text-ink">
                Değişim süreci
              </h2>
              <p>
                Beden veya renk değişimi yapmak istiyorsan; iade süreciyle aynı
                biçimde ürünü bize gönderir, ardından istediğin varyantı yeni
                bir sipariş gibi iletiriz. Stokta ise aynı gün kargolarız.
                Değişim gönderimi ücretsizdir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                İade tutarı
              </h2>
              <p>
                Ürün stüdyomuza ulaştıktan sonra koşulların uygunluğu kontrol
                edilir ve en geç 14 gün içinde ödemenin yapıldığı karta iade
                başlatılır. Bankaların yansıtma süresi 3 ile 14 iş günü
                arasında değişir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                İstisnalar
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>Hijyen kategorisindeki ürünler (iç giyim vb.).</li>
                <li>
                  Kişiye özel hazırlanmış veya üstüne isim/monogram işlenmiş
                  parçalar.
                </li>
                <li>
                  Kullanılmış, yıkanmış ya da etiketi kesilmiş ürünler.
                </li>
                <li>
                  Hediye kart ve aksesuar kategorisindeki bazı ürünler (ürün
                  sayfasında belirtilir).
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                İade adresi
              </h2>
              <p>
                Modaralist Stüdyo
                <br />
                Karaköy, Beyoğlu
                <br />
                İstanbul, Türkiye
                <br />
                Not: Kargo şubesine bırakmadan önce mutlaka iade kodunu al,
                aksi halde iade işlemi başlatılamayabilir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Hasarlı ya da yanlış ürün
              </h2>
              <p>
                Gönderinde bir sorun varsa 48 saat içinde fotoğraflı olarak{" "}
                <a
                  href="mailto:hello@modaralist.com"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  hello@modaralist.com
                </a>
                {" "}adresine ilet. Hatalı ürün, eksik veya hasarlı gönderi
                durumunda iade ve değişim tüm masrafları bize ait olmak üzere
                öncelikli olarak yürütülür.
              </p>
            </section>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
