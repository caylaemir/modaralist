// Modaralist hukuki metinler - admin paneli icin DB upsert kaynagi.
// Kaynak: /Politikalar/*.pdf (yasal danismanin teslim ettigi metinler).
// Sirket: Trend Is Guvenligi Malzemeleri Tekstil San.Tic.Ltd.Sti.

export type LegalPage = {
  slug: string;
  tr: { title: string; body: string; seoTitle?: string; seoDesc?: string };
  en: { title: string; body: string; seoTitle?: string; seoDesc?: string };
};

const PRIVACY_TR_BODY = `
<p>İşbu Gizlilik Politikası'nın amacı, <strong>Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</strong>'ne ("Şirket") ait <a href="https://modaralist.com">www.modaralist.com</a> alan adlı internet sitesi ("İnternet Sitesi") üzerinden Şirket ürünlerini satın alan müşterilerimizin ("Kullanıcılar"), elektronik ticaret işlemleri nedeniyle elde edilen kişisel verilerine ilişkin gizlilik kurallarını tespit etmektir.</p>

<ol>
<li>Şirket, Kullanıcılar tarafından üyelik formları ile veya sair surette kendisine iletilen kişisel verileri; Gizlilik Politikası, kişisel veri elde edilmesi esnasında Kullanıcı'ya sunulan Kişisel Verilere İlişkin Aydınlatma Metni ve Kullanıcı'nın açık rızasında belirtilen haller haricinde üçüncü şahıslarla paylaşmamakta, belirtilen amaçlar dışında hiçbir ticari amaçla kullanmamakta ve üçüncü kişilere aktarmamaktadır.</li>

<li>Kullanıcı'ya ait kişisel veriler ancak resmi makamlarca talep edilmesi halinde ve yürürlükteki emredici mevzuat hükümleri gereğince açıklama yapılmak zorunda olunduğu durumlarda resmi makamlara açıklanacaktır.</li>

<li>İnternet Sitesi'ne üyelik, ürün satın alma ve bilgi güncelleme amaçlı girilen kredi kartı ve banka kartlarına ilişkin kişisel veriler, Kullanıcı ile ilgili banka veya kart kuruluşları arasında, Şirket'ten bağımsız olarak gerçekleştirilmekte olup kredi kartı şifresi gibi bilgiler Şirket veya diğer İnternet Sitesi kullanıcıları tarafından görüntülenememektedir.</li>

<li>Ödeme sayfasında talep edilen Kullanıcı kredi kartı bilgileri, Kullanıcılar'ın güvenliğini en üst seviyede tutmak amacıyla hiçbir şekilde İnternet Sitesi'nde veya hizmet veren üçüncü şirketlerin sunucularında tutulmamaktadır. Bu şekilde ödemeye yönelik tüm işlemlerin, İnternet Sitesi üzerinden ilgili banka ve Kullanıcı'nın kullanmakta olduğu cihaz arasında gerçekleşmesi sağlanmaktadır.</li>

<li>Şirket, Kullanıcı'nın İnternet Sitesi üzerinde gerçekleştirdiği kullanım ve işlem bilgilerini anonim hale getirerek; istatistiki değerlendirmelerde, performans değerlendirmelerinde, Şirket ve iş ortaklarının pazarlama kampanyalarında ve bağış kampanyalarında, yıllık rapor ve benzeri raporlarda kullanmak üzere bu amaçların gerçekleştirilmesi için gereken sürede saklayabilir, işleyebilir ve iş ortaklarına iletebilir.</li>

<li>Kullanıcılar tarafından Şirket'e sağlanan veya Şirket tarafından edinilen kişisel verilerin ve İnternet Sitesi üzerinden gerçekleşen tüm işlemlerin güvenliği için bilgi ve işlemin mahiyetine göre Şirket veya ilgili kuruluşça sistemlerde ve internet altyapısında, teknolojik imkânlar ve maliyet unsurları dâhilinde, uygun teknik ve idari tedbirler alınmıştır.</li>

<li>Kullanıcı'nın, Şirket ile paylaşmış olduğu kişisel verilerinin Kullanıcı'ya ait olduğu kabul edilmektedir.</li>

<li>Şirket, Gizlilik Politikası'nda ve Kullanıcı'ya sunacağı ürün, hizmet, fırsat ve kampanyalarda gerekli görebileceği her türlü değişikliği yapma hakkını saklı tutar; bu değişiklikler Şirket tarafından İnternet Sitesi'nde veya diğer uygun yöntemler ile duyurulduğu andan itibaren geçerli olur.</li>
</ol>

<p>Şirket tarafından işlenen kişisel verilerinize ilişkin detaylı bilgiye <a href="/pages/kvkk">Kişisel Verilere İlişkin Aydınlatma Metni</a>'nden ulaşabilirsiniz.</p>

<p>Bilginize sunarız.<br/><strong>Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</strong></p>
`;

