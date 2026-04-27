import Link from "next/link";
import { ImportClient } from "./import-client";

export const dynamic = "force-dynamic";

const SAMPLE_CSV = `slug,categorySlug,basePrice,discountPrice,status,trName,enName,trDescription,enDescription,trMaterial,enMaterial,trCare,enCare,images
ornek-tisort,tshirt,1990,,DRAFT,Örnek Tişört,Sample T-shirt,"%100 pamuk, oversize kesim","100% cotton, oversize fit",%100 pamuk,100% cotton,30°C yıka,Wash 30°C,https://res.cloudinary.com/x/a.jpg|https://res.cloudinary.com/x/b.jpg
ornek-sweat,sweatshirt,2490,1990,DRAFT,Örnek Sweatshirt,Sample Sweatshirt,Kalın dokulu,Heavyweight,Pamuk-polyester,Cotton-polyester,Soğukta yıka,Cold wash,`;

export default function ImportPage() {
  return (
    <div>
      <header>
        <p className="text-[10px] uppercase tracking-[0.4em] text-mist">
          — toplu yükleme
        </p>
        <h1 className="display mt-3 text-5xl leading-none">CSV Import</h1>
        <p className="mt-4 max-w-2xl text-sm text-mist">
          Excel'den export ettiğin CSV ile birden çok ürünü tek seferde
          ekleyebilirsin. Var olan slug'lar atlanır, sadece yenileri eklenir
          (idempotent). Status DRAFT olarak gelir — Yayında'ya admin'den geçir.
        </p>
        <Link
          href="/admin/products"
          className="mt-3 inline-block text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
        >
          ← Ürünlere dön
        </Link>
      </header>

      <section className="mt-10 border-t border-line pt-8">
        <h2 className="caps-wide text-sm">Format</h2>
        <p className="mt-2 text-[12px] text-mist">
          1. satır header. Zorunlu kolonlar: <strong>slug</strong>,{" "}
          <strong>categorySlug</strong>, <strong>basePrice</strong>,{" "}
          <strong>trName</strong>, <strong>enName</strong>. Diğerleri
          opsiyonel. <strong>images</strong> alanı pipe ile ayrılmış URL listesi
          (ilk = ana, ikinci = hover).
        </p>
        <details className="mt-4 group">
          <summary className="cursor-pointer text-[11px] uppercase tracking-[0.3em] text-ink">
            Örnek CSV göster →
          </summary>
          <pre className="mt-3 overflow-x-auto border border-line bg-bone/40 p-4 font-mono text-[11px] leading-relaxed">
{SAMPLE_CSV}
          </pre>
          <a
            href={`data:text/csv;charset=utf-8,${encodeURIComponent(SAMPLE_CSV)}`}
            download="modaralist-product-template.csv"
            className="mt-3 inline-block text-[11px] uppercase tracking-[0.3em] text-mist hover:text-ink"
          >
            Şablonu indir →
          </a>
        </details>
      </section>

      <ImportClient />
    </div>
  );
}
