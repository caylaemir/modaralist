import { setRequestLocale } from "next-intl/server";
import { Reveal } from "@/components/shop/reveal";
import { SplitText } from "@/components/shop/split-text";

export const metadata = { title: "KVKK Aydınlatma Metni" };

export default async function KvkkPage({
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
          — kvkk
        </p>
      </Reveal>
      <SplitText
        text="Kişisel verilerin gözetiminde."
        as="h1"
        className="display mt-6 max-w-5xl text-[12vw] leading-[0.95] md:text-[7vw]"
      />

      <Reveal delay={0.3}>
        <div className="mt-16 grid gap-16 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-3">
            <section className="space-y-6 text-base leading-relaxed text-mist">
              <p className="text-lg text-ink">
                İşbu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması
                Kanunu'nun (&quot;KVKK&quot;) 10. maddesi uyarınca, veri
                sorumlusu sıfatıyla Modaralist tarafından kişisel verilerinizin
                işlenmesine ilişkin olarak sizi bilgilendirmek amacıyla
                hazırlanmıştır.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                1. Veri sorumlusu
              </h2>
              <p>
                Kişisel verileriniz; Modaralist (&quot;Şirket&quot;) tarafından,
                veri sorumlusu sıfatıyla, aşağıda açıklanan kapsamda
                işlenebilecektir.
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Ünvan: Modaralist</li>
                <li>Adres: Karaköy, Beyoğlu / İstanbul, Türkiye</li>
                <li>E-posta: kvkk@modaralist.com</li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                2. İşlenen kişisel veriler
              </h2>
              <p>
                Sizden aldığımız hizmet ve işlem türüne göre aşağıdaki kişisel
                veriler işlenebilmektedir:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <span className="text-ink">Kimlik verileri:</span> ad, soyad,
                  T.C. kimlik numarası (fatura gerekliliğinde).
                </li>
                <li>
                  <span className="text-ink">İletişim verileri:</span> e-posta
                  adresi, telefon numarası, teslimat ve fatura adresi.
                </li>
                <li>
                  <span className="text-ink">Müşteri işlem verileri:</span>
                  {" "}sipariş detayı, ödeme bilgileri (kart bilgileri ödeme
                  sağlayıcısında saklanır), iade ve değişim kayıtları.
                </li>
                <li>
                  <span className="text-ink">Pazarlama verileri:</span> ilgi
                  alanları, bülten tercihleri, alışveriş geçmişi.
                </li>
                <li>
                  <span className="text-ink">Dijital iz verileri:</span> IP
                  adresi, tarayıcı bilgisi, çerez kayıtları, oturum verileri.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                3. İşleme amaçları
              </h2>
              <p>Kişisel verileriniz aşağıdaki amaçlar için işlenir:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Sipariş, teslimat ve satış süreçlerinin yürütülmesi.</li>
                <li>
                  Ödeme işlemlerinin gerçekleştirilmesi, fatura ve e-arşiv
                  düzenlenmesi.
                </li>
                <li>
                  Kargolama, iade ve değişim işlemlerinin yönetilmesi.
                </li>
                <li>
                  Müşteri talep, şikâyet ve destek süreçlerinin sağlanması.
                </li>
                <li>
                  Yasal yükümlülüklerin (vergi, tüketici hukuku, elektronik
                  ticaret mevzuatı) yerine getirilmesi.
                </li>
                <li>
                  Açık rızaya bağlı olarak pazarlama, kampanya duyurusu ve
                  ürün tavsiyesi iletişimlerinin yapılması.
                </li>
                <li>
                  Site güvenliğinin sağlanması, sahtecilik önleme ve analiz.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                4. Hukuki sebepler
              </h2>
              <p>
                Kişisel verileriniz, KVKK'nın 5. maddesinde belirtilen hukuki
                sebeplere dayalı olarak; sözleşmenin kurulması ve ifası, yasal
                yükümlülüğün yerine getirilmesi, veri sorumlusunun meşru menfaati
                ve açık rıza kapsamında işlenir.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                5. Aktarım
              </h2>
              <p>
                Kişisel verileriniz, işleme amaçlarıyla sınırlı olmak üzere
                aşağıdaki taraflara aktarılabilir:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Kargo ve lojistik şirketleri (teslimat amacıyla).
                </li>
                <li>
                  Ödeme hizmet sağlayıcıları (iyzico, banka POS ortakları).
                </li>
                <li>
                  E-arşiv/e-fatura entegratörleri ve muhasebe hizmeti
                  sağlayıcıları.
                </li>
                <li>
                  E-posta gönderim sağlayıcıları (Resend vb.) ve pazarlama
                  iletişim platformları.
                </li>
                <li>
                  Yetkili kamu kurum ve kuruluşları, yasal zorunluluk
                  halinde.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                6. Toplama yöntemi
              </h2>
              <p>
                Kişisel verileriniz; site üzerinden yapılan kayıt, sipariş ve
                iletişim formları, çağrı merkezi, e-posta yazışmaları, çerezler
                ve ilgili üçüncü taraf entegrasyonları aracılığıyla otomatik ya
                da kısmen otomatik yöntemlerle toplanır.
              </p>

              <h2 className="display mt-12 text-2xl text-ink">
                7. Veri sahibinin hakları
              </h2>
              <p>
                KVKK'nın 11. maddesi uyarınca, veri sahibi olarak aşağıdaki
                haklara sahipsiniz:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Kişisel verilerinizin işlenip işlenmediğini öğrenme.
                </li>
                <li>İşlenmişse buna ilişkin bilgi talep etme.</li>
                <li>
                  İşleme amacını ve amaca uygun kullanılıp kullanılmadığını
                  öğrenme.
                </li>
                <li>
                  Yurt içinde veya yurt dışında aktarıldığı üçüncü kişileri
                  bilme.
                </li>
                <li>
                  Eksik veya yanlış işlenmiş olması hâlinde düzeltilmesini
                  isteme.
                </li>
                <li>
                  KVKK'nın 7. maddesi kapsamında silinmesini veya yok
                  edilmesini isteme.
                </li>
                <li>
                  Düzeltme, silme ve yok etme işlemlerinin aktarıldığı üçüncü
                  kişilere bildirilmesini isteme.
                </li>
                <li>
                  Otomatik sistemler ile analiz edilmesi sonucu aleyhte bir
                  sonuca itiraz etme.
                </li>
                <li>
                  Kanuna aykırı işleme sebebiyle zarara uğraması hâlinde
                  zararın giderilmesini talep etme.
                </li>
              </ul>

              <h2 className="display mt-12 text-2xl text-ink">
                8. Başvuru yolu
              </h2>
              <p>
                Yukarıda belirtilen haklarınıza ilişkin taleplerinizi,
                kimliğinizi tevsik edici belgeler ve talebinizi içeren dilekçe
                ile{" "}
                <a
                  href="mailto:kvkk@modaralist.com"
                  className="text-ink underline-offset-4 hover:underline"
                >
                  kvkk@modaralist.com
                </a>{" "}
                adresine iletebilir ya da Veri Sorumlusuna Başvuru Usul ve
                Esasları Hakkında Tebliğ hükümlerine uygun yöntemlerle
                iletebilirsiniz. Talepleriniz en geç otuz (30) gün içinde
                ücretsiz olarak sonuçlandırılır; işlem ayrı bir maliyet
                gerektirdiği takdirde Kurul tarafından belirlenen tarifeye göre
                ücret talep edilebilir.
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
