import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";

export const metadata = { title: "Mesafeli Satış Sözleşmesi" };

export default async function DistanceSalesPage({
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
          — mesafeli satış
        </p>
      </Reveal>
      <SplitText
        text="Sözleşmenin özeti."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3">
            <section className="space-y-6 text-base leading-relaxed text-mist">
              <p className="text-lg text-ink">
                Bu sözleşme, 6502 sayılı Tüketicinin Korunması Hakkında Kanun
                ve Mesafeli Sözleşmeler Yönetmeliği uyarınca, aşağıda kimliği
                belirtilen Satıcı ile Alıcı arasında, Alıcı'nın internet
                üzerinden satın aldığı ürün ve hizmetlere ilişkin hak ve
                yükümlülükleri düzenler.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 1 — Taraflar
              </h2>
              <p>
                <span className="text-ink">Satıcı:</span> Modaralist
                <br />
                Adres: Karaköy, Beyoğlu / İstanbul, Türkiye
                <br />
                E-posta: hello@modaralist.com
                <br />
                Telefon: +90 212 000 00 00
              </p>
              <p>
                <span className="text-ink">Alıcı:</span> Sipariş formunda
                belirtilen ad, soyad, adres ve iletişim bilgilerine sahip
                tüketici.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 2 — Sözleşmenin konusu
              </h2>
              <p>
                İşbu sözleşmenin konusu; Alıcı'nın, Satıcı'ya ait modaralist.com
                internet sitesinden elektronik ortamda siparişini verdiği,
                aşağıda nitelikleri ve satış fiyatı belirtilen ürünün satışı
                ve teslimi ile ilgili olarak tarafların hak ve yükümlülüklerinin
                saptanmasıdır.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 3 — Sözleşme konusu ürün
              </h2>
              <p>
                Ürünün cinsi, türü, miktarı, rengi, bedeni, marka/model, satış
                bedeli, ödeme şekli ve teslim bilgileri sipariş formunda,
                sipariş onay e-postasında ve faturada belirtildiği şekildedir.
                Belirtilen fiyatlar KDV dahildir. Kargo ücreti sipariş sırasında
                ayrıca gösterilir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 4 — Teslimat
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Ürün, sipariş onayının ardından en geç 30 (otuz) gün içinde
                  Alıcı'nın teslim adresine anlaşmalı kargo şirketi üzerinden
                  gönderilir.
                </li>
                <li>
                  Stokta bulunan ürünler için standart hazırlama süresi 1-3 iş
                  günüdür. Hazırlanan gönderilerin yurt içi teslimi ek 1-3 iş
                  günü sürer.
                </li>
                <li>
                  Teslimat sırasında ürünün hasarlı olduğu tespit edilirse
                  tutanak tutturulmalı ve ürün teslim alınmadan Satıcı
                  bilgilendirilmelidir.
                </li>
                <li>
                  Mücbir sebepler (doğal afet, grev, yangın, salgın, kargo
                  aksaklıkları vb.) nedeniyle teslim gerçekleşmezse Satıcı
                  durumu Alıcı'ya bildirir ve sipariş iptal edilerek ödeme iade
                  edilir.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 5 — Ödeme
              </h2>
              <p>
                Ödemeler; anlaşmalı ödeme kuruluşu iyzico altyapısı üzerinden,
                kredi kartı, banka kartı ve taksitli işlemlerle yapılabilir.
                Ödeme bilgileri Satıcı sunucularında saklanmaz.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 6 — Cayma hakkı
              </h2>
              <p>
                Alıcı; ürünün kendisine veya gösterdiği adresteki kişiye
                teslim tarihinden itibaren 14 (on dört) gün içinde hiçbir
                hukuki ve cezai sorumluluk üstlenmeksizin ve hiçbir gerekçe
                göstermeksizin sözleşmeden cayma hakkına sahiptir. Cayma hakkı
                süresi içinde:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Ürünün orijinal ambalajı, etiketleri ve tüm aksesuarlarıyla
                  birlikte, kullanılmamış ve yeniden satılabilir halde olması
                  şarttır.
                </li>
                <li>
                  Cayma bildirimi; e-posta ile veya iade formu üzerinden
                  Satıcı'ya iletilmelidir.
                </li>
                <li>
                  Cayma hakkının kullanılmasından itibaren 10 gün içinde ürün
                  Satıcı'ya iade edilmelidir.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 7 — Cayma hakkının istisnaları
              </h2>
              <p>
                Mesafeli Sözleşmeler Yönetmeliği'nin 15. maddesi uyarınca
                aşağıdaki ürünlerde cayma hakkı kullanılamaz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Kişiye özel üretilen veya sipariş üzerine hazırlanan
                  (monogram, kişiselleştirilmiş) ürünler.
                </li>
                <li>
                  Hijyen gerekçesiyle ambalajı açıldıktan sonra iade
                  edilemeyecek iç giyim ve benzeri ürünler.
                </li>
                <li>
                  Muhafazası şartları Satıcı'nın kontrolü dışındaki sebeplerle
                  bozulan ürünler.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 8 — İade süreci
              </h2>
              <p>
                Ürün iadesinin Satıcı'ya ulaşmasını takiben en geç 14 gün
                içinde, ürün bedeli ve varsa teslimat masrafları Alıcı'nın
                ödeme yaptığı yöntemle iade edilir. Kredi kartı iadelerinin
                banka tarafından kartınıza yansıtılması 3-14 iş gününü
                bulabilir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 9 — Fatura
              </h2>
              <p>
                Gönderi ile birlikte ya da elektronik ortamda e-arşiv/e-fatura
                olarak düzenlenerek Alıcı'ya iletilir. İade hâlinde ürünün
                faturasının da iade edilmesi (kurumsal siparişlerde) gerekir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 10 — Uyuşmazlık çözümü
              </h2>
              <p>
                İşbu sözleşmeden doğabilecek uyuşmazlıklarda, T.C. Gümrük ve
                Ticaret Bakanlığı'nca her yıl Aralık ayında ilan edilen
                parasal sınırlar dahilinde Alıcı'nın yerleşim yerindeki Tüketici
                Hakem Heyetleri ile Tüketici Mahkemeleri yetkilidir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                Madde 11 — Yürürlük
              </h2>
              <p>
                İşbu sözleşme, Alıcı tarafından elektronik ortamda onaylandığı
                anda yürürlüğe girer. Alıcı, siparişi onaylamadan önce
                sözleşmenin tüm maddelerini okuyup anladığını ve kabul ettiğini
                beyan eder.
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