const KVKK_TR_BODY = `
<p><strong>TREND İŞ GÜVENLİĞİ MALZEMELERİ TEKSTİL SAN.TİC.LTD.ŞTİ.</strong> ("Şirket") olarak, işbu Aydınlatma Metni ile, Kişisel Verilerin Korunması Kanunu ("Kanun") kapsamında aydınlatma yükümlüğümüzün yerine getirilmesi amaçlanmaktadır. Bu kapsamda sizlere bilgi vermekle yükümlü olduğumuz konular aşağıdaki şekildedir:</p>

<h2>Veri sorumlusunun ve varsa temsilcisinin kimliği</h2>
<p>Veri sorumlusu; <strong>Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA</strong> adresinde mukim, Bursa Ticaret Sicili Müdürlüğü'ne <strong>112351</strong> sicil numarası ile kayıtlı <strong>0859-1228-3400-0001</strong> Mersis numaralı <strong>TREND İŞ GÜVENLİĞİ MALZEMELERİ TEKSTİL SAN.TİC.LTD.ŞTİ.</strong>'dir.</p>
<ul>
<li><strong>KEP adresi:</strong> ozkan.galak@hs01.kep.tr</li>
<li><strong>E-posta:</strong> admin@modaralist.com</li>
<li><strong>Telefon:</strong> +90 501 700 88 16</li>
</ul>

<h2>Kişisel verilerin hangi amaçla işleneceği</h2>
<p>Şirket'imize sağladığınız <em>ad-soyadı, telefon numarası ve e-posta adresi, doğum tarihi, cinsiyet, medeni durumu, yaşadığı il</em> kategorilerindeki kişisel verileriniz; reklam/kampanya/promosyon süreçlerinin yürütülmesi, ürün ve hizmetlerin pazarlama süreçlerinin yürütülmesi, müşteri memnuniyetine yönelik aktivitelerin yürütülmesi, açık rızanızın bulunması halinde tarafınıza tanıtım, reklam, kampanya vb. içerikli elektronik ileti gönderilmesi (arama, SMS, E-posta) ve mevzuattan kaynaklanan zamanaşımı süresi doğrultusunda saklanması amacı ile işlenmektedir.</p>

<h2>Şirket tarafından işlenen kişisel verilerin kimlere ve hangi amaçla aktarılabileceği</h2>
<p>Kişisel verileriniz yukarıdaki amaçlar doğrultusunda hizmet sağlayıcılarımız ile paylaşılabilecektir. Kişisel verileriniz pazarlama, reklam ve tanıtım faaliyetlerinin yürütülmesi amacıyla hizmet aldığımız yurt dışında mukim firmalara <em>Kişisel Verilerin Yurt Dışına Aktarılmasına İlişkin Usul ve Esaslar Hakkında Yönetmelik</em>'e uygun şekilde aktarılabilmektedir.</p>

<h2>Kişisel veri toplamanın yöntemi ve hukuki sebebi</h2>
<p>Kişisel verileriniz, İnternet Sitesi'nde yer alan form aracılığıyla veya mağazalarımızda işlem esnasında beyanlarınız ile otomatik veya otomatik olmayan yollarla; "bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olması kaydıyla, sözleşmenin taraflarına ait kişisel verilerin işlenmesinin gerekli olması", "ilgili kişinin temel hak ve özgürlüklerine zarar vermemek kaydıyla, veri sorumlusunun meşru menfaatleri için veri işlenmesinin zorunlu olması" ve "açık rızanız" hukuki sebebi ile toplanmaktadır.</p>

<h2>Kişisel verileriniz ile ilgili Kanun kapsamındaki haklarınız</h2>
<ol type="a">
<li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
<li>Kişisel verileriniz işlenmişse buna ilişkin bilgi talep etme,</li>
<li>Kişisel verilerinizin işlenme amacını ve bunların amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
<li>Yurt içinde veya yurt dışında kişisel verilerin aktarıldığı üçüncü kişileri bilme,</li>
<li>Kişisel verilerinizin eksik veya yanlış işlenmiş olması hâlinde bunların düzeltilmesini isteme,</li>
<li>Kişisel verilerinizin işlenmesini gerektiren sebeplerin ortadan kalkması halinde kişisel verilerinizin silinmesini veya yok edilmesini isteme,</li>
<li>(d) ve (e) bentleri uyarınca yapılan işlemlerin, kişisel verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
<li>İşlenen verilerin münhasıran otomatik sistemler vasıtasıyla analiz edilmesi suretiyle kişinin kendisi aleyhine bir sonucun ortaya çıkmasına itiraz etme,</li>
<li>Kişisel verilerin kanuna aykırı olarak işlenmesi sebebiyle zarara uğraması hâlinde zararın giderilmesini talep etme.</li>
</ol>

<p>Bu haklarınızı yazılı olarak veya kayıtlı elektronik posta adresi (KEP adresi: <strong>ozkan.galak@hs01.kep.tr</strong>'dir), güvenli elektronik imza, mobil imza ya da Şirket'e daha önce bildirilen ve Şirket'in sisteminde kayıtlı bulunan elektronik posta adresinizi kullanmak suretiyle (<strong>admin@modaralist.com</strong> e-posta adresi üzerinden Şirket'e ulaşabilirsiniz) veya başvuru amacına yönelik geliştirilmiş bir yazılım ya da uygulama vasıtasıyla Şirket'e iletebilirsiniz.</p>

<p>Bilginize sunarız.<br/><strong>TREND İŞ GÜVENLİĞİ MALZEMELERİ TEKSTİL SAN.TİC.LTD.ŞTİ.</strong></p>
`;

