# Abonelik Planları Dokümantasyonu

## Genel Bakış

GiderSe Gelir uygulaması 4 farklı abonelik planı sunar:

- **FREE**: Temel özellikler
- **PREMIUM**: Bireysel kullanıcılar için gelişmiş özellikler
- **ENTERPRISE**: KOBİ ve şirketler için kurumsal çözümler
- **ENTERPRISE_PREMIUM**: Holding ve büyük kurumlar için ultra premium

## Plan Konfigürasyonu

Tüm plan tanımları merkezi olarak `lib/plan-config.ts` dosyasında yönetilir.

```typescript
import { PLAN_IDS, getPlanById, getPlanPrice, isPremiumPlan } from '@/lib/plan-config'
```

### Plan ID'leri

```typescript
export const PLAN_IDS = {
  FREE: 'free',
  PREMIUM: 'premium',
  ENTERPRISE: 'enterprise',
  ENTERPRISE_PREMIUM: 'enterprise_premium',
}
```

### Plan Fiyatları

| Plan               | Aylık Fiyat | Para Birimi |
| ------------------ | ----------- | ----------- |
| FREE               | ₺0          | TRY         |
| PREMIUM            | ₺250        | TRY         |
| ENTERPRISE         | ₺450        | TRY         |
| ENTERPRISE_PREMIUM | Özel Fiyat  | TRY         |

## Plan Özellikleri

### FREE Plan

**Hedef Kitle:** Yeni kullanıcılar, bireysel kullanım

**Limitler:**

- Aylık 50 işlem
- Maksimum 3 hesap
- Maksimum 2 kredi kartı
- 10 analiz limiti

**Özellikler:**

- Temel finansal yönetim
- Temel raporlar
- Mobil erişim
- E-posta desteği

### PREMIUM Plan

**Hedef Kitle:** Bireysel kullanıcılar

**Fiyat:** ₺250/ay

**Limitler:** Sınırsız

**Özellikler:**

#### 🧠 AI & Akıllı Analizler

- AI Finansal Asistan
- Otomatik Kategorileme
- Tahmin Modelleri
- Akıllı Öneriler

#### 📊 Gelişmiş Raporlama

- İnteraktif Grafikler
- Harcama Dağılımı
- Trend Analizleri
- PDF/Excel Raporları

#### 🎯 Akıllı Hedefleme

- Kişisel Hedefler
- Mevsimsel Analiz
- Akıllı Bildirimler
- Başarı Takibi

#### ⚡ Otomasyon & Verimlilik

- Otomatik Takip
- Akıllı Tekrarlar
- Zaman Tasarrufu
- Özelleştirilebilir

#### 🛡️ Premium Destek

- 7/24 Premium Destek
- Gelişmiş Güvenlik
- Premium Tema
- Bulut Yedekleme

### ENTERPRISE Plan

**Hedef Kitle:** KOBİ ve şirketler

**Fiyat:** ₺450/ay

**Limitler:** Sınırsız

**Özellikler:**

#### 🏢 Kurumsal Yönetim

- Tüm Premium Özellikler
- Çoklu Kullanıcı Desteği
- Departman Yönetimi
- Rol Bazlı Erişim Kontrolü

#### 🔧 Entegrasyonlar

- API Erişimi
- Webhook Desteği
- Özel Entegrasyonlar
- ERP/CRM Entegrasyonu

#### 📈 Gelişmiş Analizler

- Departman Bazlı Raporlar
- Bütçe Takibi
- Nakit Akış Tahminleri
- Özel Dashboard'lar

#### 🎯 Premium Destek

- Dedicated Hesap Yöneticisi
- Öncelikli 7/24 Destek
- Özel Eğitim
- SLA Garantisi

### ENTERPRISE_PREMIUM Plan

**Hedef Kitle:** Holding ve büyük kurumlar

**Fiyat:** Özel fiyatlandırma

**Limitler:** Sınırsız

**Özellikler:**

#### 🏢 Kurumsal Yönetim

- Çoklu Şirket Konsolidasyonu
- Sınırsız Departman Yönetimi
- Hiyerarşik Yetki Sistemi
- Global Şube Ağı

#### 🔒 Enterprise Güvenlik

- Kurumsal Quantum Şifreleme
- Enterprise Sıfır Güven
- Siber Tehdit İzleme
- Uyumluluk Yönetimi (GDPR, KVKK, SOX, PCI DSS)

#### 🤖 AI Süper Zeka

- Kurumsal AI Süper Zeka
- Kurumsal Gelir Optimizasyonu
- Operasyonel Verimlilik
- Kurumsal Süreç Otomasyonu

#### 🌐 Global Altyapı

- Global İş Ağı
- Enterprise Bulut Altyapısı
- Çoklu Para Birimi Yönetimi (150+ para birimi)
- VIP Kurumsal Destek

