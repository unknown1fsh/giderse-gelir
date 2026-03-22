# 04 — API Katmanı

> Next.js App Router API Routes | Tüm endpoint'ler `/app/api/` altında
> Son güncelleme: 2026-03-22

---

## Genel İstek/Yanıt Yapısı

### Başarılı Yanıt
```json
{ "data": { ... } }
// veya doğrudan:
{ "field1": "value", "field2": 123 }
```

### Hata Yanıtı
```json
{ "error": "Hata mesajı" }
```

### Auth Gerektiren İstekler
Header gerekmez — `auth-token` cookie otomatik gönderilir.
Cookie yoksa → `401 Unauthorized`

---

## Endpoint Grupları (34 grup)

### Kimlik Doğrulama — `/api/auth/`

| Endpoint | Metod | Auth | Açıklama |
|----------|-------|------|----------|
| `/api/auth/login` | POST | ✗ | Giriş yap, cookie set et |
| `/api/auth/logout` | POST | ✓ | Çıkış yap, cookie sil |
| `/api/auth/register` | POST | ✗ | Yeni hesap oluştur |
| `/api/auth/me` | GET | ✓ | Mevcut kullanıcı bilgisi + plan |
| `/api/auth/verify-email` | GET | ✗ | E-posta doğrulama (token ile) |
| `/api/auth/forgot-password` | POST | ✗ | Şifre sıfırlama e-postası gönder |
| `/api/auth/reset-password` | POST | ✗ | Yeni şifre belirle |
| `/api/auth/resend-verification` | POST | ✗ | Doğrulama e-postasını yeniden gönder |
| `/api/auth/demo` | POST | ✗ | Demo hesabıyla giriş |

---

### Kullanıcı — `/api/user/`

| Endpoint | Metod | Auth | Açıklama |
|----------|-------|------|----------|
| `/api/user` | GET | ✓ | Profil bilgileri |
| `/api/user` | PUT | ✓ | Profil güncelle |
| `/api/user` | DELETE | ✓ | Hesabı sil |

---

### Dashboard — `/api/dashboard/`

| Endpoint | Metod | Auth | Açıklama |
|----------|-------|------|----------|
| `/api/dashboard` | GET | ✓ | Aktif döneme ait özet: bakiyeler, son işlemler, hedefler |

---

### Dönemler — `/api/periods/`

| Endpoint | Metod | Auth | Açıklama |
|----------|-------|------|----------|
| `/api/periods` | GET | ✓ | Tüm dönemleri listele |
| `/api/periods` | POST | ✓ | Yeni dönem oluştur |
| `/api/periods/[id]` | GET | ✓ | Dönem detayı |
| `/api/periods/[id]` | PUT | ✓ | Dönem güncelle |
| `/api/periods/[id]` | DELETE | ✓ | Dönem sil |
| `/api/periods/[id]/activate` | POST | ✓ | Dönemi aktif yap |
| `/api/periods/[id]/close` | POST | ✓ | Dönemi kapat (net worth hesapla) |

---

### İşlemler — `/api/transactions/`

| Endpoint | Metod | Auth | Premium | Açıklama |
|----------|-------|------|---------|----------|
| `/api/transactions` | GET | ✓ | Limit* | Filtrelenmiş işlem listesi |
| `/api/transactions` | POST | ✓ | Limit* | Yeni işlem ekle |
| `/api/transactions/[id]` | GET | ✓ | - | İşlem detayı |
| `/api/transactions/[id]` | PUT | ✓ | - | İşlem güncelle |
| `/api/transactions/[id]` | DELETE | ✓ | - | İşlem sil |

*Free: aylık 30 işlem, 3 aylık geçmiş. Premium/Family: sınırsız.

---

### Hesaplar — `/api/accounts/`

| Endpoint | Metod | Auth | Açıklama |
|----------|-------|------|----------|
| `/api/accounts` | GET | ✓ | Hesap listesi |
| `/api/accounts` | POST | ✓ | Hesap ekle (Free: max 3) |
| `/api/accounts/[id]` | GET | ✓ | Hesap detayı |
| `/api/accounts/[id]` | PUT | ✓ | Hesap güncelle |
| `/api/accounts/[id]` | DELETE | ✓ | Hesap sil |
| `/api/accounts/bank` | GET | ✓ | Banka listesi |

---

### Kredi Kartları — `/api/cards/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/cards` | GET/POST | Liste / Ekle (Free: max 2) |
| `/api/cards/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |

---

### E-Cüzdanlar — `/api/ewallets/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/ewallets` | GET/POST | Liste / Ekle (Free: max 2) |
| `/api/ewallets/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |

---

### Alıcılar — `/api/beneficiaries/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/beneficiaries` | GET/POST | Liste / Ekle |
| `/api/beneficiaries/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |

---

### Yatırımlar — `/api/investments/` (Premium)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/investments` | GET/POST | Yatırım listesi / Ekle |
| `/api/investments/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |
| `/api/investments/types` | GET | Yatırım tip listesi |

---

### Altın — `/api/gold/` (Premium)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/gold` | GET/POST | Altın listesi / Ekle |
| `/api/gold/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |

---

### Krediler — `/api/loans/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/loans` | GET/POST | Kredi listesi / Ekle |
| `/api/loans/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |

---