const TERMS_TR_BODY = `
<h2>MADDE 1 — TARAFLAR</h2>
<p>İşbu Kullanıcı Sözleşmesi ("Sözleşme"), Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA adresinde bulunan <strong>Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</strong> ("TREND İŞ GÜVENLİĞİ" veya "Şirket") ait <a href="https://modaralist.com">www.modaralist.com</a> internet sitesindeki ("İnternet Sitesi") Modaralist ürünlerini/hizmetlerini kullanan tüm kişiler ("Üye") arasında elektronik ortamda akdedilmiştir. Şirket ve Üye bundan böyle birlikte "Taraflar" olarak anılacaktır.</p>

<h2>MADDE 2 — SÖZLEŞME'NİN KONUSU</h2>
<p>İşbu Sözleşme'nin konusu Şirket'in sahibi olduğu İnternet Sitesi üzerinden Üye'nin satın alacağı ürünlerin ve buna bağlı olarak yararlanacağı hizmetin yararlanma ve kullanma koşullarının belirlenmesidir.</p>

<h2>MADDE 3 — SÖZLEŞME'NİN KURULMASI</h2>
<ul>
<li>ÜYE SÖZLEŞME'Yİ OKUDUĞUNU, ANLADIĞINI, HAKLARININ VE YÜKÜMLÜLÜKLERİNİN BİLİNCİNDE OLDUĞUNU KABUL EDER.</li>
<li>TARAFLAR, SÖZLEŞME İLE KARARLAŞTIRILAN EDİMLER ARASINDA HİÇBİR ORANSIZLIK BULUNMADIĞINI VE KARŞILIKLI EDİMLERİN İŞİN NİTELİĞİNE UYGUN OLDUĞUNU, SÖZLEŞME KONUSUNA GİREN İŞLEMLER KAPSAMINDA HERHANGİ BİR TECRÜBESİZLİKLERİNİN BULUNMADIĞINI KABUL EDERLER.</li>
<li>ÜYE, SÖZLEŞME KAPSAMINDA YER ALAN İŞLEMLERİN KENDİ MENFAATİNE UYGUN OLDUĞU KONUSUNDA TAM BİR KANAATE VARDIĞINI VE TÜM ŞARTLARA KENDİ ÖZGÜR İRADESİ İLE, HİÇBİR GÜÇLÜK VEYA SIKINTI İÇİNDE OLMADAN, DÜŞÜNEREK, İSTEYEREK VE BİLEREK UYACAĞINI KABUL EDER.</li>
<li>TARAFLAR, SÖZLEŞME'NİN HÜKÜMLERİNİN HAKSIZ ŞART SAYILABİLECEK BİR ÖZELLİK TAŞIMADIĞINI, MENFAATLER DENGESİ BAKIMINDAN BİR HAKSIZLIK OLMADIĞINI KABUL EDER.</li>
<li>İŞBU SÖZLEŞME HÜKÜMLERİ TÜKETİCİ SÖZLEŞMELERİNDEKİ HAKSIZ ŞARTLAR HAKKINDA YÖNETMELİK HÜKÜMLERİ UYARINCA HERHANGİ BİR HAKSIZ ŞART İÇERMEMEKTEDİR. HÜKÜMLER DÜRÜSTLÜK VE İYİNİYET KURALINA AYKIRILIK TEŞKİL ETMEMEKTE OLUP TÜKETİCİNİN KORUNMASI MEVZUATINA UYGUN OLARAK HAZIRLANMIŞTIR.</li>
<li>İŞBU SÖZLEŞME HÜKÜMLERİ TÜRK BORÇLAR KANUNU HÜKÜMLERİ DE DİKKATE ALINARAK HAZIRLANMIŞTIR.</li>
</ul>

<h2>MADDE 4 — ÜYELİK</h2>
<ul>
<li>Üyelik, İnternet Sitesi'nde yer alan üyelik işlemlerinin tamamlanmasıyla (ve bu Sözleşme'nin akdedilmesiyle) kazanılır.</li>
<li>Üye, üyeliği kazanmak, hesap açmak veya hizmetleri herhangi bir şekilde kullanmak için en az <strong>18 (on sekiz) yaşında</strong> (veya daha büyük) olduğunu beyan eder. Üye'nin en az 13 yaşında olması ve ayırt etme gücünü haiz olması kaydıyla, 18 yaşının altında olması halinde, İnternet Sitesi'ni sadece bir ebeveyn veya yasal temsilcisi eşliğinde kullanması gerekmektedir. <strong>13 yaşın altındaki hiç kimse hizmetleri herhangi bir şekilde kullanamaz.</strong></li>
<li>Üyeler, üyelik işlemleri ile ilgili olarak Şirket'e <strong>doğru, gerçek ve güncel bilgiler</strong> vermekle yükümlüdür. Paylaşılan bu bilgiler Üye tarafından her zaman değiştirilebilir ve güncellenebilir.</li>
<li>Şirket, resmi makamların düzenleyici veya icrai işlemleri veya yargı kararlarının gereklerini yerine getirmek amacıyla ve taleple sınırlı olarak Üye'nin bilgilerini ilgili resmi makamlar ile paylaşabilir.</li>
<li>Üyeler, üyelikten diledikleri zaman çıkabilirler. Üyelikten çıkış tarihine kadar Sözleşme'den kaynaklanan hak ve yükümlülüklere ve Sözleşme feshedilse dahi nitelikleri gereği yürürlükte kalması gereken hükümlere üyelikten çıkmanın bir etkisi olmaz.</li>
</ul>

<h2>MADDE 5 — HİZMET'İN ÜYE TARAFINDAN KULLANIMI VE HİZMET BEDELİ</h2>
<ul>
<li>Üye, İnternet Sitesi'nin ilgili bölümünü ziyaret edip kayıt için gerekli olan bölümleri doldurup bu Sözleşme'ye taraf olduktan sonra işbu Sözleşme koşulları dâhilinde İnternet Sitesi'nin sunduğu ürün ve hizmetlerden yararlanmaya başlayabilir. Şirket tarafından sunulan ürün ve hizmetler, Üye tarafından <strong>yalnızca hukuka uygun amaçlar için</strong> kullanılabilir.</li>
<li>İnternet Sitesi'ne <strong>ücretsiz olarak</strong> üye olunabilmektedir.</li>
<li>Şirket, kendi takdirine bağlı olarak kendi ürün ve buna bağlı hizmetler ile ilgili olarak promosyon kodları veya kampanyalar oluşturabilir. Üye, her zaman kendisine ticari elektronik ileti gönderilmesi konusunda rızasını reddetme imkanına sahiptir.</li>
</ul>

<h2>MADDE 6 — TARAFLAR'IN HAK VE YÜKÜMLÜLÜKLERİ</h2>
<ul>
<li>Üye, İnternet Sitesi'ne üye olurken verdiği kişisel ve diğer sair bilgilerin gerçeğe uygun olduğunu, bu bilgilerin gerçeğe aykırılığı nedeniyle Şirket'in uğrayacağı tüm zararları derhal tazmin edeceğini beyan ve taahhüt eder.</li>
<li>Üye'nin İnternet Sitesi'nin kullanılması için üyelik kapsamında aldığı şifreyi kullanma hakkı münhasıran Üye'ye aittir. <strong>Üye bu şifreyi herhangi bir üçüncü şahsa veremez.</strong> Şifrenin kullanımına ilişkin tüm hukuki ve cezai sorumluluk Üye'ye aittir.</li>
<li>Üye, üyeliğini başka birine devredemez.</li>
<li>Üye, İnternet Sitesi'ni hiçbir şekilde kamu düzenini bozucu, genel ahlaka aykırı, başkalarını rahatsız ve taciz edici şekilde, yasalara aykırı bir amaç için, başkalarının fikir ve telif haklarına tecavüz edecek şekilde kullanamaz. Ayrıca Üye başkalarının hizmetleri kullanmasını önleyici veya zorlaştırıcı faaliyet (spam, virüs, truva atı, vb.) ve işlemlerde bulunamayacağı gibi İnternet Sitesi'nin veya yazılımın güvenliğini tehdit edecek faaliyetlerde de bulunamaz.</li>
<li>Şirket, gerekli bilgi güvenliği önlemlerini almasına karşın Üye bilgi ve verilerinin yetkisiz kişilerce ele geçirilmesinden ve Üye bilgi ve verilerine gelebilecek zararlardan dolayı sorumlu tutulmayacaktır.</li>
<li>İnternet Sitesi'nde Üye'ler tarafından beyan edilen, yazılan fikir ve düşünceler münhasıran Üyeler'in kendi kişisel fikirleridir; Şirket'in bunlarla bağlantısı yoktur.</li>
<li>İnternet Sitesi genel görünüm, tasarım ve yazılımı ile site içerisindeki tüm metin ve görsel içeriklere, marka, logo, know-how ve diğer öğelere ilişkin telif hakkı ve/veya her türlü <strong>fikri mülkiyet hakları Şirket'e aittir</strong> veya Şirket tarafından lisans alınarak kullanılmaktadır.</li>
<li>İnternet Sitesi kullanımlarında tüm kredi kartı işlemleri ve onayları İnternet Sitesi'nden bağımsız olarak ilgili banka ve benzeri kart kuruluşlarınca online olarak aralarında gerçekleştirilmektedir. Kredi kartı şifresi gibi bilgiler Modaralist tarafından <strong>görülmez ve kaydedilmez</strong>.</li>
</ul>

<h2>MADDE 7 — SÖZLEŞME'NİN FESHİ</h2>
<ul>
<li>İşbu Sözleşme'de yer alan fesih imkanları saklı kalmak kaydıyla, Üye ve Şirket işbu Sözleşme'yi diledikleri zaman feshedebilir. İşbu Sözleşme, Üye'nin üyeliğini iptal etmesi veya Modaralist'in tarafından üyeliğinin iptal edilmesine kadar yürürlükte kalacaktır.</li>
<li>Üye'nin fesih işlemi İnternet Sitesi üzerinden fesih usullerinin takip edilerek gerçekleştirilmesi suretiyle yapılır.</li>
</ul>

<h2>MADDE 8 — SON HÜKÜMLER</h2>
<p><strong>8.1 Uygulanacak Hukuk:</strong> İşbu Sözleşme Türkiye Cumhuriyeti kanunlarına tabidir ve ona göre yorumlanacaktır.</p>
<p><strong>8.2 Yetkili Mahkeme:</strong> İşbu Sözleşme'den doğan veya işbu Sözleşme ile bağlantılı tüm uyuşmazlıkların çözümünde <strong>Bursa Adliyesi Mahkemeleri</strong> yetkilidir.</p>
<p><strong>8.5 Şirket İletişim Bilgileri:</strong></p>
<ul>
<li><strong>Unvan:</strong> Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</li>
<li><strong>Adres:</strong> Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA</li>
<li><strong>Telefon:</strong> 0501 700 88 16</li>
<li><strong>E-posta:</strong> admin@modaralist.com</li>
</ul>
<p>Üye'nin Modaralist'e bildirdiği elektronik posta adresi, işbu Sözleşme ile ilgili olarak yapılacak her türlü bildirim için yasal ve geçerli bildirim adresi olarak kabul edilir.</p>
`;