#### 💰 Kurumsal Gelir Artırma

- Pazar Genişletme Stratejileri
- Müşteri Segmentasyonu
- Ürün Portföy Optimizasyonu
- Kurumsal Ortaklıklar

#### 📈 İş Zekası & Analytics

- Kurumsal Dashboard
- Enterprise API
- Özel Sistem Entegrasyonları (SAP, Oracle, Microsoft Dynamics)
- Beyaz Etiket Çözümü

## API Kullanımı

### Plan Bilgisi Alma

```typescript
// Tüm planları getir
GET / api / subscription / plans

// Kullanıcının aktif planını getir
GET / api / subscription / status
```

### Plan Yükseltme

```typescript
// Plan yükseltme
POST /api/subscription/upgrade
{
  "planId": "premium" | "enterprise" | "enterprise_premium"
}
```

### Premium Kontrolü

Backend'de premium özellik kontrolü:

```typescript
import { withPremium } from '@/lib/premium-middleware'

export const GET = withPremium(async (request: NextRequest) => {
  // Premium kullanıcılar için kod
}, 'premium') // 'premium', 'enterprise', veya 'enterprise_premium'
```

Frontend'de premium kontrolü:

```typescript
import { usePremium } from '@/lib/use-premium'

function MyComponent() {
  const { isPremium, isEnterprise, requirePremium } = usePremium()

  const handlePremiumFeature = () => {
    requirePremium(() => {
      // Premium özellik kodu
    })
  }
}
```

## Database Şeması

### UserSubscription Tablosu

```sql
CREATE TABLE user_subscription (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  plan_id VARCHAR(50) NOT NULL,
  status VARCHAR(20) NOT NULL,  -- 'active', 'cancelled', 'expired', 'pending'
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  auto_renew BOOLEAN DEFAULT true,
  cancelled_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Plan Geçişleri

### FREE → PREMIUM

1. Kullanıcı `/premium` sayfasından plan seçer
2. Ödeme sayfasına yönlendirilir
3. PayTR ile ödeme yapılır
4. Webhook ile subscription aktif edilir
5. Email bildirimi gönderilir

### FREE → ENTERPRISE

1. Kullanıcı `/premium` sayfasından Enterprise planı seçer
2. Ödeme sayfasına yönlendirilir
3. PayTR ile ödeme yapılır
4. Webhook ile subscription aktif edilir
5. Email bildirimi gönderilir

### ANY → ENTERPRISE_PREMIUM

1. Kullanıcı `/enterprise-premium` sayfasından talep oluşturur
2. PaymentRequest kaydı oluşturulur
3. Email bildirimi gönderilir (kullanıcı ve admin'e)
4. Admin `/admin/payment-requests` sayfasından onaylar
5. Subscription manuel olarak aktif edilir
6. Email bildirimi gönderilir

### Plan İndirme/İptal

```typescript
POST / api / subscription / cancel
```

- Subscription status 'cancelled' olarak güncellenir
- `auto_renew` false yapılır
- Mevcut period sonuna kadar erişim devam eder

## Test

Plan testleri için hazır script'ler:

```bash
# Free plan testi
npm run test:api

# Premium plan testi
npm run test:api:premium

# Enterprise plan testi
npm run test:api:enterprise

# Enterprise Premium plan testi
npm run test:api:enterprise-premium
```

## Güvenlik

### Premium Özelliklerin Korunması

1. **Backend Kontrolü**: Her premium endpoint'te `withPremium` middleware kullanılır
2. **Frontend Kontrolü**: `usePremium` hook ile UI'da kontrol edilir
3. **Database Seviyesi**: Plan bilgisi `UserSubscription` tablosunda tutulur

### API Rate Limiting

Premium planlar için rate limit yok, FREE plan için:

- API calls: 100/hour
- Transactions: 50/month

## Troubleshooting

### Plan değişmiyor

1. `UserSubscription` tablosunda `status='active'` olan kayıt var mı?
2. User context güncel mi? (`refreshUser()` çağrıldı mı?)
3. Webhook doğru çalışıyor mu?

### Ödeme tamamlandı ama plan aktif değil

1. PayTR webhook loglarını kontrol edin
2. `UserSubscription` tablosunda kayıt oluştu mu?
3. Eski subscription iptal edildi mi?

## Bakım

### Plan Fiyat Güncelleme

1. `lib/plan-config.ts` dosyasında `PLAN_PRICES` objesini güncelleyin
2. Değişiklik otomatik olarak tüm sayfalara yansır

### Yeni Plan Ekleme

1. `lib/plan-config.ts` dosyasına yeni plan ekleyin
2. `PLANS` objesine plan detaylarını ekleyin
3. Database'de migration gerekmez (plan bilgisi varchar)

---

**Son Güncelleme:** 2025-01-19
**Versiyon:** 2.1.1
