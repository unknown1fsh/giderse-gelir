<div align="center">

# 💰 GiderSE Gelir

### 🚀 Modern Finansal Yönetim Platformu | Next-Generation Financial Management Platform

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.7-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**AI destekli, kurumsal seviye finansal yönetim çözümü**  
**AI-powered, enterprise-grade financial management solution**

[English](#-english) • [Türkçe](#-türkçe)

---

</div>

---

## 🇹🇷 Türkçe

### 📖 Hakkında

**GiderSE Gelir**, kişisel finans yönetiminden kurumsal mali işlere kadar her seviyede finansal kontrol sağlayan, yapay zeka destekli modern bir finansal yönetim platformudur. Next.js 15, TypeScript ve PostgreSQL ile geliştirilmiş, enterprise seviyesinde güvenlik ve performans standartlarına sahiptir.

### ✨ Öne Çıkan Özellikler

#### 🧠 Yapay Zeka & Akıllı Analizler

- **AI Finansal Asistan**: Harcamalarınızı analiz eder, tasarruf önerileri sunar
- **Otomatik Kategorileme**: İşlemleriniz otomatik olarak doğru kategoriye yerleşir
- **Tahmin Modelleri**: 3-6 ay sonraki gelir ve harcamalarınızı tahmin eder
- **Akıllı Öneriler**: Kişiselleştirilmiş finansal tavsiyeler

#### 📊 Gelişmiş Raporlama & Analitik

- **İnteraktif Grafikler**: Recharts ile zengin görselleştirmeler
- **Harcama Dağılımı**: Detaylı kategori bazlı analizler
- **Trend Analizleri**: Zaman içindeki finansal değişimleri görün
- **PDF/Excel Export**: Profesyonel raporlar oluşturun
- **Periyod Yönetimi**: Yıl, ay veya özel dönemlere göre takip

#### 💳 Kapsamlı Hesap Yönetimi

- **Çoklu Hesap Desteği**: Bankalar, e-cüzdanlar, kredi kartları
- **Kredi Kartı Yönetimi**: Tüm kartlarınızı tek yerden yönetin
- **Otomatik Ödemeler**: Tekrarlayan giderlerinizi otomatik takip edin
- **Bakiye Takibi**: Gerçek zamanlı bakiye görüntüleme

#### 📈 Yatırım Portföyü

- **Hisse Senedi Takibi**: Portföy performansını izleyin
- **Kripto Para Yönetimi**: Crypto varlıklarınızı takip edin
- **Altın Yönetimi**: Altın yatırımlarınızı yönetin
- **Portföy Analizi**: Detaylı yatırım raporları

#### 🏢 Kurumsal Özellikler

- **Çoklu Kullanıcı Desteği**: Takım çalışması için ideal
- **Departman Yönetimi**: Organizasyonel yapı desteği
- **Rol Bazlı Erişim**: Granüler yetki kontrolü
- **API Erişimi**: Entegrasyon için RESTful API
- **Webhook Desteği**: Gerçek zamanlı bildirimler

#### 🔒 Enterprise Güvenlik

- **JWT Authentication**: Güvenli kimlik doğrulama
- **Bcrypt Hashing**: Şifre güvenliği
- **SQL Injection Koruması**: Prisma ORM ile güvenli sorgular
- **XSS Koruması**: Content Security Policy
- **HTTPS Enforcement**: Güvenli bağlantı zorunluluğu
- **Security Headers**: Kapsamlı güvenlik başlıkları

### 🛠️ Teknoloji Stack

#### Frontend

- **Next.js 15** - React framework (App Router)
- **React 18** - UI library
- **TypeScript** - Tip güvenliği
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Recharts** - Grafik ve görselleştirme
- **React Hook Form** - Form yönetimi
- **Zod** - Runtime validation

#### Backend

- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Güçlü ilişkisel veritabanı
- **JWT** - Stateless authentication
- **Bcrypt** - Password hashing
- **Resend** - Email servisi

#### DevOps & Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit standardizasyonu
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Docker** - Containerization
- **Railway** - Cloud deployment

### 📋 Gereksinimler

- **Node.js** 18.0 veya üzeri
- **PostgreSQL** 14.0 veya üzeri
- **npm** 9.0 veya üzeri (veya yarn/pnpm)

### 🚀 Hızlı Başlangıç

#### 1. Repository'yi Klonlayın

```bash
git clone https://github.com/your-username/giderseGelir.git
cd giderseGelir
```

#### 2. Bağımlılıkları Kurun

```bash
npm install
```

#### 3. Ortam Değişkenlerini Ayarlayın

`.env` dosyası oluşturun:

```bash
cp env.example .env
```

Gerekli değişkenleri düzenleyin:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/giderse_gelir"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Payment (PayTR)
PAYTR_MERCHANT_ID="your-merchant-id"
PAYTR_MERCHANT_KEY="your-merchant-key"
PAYTR_MERCHANT_SALT="your-merchant-salt"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4. Veritabanını Hazırlayın

```bash
# Migration'ları çalıştır
npx prisma migrate dev

# Seed data yükle (opsiyonel)
npm run db:seed
```

#### 5. Development Server'ı Başlatın

```bash
npm run dev
```

Tarayıcıda [http://localhost:3000](http://localhost:3000) adresini açın.

#### 6. Demo Hesap (2026 Test Verileri)

2026 tahmini verilerle dolu demo hesabı oluşturmak için:

```bash
npm run db:seed-demo
```

**Giriş bilgileri:**
- **E-posta:** demo@giderse-gelir.com
- **Şifre:** 123456

Demo hesapta: Maaş 115.000 TL, Kira 35.000 TL, banka hesapları, kredi kartı, krediler, faturalar, yatırımlar, altın, hedefler ve otomatik ödemeler bulunur.

### 📦 Kurulum Seçenekleri

#### Tam Geliştirme Ortamı

```bash
# Veritabanı ve development server'ı birlikte başlat
npm run dev:full
```

#### Docker ile Kurulum

```bash
# Docker image oluştur
docker build -t giderse-gelir .

# Container'ı çalıştır
docker run -p 3000:3000 --env-file .env giderse-gelir
```

### 🧪 Test

```bash
# Tüm testleri çalıştır
npm test

# Watch mode
npm run test:watch

# API testleri
npm run test:api

# Plan bazlı testler
npm run test:api:free
npm run test:api:premium
npm run test:api:enterprise
npm run test:api:enterprise-premium

# Test coverage
npm run test:coverage

# E2E testler
npm run e2e
```

### 🚢 Deployment

#### Railway Deployment

Detaylı deployment rehberi için: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Hızlı Başlangıç:**

1. [Railway](https://railway.app) hesabı oluşturun
2. GitHub repository'yi bağlayın
3. PostgreSQL service ekleyin
4. Environment variables'ı ayarlayın
5. Deploy!

```bash
# Railway CLI ile
railway login
railway link
railway up
```

#### Production Build

```bash
# Production build
npm run build

# Production server
npm start
```

### 📚 Dokümantasyon

- 📖 [API Dokümantasyonu](docs/API.md) - Tüm API endpoint'leri
- 🏛️ [Mimari Dokümantasyon](docs/ARCHITECTURE.md) - Sistem mimarisi
- 🚀 [Deployment Rehberi](docs/DEPLOYMENT.md) - Production deployment
- 💳 [Ödeme Akışı](docs/PAYMENT_FLOW.md) - Ödeme entegrasyonu
- 📋 [Abonelik Planları](docs/SUBSCRIPTION_PLANS.md) - Plan detayları
- 🔧 [Ortam Değişkenleri](docs/ENVIRONMENT_VARIABLES.md) - Config rehberi

### 🎯 Abonelik Planları

#### 🆓 FREE Plan

- Temel gelir-gider takibi
- Aylık 50 işlem limiti
- Maksimum 3 hesap
- Maksimum 2 kredi kartı
- 10 analiz limiti
- Temel raporlar

#### ⭐ PREMIUM Plan - ₺250/ay

- **Sınırsız** işlem ve hesap
- **AI Finansal Asistan** (Ayda 4 rapor)
- Gelişmiş analitik ve raporlar
- Yatırım takibi
- Otomatik ödemeler
- PDF/Excel export
- Premium destek

#### 🏢 ENTERPRISE Plan - ₺450/ay

- Tüm Premium özellikler
- Çoklu kullanıcı desteği
- Departman yönetimi
- Rol bazlı erişim kontrolü
- API erişimi
- Webhook desteği
- Özel entegrasyonlar
- Dedicated hesap yöneticisi

#### 🚀 ENTERPRISE PREMIUM Plan

- Tüm Enterprise özellikler
- Çoklu şirket konsolidasyonu
- Global şube ağı
- Enterprise güvenlik (Quantum şifreleme)
- Kurumsal AI süper zeka
- 150+ para birimi desteği
- Özel sistem entegrasyonları (SAP, Oracle, Dynamics)
- VIP kurumsal destek

### 🏗️ Proje Yapısı

```
giderseGelir/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard sayfaları
│   ├── (transactions)/    # İşlem sayfaları
│   ├── accounts/          # Hesap yönetimi
│   ├── admin/             # Admin paneli
│   ├── ai-analysis/       # AI analizleri
│   ├── analysis/          # Finansal analizler
│   ├── api/               # API routes
│   ├── auth/              # Authentication
│   ├── investments/       # Yatırım yönetimi
│   └── ...
├── components/            # React bileşenleri
│   ├── ui/               # UI bileşenleri (Radix UI)
│   └── ...
├── lib/                   # Utility fonksiyonları
│   ├── auth.ts           # Authentication logic
│   ├── prisma.ts         # Prisma client
│   ├── plan-config.ts    # Plan konfigürasyonu
│   └── ...
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Database migrations
├── docs/                 # Dokümantasyon
├── tests/                # Test dosyaları
└── public/               # Static dosyalar
```

### 🔒 Güvenlik

- ✅ **JWT Authentication** - Stateless, scalable auth
- ✅ **Bcrypt Password Hashing** - Güvenli şifre saklama
- ✅ **SQL Injection Protection** - Prisma ORM ile güvenli sorgular
- ✅ **XSS Protection** - Content Security Policy
- ✅ **HTTPS Enforcement** - Güvenli bağlantı zorunluluğu
- ✅ **Security Headers** - Kapsamlı güvenlik başlıkları
- ✅ **Rate Limiting** - API rate limiting
- ✅ **Input Validation** - Zod ile runtime validation
- ✅ **CORS Protection** - Cross-origin resource sharing kontrolü

### 📊 Veritabanı Şeması

Ana modeller:

- **User** - Kullanıcı bilgileri ve authentication
- **Account** - Banka hesapları
- **CreditCard** - Kredi kartı bilgileri
- **EWallet** - E-cüzdanlar
- **Transaction** - Finansal işlemler
- **RefTxCategory** - İşlem kategorileri
- **Investment** - Yatırım portföyü
- **GoldItem** - Altın yatırımları
- **AutoPayment** - Otomatik ödemeler
- **Period** - Periyod yönetimi
- **UserSubscription** - Abonelik bilgileri

Detaylı şema için: `prisma/schema.prisma`

### 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Lütfen şu adımları izleyin:

1. **Fork** yapın
2. **Feature branch** oluşturun (`git checkout -b feature/amazing-feature`)
3. **Commit** yapın (`git commit -m 'feat: Add some amazing feature'`)
4. **Push** yapın (`git push origin feature/amazing-feature`)
5. **Pull Request** açın

#### Commit Standartları

Proje [Conventional Commits](https://www.conventionalcommits.org/) standardını kullanır:

- `feat:` Yeni özellik
- `fix:` Bug düzeltmesi
- `docs:` Dokümantasyon değişiklikleri
- `style:` Kod formatı (formatting)
- `refactor:` Kod refactoring
- `test:` Test ekleme/değişiklikleri
- `chore:` Build process veya yardımcı araçlar

### 📄 Lisans

Bu proje [MIT License](LICENSE) altında lisanslanmıştır.

### 📞 İletişim

- 📧 **Email**: support@giderse.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/giderseGelir/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/giderseGelir/discussions)

### 🙏 Teşekkürler

Bu projeyi mümkün kılan harika açık kaynak projeler:

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Chart library
- [Railway](https://railway.app/) - Cloud platform

---

<div align="center">

**Versiyon:** 2.1.1  
**Son Güncelleme:** 2025-01-28

Made with ❤️ by GiderSE Team

[⬆ Back to Top](#-giderse-gelir)

</div>

---

## 🇬🇧 English

### 📖 About

**GiderSE Gelir** is a modern, AI-powered financial management platform that provides comprehensive financial control from personal finance to enterprise-level accounting. Built with Next.js 15, TypeScript, and PostgreSQL, it features enterprise-grade security and performance standards.

### ✨ Key Features

#### 🧠 AI & Smart Analytics

- **AI Financial Assistant**: Analyzes your spending and provides savings recommendations
- **Auto Categorization**: Transactions automatically categorized
- **Forecast Models**: Predict income and expenses 3-6 months ahead
- **Smart Recommendations**: Personalized financial advice

#### 📊 Advanced Reporting & Analytics

- **Interactive Charts**: Rich visualizations with Recharts
- **Spending Distribution**: Detailed category-based analysis
- **Trend Analysis**: View financial changes over time
- **PDF/Excel Export**: Generate professional reports
- **Period Management**: Track by year, month, or custom periods

#### 💳 Comprehensive Account Management

- **Multi-Account Support**: Banks, e-wallets, credit cards
- **Credit Card Management**: Manage all cards in one place
- **Auto Payments**: Automatically track recurring expenses
- **Balance Tracking**: Real-time balance viewing

#### 📈 Investment Portfolio

- **Stock Tracking**: Monitor portfolio performance
- **Crypto Management**: Track your crypto assets
- **Gold Management**: Manage gold investments
- **Portfolio Analysis**: Detailed investment reports

#### 🏢 Enterprise Features

- **Multi-User Support**: Perfect for team collaboration
- **Department Management**: Organizational structure support
- **Role-Based Access**: Granular permission control
- **API Access**: RESTful API for integrations
- **Webhook Support**: Real-time notifications

#### 🔒 Enterprise Security

- **JWT Authentication**: Secure authentication
- **Bcrypt Hashing**: Password security
- **SQL Injection Protection**: Safe queries with Prisma ORM
- **XSS Protection**: Content Security Policy
- **HTTPS Enforcement**: Secure connection requirement
- **Security Headers**: Comprehensive security headers

### 🛠️ Technology Stack

#### Frontend

- **Next.js 15** - React framework (App Router)
- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible UI components
- **Recharts** - Charts and visualizations
- **React Hook Form** - Form management
- **Zod** - Runtime validation

#### Backend

- **Next.js API Routes** - RESTful API
- **Prisma ORM** - Type-safe database client
- **PostgreSQL** - Powerful relational database
- **JWT** - Stateless authentication
- **Bcrypt** - Password hashing
- **Resend** - Email service

#### DevOps & Tools

- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Commitlint** - Commit standardization
- **Vitest** - Unit testing
- **Playwright** - E2E testing
- **Docker** - Containerization
- **Railway** - Cloud deployment

### 📋 Requirements

- **Node.js** 18.0 or higher
- **PostgreSQL** 14.0 or higher
- **npm** 9.0 or higher (or yarn/pnpm)

### 🚀 Quick Start

#### 1. Clone the Repository

```bash
git clone https://github.com/your-username/giderseGelir.git
cd giderseGelir
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Environment Variables

Create `.env` file:

```bash
cp env.example .env
```

Edit required variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/giderse_gelir"

# Authentication
JWT_SECRET="your-super-secret-jwt-key-here"
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxx"

# Payment (PayTR)
PAYTR_MERCHANT_ID="your-merchant-id"
PAYTR_MERCHANT_KEY="your-merchant-key"
PAYTR_MERCHANT_SALT="your-merchant-salt"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

#### 4. Set Up Database

```bash
# Run migrations
npx prisma migrate dev

# Load seed data (optional)
npm run db:seed
```

#### 5. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 📦 Installation Options

#### Full Development Environment

```bash
# Start database and development server together
npm run dev:full
```

#### Docker Installation

```bash
# Build Docker image
docker build -t giderse-gelir .

# Run container
docker run -p 3000:3000 --env-file .env giderse-gelir
```

### 🧪 Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# API tests
npm run test:api

# Plan-based tests
npm run test:api:free
npm run test:api:premium
npm run test:api:enterprise
npm run test:api:enterprise-premium

# Test coverage
npm run test:coverage

# E2E tests
npm run e2e
```

### 🚢 Deployment

#### Railway Deployment

For detailed deployment guide: [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md)

**Quick Start:**

1. Create [Railway](https://railway.app) account
2. Connect GitHub repository
3. Add PostgreSQL service
4. Set environment variables
5. Deploy!

```bash
# With Railway CLI
railway login
railway link
railway up
```

#### Production Build

```bash
# Production build
npm run build

# Production server
npm start
```

### 📚 Documentation

- 📖 [API Documentation](docs/API.md) - All API endpoints
- 🏛️ [Architecture Documentation](docs/ARCHITECTURE.md) - System architecture
- 🚀 [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment
- 💳 [Payment Flow](docs/PAYMENT_FLOW.md) - Payment integration
- 📋 [Subscription Plans](docs/SUBSCRIPTION_PLANS.md) - Plan details
- 🔧 [Environment Variables](docs/ENVIRONMENT_VARIABLES.md) - Config guide

### 🎯 Subscription Plans

#### 🆓 FREE Plan

- Basic income-expense tracking
- 50 transactions/month limit
- Maximum 3 accounts
- Maximum 2 credit cards
- 10 analysis limit
- Basic reports

#### ⭐ PREMIUM Plan - ₺250/month

- **Unlimited** transactions and accounts
- **AI Financial Assistant** (4 reports/month)
- Advanced analytics and reports
- Investment tracking
- Auto payments
- PDF/Excel export
- Premium support

#### 🏢 ENTERPRISE Plan - ₺450/month

- All Premium features
- Multi-user support
- Department management
- Role-based access control
- API access
- Webhook support
- Custom integrations
- Dedicated account manager

#### 🚀 ENTERPRISE PREMIUM Plan

- All Enterprise features
- Multi-company consolidation
- Global branch network
- Enterprise security (Quantum encryption)
- Corporate AI super intelligence
- 150+ currency support
- Custom system integrations (SAP, Oracle, Dynamics)
- VIP corporate support

### 🏗️ Project Structure

```
giderseGelir/
├── app/                    # Next.js App Router
│   ├── (dashboard)/       # Dashboard pages
│   ├── (transactions)/    # Transaction pages
│   ├── accounts/          # Account management
│   ├── admin/             # Admin panel
│   ├── ai-analysis/       # AI analysis
│   ├── analysis/          # Financial analysis
│   ├── api/               # API routes
│   ├── auth/              # Authentication
│   ├── investments/       # Investment management
│   └── ...
├── components/            # React components
│   ├── ui/               # UI components (Radix UI)
│   └── ...
├── lib/                   # Utility functions
│   ├── auth.ts           # Authentication logic
│   ├── prisma.ts         # Prisma client
│   ├── plan-config.ts    # Plan configuration
│   └── ...
├── prisma/               # Database schema
│   ├── schema.prisma     # Prisma schema
│   └── migrations/       # Database migrations
├── docs/                 # Documentation
├── tests/                # Test files
└── public/               # Static files
```

### 🔒 Security

- ✅ **JWT Authentication** - Stateless, scalable auth
- ✅ **Bcrypt Password Hashing** - Secure password storage
- ✅ **SQL Injection Protection** - Safe queries with Prisma ORM
- ✅ **XSS Protection** - Content Security Policy
- ✅ **HTTPS Enforcement** - Secure connection requirement
- ✅ **Security Headers** - Comprehensive security headers
- ✅ **Rate Limiting** - API rate limiting
- ✅ **Input Validation** - Runtime validation with Zod
- ✅ **CORS Protection** - Cross-origin resource sharing control

### 📊 Database Schema

Main models:

- **User** - User information and authentication
- **Account** - Bank accounts
- **CreditCard** - Credit card information
- **EWallet** - E-wallets
- **Transaction** - Financial transactions
- **RefTxCategory** - Transaction categories
- **Investment** - Investment portfolio
- **GoldItem** - Gold investments
- **AutoPayment** - Auto payments
- **Period** - Period management
- **UserSubscription** - Subscription information

For detailed schema: `prisma/schema.prisma`

### 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'feat: Add some amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

#### Commit Standards

The project uses [Conventional Commits](https://www.conventionalcommits.org/) standard:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code formatting
- `refactor:` Code refactoring
- `test:` Test additions/changes
- `chore:` Build process or auxiliary tools

### 📄 License

This project is licensed under the [MIT License](LICENSE).

### 📞 Contact

- 📧 **Email**: support@giderse.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/your-username/giderseGelir/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/your-username/giderseGelir/discussions)

### 🙏 Acknowledgments

Amazing open source projects that made this possible:

- [Next.js](https://nextjs.org/) - React framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Radix UI](https://www.radix-ui.com/) - Accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS
- [Recharts](https://recharts.org/) - Chart library
- [Railway](https://railway.app/) - Cloud platform

---

<div align="center">

**Version:** 2.1.1  
**Last Updated:** 2025-01-28

Made with ❤️ by GiderSE Team

[⬆ Back to Top](#-giderse-gelir)

</div>