const DISTANCE_SALES_TR_BODY = `
<h2>MADDE 1 — TARAFLAR</h2>
<p>İşbu Mesafeli Satış Sözleşmesi ("Sözleşme") Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA adresinde faaliyette bulunan <strong>Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</strong> ("Satıcı") ve hizmetlerini/ürünlerini <a href="https://modaralist.com">www.modaralist.com</a> alan adlı internet sitesi üzerinden satın alan kişi ("Alıcı") arasında elektronik ortamda imzalanmıştır.</p>

<h3>1.1. Satıcı</h3>
<ul>
<li><strong>Ticari Unvanı:</strong> Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</li>
<li><strong>Adresi:</strong> Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA</li>
<li><strong>Telefon:</strong> +90 501 700 88 16</li>
<li><strong>E-posta:</strong> admin@modaralist.com</li>
<li><strong>Ürün İade Adresi:</strong> Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA</li>
<li><strong>Mersis No:</strong> 0859-1228-3400-0001</li>
</ul>

<h2>MADDE 2 — TANIMLAR</h2>
<ul>
<li><strong>KANUN:</strong> 6502 sayılı Tüketicinin Korunması Hakkında Kanun</li>
<li><strong>YÖNETMELİK:</strong> Mesafeli Sözleşmeler Yönetmeliği (RG: 27.11.2014/29188)</li>
<li><strong>SATICI:</strong> Ticari veya mesleki faaliyetleri kapsamında tüketiciye mal sunan şirket</li>
<li><strong>ALICI:</strong> Bir mal veya hizmeti ticari veya mesleki olmayan amaçlarla edinen, kullanan veya yararlanan gerçek ya da tüzel kişi</li>
<li><strong>SİTE:</strong> Satıcı'ya ait internet sitesi</li>
<li><strong>MAL:</strong> Alışverişe konu olan taşınır eşya</li>
</ul>

<h2>MADDE 4 — KONU</h2>
<p>İşbu Sözleşme'nin konusu, Satıcı'nın, Sipariş Veren/Alıcı'ya <a href="https://modaralist.com">www.modaralist.com</a> internet adresinden ("İnternet Sitesi") yapılan, sipariş onayında belirtilen ürün/ürünlerin satışı ve teslimi ile ilgili olarak <strong>6502 sayılı Tüketicinin Korunması Hakkındaki Kanun</strong> ve <strong>Mesafeli Sözleşmeler Yönetmeliği</strong> hükümleri gereğince tarafların hak ve yükümlülüklerini belirlemektir.</p>

<h2>MADDE 8 — SÖZLEŞME KONUSU ÜRÜN/ÜRÜNLER BİLGİLERİ</h2>
<p><strong>8.1.</strong> Mal/Ürün/Ürünlerin/Hizmetin temel özelliklerini (türü, miktarı, marka/modeli, rengi, adedi) Satıcı'ya ait internet sitesinde yayınlanmaktadır.</p>
<p><strong>8.2.</strong> Listelenen ve sitede ilan edilen fiyatlar satış fiyatıdır. İlan edilen fiyatlar ve vaatler güncelleme yapılana ve değiştirilene kadar geçerlidir.</p>
<p><strong>8.3.</strong> Sözleşme konusu mal ya da hizmetin <strong>tüm vergiler dâhil satış fiyatı</strong> sipariş özetinde gösterilmiştir.</p>
<p><strong>8.4.</strong> Ürün sevkiyat masrafı olan kargo ücreti Alıcı tarafından ödenecektir.</p>

<h2>MADDE 10 — TESLİMAT</h2>
<p>Sözleşme konusu ürün, Alıcı'nın isteği veya kişisel ihtiyaçları doğrultusunda hazırlanan bir ürün olmadıkça <strong>yasal 30 (otuz) günlük</strong> yasal süreyi aşmamak koşulu ile her bir ürün için Alıcı'nın teslimat adresinin uzaklığına bağlı olarak ön bilgilendirme formunda belirtilen süre içinde Alıcı'ya veya gösterdiği adresteki kişi/kuruluşa teslim edilir.</p>
<p><strong>Taşıyıcı Firma:</strong> Aras Kargo. Gönderilecek kargo bilgisi otomatik olarak müşteriye gösterilecek/gönderilecektir.</p>

<h2>MADDE 11 — GENEL HÜKÜMLER</h2>
<ul>
<li>Alıcı, Satıcı'dan ürün ve hizmet satın alarak işbu Sözleşme'nin tamamını okuduğunu, içeriğini bütünü ile anladığını ve tüm hükümlerini onayladığını kabul eder.</li>
<li>Sözleşme konusu ürünün teslimatı için işbu Sözleşme'nin <strong>elektronik ortamda teyit edilmesi</strong> ve sipariş bedelinin ödenmesi şarttır.</li>
<li>Müşteri, sipariş özetinde yer alan Sözleşme konusu ürün veya hizmetin temel nitelikleri, satış fiyatı, ödeme şekli, teslimat ve kargo bedeline ilişkin <strong>Ön Bilgilendirme Formu</strong>'nu okuyup bilgi sahibi olduğunu, elektronik ortamda gerekli teyidi verdiğini ve İnternet Sitesi üzerinden siparişi onaylaması ile <strong>ÖDEME YÜKÜMLÜLÜĞÜ</strong> altına girdiğinin bilincinde olduğunu kabul eder.</li>
<li>Alıcı, Satıcı tarafından üretilen tasarımlarda kullanılan özel tasarım tekniklerinin, doku, desen, tasarım elementleri, stiller, gradyan ve solid renk tonları ile her türlü grafik tasarım, illustrasyon, çizim, tasarım ve eserlerin tasarımında kullanılan öğelerin <strong>Fikir ve Sanat Eserleri Kanunu</strong>'ndan (FSEK) kaynaklı tüm hakların Satıcı'ya ait olduğunu kabul eder.</li>
<li>Alıcı siparişin teslimini talep ettiği adreste bulunmaz ise siparişi <strong>kesinlikle başka bir adrese bırakılmayacaktır</strong>.</li>
<li>Satıcı, malın Alıcı'ya tesliminden önce ALICI'nın taşıyıcı dışında belirleyeceği üçüncü bir kişiye teslimine kadar oluşan kayıp ve hasarlardan sorumludur.</li>
<li>Satıcı mücbir sebepler veya nakliyeyi engelleyen hava muhalefeti, ulaşımın kesilmesi gibi olağanüstü durumlar nedeni ile sözleşme konusu ürünü süresi içinde teslim edemez ise, durumu Alıcı'ya bildirmekle yükümlüdür.</li>
<li><strong>18 yaşından küçük kişiler</strong> Satıcı İnternet Sitesi'nden, çocuklara yönelik ürünlerin satışa sunulması durumunda dahi alışveriş yapamaz.</li>
<li>Ürünlerin fiyatları, katma değer vergisi ilave edilmiş <strong>Türk Lirası</strong> cinsinden sitede yer almaktadır. Alıcı internet sitesinden kredi kartı, havale veya EFT ile alışveriş yapabilir.</li>
<li>Alıcı ürünü teslim almadan önce muayenesini yapmalı, olağan muayene ile tespit edilebilen ayıplı ve hasarlı ürünü Satıcı yetkilisinden veya kargo şirketinden teslim almamalıdır.</li>
</ul>

<h2>MADDE 12 — CAYMA HAKKI</h2>
<p>6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği ilgili hükümleri uyarınca; Tüketici Alıcı, hizmet ifasına ilişkin sözleşmelerde sözleşmenin kurulduğu günden; mal satışına ilişkin mesafeli sözleşmelerde, kendisinin veya kendisi tarafından belirlenen üçüncü kişinin malı teslim aldığı tarihten itibaren <strong>14 (on dört) gün</strong> içerisinde herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayma hakkına sahiptir.</p>

<p>Cayma bildiriminin yapılabileceği Satıcı'ya ait iletişim bilgileri:</p>
<ul>
<li><strong>Açık Adres:</strong> Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA</li>
<li><strong>Telefon No:</strong> +90 501 700 88 16</li>
<li><strong>E-posta:</strong> admin@modaralist.com</li>
</ul>

<p>Cayma hakkının kullanılması halinde, Sipariş Veren/Alıcı'ya teslim edilen ürün/ürünlerin Satıcı'ya gönderildiğine ilişkin kargo teslim tutanağı örneği ile fatura aslının Satıcı'ya iadesi zorunludur.</p>

<h3>Cayma hakkı kullanılamayacak haller (Yönetmelik Madde 15)</h3>
<p>Tüketici Alıcı'nın cayma hakkı; <em>(a)</em> fiyatı finansal piyasalardaki dalgalanmalara bağlı olarak değişen mal/hizmetler, <em>(b)</em> tüketicinin istekleri veya kişisel ihtiyaçları doğrultusunda hazırlanan mallar, <em>(c)</em> çabuk bozulabilen veya son kullanma tarihi geçebilecek mallar, <em>(ç)</em> tesliminden sonra ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış olan mallardan iadesi sağlık ve hijyen açısından uygun olmayanlar, <em>(d)</em> tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan mallar, <em>(g)</em> belirli bir tarihte yapılması gereken hizmetler, <em>(ğ)</em> elektronik ortamda anında ifa edilen hizmetler veya tüketiciye anında teslim edilen gayri maddi mallar — kapsamında uygulanmaz.</p>

<h2>Şikâyet ve İtiraz Prosedürü</h2>
<p>İşbu Sözleşme'den dolayı her türlü şikâyet ve itirazlar, Ticaret Bakanlığı'nca her yıl Aralık ayında belirlenen parasal sınırlara göre Alıcı'nın yerleşim yerinin bulunduğu veya tüketici işleminin yapıldığı yerdeki <strong>Tüketici Hakem Heyeti'ne</strong> veya 6502 sayılı Kanun'un 73/A maddesi uyarınca dava açılmadan önce arabulucuya başvurulması şartı ile <strong>Tüketici Mahkemesi'ne</strong> yapabilir.</p>

<h2>MADDE 13 — DİĞER HÜKÜMLER</h2>
<p>İşbu Sözleşme Alıcı tarafından onaylanıp kurulmasından sonra Alıcı'ya elektronik posta ile gönderilecek, Satıcı <strong>3 (üç) yıl</strong> süre ile işbu Sözleşme'yi saklayacaktır. Alıcı dilediğinde <strong>admin@modaralist.com</strong> adresine göndereceği bir talep ile başvuruda bulunarak işbu Sözleşme'nin nüshasına erişimini Satıcı'dan talep edebilir.</p>

<p>Alıcı ürün ve hizmetlere ilişkin şikayetlerini (i) <strong>admin@modaralist.com</strong> adresine e-posta göndererek, (ii) İnternet Sitesi üzerinden veya (iii) <strong>+90 501 700 88 16</strong> numaralı telefon hattını arayarak Satıcı'ya iletebilir.</p>

<h2>MADDE 16 — YÜRÜRLÜK</h2>
<p>İşbu Sözleşme, Alıcı tarafından elektronik ortamda onaylanmak suretiyle akdedilmiş ve yürürlüğe girer.</p>

<p><strong>Satıcı:</strong> Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</p>
`;