### Taksitler — `/api/installments/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/installments` | GET/POST | Taksit listesi / Ekle |
| `/api/installments/[id]/process-payment` | POST | Taksit ödemesi işle |

---

### Otomatik Ödemeler — `/api/auto-payments/` (Premium)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/auto-payments` | GET/POST | Liste / Ekle |
| `/api/auto-payments/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |

---

### Bütçeler — `/api/budgets/` (Free: max 3)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/budgets` | GET/POST/PUT/DELETE | Bütçe yönetimi |

---

### Hedefler — `/api/goals/` (Free: max 3)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/goals` | GET/POST | Hedef listesi / Ekle |
| `/api/goals/[id]` | GET/PUT/DELETE | Detay / Güncelle / Sil |

---

### Analiz — `/api/analysis/` (Premium)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/analysis` | GET | Genel analiz özeti |
| `/api/analysis/cashflow` | GET | Nakit akış analizi |
| `/api/analysis/categories` | GET | Kategori bazlı analiz |
| `/api/analysis/trends` | GET | Trend raporları |
| `/api/analysis/export` | GET | PDF/Excel export |

---

### AI Analiz — `/api/ai-analysis/` (Premium/Family)

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/ai-analysis/report/generate` | POST | AI rapor oluşturma talebi |
| `/api/ai-analysis/report/status` | GET | Rapor üretim durumu |
| `/api/ai-analysis/report/[id]` | GET | Rapor detayı |
| `/api/ai-analysis/report/[id]/pdf` | GET | Raporu PDF indir |
| `/api/ai-analysis/snowball` | POST | AI borç snowball planı (Family) |
| `/api/ai-analysis/credit-card-statement` | POST | Ekstre analizi (Family) |
| `/api/ai-analysis/investment-scenarios` | POST | Yatırım senaryoları (Family) |

---

### AI Koç — `/api/ai-coach/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/ai-coach/summary` | GET | Finansal koçluk özeti |

---

### Market Verileri — `/api/market/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/market/stocks/quote` | GET | Hisse senedi fiyatı |
| `/api/market/stocks/search` | GET | Hisse arama |
| `/api/market/crypto` | GET | Kripto fiyatları |
| `/api/market/forex/quote` | GET | Döviz kuru |
| `/api/market/funds/quote` | GET | Yatırım fonu değeri |
| `/api/market/funds/search` | GET | Fon arama |
| `/api/market/commodities/quote` | GET | Emtia fiyatı |

---

### Net Worth — `/api/net-worth/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/net-worth` | GET | Toplam varlık/borç/net değer |

---

### Bildirimler — `/api/notifications/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/notifications` | GET | Bildirim listesi |
| `/api/notifications/[id]` | PUT/DELETE | Okundu işaretle / Sil |
| `/api/notifications/read-all` | POST | Tümünü okundu yap |
| `/api/notifications/push-subscriptions` | POST/DELETE | Push abonelik yönet |

---

### Ödeme & Abonelik

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/payment/create` | POST | Ödeme oturumu oluştur (PayTR) |
| `/api/payment-request/create` | POST | Admin onaylı ödeme talebi oluştur |
| `/api/subscription/create-payment-link` | POST | Shopier ödeme linki oluştur |
| `/api/subscription/cancel` | POST | Abonelik iptal et |

---

### Arama & Yardımcılar

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/search` | GET | Global arama (işlem, hesap, hedef...) |
| `/api/reference-data` | GET | Referans verileri (para birimleri, kategoriler...) |
| `/api/parameters/[group]/[code]` | GET | Sistem parametresi oku |
| `/api/saved-views` | GET/POST | Kayıtlı görünümler |
| `/api/saved-views/[id]` | PUT/DELETE | Görünüm güncelle/sil |
| `/api/feedback` | POST | Geri bildirim gönder |
| `/api/health` | GET | Sunucu sağlık kontrolü (Railway health check) |

---

### Destek — `/api/help/`

| Endpoint | Metod | Açıklama |
|----------|-------|----------|
| `/api/help/faq` | GET | SSS listesi |
| `/api/help/categories` | GET | Destek kategorileri |
| `/api/help/tickets` | GET/POST | Ticket listesi / Aç |
| `/api/help/tickets/[id]` | GET/PUT | Ticket detayı / Güncelle |
| `/api/help/tickets/[id]/attachments` | POST | Dosya ekle |

---

### Admin — `/api/admin/` (ADMIN rolü gerektirir)

| Endpoint | Açıklama |
|----------|----------|
| `/api/admin/dashboard` | Admin özet istatistikleri |
| `/api/admin/users` | Kullanıcı listesi ve yönetimi |
| `/api/admin/users/[id]` | Kullanıcı detayı/güncelleme |
| `/api/admin/transactions` | Tüm işlemler |
| `/api/admin/subscriptions` | Abonelik listesi |
| `/api/admin/payment-requests` | Ödeme talepleri |
| `/api/admin/payment-requests/[id]/approve` | Ödeme talebi onayla |
| `/api/admin/investments` | Tüm yatırımlar |
| `/api/admin/accounts` | Tüm hesaplar |
| `/api/admin/faq` | SSS yönetimi |
| `/api/admin/feedback` | Geri bildirim yönetimi |
| `/api/admin/support-tickets` | Destek ticket yönetimi |
| `/api/admin/support-categories` | Destek kategorisi yönetimi |
