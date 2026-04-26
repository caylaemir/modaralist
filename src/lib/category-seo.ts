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
  sweatshirt: {
    slug: "sweatshirt",
    name: "Sweatshirt",
    h1: "Sweatshirt Modelleri — Modaralist Sweatshirt Koleksiyonu",
    metaTitle: "Sweatshirt Modelleri | Kapüşonlu & Bisiklet Yaka | Modaralist",
    metaDescription:
      "Marmara bölgesinde sweatshirt modelleri, kapüşonlu sweatshirt ve bisiklet yaka seçenekleri. İstanbul, Bursa, Kocaeli'ne hızlı kargo. Pamuklu, kalın dokulu.",
    intro:
      "Sezonun yumuşak başlangıcı: kapüşonlu sweatshirt, bisiklet yaka sweatshirt ve kanguru cep modelleri.",
    longDescription:
      "Modaralist sweatshirt koleksiyonu Marmara bölgesinin değişken iklimi için ideal. " +
      "Kalın dokulu pamuk-polyester karışımı, içi şardonlu dokumalar, sıcak ama nefes alan kumaşlar. " +
      "Kapüşonlu sweatshirt, bisiklet yaka sweatshirt, kanguru cepli ve fermuarlı modeller. " +
      "İstanbul'un nemli kışında, Bursa'nın karlı sokaklarında, Kocaeli'nin rüzgarlı limanında — her yere uygun. " +
      "Hızlı kargo ile Marmara'nın her şehrine 1-2 günde teslim.",
    keywords: [
      "sweatshirt",
      "kapüşonlu sweatshirt",
      "bisiklet yaka sweatshirt",
      "marmara sweatshirt",
      "istanbul sweatshirt",
      "kalın sweatshirt",
      "pamuklu sweatshirt",
      "kadın sweatshirt",
      "erkek sweatshirt",
      "fermuarlı sweatshirt",
    ],
  },
  oversize: {
    slug: "oversize",
    name: "Oversize",
    h1: "Oversize Modelleri — Modaralist Streetwear Geniş Kesim",
    metaTitle: "Oversize Giyim | Geniş Kesim Tişört, Sweatshirt | Modaralist",
    metaDescription:
      "Oversize tişört, oversize sweatshirt, geniş kesim modeller Marmara bölgesinde Modaralist'te. Streetwear estetiği, vintage washed. İstanbul, Bursa'ya aynı gün kargo.",
    intro:
      "Geniş omuz, düşük kol, oversize silüet. Streetwear estetiğinin merkezindeki parça — tişört, sweatshirt, hoodie.",
    longDescription:
      "Oversize — Modaralist'in imza streetwear silüeti. Klasik kesim parçalardan " +
      "farklı olarak omuz hattı düşürülmüş, kollar geniş, beden olduğundan iri görünür. " +
      "Marmara bölgesinde modaya uyak tutmak isteyenler için: İstanbul'un Karaköy ve Cihangir " +
      "sokaklarından, Bursa'nın FSM bulvarına, Kocaeli marinasından Tekirdağ sahiline kadar. " +
      "Oversize tişört, oversize sweatshirt, oversize hoodie, oversize gömlek modelleri. " +
      "Premium pamuk, ağır gramajlı (250-400 gr) kumaşlar, vintage washed renkler. " +
      "Erkek ve kadın için unisex kalıp, S-XL beden aralığı.",
    keywords: [
      "oversize",
      "oversize tişört",
      "oversize sweatshirt",
      "oversize hoodie",
      "oversize gömlek",
      "geniş kesim",
      "streetwear",
      "marmara streetwear",
      "istanbul oversize",
      "vintage oversize",
      "unisex oversize",
    ],
  },
  outdoor: {
    slug: "outdoor",
    name: "Outdoor",
    h1: "Outdoor Giyim — Doğa Sporları için Modaralist Koleksiyonu",
    metaTitle: "Outdoor Giyim | Trekking, Kamp, Hiking | Modaralist Marmara",
    metaDescription:
      "Outdoor giyim Marmara bölgesinde Modaralist'te. Trekking, kamp, hiking, dağcılık için fonksiyonel parçalar. İstanbul, Bursa, Sakarya'ya hızlı kargo.",
    intro:
      "Doğa sporları, kamp, trekking, hiking ve dağcılık için tasarlanmış fonksiyonel outdoor parçalar.",
    longDescription:
      "Modaralist outdoor koleksiyonu Marmara'nın doğa rotalarını sevenler için. " +
      "Uludağ kayak merkezi, Kazdağları trekking parkurları, Yalova termal yürüyüş yolları, " +
      "Belgrad ormanı, Sapanca gölü çevresi, Iğneada longoz ormanları, Sakarya kanyon turları — " +
      "Marmara'nın her doğa noktasında işine yarar. Su ve rüzgar geçirmez ceket, fonksiyonel pantolon, " +
      "kargo şort, taktik tişört, çıkarılabilir kapüşonlu mont, yansıtıcı detaylı yelek modelleri. " +
      "Erkek ve kadın için fonksiyonel kesim, S-XXL beden seçenekleri. Aynı gün kargolama.",
    keywords: [
      "outdoor",
      "outdoor giyim",
      "trekking giyim",
      "doğa sporu giyim",
      "kamp giyim",
      "hiking",
      "dağcılık",
      "marmara outdoor",
      "uludağ outdoor",
      "kadın outdoor",
      "erkek outdoor",
      "su geçirmez",
      "rüzgar geçirmez",
    ],
  },
  polar: {
    slug: "polar",
    name: "Polar",
    h1: "Polar Modelleri — Modaralist Polar Koleksiyonu",
    metaTitle: "Polar Modelleri | Kışlık & Outdoor Polar | Modaralist Marmara",
    metaDescription:
      "Polar modelleri Marmara bölgesinde Modaralist'te. Microfleece, kışlık polar, fermuarlı polar. İstanbul, Bursa, Kocaeli'ne hızlı kargo.",
    intro:
      "Hafif, sıcak, hızlı kuruyan polar modelleri. Microfleece teknolojisi ile günlük ve doğa için.",
    longDescription:
      "Modaralist polar koleksiyonu Marmara'nın soğuk aylarına hazır. " +
      "İstanbul'un nemli kışında ısıtan, Uludağ'da hafif kalan, Sapanca gölü kıyısında nefes alan polar. " +
      "Microfleece teknolojisi, fermuarlı ön cep, yarım fermuar boğazlı veya tam fermuar açma kapama. " +
      "Hızlı kuruyan, hafif, ısı tutan, nefes alan polyester polar kumaş. " +
      "Kışlık polar, outdoor polar, çocuk polar ve kadın/erkek günlük polar modelleri. " +
      "S-XXL beden seçenekleri. Marmara'ya 1-2 iş günü kargo.",
    keywords: [
      "polar",
      "polar bere",
      "polar mont",
      "polar yelek",
      "microfleece",
      "kışlık polar",
      "outdoor polar",
      "trekking polar",
      "marmara polar",
      "istanbul polar",
      "kadın polar",
      "erkek polar",
      "fermuarlı polar",
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
