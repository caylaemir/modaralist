/**
 * Marmara bölgesi odaklı kategori SEO metinleri.
 * Her kategori için title, description, h1, tanıtım metni
 * ve hedeflenen şehir/anahtar kelimeler.
 */

export type CategorySeo = {
  slug: string;
  name: string;
  h1: string;
  metaTitle: string;
  metaDescription: string;
  intro: string;
  longDescription: string;
  keywords: string[];
};

const MARMARA_CITIES = [
  "İstanbul",
  "Bursa",
  "Kocaeli",
  "Tekirdağ",
  "Edirne",
  "Balıkesir",
  "Çanakkale",
  "Yalova",
  "Sakarya",
  "Bilecik",
  "Kırklareli",
];

export const CATEGORY_SEO_TR: Record<string, CategorySeo> = {
  tisort: {
    slug: "tisort",
    name: "Tişört",
    h1: "Tişört Modelleri — Marmara Bölgesi'ne Hızlı Kargo",
    metaTitle:
      "Tişört Modelleri | Erkek & Kadın Tişört | Modaralist Marmara",
    metaDescription:
      "Marmara bölgesinde en yeni tişört modelleri Modaralist'te. İstanbul, Bursa, Kocaeli'ne aynı gün kargo. %100 pamuk basic, oversize ve baskılı tişört seçenekleri.",
    intro:
      "Marmara'nın her köşesine ulaşan basic, oversize ve baskılı tişört koleksiyonumuz. %100 pamuk, sezonun parçaları, sınırlı üretim.",
    longDescription:
      "Modaralist tişört koleksiyonu Marmara bölgesinde modaya yön verenler için tasarlandı. " +
      "Premium pamuk dokular, modern kesimler ve şehirli silüetler. İstanbul, Bursa, Kocaeli, " +
      "Tekirdağ, Sakarya, Yalova, Balıkesir, Çanakkale ve diğer Marmara şehirlerine 1-2 iş günü içinde " +
      "kargolanır. Erkek ve kadın için basic tişört, oversize tişört, baskılı tişört modelleri. " +
      "Yıkamaya dayanıklı kumaş, solmayan baskı, sezonsuz silüet — drop'lar bittiğinde bir daha basılmaz.",
    keywords: [
      "tişört",
      "marmara tişört",
      "istanbul tişört",
      "oversize tişört",
      "basic tişört",
      "pamuk tişört",
      "kadın tişört",
      "erkek tişört",
      "online tişört",
    ],
  },
  sweat: {
    slug: "sweat",
    name: "Sweat",
    h1: "Sweat Modelleri — Modaralist Sweat Koleksiyonu",
    metaTitle: "Sweat Modelleri | Kapüşonlu & Bisiklet Yaka | Modaralist",
    metaDescription:
      "Marmara bölgesinde sweat modelleri, kapüşonlu sweat ve bisiklet yaka sweatshirt seçenekleri. İstanbul, Bursa, Kocaeli'ne hızlı kargo. Pamuklu, kalın dokulu, oversize.",
    intro:
      "Sezonun yumuşak başlangıcı: kapüşonlu sweat, bisiklet yaka sweat ve kanguru cep modelleri.",
    longDescription:
      "Modaralist sweat koleksiyonu Marmara bölgesinin değişken iklimi için ideal. " +
      "Kalın dokulu pamuk-polyester karışımı, içi şardonlu dokumalar, sıcak ama nefes alan kumaşlar. " +
      "Kapüşonlu sweat, bisiklet yaka sweatshirt, kanguru cepli ve fermuarlı modeller. " +
      "İstanbul'un nemli kışında, Bursa'nın karlı sokaklarında, Kocaeli'nin rüzgarlı limanında — her yere uygun. " +
      "Hızlı kargo ile Marmara'nın her şehrine 1-2 günde teslim.",
    keywords: [
      "sweat",
      "sweatshirt",
      "kapüşonlu sweat",
      "bisiklet yaka sweat",
      "marmara sweat",
      "istanbul sweatshirt",
      "kalın sweat",
      "pamuklu sweat",
      "kadın sweat",
      "erkek sweat",
    ],
  },
  "oversize-sweatshirt": {
    slug: "oversize-sweatshirt",
    name: "Oversize Sweatshirt",
    h1: "Oversize Sweatshirt — Modaralist Streetwear",
    metaTitle:
      "Oversize Sweatshirt | Geniş Kesim Sweat Modelleri | Modaralist",
    metaDescription:
      "Oversize sweatshirt modelleri Marmara bölgesinde Modaralist'te. Streetwear modaya uygun geniş kesim, kalın doku. İstanbul, Bursa'ya aynı gün kargo.",
    intro:
      "Geniş omuz, düşük kol, oversize silüet. Streetwear estetiğinin merkezindeki parça.",
    longDescription:
      "Oversize sweatshirt — Modaralist'in imza streetwear silüeti. Klasik kesim sweatshirt'lerden " +
      "farklı olarak omuz hattı düşürülmüş, kollar geniş, beden olduğundan iri görünür. " +
      "Marmara bölgesinde modaya uyak tutmak isteyenler için: İstanbul'un Karaköy ve Cihangir " +
      "sokaklarından, Bursa'nın FSM bulvarına, Kocaeli marinasından Tekirdağ sahiline kadar. " +
      "Premium pamuk, ağır gramajlı (350+ gr) kumaş, içi şardon, vintage washed renkler. " +
      "Erkek ve kadın için unisex kalıp, S-XL beden aralığı.",
    keywords: [
      "oversize sweatshirt",
      "oversize sweat",
      "geniş kesim sweat",
      "streetwear sweatshirt",
      "marmara streetwear",
      "istanbul oversize",
      "vintage sweatshirt",
      "350gr sweatshirt",
      "unisex sweatshirt",
    ],
  },
  "outdoor-polar": {
    slug: "outdoor-polar",
    name: "Outdoor Polar",
    h1: "Outdoor Polar — Doğa Sporları için Modaralist Koleksiyonu",
    metaTitle: "Outdoor Polar | Doğa Sporu Polar Modelleri | Modaralist",
    metaDescription:
      "Outdoor polar modelleri Marmara bölgesinde Modaralist'te. Trekking, kamp, hiking için sıcak tutan polar. İstanbul, Bursa, Sakarya'ya hızlı kargo.",
    intro:
      "Doğa sporları, kamp, trekking için tasarlanmış outdoor polar koleksiyonumuz. Hafif, sıcak, hızlı kuruyan.",
    longDescription:
      "Modaralist outdoor polar koleksiyonu Marmara'nın doğa rotalarını sevenler için. " +
      "Uludağ kayak merkezi, Kazdağları trekking parkurları, Yalova termal yürüyüş yolları, " +
      "Belgrad ormanı, Sapanca gölü çevresi — Marmara'nın her doğa noktasında işine yarar. " +
      "Microfleece teknolojisi, fermuarlı ön cep, yarım fermuar boğazlı veya tam fermuar açma kapama. " +
      "Hızlı kuruyan, hafif, ısı tutan, nefes alan polyester polar kumaş. " +
      "Erkek ve kadın için fonksiyonel kesim, S-XXL beden seçenekleri. Aynı gün kargolama.",
    keywords: [
      "outdoor polar",
      "polar",
      "trekking polar",
      "doğa sporu polar",
      "marmara outdoor",
      "uludağ polar",
      "kamp polar",
      "hiking polar",
      "microfleece",
      "kadın polar",
      "erkek polar",
    ],
  },
  esofman: {
    slug: "esofman",
    name: "Eşofman",
    h1: "Eşofman Modelleri — Spor & Lounge Eşofman Modaralist",
    metaTitle:
      "Eşofman Modelleri | Spor & Günlük Eşofman | Modaralist Marmara",
    metaDescription:
      "Eşofman altı, spor eşofman, lounge eşofman modelleri Marmara bölgesinde Modaralist'te. İstanbul, Bursa, Kocaeli'ne hızlı kargo. Pamuklu, jogger kesim.",
    intro:
      "Spor için, gezerken giymek için, evde keyif için. Pamuklu, jogger ve klasik eşofman modelleri.",
    longDescription:
      "Modaralist eşofman koleksiyonu hem konfor hem stil arayanlar için. " +
      "Marmara bölgesinde sporcu, koşucu, fitness severler için yüksek kaliteli pamuklu eşofman altı. " +
      "Jogger kesim, klasik düz paça, manşetli model seçenekleri. Cepli, yan dikişli, lastik beli + bağcık. " +
      "Premium pamuk dokular nefes alır, terlemeyi yönetir, yıkamaya dayanır. " +
      "İstanbul'un Maçka parkından, Bursa'nın Kültürpark'ına, Sakarya'nın sahil yürüyüşüne kadar. " +
      "Aynı zamanda evde lounge wear olarak ideal — şık ve rahat. Erkek ve kadın bedenleri.",
    keywords: [
      "eşofman",
      "eşofman altı",
      "jogger eşofman",
      "spor eşofman",
      "pamuklu eşofman",
      "marmara eşofman",
      "istanbul eşofman",
      "lounge eşofman",
      "kadın eşofman",
      "erkek eşofman",
    ],
  },
  sort: {
    slug: "sort",
    name: "Şort",
    h1: "Şort Modelleri — Yaz Şortu Modaralist Koleksiyonu",
    metaTitle: "Şort Modelleri | Yaz & Spor Şortu | Modaralist Marmara",
    metaDescription:
      "Şort modelleri Marmara bölgesinde Modaralist'te. Yaz şortu, spor şortu, plaj şortu. İstanbul, Bursa, Kocaeli'ne hızlı kargo.",
    intro:
      "Yazın hafif parçası: spor şort, plaj şort, günlük şort modelleri.",
    longDescription:
      "Modaralist şort koleksiyonu Marmara'nın sıcak yaz aylarına hazır. " +
      "Antalya'ya gitmeden Marmara'nın kendi sahillerini keşfet — Avşa, Marmara adası, " +
      "Çınarcık, Erdek, Kapıdağ, Saroz körfezi. Plajda şık şort, koşuda fonksiyonel şort, " +
      "günlük gezilerde rahat şort. Pamuk-polyester karışımı kumaşlar, hızlı kurur, nefes alır. " +
      "Cepli, kemer lastikli, bağcıklı, fermuarlı modeller. Erkek ve kadın için " +
      "5\", 7\", 9\" boy seçenekleri. Marmara bölgesine 1-2 iş günü kargo.",
    keywords: [
      "şort",
      "yaz şortu",
      "spor şortu",
      "plaj şortu",
      "marmara şort",
      "istanbul şort",
      "erkek şort",
      "kadın şort",
      "denim şort",
    ],
  },
};

export const MARMARA_REGION = {
  name: "Marmara Bölgesi",
  cities: MARMARA_CITIES,
  geo: {
    region: "TR-34", // İstanbul ISO code
    placename: "İstanbul, Marmara Bölgesi",
    latitude: "41.0082",
    longitude: "28.9784",
  },
};
