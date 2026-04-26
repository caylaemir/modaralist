/**
 * SSS verisi — hem /pages/faq sayfasinda accordion render edilir,
 * hem FAQPage JSON-LD olarak Google'a gonderilir (rich snippet).
 *
 * Soru/cevap eklemek istersen sadece bu listeye satir ekle —
 * UI ve schema otomatik guncellenecek.
 */

export type FaqItem = {
  question: string;
  answer: string;
};

export const FAQS_TR: FaqItem[] = [
  {
    question: "Kaç günde teslim alırım?",
    answer:
      "Standart kargo Marmara bölgesine 1-2 iş günü, diğer şehirlere 2-4 iş günü. Hızlı kargo siparişin onaylandığı günü takip eden iş günü teslim edilir. Kargolanınca takip numaran SMS ve email ile gelir.",
  },
  {
    question: "Kargo ücretsiz mi?",
    answer:
      "Belirli bir tutarın üstündeki standart kargo siparişleri ücretsizdir (sepet sayfasında ne kadar daha eklenmesi gerektiği görünür). Hızlı kargo her zaman ücretlidir.",
  },
  {
    question: "İade ve değişim nasıl olur?",
    answer:
      "Etiketleri sökülmemiş, denenmiş ama giyilmemiş ürünler için 14 gün iade hakkın var. Ürünü orijinal ambalajında bize göndermen yeterli; kargo ücreti tarafımızca karşılanır. İade onaylanınca ödemen 5-10 iş günü içinde aynı kart/hesaba geri yatırılır.",
  },
  {
    question: "Hangi ödeme yöntemlerini kabul ediyorsunuz?",
    answer:
      "iyzico altyapısı üzerinden tüm Visa, Mastercard ve American Express kartları kabul ediyoruz. Tek çekim veya 3 taksit seçenekleri var. Kart bilgilerin sunucumuzda saklanmaz, doğrudan iyzico ile şifrelenir.",
  },
  {
    question: "Bedenim olmayan ürün için haber alabilir miyim?",
    answer:
      "Tükenen bedeni olan üründe \"Geldiğinde haber ver\" butonu gözükür. Email'ini bırakırsan stok geldiğinde sana ilk biz haber veririz. Drop'lar sınırlı üretim olduğu için bazen tekrar üretilmeyebilir.",
  },
  {
    question: "Drop nedir? Tekrar üretiliyor mu?",
    answer:
      "Drop, sınırlı sayıda üretilen sezonluk koleksiyonumuzdur. Numaralandırılır ve genellikle bir daha basılmaz. Bittiğinde ürün arşive geçer; tekrar üretim nadirdir.",
  },
  {
    question: "Sipariş verdikten sonra adresimi değiştirebilir miyim?",
    answer:
      "Sipariş kargoya verilmeden önce değiştirebiliriz. WhatsApp veya email üzerinden sipariş numaranla bize ulaş; mümkün olan en kısa sürede güncelleriz.",
  },
  {
    question: "KVKK kapsamında verilerim güvende mi?",
    answer:
      "Evet. Ad-soyad, telefon ve adres bilgilerin sadece sipariş işleme + kargo amaçlı kullanılır. Kart bilgilerin asla bizde saklanmaz (PCI-DSS uyumlu iyzico'ya direkt iletilir). Tüm haklarını /pages/kvkk üzerinden okuyabilir, hesabından verilerini indirebilir veya silebilirsin.",
  },
  {
    question: "Yurt dışına kargo yapıyor musunuz?",
    answer:
      "Şu an sadece Türkiye içine gönderim yapıyoruz. Yurt dışı kargo yakında eklenecek — Newsletter'a kayıt olursan hazır olduğunda haberdar olursun.",
  },
];

export const FAQS_EN: FaqItem[] = [
  {
    question: "How long does delivery take?",
    answer:
      "Standard shipping: 1-2 business days for Marmara region, 2-4 days for other cities. Express shipping arrives the next business day after order confirmation. Tracking number is sent by SMS and email once shipped.",
  },
  {
    question: "Is shipping free?",
    answer:
      "Standard shipping is free above a certain order amount (shown in cart). Express shipping is always charged.",
  },
  {
    question: "What's your return policy?",
    answer:
      "14-day return window for items with tags intact. Send the item in original packaging — return shipping is on us. Refunds are issued to the original payment method within 5-10 business days.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Visa, Mastercard and American Express via iyzico. Single payment or 3 installments. Card data is never stored on our servers — encrypted directly with iyzico.",
  },
  {
    question: "Can I get notified when my size restocks?",
    answer:
      "Sold-out items show a \"Notify me\" button. Drops are limited edition and may not be restocked.",
  },
];

/**
 * FAQPage JSON-LD object — script tag icine stringify edilir.
 * Google'a sayfada hangi sorular oldugunu soyler, SERP'te accordion olarak cikar.
 */
export function faqJsonLd(faqs: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.answer,
      },
    })),
  };
}
