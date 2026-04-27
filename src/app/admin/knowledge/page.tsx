import { db } from "@/lib/db";
import { KnowledgeClient } from "./knowledge-client";

export const dynamic = "force-dynamic";

const SUGGESTED_TITLES = [
  "Kargo Süreci",
  "İade Süreci",
  "Beden Tablosu",
  "Sipariş Takibi",
  "Ödeme Yöntemleri",
  "Stok Yenileme",
  "Drop Sistemi",
  "Müşteri Hizmetleri",
];

export default async function KnowledgePage() {
  const entries = await db.knowledgeBase.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div>
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — selooai
        </p>
        <h1 className="display mt-3 text-5xl leading-none">Bilgi Bankası</h1>
        <p className="mt-4 max-w-2xl text-sm text-mist">
          SelooAI'nin müşteri sorularını cevaplarken kullandığı bilgi
          parçaları. Fiyat/stok/varyant DB'den canlı geldiği için burada
          tekrar yazma — bu sayfa <strong>nüanslı süreç soruları</strong> için:
          kargo süreci, iade adımları, beden tablosu, ödeme yöntemleri vs.
          Müşteri sorduğunda Selo bu bilgileri tarayıp özetleyerek cevaplar.
        </p>
        <p className="mt-3 max-w-2xl text-[12px] text-mist">
          <strong>Anahtar kelimeler</strong> alanı virgülle ayrılır (örn:{" "}
          <span className="font-mono text-ink">kargo, ücret, fiyat, ne kadar</span>) —
          müşterinin sorabileceği farklı kelimeleri burada belirt, eşleşme
          şansı artar.
        </p>
      </header>

      {entries.length === 0 ? (
        <section className="mt-8 border border-dashed border-line bg-bone/40 p-6 text-center">
          <p className="text-[10px] uppercase tracking-[0.3em] text-mist">
            önerilen başlıklar (öneri)
          </p>
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            {SUGGESTED_TITLES.map((t) => (
              <span
                key={t}
                className="border border-line bg-paper px-3 py-1.5 text-[11px] text-ink"
              >
                {t}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <KnowledgeClient
        initial={entries.map((e) => ({
          id: e.id,
          title: e.title,
          content: e.content,
          keywords: e.keywords ?? "",
          isActive: e.isActive,
          sortOrder: e.sortOrder,
          updatedAt: e.updatedAt,
        }))}
      />
    </div>
  );
}
