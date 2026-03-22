# 03 — Authentication Katmanı

> Strateji: JWT + httpOnly Cookie
> Son güncelleme: 2026-03-22

---

## Genel Akış

```
1. POST /api/auth/login
   → AuthService.login(email, password)
   → bcryptjs ile şifre doğrula
   → UserSession oluştur (DB'ye kaydet)
   → JWT token imzala (JWT_SECRET)
   → setAuthCookie(response, token)

2. Her istekte middleware
   → hasValidToken(request): cookie varlığını kontrol eder (imza doğrulaması YOK)
   → Korumalı route ise → /landing'e yönlendir

3. API route içinde
   → getCurrentUser(request)
   → AuthService.validateSession(token): DB'den UserSession sorgular, User döner
   → Kullanıcı bulunamazsa 401 döner (createUnauthorizedResponse)

4. Çıkış
   → POST /api/auth/logout
   → UserSession pasif yap (is_active = false)
   → clearAuthCookie(response)
```

---

## Dosyalar

| Dosya | Amaç |
|-------|------|
| `lib/auth/index.ts` | Ana auth yardımcıları |
| `lib/auth/utils.ts` | Edge runtime (middleware) için hafif token kontrolü |
| `server/services/impl/AuthService.ts` | Oturum yönetimi, token doğrulama |
| `app/api/auth/login/route.ts` | Giriş endpoint'i |
| `app/api/auth/logout/route.ts` | Çıkış endpoint'i |
| `app/api/auth/register/route.ts` | Kayıt endpoint'i |
| `app/api/auth/me/route.ts` | Mevcut kullanıcı bilgisi |
| `app/api/auth/verify-email/route.ts` | E-posta doğrulama |
| `app/api/auth/forgot-password/route.ts` | Şifre sıfırlama talebi |
| `app/api/auth/reset-password/route.ts` | Yeni şifre set etme |
| `app/api/auth/resend-verification/route.ts` | Doğrulama e-postasını yeniden gönder |
| `app/api/auth/demo/route.ts` | Demo hesap girişi |

---

## `lib/auth/index.ts` API

```typescript
// Mevcut kullanıcıyı oturum token'ından al (DB sorgusu yapar)
getCurrentUser(request: Request): Promise<UserDTO | null>

// Auth cookie'yi set et
setAuthCookie(response: NextResponse, token: string): void

// Auth cookie'yi sil
clearAuthCookie(response: NextResponse): void

// 401 yanıtı oluştur (cookie temizleme dahil)
createUnauthorizedResponse(): NextResponse

// Kullanıcının aktif dönemini al
getActivePeriod(request: Request): Promise<Period | null>
```

## `lib/auth/utils.ts` API

```typescript
// Sadece cookie varlığını kontrol eder — Edge runtime uyumlu, DB sorgusu YAPMAZ
hasValidToken(request: NextRequest): boolean
```

---

## Cookie Ayarları

| Ayar | Değer | Neden |
|------|-------|-------|
| `name` | `auth-token` | Sabit cookie adı |
| `httpOnly` | `true` | XSS saldırılarına karşı JS erişimini engeller |
| `secure` | `true` (prod) | Yalnızca HTTPS üzerinden iletilir |
| `sameSite` | `lax` | CSRF koruması |
| `path` | `/` | Tüm sayfalarda geçerli |
| `maxAge` | 7 gün (604800 sn) | Oturum süresi |

---

## JWT Payload Yapısı

```json
{
  "userId": 123,
  "email": "user@example.com",
  "role": "USER",
  "iat": 1711234567,
  "exp": 1711839367
}
```

**Roller:**
- `USER` — Normal kullanıcı
- `ADMIN` — Yönetici (admin panel erişimi)
- `DEMO` — Demo hesap (yazma işlemleri engellenir)

---

## Demo Hesap Kısıtlamaları

Demo hesabı (`role: "DEMO"`) şu işlemleri yapamaz:
- `POST`, `PUT`, `PATCH`, `DELETE` metodlu istekler
- İstisna: `/api/auth/` başlayan rotalar (giriş/çıkış)

Middleware `getDemoRoleFromToken()` ile JWT payload'ı imzasız decode eder (edge runtime için yeterli).

---

## E-posta Doğrulama Akışı

```
1. Kayıt → email_verification_token oluştur (UUID)
            Resend ile doğrulama e-postası gönder
2. Kullanıcı linke tıklar → GET /api/auth/verify-email?token=xxx
3. token + expiry kontrol → email_verified = true yap
```

---

## Şifre Sıfırlama Akışı

```
1. POST /api/auth/forgot-password { email }
   → reset_password_token + reset_password_expiry (1 saat) oluştur
   → Resend ile sıfırlama e-postası gönder

2. POST /api/auth/reset-password { token, newPassword }
   → Token + expiry kontrol
   → bcryptjs ile yeni şifre hashle
   → reset_password_token = null yap
```

---

## Güvenlik Notları

- `JWT_SECRET` minimum 32 karakter olmalı (`lib/env-validation.ts` denetler)
- Production'da `secure: true` cookie otomatik aktif
- Session token DB'de saklanır — sunucu tarafında iptal edilebilir (`is_active = false`)
- Brute force koruması yok (rate limiting ilave edilebilir)
