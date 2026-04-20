# Modaralist — Yapılacaklar

Son güncelleme: 2026-04-19

## Tamamlananlar ✓

### Storefront (demo verilerle çalışıyor)
- [x] Ana sayfa (splash intro, hero carousel, marquee, lineup grid, featured, newsletter)
- [x] `/shop` listeleme (kategori filtre drawer, sıralama, grid)
- [x] `/products/[slug]` ürün detay (galeri, varyant matrisi, beden tablosu, accordion)
- [x] `/drops` + `/drops/[slug]` koleksiyon (countdown, notify-me, manifesto)
- [x] `/cart` sepet (drawer + tam sayfa)
- [x] `/checkout` 3 adımlı ödeme (contact → address → payment + 3DS iframe)
- [x] `/checkout/success` ve `/checkout/failed`
- [x] Auth sayfaları (`/login`, `/register`, `/forgot-password`)
- [x] `/account` (overview + orders + addresses + wishlist + profile)
- [x] 8 statik sayfa (about, contact, kvkk, privacy, terms, distance-sales, returns, faq)
- [x] KVKK çerez banner
- [x] TR/EN i18n (next-intl, middleware)
- [x] Sepet store (Zustand + localStorage persist)
- [x] Lenis smooth scroll
- [x] Onaylı tasarım dili tüm sayfalara yayıldı

### Admin paneli (utility UI)
- [x] Layout + sidebar + auth guard
- [x] Dashboard iskelet
- [x] Products CRUD (list + new + edit + form + delete)
  - TR/EN translations
  - Varyant matrisi (beden × renk, SKU, stok)
  - Görsel yönetimi
  - SEO alanları
- [x] Categories CRUD
- [x] Collections CRUD (drop tarihleri, tema renkleri, ürün seçici)
- [x] Orders list + detail + ActionsPanel (durum güncelleme, kargo no)
- [x] Customers listesi

