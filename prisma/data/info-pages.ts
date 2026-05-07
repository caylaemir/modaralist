// Modaralist statik sayfalar — about + contact + (gelecekte: shipping vs.)
// Hukuki olmayan kurumsal/marka sayfalari icin ayri kaynak.
// Idempotent upsert: scripts/import-info-pages.ts ile yuklenir.

export type InfoPage = {
  slug: string;
  tr: { title: string; body: string; seoTitle?: string; seoDesc?: string };
  en: { title: string; body: string; seoTitle?: string; seoDesc?: string };
};

const ABOUT_TR_BODY = `
<p class="lead">Modaralist, <strong>Bursa'dan dünyaya</strong> sınırlı sayıda üretilen, numaralı koleksiyonlar üreten bir streetwear markasıdır.</p>

<h2>Az ama öz</h2>
<p>Bizim için her parça bir <strong>açıklama</strong>. Hızlı modaya — tek sezonluk, gri kalitede üretime — karşı bilinçli bir duruşumuz var. Modaralist'te her drop sınırlı sayıda üretilir; numaralandırılır ve genellikle tekrar basılmaz.</p>

<p>Bu yaklaşım iki şey yapar:</p>
<ul>
<li>Kalite üzerinden anlamlı uzlaşmalardan kaçınmamızı sağlar — pamuk, dokuma kumaş ve dikiş kalitesi her seferinde aynı çıtanın üstünde olur.</li>
<li>Senin satın aldığın parça <strong>başka kimsede çok fazla olmaz</strong>. Sokakta giydiğinde "ben de aldım" cümlesi ender.</li>
</ul>

<h2>Made in Turkey — Bursa</h2>
<p><strong>Bursa</strong>, Türkiye'nin tekstil başkentidir. Yünden ipeğe, denimden örgüye yüzyıllık bir bilgi birikimi taşır. Modaralist olarak ürünlerimizin tamamını <strong>Bursa'daki atölyelerde</strong> üretiyoruz — etiketinde "Made in Turkey" gördüğün her parça, üreticisini, kumaşını ve dikişini izleyebileceğimiz bir hikâyeye sahip.</p>

<p>Bu, bize iki şey kazandırıyor: <strong>kontrol</strong> ve <strong>sorumluluk</strong>. Kumaşı, dikişi, baskıyı bizzat onaylıyoruz; teslim sürelerini gerçekçi tutuyoruz; bir parça istediğimiz gibi olmadığında üretime geri gönderiyoruz.</p>

<h2>Kategoriler ve seriler</h2>
<p>Koleksiyonumuz <strong>6 ana kategoride</strong> üretilir:</p>
<ul>
<li><strong>Oversize</strong> — geniş kalıp tişört, sweatshirt ve kapşonlu</li>
<li><strong>Tshirt</strong> — temel ve seri parçalar (Basic · Adventure · Deniz · Street Wear · Teddy Bear · Spor)</li>
<li><strong>Sweatshirt</strong> — klasik, kapşonlu ve fermuarlı kapşonlu</li>
<li><strong>Esofman</strong> — erkek ve kadın</li>
<li><strong>Sort</strong> — erkek ve kadın</li>
<li><strong>Outdoor</strong> — erkek ve kadın</li>
</ul>
<p>Her kategorinin altında <strong>tematik seriler</strong> bulunur — Adventure outdoor için sert kullanıma; Teddy Bear yumuşak peluş dokuya; Street Wear günlük şehirli yaşama; Spor performansa odaklanır. Her seri kendi rengi, kumaşı ve baskı dilini taşır.</p>

<h2>Marmara'ya hızlı kargo</h2>
<p>Marmara bölgesindeki tüm illere — İstanbul, Bursa, Kocaeli, Tekirdağ, Sakarya, Yalova, Bilecik, Edirne, Kırklareli, Çanakkale, Balıkesir — <strong>1-2 iş günü</strong> içinde teslim ediyoruz. Diğer illere 2-4 iş günü. <strong>Ücretsiz iade</strong> 14 gün, anlaşmalı kargo (Aras) bizden.</p>

<h2>İletişim</h2>
<p>Soruların, önerilerin veya işbirliği talebin için <a href="/pages/contact">iletişim sayfamızdan</a> bize ulaş. Instagram'dan da yazabilirsin — DM'lere genelde aynı gün döneriz.</p>

<p class="closing"><em>Modaralist · Bursa, 2024</em></p>
`;

