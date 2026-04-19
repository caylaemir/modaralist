export default function AdminDashboard() {
  const stats = [
    { label: "Bugünkü Sipariş", value: "—" },
    { label: "Bugünkü Ciro", value: "—" },
    { label: "Bekleyen Sipariş", value: "—" },
    { label: "Düşük Stok", value: "—" },
  ];

  return (
    <div>
      <h1 className="display text-4xl">Panel</h1>
      <p className="mt-2 text-sm text-mist">
        Hoş geldin. Buradan her şeyi yönetebilirsin.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className="rounded border border-line bg-paper p-6"
          >
            <p className="eyebrow text-mist">{s.label}</p>
            <p className="display mt-3 text-4xl">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-10 rounded border border-line bg-paper p-8">
        <h2 className="caps-wide text-sm">Yapılacaklar</h2>
        <ul className="mt-4 space-y-2 text-sm text-mist">
          <li>• İlk ürünü ekle</li>
          <li>• Bir koleksiyon (drop) oluştur</li>
          <li>• iyzico API anahtarlarını ayarla</li>
          <li>• Nilvera e-Arşiv bağlantısını kur</li>
          <li>• Ana sayfa bloklarını düzenle</li>
        </ul>
      </div>
    </div>
  );
}
