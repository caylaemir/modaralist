/**
 * Marmara bolgesi sehirleri — lokal SEO landing page'leri icin.
 * Her sehir + 7 kategori kombinasyonu icin static landing page olusur:
 *   /sehir/istanbul/tshirt, /sehir/bursa/sweatshirt vs.
 *
 * Toplam 11 sehir x 7 kategori = 77 ek SEO landing page.
 * Her biri sehir-spesifik intro + kategori urunleri + LocalBusiness schema.
 */

export type MarmaraCity = {
  slug: string;
  name: string;
  /** GPS koordinatlari — LocalBusiness schema icin */
  lat: number;
  lng: number;
  /** ISO 3166-2 region code (ornek: TR-34 = Istanbul) */
  isoRegion: string;
  /** Sehir hakkinda kisa cumle (intro paragrafinda kullanilir) */
  blurb: string;
  /** Onemli ilceler — long-tail SEO icin */
  districts: string[];
};

export const MARMARA_CITIES: MarmaraCity[] = [
  {
    slug: "istanbul",
    name: "İstanbul",
    lat: 41.0082,
    lng: 28.9784,
    isoRegion: "TR-34",
    blurb:
      "İstanbul'un Avrupa ve Anadolu yakasının her köşesine 1-2 iş günü kargo. Karaköy, Cihangir, Kadıköy, Beşiktaş — şehrin nabzındaki streetwear.",
    districts: [
      "Beşiktaş",
      "Beyoğlu",
      "Kadıköy",
      "Üsküdar",
      "Şişli",
      "Bakırköy",
      "Maltepe",
      "Ataşehir",
    ],
  },
  {
    slug: "bursa",
    name: "Bursa",
    lat: 40.1956,
    lng: 29.061,
    isoRegion: "TR-16",
    blurb:
      "Bursa'nın Nilüfer, Osmangazi ve Yıldırım ilçelerine hızlı kargo. Uludağ kayak sezonuna outdoor + polar koleksiyonu hazır.",
    districts: ["Nilüfer", "Osmangazi", "Yıldırım", "Mudanya", "Gemlik", "İnegöl"],
  },
  {
    slug: "kocaeli",
    name: "Kocaeli",
    lat: 40.8533,
    lng: 29.8815,
    isoRegion: "TR-41",
    blurb:
      "Kocaeli İzmit, Gebze, Darıca'ya 1 iş günü kargo. Sapanca yürüyüşlerinden Marmara sahillerine uygun parçalar.",
    districts: ["İzmit", "Gebze", "Darıca", "Çayırova", "Körfez", "Derince"],
  },
  {
    slug: "tekirdag",
    name: "Tekirdağ",
    lat: 40.978,
    lng: 27.5099,
    isoRegion: "TR-59",
    blurb:
      "Tekirdağ Süleymanpaşa, Çorlu ve Çerkezköy'e hızlı kargo. Saroz körfezi sahilleri için yaz koleksiyonu.",
    districts: ["Süleymanpaşa", "Çorlu", "Çerkezköy", "Kapaklı", "Marmara Ereğlisi"],
  },
  {
    slug: "edirne",
    name: "Edirne",
    lat: 41.6764,
    lng: 26.5557,
    isoRegion: "TR-22",
    blurb:
      "Edirne'nin Trakya esintili sokaklarına Modaralist parçalar. Merkez ve Keşan ilçelerine hızlı kargo.",
    districts: ["Merkez", "Keşan", "Uzunköprü", "Havsa"],
  },
  {
    slug: "balikesir",
    name: "Balıkesir",
    lat: 39.6484,
    lng: 27.8826,
    isoRegion: "TR-10",
    blurb:
      "Balıkesir Bandırma, Edremit ve Ayvalık'a hızlı kargo. Kazdağları trekking + Ayvalık plaj koleksiyonu.",
    districts: ["Karesi", "Altıeylül", "Bandırma", "Edremit", "Ayvalık", "Erdek"],
  },
  {
    slug: "canakkale",
    name: "Çanakkale",
    lat: 40.1553,
    lng: 26.4142,
    isoRegion: "TR-17",
    blurb:
      "Çanakkale merkez ve Biga'ya hızlı kargo. Kazdağları doğa rotalarına outdoor parçalar, ege esintili tişörtler.",
    districts: ["Merkez", "Biga", "Çan", "Lapseki", "Gelibolu"],
  },
  {
    slug: "yalova",
    name: "Yalova",
    lat: 40.6549,
    lng: 29.2842,
    isoRegion: "TR-77",
    blurb:
      "Yalova'nın termal ve doğa yürüyüşlerine uygun parçalar. Merkez, Çiftlikköy ve Termal'e hızlı kargo.",
    districts: ["Merkez", "Çiftlikköy", "Termal", "Çınarcık", "Altınova"],
  },
  {
    slug: "sakarya",
    name: "Sakarya",
    lat: 40.756,
    lng: 30.378,
    isoRegion: "TR-54",
    blurb:
      "Sapanca gölü kıyısı, Sakarya kanyonları için Modaralist outdoor + polar parçaları. Adapazarı ve Serdivan'a hızlı kargo.",
    districts: ["Adapazarı", "Serdivan", "Erenler", "Hendek", "Sapanca", "Karasu"],
  },
  {
    slug: "bilecik",
    name: "Bilecik",
    lat: 40.142,
    lng: 29.9793,
    isoRegion: "TR-11",
    blurb:
      "Bilecik merkez ve Bozüyük'e hızlı kargo. Şehir-doğa arası rotalara uygun parçalar.",
    districts: ["Merkez", "Bozüyük", "Söğüt", "Osmaneli"],
  },
  {
    slug: "kirklareli",
    name: "Kırklareli",
    lat: 41.7333,
    lng: 27.2167,
    isoRegion: "TR-39",
    blurb:
      "Kırklareli merkez, Lüleburgaz ve Iğneada longoz ormanları için Modaralist outdoor koleksiyonu.",
    districts: ["Merkez", "Lüleburgaz", "Babaeski", "Vize", "Demirköy"],
  },
];

export const MARMARA_CITY_SLUGS = MARMARA_CITIES.map((c) => c.slug);

export function getCityBySlug(slug: string): MarmaraCity | undefined {
  return MARMARA_CITIES.find((c) => c.slug === slug);
}