const CONTACT_TR_BODY = `
<p class="lead">Sorularını, sipariş takibini, iade talebini veya iş birliği önerini bekliyoruz. <strong>İş günleri içinde 24 saat içinde</strong> cevap vermeye çalışıyoruz.</p>

<h2>Hızlı iletişim</h2>
<ul>
<li><strong>WhatsApp:</strong> <a href="https://wa.me/905017008816?text=Merhaba%20Modaralist%2C">+90 501 700 88 16</a> — en hızlı geri dönüş kanalı</li>
<li><strong>E-posta:</strong> <a href="mailto:admin@modaralist.com">admin@modaralist.com</a></li>
<li><strong>Telefon:</strong> <a href="tel:+905017008816">+90 501 700 88 16</a></li>
<li><strong>Instagram DM:</strong> <a href="https://instagram.com/modaralist" target="_blank" rel="noopener">@modaralist</a></li>
</ul>

<h2>Çalışma saatleri</h2>
<ul>
<li><strong>Pazartesi — Cuma:</strong> 09:00 — 18:00</li>
<li><strong>Cumartesi:</strong> 10:00 — 16:00</li>
<li><strong>Pazar:</strong> Kapalı</li>
</ul>
<p>Hafta sonu ve resmi tatillerde gelen mesajları takip eden ilk iş günü cevaplıyoruz. Sipariş takibi için 7/24 hesap sayfandan ya da Aras Kargo SMS'inden ulaşabilirsin.</p>

<h2>Adres</h2>
<p><strong>Trend İş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</strong><br/>
Kazım Karabekir Mahallesi, 2. Konuk Sokak No:3<br/>
Yıldırım / BURSA<br/>
Türkiye</p>

<p><em>Üretim ve iade adresi olarak kullanılır. Mağaza ziyareti için lütfen önceden randevu al — atölye olarak çalıştığımız için her zaman müşteri ağırlamaya uygun olmayabiliyoruz.</em></p>

<h2>Sosyal medya</h2>
<ul>
<li><strong>Instagram:</strong> <a href="https://instagram.com/modaralist" target="_blank" rel="noopener">@modaralist</a> — yeni drop'lar, ürün detayları, behind the scenes</li>
<li><strong>TikTok:</strong> <a href="https://tiktok.com/@modaralist" target="_blank" rel="noopener">@modaralist</a> — kısa video içerikleri</li>
</ul>

<h2>Konu bazında ulaş</h2>
<ul>
<li><strong>Sipariş takibi / kargo sorunu:</strong> WhatsApp + sipariş numaran (en hızlı)</li>
<li><strong>İade ve değişim:</strong> <a href="/pages/returns">İade rehberi</a> — adım adım anlatıyor; talep iletmek için aynı kanal e-posta</li>
<li><strong>Toptan / kurumsal alım:</strong> admin@modaralist.com — konu satırına <em>"Toptan"</em> yaz</li>
<li><strong>İş birliği / influencer / press:</strong> admin@modaralist.com — portföy/Instagram link'inle birlikte</li>
<li><strong>Hukuki / KVKK başvurusu:</strong> admin@modaralist.com (yazılı) veya KEP: ozkan.galak@hs01.kep.tr</li>
</ul>

<h2>Sıkça sorulanlar</h2>
<p>Belki sorunun cevabı zaten <a href="/pages/faq">SSS sayfasında</a> vardır — kargo süreleri, iade, ödeme, drop'lar gibi konular için ilk oraya bakman daha hızlı.</p>
`;

const ABOUT_EN_BODY = `
<p class="lead">Modaralist is a streetwear label producing <strong>numbered, limited-run collections from Bursa</strong> — Turkey's textile capital.</p>

<h2>Less, but better</h2>
<p>For us, every piece is a statement. We take a deliberate stance against fast fashion — single-season, mass-produced, average-quality. At Modaralist, every drop is produced in limited numbers, numbered individually, and rarely reprinted.</p>

<p>Two outcomes:</p>
<ul>
<li>We don't compromise on quality — cotton, weave, stitching meet the same bar every time.</li>
<li>What you buy <strong>won't be on every other person</strong>. The "I have that too" line is rare on the street.</li>
</ul>

<h2>Made in Turkey — Bursa</h2>
<p><strong>Bursa</strong> is the textile capital of Turkey. From wool to silk, denim to knits, it carries a century of textile know-how. We produce <strong>everything in Bursa workshops</strong> — every "Made in Turkey" tag is a story we can trace back to its maker, fabric, and stitch.</p>

<p>This gives us two things: <strong>control</strong> and <strong>responsibility</strong>. We approve the fabric, the stitch, the print ourselves; we keep delivery dates realistic; if a piece doesn't meet the standard, it goes back into production.</p>

<h2>Categories and series</h2>
<p>Our collection is structured across <strong>6 categories</strong>:</p>
<ul>
<li><strong>Oversize</strong> — wide-cut t-shirts, sweatshirts, hoodies</li>
<li><strong>Tshirt</strong> — basics and themed series (Basic · Adventure · Sea · Street Wear · Teddy Bear · Sport)</li>
<li><strong>Sweatshirt</strong> — classic, hooded, zip-hoodie</li>
<li><strong>Esofman</strong> — sweatpants for men and women</li>
<li><strong>Sort</strong> — shorts for men and women</li>
<li><strong>Outdoor</strong> — for men and women</li>
</ul>

<h2>Fast shipping across Marmara</h2>
<p>We deliver to all 11 Marmara cities — Istanbul, Bursa, Kocaeli, Tekirdağ, Sakarya, Yalova, Bilecik, Edirne, Kırklareli, Çanakkale, Balıkesir — within <strong>1-2 business days</strong>. 2-4 days for the rest of Turkey. Free 14-day returns via Aras Kargo, on us.</p>

<h2>Get in touch</h2>
<p>Questions, suggestions, or collaboration ideas — reach us via the <a href="/pages/contact">contact page</a>, or DM on Instagram. We usually reply the same day.</p>

<p class="closing"><em>Modaralist · Bursa, 2024</em></p>
`;

