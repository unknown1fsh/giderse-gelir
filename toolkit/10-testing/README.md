# 10 — Test Katmanı

> Framework: Vitest | API Testleri: tsx ile çalışan özel test runner
> Son güncelleme: 2026-03-22

---

## Test Komutları

| Komut | Açıklama |
|-------|----------|
| `npm run test` | Tüm Vitest unit testlerini çalıştır |
| `npm run test:watch` | Watch modunda Vitest |
| `npm run test:coverage` | Coverage raporu (V8 engine) |
| `npm run test:api` | Tüm API entegrasyon testleri (free tier kullanıcısıyla) |
| `npm run test:api:premium` | Premium API testleri |
| `npm run test:api:enterprise` | Enterprise (family) API testleri |
| `npm run test:api:enterprise-premium` | Enterprise Premium API testleri |

---

## Vitest Konfigürasyonu (`vitest.config.ts`)

```typescript
{
  environment: 'node',
  setupFiles: ['tests/setup.ts'],
  include: ['tests/**/*.test.ts'],
  coverage: { provider: 'v8' },
  testTimeout: 30000
}
```

---

## API Test Mimarisi

API testleri Vitest değil, `tsx` ile doğrudan çalışan runner dosyaları kullanır.

### Test Runner Dosyaları

| Dosya | Kullanıcı Tipi | Açıklama |
|-------|---------------|----------|
| `tests/run-all-tests.ts` | Free | Tüm testleri free kullanıcı ile çalıştır |
| `tests/run-all-tests-premium.ts` | Premium | Tüm testleri premium kullanıcı ile çalıştır |
| `tests/run-all-tests-enterprise.ts` | Family | Family plan testleri |
| `tests/run-all-tests-enterprise-premium.ts` | Family+ | Enterprise Premium testleri |

### Test Yardımcıları (`tests/helpers/`)

| Dosya | İçerik |
|-------|--------|
| `test-utils.ts` | `makeRequest()`, `loginUser()`, `createTestUser()`, `cleanupTestData()` |
| `test-logger.ts` | Test sonuçlarını formatlı loglama |

---

## API Test Dosyaları (`tests/api/`)

25 API test dosyası:

| Test Dosyası | Test Edilen Alan |
|-------------|-----------------|
| `auth.test.ts` | Login, register, logout, token yönetimi |
| `user.test.ts` | Profil CRUD, hesap silme |
| `dashboard.test.ts` | Dashboard veri özeti |
| `accounts.test.ts` | Banka hesabı CRUD + limit kontrolü |
| `cards.test.ts` | Kredi kartı CRUD + limit kontrolü |
| `ewallets.test.ts` | E-cüzdan CRUD + limit kontrolü |
| `transactions.test.ts` | İşlem CRUD, filtreleme, sayfalama |
| `periods.test.ts` | Dönem yönetimi, aktifleştirme, kapatma |
| `investments.test.ts` | Yatırım CRUD (premium gerektirir) |
| `gold.test.ts` | Altın takibi CRUD |
| `loans.test.ts` | Kredi yönetimi |
| `auto-payments.test.ts` | Otomatik ödeme CRUD |
| `budgets.test.ts` | Bütçe plan ve tahsis yönetimi |
| `goals.test.ts` | Tasarruf hedefi CRUD |
| `beneficiaries.test.ts` | Alıcı yönetimi |
| `analysis.test.ts` | Analiz endpoint'leri (premium) |
| `ai-analysis.test.ts` | AI rapor endpoint'leri |
| `ai-coach.test.ts` | AI koçluk özeti |
| `market.test.ts` | Piyasa veri endpoint'leri |
| `subscription.test.ts` | Abonelik yönetimi |
| `payment.test.ts` | Ödeme akışı |
| `payment-request.test.ts` | Ödeme talebi akışı |
| `help.test.ts` | Destek sistemi testleri |
| `parameters.test.ts` | Sistem parametreleri |
| `reference-data.test.ts` | Referans veri endpoint'leri |
| `admin.test.ts` | Admin panel endpoint'leri |
| `health.test.ts` | Sağlık kontrolü |
| `comprehensive-2026.test.ts` | 2026 kapsamlı entegrasyon test paketi |

---

## `tests/setup.ts`

Vitest global setup dosyası:
- Test ortamı konfigürasyonu
- Global mock'lar (gerekirse)
- Test öncesi/sonrası cleanup

---

## Test Stratejisi

### Unit Testler (Vitest)
- `tests/*.test.ts` dosyaları
- İş mantığı fonksiyonları, hesaplamalar, yardımcılar
- DB mock'u KULLANMAZ (doğrudan test DB veya servis izolasyonu)

### API Entegrasyon Testleri (tsx runner)
- Gerçek HTTP istekleri gönderir (çalışan Next.js sunucusu gerektirir)
- Test kullanıcısı oluşturur, istekleri çalıştırır, temizler
- Plan bazlı erişim kontrolünü test eder (free vs premium vs family)

---

## Test Ortamı Kurulumu

```bash
# 1. Test veritabanı oluştur (opsiyonel, ayrı DB önerilir)
DATABASE_URL="postgresql://...test_db" npx prisma migrate deploy

# 2. Sunucuyu başlat
npm run dev

# 3. Testleri çalıştır (ayrı terminalde)
npm run test:api
```

---

## E2E Testler (Playwright)

```bash
npm run e2e   # Playwright testlerini çalıştır
```

Playwright konfigürasyonu: `@playwright/test` paketine bakın.
Test dosyaları henüz tanımlanmamış — `e2e/` dizininde oluşturulabilir.