const MEMBERSHIP_TR_BODY = `
<h2>Madde 1 — Taraflar</h2>
<p>İşbu Üyelik Sözleşmesi ("Sözleşme"), Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA adresinde bulunan <strong>Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</strong> ("Şirket") ve Şirket tarafından işletilen <a href="https://modaralist.com">www.modaralist.com</a> alan adlı internet sitesine ("İnternet Sitesi") üye olan kişiler ("Üye(ler)") arasında elektronik ortamda akdedilmiştir.</p>

<h2>Madde 2 — Sözleşme'nin Konusu</h2>
<p>İşbu Sözleşme'nin konusu, Üye'nin İnternet Sitesi üzerinden alacağı ürün veya hizmetler kapsamında, İnternet Sitesi kullanma ve üyelik koşullarının belirlenmesidir.</p>

<h2>Madde 3 — Sözleşme'nin Kurulması</h2>
<ol type="a">
<li>ÜYE SÖZLEŞME'Yİ OKUDUĞUNU, ANLADIĞINI, HAKLARININ VE YÜKÜMLÜLÜKLERİNİN BİLİNCİNDE OLDUĞUNU KABUL EDER.</li>
<li>TARAFLAR, SÖZLEŞME İLE KARARLAŞTIRILAN EDİMLER ARASINDA HİÇBİR ORANSIZLIK BULUNMADIĞINI VE KARŞILIKLI EDİMLERİN İŞİN NİTELİĞİNE UYGUN OLDUĞUNU KABUL EDERLER.</li>
<li>ÜYE, SÖZLEŞME KAPSAMINDA YER ALAN İŞLEMLERİN KENDİ MENFAATİNE UYGUN OLDUĞU KONUSUNDA TAM BİR KANAATE VARDIĞINI VE TÜM ŞARTLARA KENDİ ÖZGÜR İRADESİ İLE UYACAĞINI KABUL EDER.</li>
<li>İŞBU SÖZLEŞME HÜKÜMLERİ TÜKETİCİ SÖZLEŞMELERİNDEKİ HAKSIZ ŞARTLAR HAKKINDA YÖNETMELİK HÜKÜMLERİ UYARINCA HERHANGİ BİR HAKSIZ ŞART İÇERMEMEKTEDİR.</li>
</ol>

<h2>Madde 4 — Üyelik</h2>
<p><strong>4.1</strong> Üyelik, İnternet Sitesi'nde yer alan üyelik işlemlerinin tamamlanmasıyla (ve bu Sözleşme'nin akdedilmesiyle) kazanılır.</p>
<p><strong>4.2</strong> Üye, üyeliği kazanmak için en az <strong>18 yaşında</strong> (veya daha büyük) olduğunu beyan etmektedir. Üye'nin en az 13 yaşında olması ve aynı zamanda ayırt etme gücünü haiz olması kaydıyla, 18 yaşının altında olması halinde, İnternet Sitesi'ni sadece bir ebeveyn veya yasal temsilcisi eşliğinde kullanması gerekmektedir.</p>
<p><strong>4.3</strong> Üyeler, üyelik işlemleri ile ilgili olarak <strong>doğru, gerçek ve güncel bilgiler</strong> vermekle yükümlüdür. Bu bilgiler Üye tarafından her zaman değiştirilebilir ve güncellenebilir.</p>
<p><strong>4.4</strong> Şirket, resmi makamların düzenleyici veya icrai işlemleri veya yargı kararlarının gereklerini yerine getirmek amacıyla ve taleple sınırlı olarak Üye'nin bilgilerini ilgili resmi makamlar ile paylaşabilir.</p>
<p><strong>4.5</strong> Üyeler'in bir rumuz (nick name) kullanmaları durumunda söz konusu rumuz, yürürlükteki mevzuata ve ahlaka aykırı olamaz; hakaret, küfür, sövme, aşağılayıcı, kişilik haklarına zarar veren sözler içeremez.</p>
<p><strong>4.6</strong> Üyeler, üyelikten <strong>diledikleri zaman çıkabilirler</strong>. Üyelikten çıkış tarihine kadar Sözleşme'den kaynaklanan hak ve yükümlülüklere üyelikten çıkmanın bir etkisi olmaz.</p>

<h2>Madde 5 — Tarafların Hak ve Yükümlülükleri</h2>
<p><strong>5.1</strong> Üye, İnternet Sitesi'ne üye olurken verdiği bilgilerin gerçeğe uygun olduğunu, bilgilerin gerçeğe aykırılığı nedeniyle Şirket'in uğrayacağı tüm zararları derhal tazmin edeceğini taahhüt eder.</p>
<p><strong>5.2</strong> Üye'nin üyelik kapsamında aldığı şifreyi kullanma hakkı münhasıran Üye'ye aittir. <strong>Üye bu şifreyi herhangi bir üçüncü şahsa veremez.</strong> Şifrenin kullanımına ilişkin tüm hukuki ve cezai sorumluluk Üye'ye aittir.</p>
<p><strong>5.3</strong> Üye, üyeliğini başka birine devredemez.</p>
<p><strong>5.4</strong> Üye, İnternet Sitesi'ni kullanırken tüm yasal mevzuat hükümlerine uymayı kabul eder.</p>
<p><strong>5.5</strong> Üye, İnternet Sitesi'ni kamu düzenini bozucu, genel ahlaka aykırı, başkalarını rahatsız edici şekilde, yasalara aykırı bir amaç için, başkalarının fikir ve telif haklarına tecavüz edecek şekilde kullanamaz. Spam, virüs, truva atı vb. yazılım yayma, sistemin güvenliğini tehdit etme yasaktır.</p>
<p><strong>5.7</strong> Şirket, gerekli bilgi güvenliği önlemlerini almasına karşın Üye bilgi ve verilerinin yetkisiz kişilerce ele geçirilmesinden ve Üye bilgi ve verilerine gelebilecek zararlardan dolayı sorumlu tutulmayacaktır.</p>
<p><strong>5.13</strong> İnternet Sitesi'ndeki genel görünüm, tasarım ve yazılımı ile site içerisindeki tüm metin ve görsel içeriklere, marka, logo ve diğer öğelere ilişkin telif hakkı ve fikri mülkiyet hakları <strong>Şirket'e aittir</strong>.</p>
<p><strong>5.16</strong> Şirket, işbu Sözleşme'nin koşullarını her zaman güncelleyebilir, değiştirebilir veya yürürlükten kaldırabilir. Güncellenen, değiştirilen ya da yürürlükten kaldırılan her hüküm, yayın tarihinde Üye için hüküm ifade edecektir.</p>
<p><strong>5.20</strong> Şirket, kendi takdirinde olmak üzere kampanyalar düzenleyebilir ve bu kampanyaları çeşitli kanallardan duyurabilir.</p>

<h2>Madde 6 — Sözleşme'nin Feshi</h2>
<p><strong>6.1.</strong> Üye ve Şirket işbu Sözleşme'yi <strong>diledikleri zaman</strong> feshedebilir.</p>
<p><strong>6.2.</strong> Fesih tarihine kadar Sözleşme'den kaynaklanan hak ve yükümlülüklere ve Sözleşme feshedilse dahi nitelikleri gereği yürürlükte kalması gereken hükümlere feshin bir etkisi olmaz.</p>

<h2>Madde 7 — Son Hükümler</h2>
<p><strong>7.1</strong> İşbu Sözleşme Türkiye Cumhuriyeti kanunlarına tabidir.</p>
<p><strong>7.2</strong> İşbu Sözleşme'den doğan veya işbu Sözleşme ile bağlantılı tüm uyuşmazlıkların çözümünde <strong>Bursa Mahkemeleri</strong> yetkilidir.</p>
<p><strong>7.4 Şirket İletişim Bilgileri:</strong></p>
<ul>
<li><strong>Unvan:</strong> Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</li>
<li><strong>Adres:</strong> Kazım Karabekir Mahallesi 2.Konuk Sokak No:3 Yıldırım/BURSA</li>
<li><strong>Telefon:</strong> +90 501 700 88 16</li>
<li><strong>E-posta:</strong> admin@modaralist.com</li>
</ul>
`;