const CONTACT_EN_BODY = `
<p class="lead">Questions, order tracking, returns or partnership — we aim to reply <strong>within 24 hours</strong> on business days.</p>

<h2>Quick contact</h2>
<ul>
<li><strong>WhatsApp:</strong> <a href="https://wa.me/905017008816?text=Hello%20Modaralist%2C">+90 501 700 88 16</a> — fastest channel</li>
<li><strong>Email:</strong> <a href="mailto:admin@modaralist.com">admin@modaralist.com</a></li>
<li><strong>Phone:</strong> <a href="tel:+905017008816">+90 501 700 88 16</a></li>
<li><strong>Instagram DM:</strong> <a href="https://instagram.com/modaralist" target="_blank" rel="noopener">@modaralist</a></li>
</ul>

<h2>Working hours</h2>
<ul>
<li><strong>Monday — Friday:</strong> 09:00 — 18:00 (GMT+3)</li>
<li><strong>Saturday:</strong> 10:00 — 16:00</li>
<li><strong>Sunday:</strong> Closed</li>
</ul>
<p>Weekend and holiday messages are handled the next business day. Order tracking is available 24/7 from your account or the Aras Kargo SMS.</p>

<h2>Address</h2>
<p><strong>Trend Iş Güvenliği Malzemeleri Tekstil San.Tic.Ltd.Şti.</strong><br/>
Kazım Karabekir Mahallesi, 2. Konuk Sokak No:3<br/>
Yıldırım / BURSA<br/>
Turkey</p>

<p><em>This address handles production and returns. Please book in advance for in-person visits — we operate as a workshop and may not always be able to host walk-ins.</em></p>

<h2>Social</h2>
<ul>
<li><strong>Instagram:</strong> <a href="https://instagram.com/modaralist" target="_blank" rel="noopener">@modaralist</a></li>
<li><strong>TikTok:</strong> <a href="https://tiktok.com/@modaralist" target="_blank" rel="noopener">@modaralist</a></li>
</ul>

<h2>By topic</h2>
<ul>
<li><strong>Order tracking / shipping issues:</strong> WhatsApp with order number (fastest)</li>
<li><strong>Returns and exchanges:</strong> <a href="/pages/returns">Returns guide</a> — step-by-step; for requests use email</li>
<li><strong>Wholesale / B2B:</strong> admin@modaralist.com — subject "Wholesale"</li>
<li><strong>Partnerships / influencer / press:</strong> admin@modaralist.com — with portfolio/IG link</li>
<li><strong>Legal / data requests (KVKK):</strong> admin@modaralist.com or KEP: ozkan.galak@hs01.kep.tr</li>
</ul>

<h2>FAQ</h2>
<p>Your question may already be answered in the <a href="/pages/faq">FAQ</a> — shipping times, returns, payment, drops are all covered there.</p>
`;

export const INFO_PAGES: InfoPage[] = [
  {
    slug: "about",
    tr: {
      title: "Hakkımızda",
      body: ABOUT_TR_BODY,
      seoTitle: "Hakkımızda — Modaralist Bursa Streetwear",
      seoDesc:
        "Modaralist: Bursa'da üretilen sınırlı sayıda numaralı koleksiyonlar. Streetwear, oversize, outdoor. Made in Turkey. Marmara'ya hızlı kargo.",
    },
    en: {
      title: "About",
      body: ABOUT_EN_BODY,
      seoTitle: "About — Modaralist Bursa Streetwear",
      seoDesc:
        "Modaralist: limited-edition numbered streetwear from Bursa. Oversize, t-shirt, sweatshirt, outdoor. Made in Turkey. Fast shipping across Marmara.",
    },
  },
  {
    slug: "contact",
    tr: {
      title: "İletişim",
      body: CONTACT_TR_BODY,
      seoTitle: "İletişim — Modaralist",
      seoDesc:
        "WhatsApp +90 501 700 88 16, e-posta admin@modaralist.com, Instagram @modaralist. Bursa Yıldırım adresimiz, çalışma saatleri ve konu bazlı yönlendirme.",
    },
    en: {
      title: "Contact",
      body: CONTACT_EN_BODY,
      seoTitle: "Contact — Modaralist",
      seoDesc:
        "WhatsApp +90 501 700 88 16, email admin@modaralist.com, Instagram @modaralist. Bursa Yıldırım address, working hours, and topic-based contact.",
    },
  },
];
