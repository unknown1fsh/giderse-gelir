# 07 — Abonelik & Plan Sistemi

> Kaynak: `lib/plan-config.ts`, `lib/premium-middleware.ts`
> Son güncelleme: 2026-03-22

---

## Plan Tanımları

| Plan ID | Görünen Ad | Fiyat | Deneme |
|---------|-----------|-------|--------|
| `free` | Başlangıç | ₺0/ay | — |
| `premium` | Pro | ₺99/ay | 30 gün ücretsiz |
| `family` | Premium | ₺199/ay | 30 gün ücretsiz |

> **Not:** Eski kod `enterprise` plan'ını referans alıyorsa, bu `family` planıyla eşleşir (geriye dönük uyumluluk).

---

## Limit Tablosu

| Limit | Başlangıç (free) | Pro (premium) | Premium (family) |
|-------|-----------------|---------------|-----------------|
| Aylık işlem | 30 | Sınırsız | Sınırsız |
| İşlem geçmişi | 3 ay | Sınırsız | Sınırsız |
| Banka hesabı | 3 | Sınırsız | Sınırsız |
| Kredi kartı | 2 | Sınırsız | Sınırsız |
| E-cüzdan | 2 | Sınırsız | Sınırsız |
| Tasarruf hedefi | 3 | Sınırsız | Sınırsız |
| Bütçe | 3 | Sınırsız | Sınırsız |
| Aile üyesi | 1 | 1 | 5 |

---

## Plan Özellikleri

### Başlangıç (free)
- Temel işlem takibi
- Dönem yönetimi
- Mobil uyumlu arayüz
- **Yok:** AI analiz, PDF/Excel export, yatırım takibi, otomatik ödeme

### Pro (premium) — ₺99/ay
- Tüm Başlangıç özellikleri + sınırsız kullanım
- AI finansal asistan
- Harcama tahminleri (3–6 ay)
- Otomatik kategorileme
- Nakit akış & trend analizi
- Yatırım & portföy takibi (hisse, kripto, altın, fon)
- Otomatik ödeme takibi
- PDF & Excel export
- 7/24 öncelikli e-posta desteği

### Premium (family) — ₺199/ay
- Tüm Pro özellikleri
- Kredi kartı ekstre analizi (AI)
- Gelişmiş AI finansal içgörüler
- Borç azaltma stratejisi (snowball)
- Yatırım öneri senaryoları
- Telefon desteği (hafta içi)
- Hesap yöneticisi atama
- 5 aile üyesi

---

## Feature Gating Fonksiyonları

### `lib/plan-config.ts`

```typescript
// Plan ID kontrolü
isPremiumPlan(planId: string): boolean   // premium veya family
isFamilyPlan(planId: string): boolean    // sadece family
isEnterprisePlan(planId: string): boolean // family ile aynı (geriye dönük uyumluluk)

// Plan bilgisi
getPlanById(planId: string): PlanConfig | undefined
getPlanPrice(planId: string): number
getPlanLimits(planId: string): PlanLimits
```

### `lib/premium-middleware.ts`

```typescript
// Route koruması — Premium/Family gerektirir
withPremium(handler: RouteHandler): RouteHandler
withPremiumPost(handler: RouteHandler): RouteHandler

// Özellik erişim bayrakları
getPremiumFeatureAccess(planId: string): {
  hasAI: boolean
  hasExport: boolean
  hasInvestments: boolean
  hasAutoPayments: boolean
  hasAdvancedAnalysis: boolean
  hasCreditCardAnalysis: boolean  // Sadece family
  hasDebtStrategy: boolean        // Sadece family
}

// Sayısal limit kontrolü
checkFeatureLimit(userId, entity, planId): Promise<{ allowed: boolean, message?: string }>
checkCreationLimit(userId, entity, planId): Promise<void>  // throws BusinessError

// Tarih sınırı (3 ay geçmiş erişimi)
getHistoryLimitDate(planId: string): Date | null  // null = sınırsız
```

---

## Abonelik Veri Modeli

```
UserSubscription {
  planId:        'free' | 'premium' | 'family'
  status:        'ACTIVE' | 'CANCELLED' | 'EXPIRED' | 'PENDING'
  startDate:     DateTime
  endDate:       DateTime
  amount:        Decimal
  currency:      'TRY'
  paymentMethod: 'paytr' | 'shopier' | 'manual'
  transactionId: String?    // Ödeme gateway işlem ID'si
  autoRenew:     Boolean
  cancelledAt:   DateTime?
}
```

---

## Ödeme Yöntemleri

### 1. PayTR (otomatik ödeme linki)
- `lib/paytr.ts` — PayTR API entegrasyonu
- Endpoint: `POST /api/payment/create`
- Callback → `app/payment/` sayfaları

### 2. Shopier (sabit linkler)
- `lib/shopier.ts` — Shopier imza hesaplama
- `lib/shopier-links.ts` — Sabit ödeme URL'leri
- Endpoint: `POST /api/subscription/create-payment-link`

### 3. Admin Onaylı Ödeme (PaymentRequest)
- Manuel onay akışı (banka transferi gibi)
- Endpoint: `POST /api/payment-request/create`
- Admin onayı: `POST /api/admin/payment-requests/[id]/approve`
- Onay sonrası `SubscriptionService` planı aktif eder

---

## User.plan Alanı Nereden Geliyor?

`User` modelinde plan alanı doğrudan yok. `AuthService.validateSession()` çağrıldığında:

```typescript
1. UserSession'dan User kaydını çek
2. UserSubscription tablosunda ACTIVE durumdaki en güncel kaydı bul
3. Bulunamazsa → 'free' döndür
4. Bulunan planId'yi UserDTO'ya ekle
```

Bu değer `lib/user-context.tsx` içinde `user.plan` olarak erişilebilir.

---

## Abonelik İptal Akışı

```
POST /api/subscription/cancel
  → UserSubscription.status = 'CANCELLED'
  → UserSubscription.cancelledAt = now()
  → Dönem sonuna kadar erişim devam eder (endDate'e kadar)
  → endDate geçince plan = 'free' olarak davranılır
```

---

## Plan ID Notları

Kod tabanında `enterprise` ve `enterprise_premium` string'lerine rastlayabilirsiniz:
- `enterprise` → `family` planıyla eşdeğerdir
- `isEnterprisePlan()` → `isFamilyPlan()` ile aynıdır
- Yeni kod yazarken `PLAN_IDS.FAMILY` kullanın