const RETURNS_TR_BODY = `
<p>Modaralist'ten satın aldığın ürünlerden memnun kalmazsan endişelenme — <strong>6502 sayılı Tüketicinin Korunması Hakkında Kanun</strong> ve <strong>Mesafeli Sözleşmeler Yönetmeliği</strong> kapsamında sahip olduğun yasal haklara ek olarak, sürecin kolay ilerlemesi için elimizden geleni yapıyoruz.</p>

<h2>Özet — En önemli 3 madde</h2>
<ul>
<li><strong>14 gün koşulsuz cayma hakkı.</strong> Ürünü teslim aldığın tarihten itibaren 14 (on dört) gün içinde, herhangi bir gerekçe göstermeksizin ve cezai şart ödemeksizin sözleşmeden cayabilirsin.</li>
<li><strong>Anlaşmalı kargo (Aras Kargo) ile iade ücretsiz.</strong> Aras Kargo şubesinin olmadığı bir bölgedeysen iade için ek masraf çıkartmıyoruz, ürünü senin bulunduğun yerden teslim almakla yükümlüyüz.</li>
<li><strong>Tüm ödeme 14 gün içinde iade.</strong> Ürün elimize ulaştığı tarihten itibaren en geç 14 gün içinde — kargo ücreti dahil — tahsil edilen tüm tutarı, ödeme yaptığın karta/hesaba geri yatırırız.</li>
</ul>

<h2>Hangi ürünleri iade edebilirsin?</h2>
<p>Kullanılmamış, etiketleri sökülmemiş, orijinal ambalajı bozulmamış ve faturalı tüm ürünler iade edilebilir. Ürünü kullandığında — yıkadığında, kestiğinde, etiketini söktüğünde — değişiklik veya bozulmadan kaynaklanan değer kayıplarından yasal olarak sen sorumlu olursun.</p>

<h3>Cayma hakkının kullanılamayacağı haller</h3>
<p>Mesafeli Sözleşmeler Yönetmeliği'nin 15. Maddesi uyarınca aşağıdaki ürünlerde cayma hakkı kullanılamaz:</p>
<ol type="a">
<li>Senin isteğin veya kişisel ihtiyaçların doğrultusunda hazırlanan, kişiye özel üretilmiş ürünler (özel baskı, kişiselleştirilmiş tasarım vb.).</li>
<li>Tesliminden sonra <strong>ambalaj, bant, mühür, paket gibi koruyucu unsurları açılmış</strong> olan ve iadesi sağlık ve hijyen açısından uygun olmayan ürünler (örn. iç çamaşırı, çorap, mayo).</li>
<li>Tesliminden sonra başka ürünlerle karışan ve doğası gereği ayrıştırılması mümkün olmayan ürünler.</li>
<li>Çabuk bozulabilen veya son kullanma tarihi geçebilecek ürünler.</li>
</ol>

<h2>İade süreci — Adım adım</h2>
<ol>
<li><strong>Bize haber ver.</strong> 14 gün içinde aşağıdaki yollardan biriyle iade talebini iletmen yeterli — yazılı bildirim hukuken geçerlidir:
  <ul>
  <li>E-posta: <a href="mailto:admin@modaralist.com">admin@modaralist.com</a> (sipariş numaran + iade nedeni)</li>
  <li>Telefon: <a href="tel:+905017008816">+90 501 700 88 16</a></li>
  <li>Hesap sayfan üzerinden sipariş detayında "İade et" akışı</li>
  </ul>
</li>
<li><strong>Ürünü hazırla.</strong> Ürünün <em>faturasını, kutusunu, ambalajını, varsa hediye edilen aksesuarları</em> eksiksiz ve hasarsız şekilde paketle.</li>
<li><strong>Aras Kargo ile gönder.</strong> Anlaşmalı kargomuz Aras Kargo aracılığıyla iade kargo ücreti <strong>tarafımızca karşılanır</strong>. Başka bir kargo şirketi kullanırsan kargo masrafları sana ait olur ve süreçte oluşacak hasardan Modaralist sorumlu değildir.
  <p style="margin-top:0.6em;"><strong>İade adresi:</strong><br/>
  Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.<br/>
  Kazım Karabekir Mahallesi, 2. Konuk Sokak No:3<br/>
  Yıldırım / BURSA</p>
</li>
<li><strong>Bekleme süreci.</strong> Ürün adresimize ulaştıktan sonra inceleriz ve <strong>en geç 14 gün içinde</strong> tüm ödemelerini (kargo ücreti dahil) iade ederiz.</li>
<li><strong>Para iadesi.</strong> İade, ödeme yaparken kullandığın araca yapılır:
  <ul>
  <li>Kredi kartı: bankaya tek seferde iade talimatı verilir, banka yansıtması <strong>1-10 iş günü</strong> sürebilir. Taksitli alımlarda banka sana ödemeyi de taksitle yansıtabilir.</li>
  <li>Havale/EFT: iade gönderim bilgilerinde belirttiğin IBAN'a aynı tutarda yapılır.</li>
  </ul>
</li>
</ol>

<h2>Hasarlı veya yanlış ürün geldiyse</h2>
<p>Kargo görevlisi paketi sana teslim ettiğinde olağan muayeneyi yapman gerekir. <strong>Tesliminden önce hasarlı olduğu görülen paketleri teslim alma</strong>, kargo yetkilisi ile tutanak tut. Eğer paket sağlam görünüp içindeki ürün hasarlı/yanlış/eksikse:</p>
<ul>
<li>Teslim aldıktan sonra <strong>en geç 24 saat içinde</strong> bizi bilgilendir (e-posta + fotoğraf).</li>
<li>Bu durumda iade kargo ücreti tamamen bize aittir; ürünü hızlıca yenisiyle değiştirir veya tam iade yaparız.</li>
<li>Yasal cayma hakkın saklıdır — yine 14 gün içinde başvurabilirsin.</li>
</ul>

<h2>Değişim (beden / renk)</h2>
<p>Türk hukukunda doğrudan "değişim" hakkı düzenlenmemiştir; sürecin pratik akışı şu şekildedir:</p>
<ol>
<li>Mevcut ürünü standart iade akışıyla bize gönder.</li>
<li>Aynı anda yeni siparişini sitemizden ver — böylece istediğin beden/renk anında ayrılır, stoksuz kalma riski olmaz.</li>
<li>İlk siparişin para iadesi 14 gün içinde tamamlanır.</li>
</ol>

<h2>Şikâyet ve itiraz hakkın</h2>
<p>İade sürecinde bir uyuşmazlık yaşarsan, 6502 sayılı Kanun'un sana tanıdığı yollar şunlardır:</p>
<ul>
<li><strong>Tüketici Hakem Heyeti</strong> — Ticaret Bakanlığı'nca her yıl Aralık ayında belirlenen parasal sınırlara göre, yerleşim yerinin bulunduğu veya alışverişin yapıldığı yerdeki Tüketici Hakem Heyeti'ne başvurabilirsin.</li>
<li><strong>Tüketici Mahkemesi</strong> — 6502 sayılı Kanun'un 73/A maddesi uyarınca dava açılmadan önce arabulucuya başvurulması şartı ile Tüketici Mahkemesi'nde dava açabilirsin.</li>
<li><strong>e-Devlet — Tüketici Şikâyeti</strong> sistemini de kullanabilirsin (<a href="https://tuketicisikayeti.ticaret.gov.tr">tuketicisikayeti.ticaret.gov.tr</a>).</li>
</ul>
<p>Bunlardan önce <a href="mailto:admin@modaralist.com">admin@modaralist.com</a> adresine yazman bizi her zaman mutlu eder — çoğu konu hızlıca, hiçbir kuruma gitmeden çözülebilir.</p>

<h2>İlgili dökümanlar</h2>
<p>İade ve cayma hakkının tüm hukuki detayı için bkz. <a href="/pages/distance-sales">Mesafeli Satış Sözleşmesi — Madde 12 (Cayma Hakkı)</a>. Kişisel verilerin işlenmesi için bkz. <a href="/pages/kvkk">KVKK Aydınlatma Metni</a>.</p>
`;

