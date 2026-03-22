# 09 — Deployment Katmanı

> Platform: Railway | Container: Docker | Son güncelleme: 2026-03-22

---

## Ortam Değişkenleri

### Zorunlu

| Değişken | Format | Açıklama |
|----------|--------|----------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | PostgreSQL bağlantı URL'i |
| `JWT_SECRET` | min 32 karakter string | JWT imzalama anahtarı |
| `NEXT_PUBLIC_APP_URL` | `https://giderse-gelir.com` | Uygulama public URL'i |

### Opsiyonel

| Değişken | Format | Açıklama |
|----------|--------|----------|
| `NODE_ENV` | `development` / `production` / `test` | Ortam tipi |
| `RESEND_API_KEY` | `re_xxxxx` | E-posta servisi (Resend) |
| `PAYTR_MERCHANT_ID` | sayı | PayTR ödeme gateway |
| `PAYTR_MERCHANT_KEY` | string | PayTR imzalama anahtarı |
| `PAYTR_MERCHANT_SALT` | string | PayTR tuz değeri |
| `PAYTR_API_URL` | URL | PayTR API endpoint'i |
| `SHOPIER_API_KEY` | string | Shopier API anahtarı |
| `SHOPIER_API_SECRET` | string | Shopier imzalama sırrı |
| `OPENAI_API_KEY` | `sk-xxxxx` | AI analiz raporları için |
| `NEXT_PUBLIC_GOOGLE_TAG_ID` | `AW-xxxxx` | Google Ads conversion ID |
| `NEXTAUTH_URL` | URL | NextAuth URL (kullanılmıyor, geriye dönük uyumluluk) |
| `NEXTAUTH_SECRET` | string | NextAuth secret (kullanılmıyor) |

---

## Railway Konfigürasyonu (`railway.json`)

```json
{
  "build": { "builder": "NIXPACKS" },
  "deploy": {
    "startCommand": "npm start",
    "releaseCommand": "npx prisma migrate deploy",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 120,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Release Command:** Her deploy'dan önce `prisma migrate deploy` çalışır.
**Health Check:** `/api/health` endpoint'i 120 saniye içinde 200 dönmeli.

---

## Dockerfile

```dockerfile
FROM node:18-alpine

# Build bağımlılıkları
RUN apk add --no-cache libc6-compat openssl

WORKDIR /app

# Bağımlılıkları yükle (cache optimizasyonu)
COPY package*.json prisma/ ./
RUN npm ci && npx prisma generate

# Kaynak kodu kopyala ve build et
COPY . .
RUN npm run build:railway

EXPOSE 3000

# Migration + sunucu başlatma
CMD npx prisma migrate deploy && npx next start -H 0.0.0.0 -p ${PORT:-3000}
```

### `build:railway` Script
```bash
npx prisma generate && next build
```

---

## Local Docker Build & Run

```bash
# Image oluştur
docker build -t giderse-gelir .

# Çalıştır (env file ile)
docker run -p 3000:3000 --env-file .env giderse-gelir

# Veya ortam değişkenlerini doğrudan gir
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e NEXT_PUBLIC_APP_URL="http://localhost:3000" \
  giderse-gelir
```

---

## Railway'e Manuel Deploy

```bash
# Railway CLI ile
npm install -g @railway/cli
railway login
railway link          # Projeye bağlan
railway up            # Deploy et

# Git push ile otomatik deploy
git push origin main  # Railway GitHub entegrasyonu varsa otomatik tetiklenir
```

---

## Sıfırdan Production Kurulum

```bash
# 1. Railway'de yeni proje oluştur
# 2. PostgreSQL servisi ekle (Railway Dashboard)
# 3. Ortam değişkenlerini Railway Dashboard'da ayarla
#    - DATABASE_URL (Railway otomatik sağlar)
#    - JWT_SECRET (rastgele 64 karakter)
#    - NEXT_PUBLIC_APP_URL (Railway'nin verdiği URL)
#    - RESEND_API_KEY (e-posta için)
#    - OPENAI_API_KEY (AI için)

# 4. Deploy et
git push origin main

# 5. Release command migration'ları çalıştırır (otomatik)

# 6. Seed verilerini yükle (ilk kurumda bir kez)
railway run npm run db:seed
```

---

## Sağlık Kontrolü

`GET /api/health` — Railway health check endpoint'i

Beklenen yanıt (HTTP 200):
```json
{ "status": "ok", "timestamp": "2026-03-22T..." }
```

---

## Next.js Standalone Mod

`next.config.js` içinde `output: 'standalone'` aktif ise:
```bash
node .next/standalone/server.js
```

---

## Güvenlik Ayarları (next.config.js)

Tüm sayfalara eklenen güvenlik header'ları:

| Header | Değer |
|--------|-------|
| `X-Frame-Options` | `DENY` |
| `X-XSS-Protection` | `1; mode=block` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | Google Analytics, Cloudflare izinli |
