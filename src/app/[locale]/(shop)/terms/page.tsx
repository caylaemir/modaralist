import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";

export const metadata = { title: "Kullanım Şartları" };

export default async function TermsPage({
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
          — kullanım şartları
        </p>
      </Reveal>
      <SplitText
        text="Birkaç net madde."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3">
            <section className="space-y-6 text-base leading-relaxed text-mist">
              <p className="text-lg text-ink">
                modaralist.com'u kullanarak aşağıdaki şartları kabul etmiş
                olursun. Şartları düzenli olarak gözden geçirmeni öneririz;
                güncel sürüm her zaman bu sayfada yayınlanır.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                1. Site kullanımı
              </h2>
              <p>
                Site, Türkiye Cumhuriyeti sınırları içinde yaşayan ve 18 yaşını
                doldurmuş kullanıcılara hizmet vermek üzere tasarlanmıştır.
                Siteyi yalnızca kişisel, ticari olmayan amaçlarla kullanabilir;
                yürürlükteki mevzuata aykırı, site güvenliğini tehdit eden ya
                da üçüncü kişilerin haklarını ihlal eden faaliyetlerde
                bulunamazsın.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                2. Hesap yükümlülükleri
              </h2>
              <p>
                Sipariş vermek veya üyelik oluşturmak istediğinde verdiğin
                bilgilerin doğruluğundan ve güncelliğinden sen sorumlusun. Şifre
                gizliliğini korumak, hesabınla yapılan işlemlerin güvenliğini
                sağlamak senin sorumluluğundur. Hesabının izinsiz kullanıldığına
                dair bir şüphen varsa derhal{" "}
                <a
                  href="mailto:hello@modaralist.com"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  hello@modaralist.com
                </a>
                {" "}adresine bildirmelisin.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                3. Ürünler ve fiyatlandırma
              </h2>
              <p>
                Sitede yayınlanan tüm ürün görselleri, açıklamaları ve
                fiyatları bilgilendirme amaçlıdır. Modaralist; ürünleri, stok
                durumunu ve fiyatları önceden bildirim yapmaksızın değiştirme
                hakkını saklı tutar. Teknik bir hata nedeniyle fiyat yanlış
                yansıdıysa siparişini iptal etme ve ödeme iadesini yapma hakkı
                saklıdır.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Tüm fiyatlara KDV dahildir.</li>
                <li>Kargo ücreti, sepet aşamasında açıkça belirtilir.</li>
                <li>
                  Sınırlı üretim gereği stok tükendiğinde ürün yeniden
                  listelenmeyebilir.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                4. Fikri mülkiyet
              </h2>
              <p>
                Sitedeki tüm metin, görsel, grafik, logo, fotoğraf, video, ürün
                tasarımı ve yazılım bileşenleri Modaralist'e veya ilgili hak
                sahiplerine aittir; 5846 sayılı Fikir ve Sanat Eserleri
                Kanunu ile 556 sayılı Markaların Korunması Hakkında KHK
                kapsamında korunmaktadır. Bu içerikler yazılı izin olmaksızın
                kopyalanamaz, çoğaltılamaz, dağıtılamaz veya ticari amaçla
                kullanılamaz.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                5. Sorumluluk sınırlaması
              </h2>
              <p>
                Modaralist, sitenin kesintisiz ya da hatasız çalışacağını
                taahhüt etmez. Site üzerinden sağlanan içeriklerin
                kullanımından doğabilecek doğrudan veya dolaylı zararlardan
                ötürü, yürürlükteki mevzuatın izin verdiği en geniş ölçüde
                sorumluluk kabul etmez.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                6. Değişiklik hakkı
              </h2>
              <p>
                Modaralist; işbu kullanım şartlarını, gizlilik politikasını,
                iade koşullarını ve diğer yasal metinleri gerektiğinde tek
                taraflı olarak değiştirme hakkını saklı tutar. Değişiklikler
                yayınlandığı tarih itibarıyla geçerli olur.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                7. Uygulanacak hukuk ve yetki
              </h2>
              <p>
                Bu şartların yorumu ve uygulanması Türkiye Cumhuriyeti
                hukukuna tâbidir. Doğabilecek uyuşmazlıklarda İstanbul (Çağlayan)
                Mahkemeleri ve İcra Daireleri yetkilidir. Tüketici sıfatı
                taşıyan kullanıcılar için 6502 sayılı Tüketicinin Korunması
                Hakkında Kanun'un ilgili hükümleri saklıdır.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                8. İletişim
              </h2>
              <p>
                Sorular, bildirimler ve hukuki yazışmalar için{" "}
                <a
                  href="mailto:hello@modaralist.com"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  hello@modaralist.com
                </a>
                {" "}adresini kullanabilirsin.
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