export const LEGAL_PAGES: LegalPage[] = [
  {
    slug: "privacy",
    tr: {
      title: "Gizlilik Politikası",
      body: PRIVACY_TR_BODY,
      seoTitle: "Gizlilik Politikası — Modaralist",
      seoDesc: "Modaralist gizlilik politikası: kişisel verilerin işlenmesi, ödeme güvenliği, KVKK uyumu.",
    },
    en: {
      title: "Privacy Policy",
      body: PRIVACY_TR_BODY,
      seoTitle: "Privacy Policy — Modaralist",
      seoDesc: "Modaralist privacy policy.",
    },
  },
  {
    slug: "kvkk",
    tr: {
      title: "KVKK Aydınlatma Metni",
      body: KVKK_TR_BODY,
      seoTitle: "KVKK Aydınlatma Metni — Modaralist",
      seoDesc: "Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında veri işleme aydınlatma metni.",
    },
    en: {
      title: "KVKK Disclosure",
      body: KVKK_TR_BODY,
      seoTitle: "KVKK Disclosure — Modaralist",
      seoDesc: "Personal data processing disclosure under Turkish KVKK law.",
    },
  },
  {
    slug: "terms",
    tr: {
      title: "Kullanıcı Sözleşmesi",
      body: TERMS_TR_BODY,
      seoTitle: "Kullanıcı Sözleşmesi — Modaralist",
      seoDesc: "Modaralist kullanıcı sözleşmesi: site kullanım koşulları, üyelik, fikri mülkiyet, sorumluluk sınırları.",
    },
    en: {
      title: "Terms of Use",
      body: TERMS_TR_BODY,
      seoTitle: "Terms of Use — Modaralist",
      seoDesc: "Modaralist terms of use.",
    },
  },
  {
    slug: "distance-sales",
    tr: {
      title: "Mesafeli Satış Sözleşmesi",
      body: DISTANCE_SALES_TR_BODY,
      seoTitle: "Mesafeli Satış Sözleşmesi — Modaralist",
      seoDesc: "Mesafeli satış sözleşmesi: taraflar, teslimat, ödeme, cayma hakkı (14 gün), şikayet prosedürü.",
    },
    en: {
      title: "Distance Sales Contract",
      body: DISTANCE_SALES_TR_BODY,
      seoTitle: "Distance Sales Contract — Modaralist",
      seoDesc: "Distance sales contract under Turkish consumer protection law.",
    },
  },
  {
    slug: "membership",
    tr: {
      title: "Üyelik Sözleşmesi",
      body: MEMBERSHIP_TR_BODY,
      seoTitle: "Üyelik Sözleşmesi — Modaralist",
      seoDesc: "Modaralist üyelik sözleşmesi: hesap açma, üyelik koşulları, fesih, taraf hakları.",
    },
    en: {
      title: "Membership Agreement",
      body: MEMBERSHIP_TR_BODY,
      seoTitle: "Membership Agreement — Modaralist",
      seoDesc: "Modaralist membership agreement.",
    },
  },
  {
    slug: "returns",
    tr: {
      title: "İade & Değişim",
      body: RETURNS_TR_BODY,
      seoTitle: "İade & Değişim — Modaralist",
      seoDesc: "14 gün koşulsuz iade hakkı, ücretsiz Aras Kargo iadesi, adım adım iade süreci. 6502 sayılı Tüketici Kanunu kapsamında haklarınız.",
    },
    en: {
      title: "Returns & Exchange",
      body: RETURNS_TR_BODY,
      seoTitle: "Returns & Exchange — Modaralist",
      seoDesc: "14-day right of withdrawal, free Aras Kargo returns, step-by-step process. Your rights under Turkish consumer law.",
    },
  },
];
