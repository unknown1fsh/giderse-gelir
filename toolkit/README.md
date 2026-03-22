# GiderseGelir — Proje Toolkit

> Bu klasör, projenin tüm katmanlarını belgeleyen kalıcı başvuru kitidir.
> **Hiçbir koşulda silinmemeli veya taşınmamalıdır.**
> Son güncelleme: 2026-03-22

---

## Proje Özeti

**GiderseGelir** — Türkçe kişisel finans takip SaaS uygulaması.
Kullanıcılar gelir/gider, yatırım, altın, kredi kartı, kredi, hedef ve bütçelerini yönetir.
3 kademeli abonelik sistemi: Başlangıç (ücretsiz) / Pro (₺99/ay) / Premium (₺199/ay).

---

## Teknoloji Stack'i

| Katman | Teknoloji |
|--------|-----------|
| Framework | Next.js 15 (App Router) |
| Frontend | React 18, TailwindCSS 3, Radix UI |
| Backend | Next.js API Routes (server-side) |
| ORM | Prisma 5 |
| Veritabanı | PostgreSQL |
| Auth | JWT + httpOnly cookie |
| AI | OpenAI API |
| Ödeme | PayTR, Shopier |
| E-posta | Resend |
| Deploy | Railway (Docker) |
| Test | Vitest + tsx |

---

## Hızlı Komutlar

```bash
# Geliştirme
npm run dev                    # Next.js geliştirme sunucusu (port 3000)
npm run build                  # Production build

# Veritabanı
npx prisma migrate dev         # Yeni migration oluştur
npx prisma migrate deploy      # Migration'ları uygula (production)
npm run db:seed                # Temel verileri yükle (prisma/seed.ts)
npm run db:seed-demo           # Demo kullanıcısı oluştur
npx prisma studio              # Veritabanı arayüzü (port 5555)
npx prisma generate            # Prisma Client'ı yeniden oluştur

# Test
npm run test                   # Vitest unit testleri
npm run test:api               # Tüm API entegrasyon testleri (free tier)
npm run test:api:premium       # Premium API testleri
npm run test:api:enterprise    # Enterprise API testleri
npm run test:api:enterprise-premium  # Enterprise Premium API testleri
npm run test:coverage          # Coverage raporu

# Kalite
npm run lint                   # ESLint (auto-fix)
npm run lint:check             # ESLint (sadece kontrol)
npm run format                 # Prettier (auto-fix)
npm run typecheck              # TypeScript type check
npm run validate               # typecheck + lint + format (hepsi)

# Deployment
npm run build:railway          # Railway için build (prisma generate dahil)
npm start                      # Production sunucu başlat
npm run db:migrate:deploy      # prisma generate + migrate deploy
```

---

## Acil Durum: Sıfırdan Kurulum

```bash
# 1. Repo klonla
git clone <repo-url>
cd giderse-gelir

# 2. Bağımlılıkları yükle
npm install

# 3. Ortam değişkenlerini ayarla
cp env.example .env
# .env dosyasını düzenle (DATABASE_URL, JWT_SECRET zorunlu)

# 4. Veritabanı oluştur (ya migration ile ya da SQL scripti ile)
## Yöntem A — Prisma migrations (önerilen):
npx prisma migrate deploy
npx prisma generate

## Yöntem B — Acil SQL scripti:
# psql -U postgres -d giderse_gelir -f toolkit/02-database/create_database.sql

# 5. Temel verileri yükle
npm run db:seed

# 6. Sunucuyu başlat
npm run dev
```

---

## Dizin Haritası

| Klasör | Açıklama |
|--------|----------|
| [01-dependencies/](01-dependencies/README.md) | Tüm npm bağımlılıkları |
| [02-database/](02-database/README.md) | Schema, modeller, migration kılavuzu |
| [03-auth/](03-auth/README.md) | JWT auth, oturum, cookie |
| [04-api/](04-api/README.md) | 34 API endpoint grubu |
| [05-server/](05-server/README.md) | Business logic katmanı |
| [06-frontend/](06-frontend/README.md) | App Router, UI, context'ler |
| [07-subscription/](07-subscription/README.md) | Plan sistemi, feature gating |
| [08-middleware/](08-middleware/README.md) | Route koruması, HTTPS, demo |
| [09-deployment/](09-deployment/README.md) | Railway, Docker, env değişkenleri |
| [10-testing/](10-testing/README.md) | Test altyapısı, komutlar |

---

## Kritik Dosya Yolları

```
prisma/schema.prisma           # Veritabanı şeması (kaynak gerçeklik)
lib/plan-config.ts             # Plan limitleri ve fiyatlar
lib/premium-middleware.ts      # Feature gating fonksiyonları
middleware.ts                  # Route koruması
lib/auth/index.ts              # Auth yardımcıları
lib/env-validation.ts          # Env doğrulama
next.config.js                 # Next.js konfigürasyonu
railway.json                   # Railway deploy konfigürasyonu
Dockerfile                     # Container build adımları
```
