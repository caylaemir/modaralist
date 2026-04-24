# Modaralist

Modaralist — modern, drop-based moda/streetwear e-ticaret platformu. Türkçe + İngilizce, admin panelli.

**Canlı:** https://modaralist.shop

## Stack

- **Framework**: Next.js 16 (App Router) + React 19 + TypeScript
- **Styling**: Tailwind CSS v4 + Motion + GSAP + Lenis (smooth scroll)
- **State**: Zustand (sepet) + React Hook Form + Zod
- **DB**: PostgreSQL + Prisma 6
- **Auth**: Auth.js v5 (Credentials + Google)
- **i18n**: next-intl (tr / en)
- **Payments**: iyzico (MVP)
- **Invoicing**: Nilvera (e-Arşiv / e-Fatura)
- **Email**: Resend
- **Images**: Cloudinary
- **Hosting**: Vercel + Neon (Postgres, Frankfurt)

## Geliştirme

```bash
# Bağımlılıklar
npm install

# .env hazırla
cp .env.example .env.local
# DATABASE_URL, AUTH_SECRET vs. doldur

# Prisma client
npx prisma generate
npx prisma migrate dev

# Dev sunucu
npm run dev
```

Site: http://localhost:3000
Admin: http://localhost:3000/admin (ADMIN / STAFF rol gerekir)

## Klasör yapısı

```
src/
  app/
    [locale]/
      (shop)/         # müşteri storefront
        page.tsx      # ana sayfa
      layout.tsx      # locale root (html/body + NextIntlProvider)
      not-found.tsx
    admin/            # admin panel (auth guarded)
    api/
      auth/[...nextauth]/
      webhooks/shipping/   # kargo scripti için webhook
  components/
    shop/             # storefront bileşenleri
    ui/               # ortak UI
  lib/
    auth.ts           # Auth.js config
    db.ts             # Prisma client
    utils.ts
  i18n/               # next-intl config
  stores/             # Zustand (cart)
  middleware.ts       # next-intl locale middleware
messages/
  tr.json
  en.json
prisma/
  schema.prisma
```

## MVP scope

- Ürün + varyant (beden × renk) + görsel yönetimi
- Drop-based koleksiyonlar (countdown, coming-soon, sold-out, notify-me)
- Sepet (drawer), misafir + üye checkout
- iyzico ödeme (3D Secure)
- Nilvera e-Arşiv fatura
- Admin: ürün/kategori/koleksiyon/sipariş/müşteri/CMS/ayarlar
- TR/EN, KVKK, GA4 + Meta Pixel

## Kargo

Kargo API entegrasyonu bu repo kapsamında değil. Müşteri kendi scriptini yazacak ve
`POST /api/webhooks/shipping` endpoint'ine `x-shipping-secret` header'ı ile istek atacak.
Admin panelden manuel kargo takip numarası girişi de mümkün.
