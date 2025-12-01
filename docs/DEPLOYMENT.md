# Railway Deployment Guide

Bu dokümantasyon Railway platformunda production deployment için gerekli adımları açıklar.

## Gereksinimler

- Railway hesabı (https://railway.app)
- PostgreSQL veya MySQL veritabanı
- Git repository erişimi

## 1. Railway Hesabı ve Proje Oluşturma

1. Railway dashboard'a gidin ve yeni bir proje oluşturun
2. "New Project" > "Deploy from GitHub repo" seçin
3. Repository'nizi seçin
4. Branch'ı belirleyin (production için `master` veya `main`)

## 2. Veritabanı Servisi

### PostgreSQL (Önerilen)

1. Railway dashboard'da "New" > "Database" > "Add PostgreSQL" tıklayın
2. PostgreSQL service otomatik olarak URL'ini sağlar
3. `DATABASE_URL` environment variable otomatik eklenir

### MySQL (Alternatif)

1. Railway dashboard'da "New" > "Database" > "Add MySQL" tıklayın
2. MySQL service URL'i otomatik eklenir
3. `prisma/schema.prisma` dosyasında provider'ı `mysql` olarak değiştirin

## 3. Environment Variables

Railway dashboard'da "Variables" sekmesine gidin ve aşağıdaki değişkenleri ekleyin:

```bash
# Database (otomatik eklenir)
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication
NEXTAUTH_URL=https://your-app.railway.app
NEXTAUTH_SECRET=<güçlü-32-karakter-secret>

# Next.js
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

### NEXTAUTH_SECRET Oluşturma

```bash
node scripts/generate-secret.js
```

## 4. Build Configuration

`railway.json` dosyası Railway'in deployment konfigürasyonunu yönetir:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 10000,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Not:** Railway otomatik olarak `Dockerfile` veya `package.json`'daki build script'lerini kullanır. Build komutu `package.json`'daki `build:railway` script'idir.

## 5. İlk Deployment

1. Railway otomatik olarak code push sonrası build başlatır
2. Build logs'ları dashboard'da görüntülenir
3. Build başarılı olduğunda deployment otomatik başlar
4. URL otomatik olarak oluşturulur: `https://your-app.railway.app`

## 6. Database Migration ve Seed

### İlk Sefer

```bash
# Railway CLI ile
railway run npx prisma migrate deploy
railway run npm run db:seed
```

Veya Railway dashboard'dan "Connect" button ile shell erişimi.

### Manuel Migration

```bash
# Database'e erişim
railway connect

# Migration'ları çalıştır
npx prisma migrate deploy

# Seed data yükle
npm run db:seed
```

## 7. Health Check

Sağlık kontrolü için özel endpoint eklenebilir:

```typescript
// app/api/health/route.ts
export async function GET() {
  return Response.json({ status: 'ok' })
}
```

## 8. Monitoring

### Railway Dashboard

- Resource usage (CPU, Memory, Disk)
- Logs
- Metrics
- Deployments history

### Custom Monitoring

- Application logs: Railway otomatik toplar
- Error tracking: Sentry, LogRocket
- Performance: Railway Metrics Dashboard

## 9. Rollback

### Railway UI

1. Railway dashboard > "Deployments"
2. Önceki başarılı deployment'ı seçin
3. "Redeploy" tıklayın

### CLI

```bash
railway redeploy <deployment-id>
```

## 10. Custom Domain

1. Railway dashboard > Project Settings > "Domains"
2. Custom domain ekleyin
3. DNS ayarlarını yapın (CNAME record)
4. SSL otomatik sağlanır

## 11. Troubleshooting

### Build Hataları

```bash
# Railway CLI logs
railway logs

# Build output'u inceleme
railway logs --build
```

### Database Bağlantı Sorunları

```bash
# Connection test
railway run npx prisma db push

# Verify connection
railway run npx prisma studio
```

### Yavaş Build

- Build cache kullanın
- Dependencies'i optimize edin
- `.dockerignore` kullanın (eğer Docker kullanıyorsanız)

## 12. Production Checklist

- [ ] Environment variables ayarlandı
- [ ] Database migrations uygulandı
- [ ] Seed data yüklendi (sadece ilk deploy)
- [ ] Build başarılı
- [ ] Health check çalışıyor
- [ ] Custom domain (opsiyonel)
- [ ] SSL aktif
- [ ] Monitoring kuruldu
- [ ] Backup stratejisi
- [ ] Error tracking aktif

## 13. Maintenance

### Düzenli Görevler

1. **Günlük**: Log monitoring
2. **Haftalık**: Performance metrics review
3. **Aylık**: Dependency updates, security patches

### Scaling

Railway otomatik scale eder, manuel ayar için:

1. Settings > Resources
2. Memory limit (önerilen: 512MB+)
3. CPU allocation

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Project Issues: GitHub Issues
