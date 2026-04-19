import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";

export const metadata = { title: "Gizlilik Politikası" };

export default async function PrivacyPage({
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
          — gizlilik
        </p>
      </Reveal>
      <SplitText
        text="Bilgin bize emanet."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3">
            <section className="space-y-6 text-base leading-relaxed text-mist">
              <p className="text-lg text-ink">
                Modaralist olarak gizliliğini ciddiye alıyoruz. Bu politika;
                modaralist.com'u ziyaret ettiğinde veya alışveriş yaptığında
                hangi verileri topladığımızı, nasıl sakladığımızı ve neden
                kullandığımızı açıklar.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Toplanan bilgiler
              </h2>
              <p>
                Siteyi kullandığında tarayıcı türü, IP adresi, ziyaret edilen
                sayfalar ve etkileşim verileri otomatik olarak toplanır. Hesap
                oluşturduğunda veya sipariş verdiğinde ad, e-posta, telefon,
                teslimat adresi ve sipariş bilgilerini bizimle paylaşırsın.
                Ödeme kartı bilgileri sunucularımızda saklanmaz; doğrudan PCI
                DSS uyumlu ödeme sağlayıcımız tarafından işlenir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">Çerezler</h2>
              <p>
                Siteyi sorunsuz kullanmanı sağlamak, sepet gibi özellikleri
                çalıştırmak ve ziyaretçi davranışını anlayabilmek için çerez ve
                benzeri izleme teknolojileri kullanıyoruz. Üç ana çerez
                grubumuz var:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="text-ink">Zorunlu çerezler:</span> oturum,
                  sepet ve güvenlik için. Kapatılamaz.
                </li>
                <li>
                  <span className="text-ink">Analitik çerezler:</span> Google
                  Analytics 4 ile sayfa trafiğini ve kullanıcı akışını
                  ölçüyoruz.
                </li>
                <li>
                  <span className="text-ink">Pazarlama çerezleri:</span> Meta
                  Pixel ile kampanya performansını ve yeniden hedeflemeyi
                  yönetiyoruz.
                </li>
              </ul>
              <p>
                Tarayıcı ayarlarından çerezleri istediğin zaman
                reddedebilirsin; bu durumda sitenin bazı bölümleri beklenildiği
                gibi çalışmayabilir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Üçüncü taraf servisler
              </h2>
              <p>
                Servisleri daha iyi sunabilmek için aşağıdaki üçüncü taraf
                sağlayıcıları kullanıyoruz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>iyzico — ödeme altyapısı.</li>
                <li>Cloudinary — görsel depolama ve optimizasyon.</li>
                <li>Resend — işlemsel ve bülten e-postaları.</li>
                <li>Google Analytics 4 — site trafik analizi.</li>
                <li>Meta Pixel — reklam ve yeniden hedefleme.</li>
                <li>Kargo şirketleri — gönderim takibi.</li>
              </ul>
              <p>
                Bu sağlayıcılar verilerini yalnızca bizim adımıza, belirlenen
                amaçlarla işler; kendi pazarlama amaçları için kullanamaz.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Pazarlama iletişimi
              </h2>
              <p>
                Bülten aboneliği ve pazarlama e-postaları yalnızca açık rızan
                olduğunda gönderilir. Her e-postanın altında bulunan
                &quot;abonelikten çık&quot; bağlantısıyla veya{" "}
                <a
                  href="mailto:hello@modaralist.com"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  hello@modaralist.com
                </a>
                {" "}adresine yazarak dilediğin an çıkış yapabilirsin.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">Güvenlik</h2>
              <p>
                Tüm site trafiği SSL/TLS sertifikasıyla şifrelenir. Hassas
                veriler sektör standardı şifreleme algoritmalarıyla saklanır.
                Erişim yetkileri en az ayrıcalık ilkesiyle tanımlanmıştır.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Çocukların gizliliği
              </h2>
              <p>
                Modaralist, 13 yaş altındaki çocuklara yönelik bir platform
                değildir. Bu yaş grubundan bilerek kişisel veri toplamayız.
                Velisi/vasisi bizimle iletişime geçtiğinde ilgili veri derhal
                silinir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Veri saklama süresi
              </h2>
              <p>
                Kişisel verilerini, işleme amacının gerektirdiği süre ve yasal
                saklama yükümlülükleri boyunca saklarız. Sürenin bitiminde
                veriler silinir, yok edilir veya anonim hale getirilir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Politikanın güncellenmesi
              </h2>
              <p>
                Bu politika, mevzuat değişiklikleri ve hizmet güncellemelerine
                bağlı olarak zaman zaman yenilenebilir. Güncel sürüm her zaman
                bu sayfada yayınlanır.
              </p>

              <p className="text-sm text-mist">
                Son güncelleme: {new Date().toLocaleDateString("tr-TR")}
              </p>
            </section>
          </div>
        </div>
      </Reveal>
    </article>
  );
}
