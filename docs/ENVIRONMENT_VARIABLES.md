# Environment Variables Dokümantasyonu

Bu dokümantasyon, GiderSe Gelir uygulaması için gerekli tüm environment variable'ları açıklar.

## Zorunlu Environment Variables

### DATABASE_URL

**Açıklama:** PostgreSQL veritabanı bağlantı URL'i

**Format:**

```
postgresql://username:password@host:port/database?schema=public
```

**Örnek:**

```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/giderse_gelir?schema=public
```

**Railway:** Otomatik olarak Railway PostgreSQL service eklendiğinde sağlanır

**Validation:** `postgresql://` ile başlamalı

---

### JWT_SECRET

**Açıklama:** JWT token imzalama için secret key

**Format:** En az 32 karakter, güçlü random string

**Örnek:**

```bash
JWT_SECRET=your-super-secret-jwt-key-change-in-production-minimum-32-characters
```

**Oluşturma:**

```bash
npm run generate:secret
```

**Validation:**

- Minimum 32 karakter
- Production'da default değer değiştirilmeli

---

### NEXT_PUBLIC_APP_URL

**Açıklama:** Uygulamanın public URL'i

**Format:** Geçerli URL

**Örnekler:**

```bash
# Development
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

**Validation:** Geçerli URL formatı

---

### NEXTAUTH_URL

**Açıklama:** NextAuth için base URL (Next.js auth için)

**Format:** Geçerli URL

**Örnek:**

```bash
NEXTAUTH_URL=https://your-app.railway.app
```

**Not:** Bu uygulamada NextAuth kullanılmıyor ama bazı bağımlılıklar için gerekli olabilir

---

### NEXTAUTH_SECRET

**Açıklama:** NextAuth için secret key

**Format:** Güçlü random string

**Örnek:**

```bash
NEXTAUTH_SECRET=your-very-secure-secret-key-here-at-least-32-characters-long
```

---

### NODE_ENV

**Açıklama:** Node.js environment

**Olası Değerler:**

- `development` - Geliştirme ortamı
- `production` - Production ortamı
- `test` - Test ortamı

**Örnek:**

```bash
NODE_ENV=production
```

**Validation:** `development`, `production` veya `test` olmalı

---

## Opsiyonel Environment Variables

### RESEND_API_KEY

**Açıklama:** Resend email servisi API key

**Format:** `re_` ile başlayan string

**Örnek:**

```bash
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Kayıt:** https://resend.com

**Kullanım:** Email doğrulama ve bildirim email'leri

**Validation:** `re_` ile başlamalı

---

### PAYTR_MERCHANT_ID

**Açıklama:** PayTR merchant ID

**Format:** PayTR'dan alınan merchant ID

**Örnek:**

```bash
PAYTR_MERCHANT_ID=123456
```

**Kayıt:** https://www.paytr.com

**Kullanım:** PayTR ödeme linki oluşturma

---

### PAYTR_MERCHANT_KEY

**Açıklama:** PayTR merchant key

**Format:** PayTR'dan alınan merchant key

**Örnek:**

```bash
PAYTR_MERCHANT_KEY=your-merchant-key
```

**Güvenlik:** Bu değer asla public olarak paylaşılmamalı

---

### PAYTR_MERCHANT_SALT

**Açıklama:** PayTR merchant salt (hash doğrulama için)

**Format:** PayTR'dan alınan merchant salt

**Örnek:**

```bash
PAYTR_MERCHANT_SALT=your-merchant-salt
```

**Güvenlik:** Bu değer asla public olarak paylaşılmamalı

---

### PAYTR_API_URL

**Açıklama:** PayTR API endpoint URL'i

**Varsayılan:** `https://www.paytr.com/odeme`

**Örnek:**

```bash
PAYTR_API_URL=https://www.paytr.com/odeme
```

**Not:** Genellikle değiştirilmesine gerek yok

---

### FROM_EMAIL (Opsiyonel)

**Açıklama:** Email gönderen adresi

**Varsayılan:** `noreply@giderse.com`

**Örnek:**

```bash
FROM_EMAIL=noreply@giderse.com
```

**Not:** Resend'de domain doğrulaması gerekebilir

---

### FROM_NAME (Opsiyonel)

**Açıklama:** Email gönderen adı

**Varsayılan:** `GiderSe Gelir`

**Örnek:**

```bash
FROM_NAME=GiderSe Gelir
```

---

### OPENAI_API_KEY (Opsiyonel)

**Açıklama:** OpenAI API key (AI Analiz Raporu için)

**Format:** `sk-` ile başlayan string

**Örnek:**

```bash
OPENAI_API_KEY=sk-your-openai-api-key-here
```

**Kayıt:** https://platform.openai.com/api-keys

**Kullanım:** AI Analiz Raporu oluşturma (Premium özellik)

**Validation:** `sk-` ile başlamalı

---

## Environment Variable Validation

Uygulama başlangıcında environment variable'lar otomatik olarak validate edilir:

```typescript
import { assertEnvironmentValid } from '@/lib/env-validation'

// Uygulama başlangıcında çağır
assertEnvironmentValid()
```

Health check endpoint'i de environment validation sonuçlarını döner:

```
GET /api/health
```

## Railway Setup

Railway dashboard'da environment variables eklemek için:

1. Railway dashboard → Your Project → Variables
2. "+ New Variable" butonuna tıklayın
3. Key ve Value'yu girin
4. "Add" butonuna tıklayın

## Local Development

Local development için `.env` dosyası oluşturun:

```bash
cp env.example .env
```

`.env` dosyasını düzenleyin ve gerekli değerleri ekleyin.

**Önemli:** `.env` dosyası asla Git'e commit edilmemelidir!

## Güvenlik Notları

1. **Asla production secret'ları Git'e commit etmeyin**
2. **Environment variable'ları loglarda yazdırmayın**
3. **Production ve development için farklı secret'lar kullanın**
4. **Secret'ları düzenli olarak rotate edin**
5. **PayTR ve Resend API key'lerini güvenli tutun**

## Troubleshooting

### Environment Variable Bulunamıyor

- Railway dashboard'da variable'ın doğru eklendiğini kontrol edin
- Variable adının doğru yazıldığını kontrol edin (büyük/küçük harf duyarlı)
- Railway'de redeploy yapın

### Validation Hatası

- Health check endpoint'ini kontrol edin: `/api/health`
- Logs'da validation hatalarını kontrol edin
- `lib/env-validation.ts` dosyasındaki validation kurallarını kontrol edin

---

**Son Güncelleme:** 2025-01-26
**Versiyon:** 2.1.1
