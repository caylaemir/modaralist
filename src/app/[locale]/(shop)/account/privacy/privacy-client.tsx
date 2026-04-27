"use client";

import { useState, useTransition } from "react";
import { Download, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteAccountAction } from "./actions";

export function PrivacyClient({ userEmail }: { userEmail: string }) {
  const [downloading, setDownloading] = useState(false);
  const [deletePending, startDeleteTransition] = useTransition();
  const [confirmText, setConfirmText] = useState("");

  async function onDownload() {
    setDownloading(true);
    try {
      const res = await fetch("/api/account/export");
      if (!res.ok) {
        toast.error("Indirme basarisiz");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `modaralist-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Verin indirildi");
    } catch {
      toast.error("Hata olustu");
    } finally {
      setDownloading(false);
    }
  }

  function onDelete() {
    if (confirmText.trim().toLowerCase() !== "sil") {
      toast.error('Onaylamak icin "sil" yaz');
      return;
    }
    startDeleteTransition(async () => {
      try {
        await deleteAccountAction();
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Silinemedi"
        );
      }
    });
  }

  return (
    <div className="mt-12 space-y-10">
      {/* Veri indir */}
      <section className="border border-line bg-paper p-6 md:p-8">
        <div className="flex items-start justify-between gap-6">
          <div>
            <h3 className="text-base font-medium">Verimi indir</h3>
            <p className="mt-2 text-sm leading-relaxed text-mist">
              Profil bilgilerin, siparişlerin, adreslerin, yorumların ve
              favorilerin tek bir JSON dosyasında. KVKK madde 11.
            </p>
          </div>
          <button
            type="button"
            onClick={onDownload}
            disabled={downloading}
            className="inline-flex shrink-0 items-center gap-3 border border-ink px-5 py-3 text-[11px] uppercase tracking-[0.3em] hover:bg-ink hover:text-paper disabled:opacity-50"
          >
            {downloading ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Download className="size-3.5" />
            )}
            Indir
          </button>
        </div>
      </section>

      {/* Hesabi sil */}
      <section className="border border-red-200 bg-red-50/30 p-6 md:p-8">
        <div className="flex items-start gap-3">
          <Trash2 className="mt-1 size-5 shrink-0 text-red-600" />
          <div className="flex-1">
            <h3 className="text-base font-medium text-red-900">
              Hesabımı kalıcı sil
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-red-800/80">
              <strong>{userEmail}</strong> hesabını ve onunla bağlantılı tüm
              kişisel veriyi (profil, adres, favoriler, yorumlar, newsletter
              aboneliği) sileriz.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-red-800/80">
              <strong>Sipariş + fatura kayıtları</strong> Türk Ticaret Kanunu
              uyarınca 10 yıl sistemde kalır ama isim/e-posta/telefon
              anonimleştirilir.
            </p>
            <p className="mt-3 text-sm font-medium text-red-900">
              Bu işlem geri alınamaz.
            </p>

            <div className="mt-6">
              <label className="text-[11px] uppercase tracking-[0.3em] text-red-900">
                Onaylamak için <span className="font-mono">sil</span> yaz
              </label>
              <div className="mt-2 flex items-center gap-3">
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="sil"
                  className="flex-1 border-b border-red-300 bg-transparent py-2 text-sm outline-none focus:border-red-600"
                />
                <button
                  type="button"
                  onClick={onDelete}
                  disabled={
                    deletePending ||
                    confirmText.trim().toLowerCase() !== "sil"
                  }
                  className="inline-flex shrink-0 items-center gap-3 bg-red-600 px-5 py-3 text-[11px] uppercase tracking-[0.3em] text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {deletePending ? (
                    <Loader2 className="size-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="size-3.5" />
                  )}
                  Hesabı Sil
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