### Backend
- [x] Prisma 6 schema (30+ model, ayrı translation tabloları)
- [x] Auth.js v5 (Credentials + Google, role guard)
- [x] iyzico 3DS entegrasyonu (initiate + callback + finalize)
- [x] Resend email + order confirmation template
- [x] Cloudinary loader + signed upload endpoint (Supabase'e swap edilecek)
- [x] Kargo webhook endpoint (`/api/webhooks/shipping`)
- [x] Server actions (products, categories, collections, orders, customers)
- [x] Seed script (admin user + 6 ürün + Drop 01)

### DevOps
- [x] GitHub repo: https://github.com/caylaemir/modaralist
- [x] vercel.json (fra1 region, prisma generate + next build)
- [x] Analytics scripts (GA4 + Meta Pixel + TikTok, consent-aware)

---

## Yarın devam ⏳

### 1. Supabase bağlantısı
- [ ] Supabase projesi aç (Frankfurt region — eu-central-1)
- [ ] 5 env var al: `DATABASE_URL` (pooled), `DIRECT_URL` (direct), `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- [ ] `schema.prisma`'ya `directUrl = env("DIRECT_URL")` ekle
- [ ] `npx prisma db push` (tabloları oluştur)
- [ ] `npm run db:seed` (admin user + ürün + drop yükle)
- [ ] Admin login test et (`admin@modaralist.com` / `modaralist-admin-2026`)

### 2. Supabase Storage (görseller)
- [ ] `products` adında public bucket oluştur (Storage → New bucket → public)
- [ ] `src/lib/cloudinary-loader.ts` → `src/lib/supabase-loader.ts` olarak değiştir
- [ ] `src/app/api/upload/sign/route.ts` → Supabase Storage signed URL üretsin
- [ ] Admin product form'da görsel upload'ı Supabase'e bağla
- [ ] `next.config.ts` `remotePatterns`'a Supabase domain'i ekle
- [ ] Demo ürün görselleri Unsplash yerine Supabase'e yükle

### 3. iyzico gerçek entegrasyon
- [ ] iyzico merchant hesabı (sandbox ilk)
- [ ] API key + secret al
- [ ] Sandbox test kartıyla tam akış dene (ürün → sepet → checkout → 3DS → PAID)
- [ ] Production keys'e geç (müşteri onayıyla)

### 4. Resend (email)
- [ ] Resend hesap + API key
- [ ] Domain doğrulama (DNS SPF/DKIM kayıtları)
- [ ] `EMAIL_FROM` ayarla
- [ ] Sipariş onayı mail testi (checkout sonrası)
- [ ] Eksik mail şablonları:
  - [ ] Kargo çıkış bildirimi (shipment update)
  - [ ] Şifre sıfırlama
  - [ ] Newsletter hoş geldin
  - [ ] İptal / iade bildirimleri

### 5. KVKK veri silme akışı
- [ ] `/account/profile` sayfasında "Hesabımı sil talebi" butonuna fonksiyon
- [ ] Admin'de "KVKK talepleri" sekmesi
- [ ] Veri ihracı (kullanıcının sipariş + profil verisini JSON/CSV olarak indirme)

### 6. Auth sayfaları detay
- [ ] Şifre sıfırlama tam akış (token üret, email ile gönder, reset form)
- [ ] Email doğrulama (register sonrası)
- [ ] Google OAuth keys ayarla
- [ ] Rate limiting (Upstash Redis) — drop anı için kritik

### 7. İçerik doldurma
- [ ] Gerçek hakkımızda metni
- [ ] Gerçek iletişim bilgileri (telefon, adres)
- [ ] Gerçek sosyal medya linkleri
- [ ] Logo (SVG)
- [ ] Favicon + app icons
- [ ] Open Graph görselleri (sosyal medya paylaşım için)

### 8. Drop sistemi genişletme
- [ ] "Notify me" POST endpoint → CollectionNotify tablosuna kaydet
- [ ] Drop açılırken abonelere otomatik mail
- [ ] Stok yarışı için rate limiting + optimistic lock
- [ ] Admin'de notify liste görüntüleme + export

### 9. Analytics
- [ ] GA4 property oluştur → `NEXT_PUBLIC_GA_ID` set
- [ ] Meta Pixel ID → `NEXT_PUBLIC_META_PIXEL_ID` set
- [ ] TikTok Pixel ID → `NEXT_PUBLIC_TIKTOK_PIXEL_ID` set
- [ ] E-ticaret event'leri (add_to_cart, begin_checkout, purchase)
- [ ] Vercel Analytics ekle (opsiyonel)
- [ ] Sentry error tracking

### 10. Kargo scripti (müşteri tarafı)
- Endpoint hazır: `POST /api/webhooks/shipping`
- [ ] Müşteri kendi scriptini yazınca `SHIPPING_WEBHOOK_SECRET`'ı paylaş
- [ ] Admin'de manuel kargo takip no girişi formu (tamamlanabilir)

### 11. Nilvera e-Arşiv (daha sonra)
- [ ] Nilvera hesap + API key
- [ ] `src/lib/invoice/nilvera.ts` oluştur
- [ ] Sipariş PAID olunca otomatik fatura oluştur
- [ ] Admin'de fatura PDF indirme butonu
- [ ] (Önce manuel fatura kesmekle başlanabilir MVP'de)

### 12. İyileştirmeler
- [ ] Next.js 16 `middleware.ts` → `proxy.ts` rename (deprecated uyarısını düzelt)
- [ ] typedRoutes tekrar aç (admin rotaları eklenince)
- [ ] SEO: sitemap.xml + robots.txt
- [ ] Structured data (Product schema.org JSON-LD)
- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (axe)

### 13. Deploy & domain
- [x] Vercel deploy (bugün yapılacak — README'ye bak)
- [ ] Custom domain: modaralist.com + modaralist.com.tr
- [ ] Cloudflare DNS + proxy
- [ ] SSL (Vercel otomatik)
- [ ] Staging ortamı (Vercel preview branch)

---

## Credentials bekleyen işler

Yarın bu servislerin API key'lerini alıp `.env.local`'e (ve Vercel env vars'a) ekleyeceğiz:

| Servis | Kullanım | Alınacak |
|---|---|---|
| Supabase | DB + Storage | DATABASE_URL, DIRECT_URL, URL, ANON_KEY, SERVICE_ROLE_KEY |
| iyzico | Ödeme | IYZICO_API_KEY, IYZICO_SECRET_KEY |
| Resend | Email | RESEND_API_KEY, EMAIL_FROM (domain doğrulama) |
| Google OAuth | Sosyal giriş | GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET |
| GA4 | Analytics | NEXT_PUBLIC_GA_ID |
| Meta Pixel | Reklam | NEXT_PUBLIC_META_PIXEL_ID |
| TikTok Pixel | Reklam | NEXT_PUBLIC_TIKTOK_PIXEL_ID |
| Nilvera | e-Arşiv | NILVERA_USERNAME, NILVERA_PASSWORD (daha sonra) |

---

## Canlı test sırası (credentials geldikten sonra)

1. [ ] `/admin` → login → ürün ekle + görsel upload
2. [ ] Ana sayfa → gerçek ürünleri gör
3. [ ] Sepete ekle → checkout → iyzico sandbox kart
4. [ ] Başarılı ödeme → confirmation mail geldi mi
5. [ ] Admin'de sipariş listesi → durum güncelle
6. [ ] Kargo takip no gir → müşteri hesabında göründü mü
7. [ ] Koleksiyon (drop) oluştur → ana sayfa + /drops sayfası
8. [ ] Notify-me formu çalıştı mı
9. [ ] EN sürümü tam mı (`/en/shop`, `/en/products/...`)
10. [ ] Mobile responsive full check

---

## Notlar

- **Tasarım dili onaylandı** — splash/hero/marquee/split-text/reveal kombosu. Yeni sayfalarda zorunlu.
- **Kargo API'si yok** — müşteri kendi scriptini yazacak, `/api/webhooks/shipping`'a POST atacak
- **Pazaryeri entegrasyonu yok** (sadece kendi site)
- **Blog/lookbook yok** (MVP kapsamı dışı)
- **Custom e-ticaret** (headless değil — Shopify/Medusa vs yok)
- Admin password seed'de: `admin@modaralist.com` / `modaralist-admin-2026` — **prod'da değiştir**
