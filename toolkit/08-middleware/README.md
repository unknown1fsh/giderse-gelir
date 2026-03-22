# 08 — Middleware Katmanı

> Dosya: `middleware.ts`
> Son güncelleme: 2026-03-22

---

## Genel Bakış

Next.js middleware tüm istekleri `_next/static`, `_next/image` ve `favicon.ico` dışında işler.

**Sıra:**
1. API rotaları → doğrudan geç (middleware atlanır)
2. Production HTTPS kontrolü
3. Demo hesap write bloğu
4. Korumalı route kontrolü (token yok → /landing)
5. Auth route kontrolü (token var → /dashboard)
6. Kök yol (`/`) yönlendirmesi

---

## Korumalı Rotalar (Giriş Gerektirir)

Aşağıdaki prefix'lerle başlayan rotalar için token yoksa `/landing`'e yönlendirilir:

```
/dashboard
/transactions
/accounts
/cards
/auto-payments
/gold
/analysis
/portfolio
/settings
/periods
/investments
/beneficiaries
/ewallets
/admin
/help
/budgets
/goals
/loans
/installments
/ai-analysis
/enterprise-dashboard
/premium
/premium-features
```

---

## Auth Rotaları (Giriş Yapmış Kullanıcı Erişemez)

Token varsa `/dashboard`'a yönlendirilir:

```
/auth/login
/auth/register
/auth/forgot-password
/landing
```

---

## Demo Hesap Write Bloğu

`role: "DEMO"` içeren JWT token ile:
- `POST`, `PUT`, `PATCH`, `DELETE` istekleri → `403 Forbidden`
- İstisna: `/api/auth/` prefix'li rotalar (giriş/çıkış işlemleri çalışır)

```json
{
  "error": "Demo hesapta değişiklik yapılamaz. Üye olarak tüm özelliklere erişin.",
  "isDemo": true
}
```

> Not: Token imzası doğrulanmaz (edge runtime uyumluluğu). Sadece payload'daki `role` alanı okunur.

---

## HTTPS Yönlendirmesi

Production ortamında (`NODE_ENV === 'production'`):
- `x-forwarded-proto` header'ı `https` değilse → 301 redirect
- Localhost hariç tutulur

---

## Kök Yol (`/`) Mantığı

```
/ → token var  → /dashboard (302)
/ → token yok  → /landing  (302)
```

---

## Token Kontrolü

Middleware `lib/auth/utils.ts`'deki `hasValidToken()` fonksiyonunu kullanır:
- Sadece `auth-token` cookie'sinin varlığını kontrol eder
- DB sorgusu **yapmaz** (edge runtime'da Prisma çalışmaz)
- İmza doğrulaması **yapmaz**

Gerçek token doğrulaması API route içinde `getCurrentUser()` → `AuthService.validateSession()` ile yapılır.

---

## Matcher Konfigürasyonu

```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
```

API rotaları (`/api/...`) matcher'a dahildir — demo write bloğu API'lere de uygulanır.

---

## Public Sayfalar (Middleware'den Bağımsız)

Aşağıdaki sayfalar korumalı rota listesinde YOK, dolayısıyla token olmadan erişilebilir:

```
/landing
/auth/login
/auth/register
/auth/forgot-password
/auth/reset-password
/auth/verify-email
/privacy
/terms
/cookie-policy
/kvkk
/demo
/enterprise
/enterprise-premium
/payment
/features
/pricing
```
