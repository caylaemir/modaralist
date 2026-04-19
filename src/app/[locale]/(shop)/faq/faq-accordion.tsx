"use client";

import { AnimatePresence, motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";

type Item = {
  q: string;
  a: string;
};

const ITEMS: Item[] = [
  {
    q: "Sipariş ne zaman kargolanır?",
    a: "Hafta içi 14:00'e kadar verilen siparişler aynı gün, sonrasında gelenler bir sonraki iş günü kargoya verilir. Hafta sonu ve resmi tatillerde gönderim yapılmaz; sıradaki ilk iş günü gönderilir.",
  },
  {
    q: "Kargoyu takip edebilir miyim?",
    a: "Siparişin kargoya verildiğinde takip numarası e-posta ile tarafına iletilir. Hesabına girerek 'Siparişlerim' sayfasından da güncel durumu her zaman görebilirsin.",
  },
  {
    q: "Ne kadar sürede gelir?",
    a: "Yurt içi standart gönderilerin teslim süresi 1-3 iş günüdür. İstanbul içi teslimatlar genellikle ertesi gün ulaşır. Uzak noktalarda kargo şirketinin rotasına göre bir iş günü daha sarkabilir.",
  },
  {
    q: "İade süreci nedir?",
    a: "14 gün içinde kullanılmamış, etiketli ve orijinal ambalajında olan ürünleri iade edebilirsin. hello@modaralist.com adresine yazarak iade kodu alıyorsun, anlaşmalı kargoya bırakıyorsun, ürün stüdyomuza ulaştıktan sonra en geç 14 gün içinde ödemenin yapıldığı karta iade başlatılıyor.",
  },
  {
    q: "Bedenini nasıl seçerim?",
    a: "Her ürün sayfasında 'Beden Tablosu' butonuna tıklayarak cm cinsinden ölçüleri görebilirsin. Arasında kaldığın iki beden varsa, rahat bir düşüş istiyorsan büyük olanı; daha oturaklı bir siluet istiyorsan küçük olanı tercih etmeni öneririz.",
  },
  {
    q: "Drop ne demek?",
    a: "Sezon yerine numaralı bölümlerle çalışıyoruz. Her drop (Drop 01, Drop 02...) kendi içinde bir bütün — tek bir konuyu, tek bir paletle anlatır. Sınırlı sayıda üretilir, tükendiğinde tekrar basılmaz.",
  },
  {
    q: "Tükenen parça tekrar gelecek mi?",
    a: "Drop'lar sınırlı üretildiği için tükenen parçalar genellikle yeniden basılmaz. Aynı parçayı arşivden çıkarma kararı aldığımızda bültende duyururuz; ürün sayfasındaki 'Haber Ver' formuna e-postanı bırakırsan stok geldiğinde ilk sen öğrenirsin.",
  },
  {
    q: "Hangi ödeme yöntemleri var?",
    a: "Kredi kartı, banka kartı ve anlaşmalı bankaların taksit seçenekleriyle ödeme yapabilirsin. Tüm işlemler iyzico altyapısı üzerinden 3D Secure ile korunur; kart bilgilerin sunucularımızda saklanmaz.",
  },
  {
    q: "Yurt dışına gönderim var mı?",
    a: "Şu an yalnızca Türkiye içine gönderim yapıyoruz. Uluslararası gönderimi yakın zamanda açmayı planlıyoruz; hazırlandığında bültenden duyuracağız.",
  },
  {
    q: "Fatura nasıl oluyor?",
    a: "Her sipariş için e-arşiv faturası otomatik olarak düzenlenir ve sipariş e-postasıyla birlikte tarafına iletilir. Kurumsal fatura talep ediyorsan ödeme aşamasında vergi bilgilerini eksiksiz girmen yeterli.",
  },
];

export function FaqAccordion() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <ul className="mt-4 divide-y divide-mist/20 border-t border-b border-mist/20">
      {ITEMS.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={i}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              className="flex w-full items-start justify-between gap-6 py-6 text-left"
            >
              <span className="display text-xl text-ink md:text-2xl">
                {item.q}
              </span>
              <motion.span
                initial={false}
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-1 shrink-0"
              >
                <Plus className="size-5 text-ink" />
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <p className="pb-6 pr-12 text-base leading-relaxed text-mist">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
