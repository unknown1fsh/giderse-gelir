# 05 — Server (Business Logic) Katmanı

> Dizin: `server/`
> Son güncelleme: 2026-03-22

---

## Mimari Katmanlar

```
API Route (app/api/...)
    ↓ çağırır
lib/auth → getCurrentUser()
    ↓
server/services/impl/   ← İş mantığı burada
    ↓ kullanır
server/repositories/    ← Veritabanı sorguları
    ↓ kullanır
server/dto/             ← Tip güvenli veri transferi
server/entities/        ← Domain nesneleri
server/mappers/         ← Entity ↔ DTO dönüşümü
server/specs/           ← Sorgu filtreleri (Specification pattern)
server/errors/          ← Hata hiyerarşisi
server/utils/           ← Yardımcı fonksiyonlar
server/clients/         ← Dış API istemcileri
```

---

## 1. DTO Katmanı (`server/dto/`)

Veri Transfer Nesneleri — API sınırında tip güvenliği sağlar.

| Dosya | İçerik |
|-------|--------|
| `BaseDTO.ts` | Temel DTO arayüzü (id, createdAt, updatedAt) |
| `UserDTO.ts` | Kullanıcı verisi (şifresiz, plan bilgisi dahil) |
| `LoanDTO.ts` | Kredi DTO'su |
| `TransactionDTO.ts` | İşlem DTO'su |
| `SystemParameterDTO.ts` | Sistem parametresi DTO'su |
| `index.ts` | Tüm DTO'ların tek noktadan export'u |

---

## 2. Entity Katmanı (`server/entities/`)

Domain nesneleri — iş mantığı metodları içerir.

| Dosya | İçerik |
|-------|--------|
| `BaseEntity.ts` | Temel entity (id, timestamps) |
| `UserEntity.ts` | Kullanıcı domain nesnesi |
| `TransactionEntity.ts` | İşlem domain nesnesi |
| `index.ts` | Export |

---

## 3. Repository Katmanı (`server/repositories/`)

Veritabanı erişim katmanı — Prisma sorgularını soyutlar.

| Dosya | Sorumluluk |
|-------|-----------|
| `BaseRepository.ts` | CRUD temel metodları (findById, findMany, create, update, delete) |
| `UserRepository.ts` | Kullanıcı sorguları (email ile bul, username ile bul) |
| `TransactionRepository.ts` | Filtrelenmiş işlem sorguları, sayfalama |
| `LoanRepository.ts` | Kredi ve taksit sorguları |
| `SystemParameterRepository.ts` | Parametre grup/kod ile arama |
| `index.ts` | Export |

```typescript
// Örnek kullanım:
const userRepo = new UserRepository(prisma)
const user = await userRepo.findByEmail('test@example.com')
```

---

## 4. Service Katmanı (`server/services/impl/`)

İş mantığı — doğrulama, hesaplama, orchestration.

| Servis | Sorumluluk |
|--------|-----------|
| `AuthService.ts` | Login, logout, token doğrulama, session yönetimi |
| `UserService.ts` | Profil güncelleme, kullanıcı silme |
| `SubscriptionService.ts` | Plan sorgulama, abonelik oluşturma/iptal |
| `TransactionService.ts` | İşlem CRUD + limit kontrolü |
| `TransactionValidationService.ts` | İşlem doğrulama kuralları (limit, dönem kontrolü) |
| `LoanService.ts` | Kredi hesaplamaları, taksit planı |
| `SystemParameterService.ts` | Parametre okuma/yazma |
| `AIAnalysisService.ts` | AI rapor oluşturma, OpenAI entegrasyonu |

```typescript
// Örnek kullanım:
const authService = new AuthService(userRepo, sessionRepo)
const result = await authService.login({ email, password })
```

### `OpenAIService.ts`
OpenAI API wrapper — model, temperature, prompt yönetimi.

---

## 5. Mapper Katmanı (`server/mappers/`)

Entity ↔ DTO dönüşümleri.

| Dosya | İşlev |
|-------|-------|
| `UserMapper.ts` | User (Prisma) → UserDTO (şifre hariç) |
| `TransactionMapper.ts` | Transaction (Prisma) → TransactionDTO |
| `LoanMapper.ts` | Loan → LoanDTO |
| `SystemParameterMapper.ts` | SystemParameter → DTO |
| `index.ts` | Export |

---

## 6. Specification Katmanı (`server/specs/`)

Yeniden kullanılabilir sorgu filtreleri.

| Dosya | İçerik |
|-------|--------|
| `Specification.ts` | `ISpecification<T>` arayüzü |
| `QueryBuilder.ts` | Specification'ları birleştirerek Prisma `where` nesnesi oluşturur |
| `TransactionSpecifications.ts` | `ByUserSpec`, `ByPeriodSpec`, `ByDateRangeSpec`, `ByCategorySpec` |
| `UserSpecifications.ts` | `ByEmailSpec`, `ActiveUsersSpec` |

```typescript
// Örnek kullanım:
const spec = new QueryBuilder<Transaction>()
  .add(new ByUserSpec(userId))
  .add(new ByPeriodSpec(periodId))
  .add(new ByDateRangeSpec(startDate, endDate))
  .build()

const transactions = await prisma.transaction.findMany({ where: spec })
```

---

## 7. Hata Katmanı (`server/errors/`)

Hiyerarşik hata yapısı.

| Sınıf | HTTP Kodu | Kullanım |
|-------|-----------|----------|
| `BaseError` | — | Tüm custom hataların tabanı |
| `BusinessError` | 422 | İş kuralı ihlali (limit aşımı, geçersiz durum) |
| `HttpError` | değişken | HTTP hatalarını sarmallar |
| `ExceptionMapper` | — | Error → HTTP yanıtı dönüştürür |

```typescript
// Örnek:
throw new BusinessError('Aylık işlem limitine ulaştınız (30/30)')
// → 422 { error: 'Aylık işlem limitine ulaştınız (30/30)' }
```

---

## 8. Enum Katmanı (`server/enums/`)

| Enum | Değerler |
|------|----------|
| `PlanId` | `FREE`, `PREMIUM`, `FAMILY` |
| `SubscriptionStatus` | `ACTIVE`, `CANCELLED`, `EXPIRED`, `PENDING` |
| `RecurringType` | `DAILY`, `WEEKLY`, `MONTHLY`, `YEARLY` |
| `UserRole` | `USER`, `ADMIN`, `DEMO` |

---

## 9. Yardımcı Araçlar (`server/utils/`)

| Dosya | İşlev |
|-------|-------|
| `Logger.ts` | Yapılandırılmış loglama (timestamp + seviye) |
| `DateHelper.ts` | Tarih dönüşümleri (Türkiye timezone'u ile) |
| `Validator.ts` | Genel doğrulama yardımcıları |
| `LoanCalculator.ts` | Anapara, faiz, taksit hesaplamaları |
| `TransactionHelper.ts` | Kategori, bakiye güncelleme yardımcıları |

---

## 10. Dış API İstemcileri (`server/clients/`)

| Dosya | İşlev |
|-------|-------|
| `BaseHttpClient.ts` | Ortak HTTP istek metodları (fetch wrapper) |
| `ClientConfig.ts` | API URL'leri, timeout, header ayarları |
| `marketDataClient.ts` | Market verisi API entegrasyonu (hisse, kripto, döviz) |
