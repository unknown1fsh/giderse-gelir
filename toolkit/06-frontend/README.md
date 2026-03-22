# 06 — Frontend Katmanı

> Framework: Next.js 15 App Router | UI: TailwindCSS + Radix UI
> Son güncelleme: 2026-03-22

---

## App Router Yapısı

```
app/
├── layout.tsx                    # Root layout (font, metadata, Google Tag)
├── page.tsx                      # / → middleware ile /landing veya /dashboard'a yönlendirilir
├── globals.css                   # Global stiller, TailwindCSS direktifleri
│
├── (dashboard)/                  # Kimlik doğrulama gerektiren sayfalar grubu
│   ├── layout.tsx                # Dashboard layout (sidebar + üst bar)
│   ├── dashboard/page.tsx        # Ana dashboard
│   ├── transactions/             # İşlem yönetimi (liste, yeni gelir/gider)
│   ├── accounts/                 # Banka hesapları
│   ├── cards/                    # Kredi kartları
│   ├── ewallets/                 # E-cüzdanlar
│   ├── beneficiaries/            # Alıcılar
│   ├── investments/              # Yatırımlar (hisse, kripto, altın, fon...)
│   ├── gold/                     # Fiziksel altın
│   ├── loans/                    # Krediler
│   ├── installments/             # Taksitler
│   ├── auto-payments/            # Otomatik ödemeler
│   ├── budgets/                  # Bütçeler
│   ├── goals/                    # Tasarruf hedefleri
│   ├── periods/                  # Dönem yönetimi
│   ├── portfolio/                # Portföy özeti
│   ├── analysis/                 # Analizler (cashflow, kategoriler, trendler, export)
│   ├── ai-analysis/              # AI analiz raporları
│   ├── settings/                 # Kullanıcı ayarları
│   ├── help/                     # Yardım merkezi + destek ticketleri
│   ├── premium/                  # Plan yükseltme sayfası
│   ├── premium-features/         # Premium özellikler genel bakış
│   └── enterprise-dashboard/     # Enterprise dashboard
│
├── admin/                        # Admin paneli (ADMIN rolü gerektirir)
│   ├── layout.tsx                # Admin layout
│   ├── page.tsx                  # Admin ana dashboard
│   ├── users/                    # Kullanıcı yönetimi
│   ├── transactions/             # Tüm işlemler
│   ├── subscriptions/            # Abonelik yönetimi
│   ├── payment-requests/         # Ödeme talepleri
│   ├── investments/              # Yatırım izleme
│   ├── accounts/                 # Hesap izleme
│   ├── support-tickets/          # Destek talepleri
│   ├── faq/                      # SSS yönetimi
│   ├── feedback/                 # Geri bildirim
│   ├── reports/                  # Raporlar
│   ├── system/                   # Sistem ayarları
│   └── components/               # Admin'e özel componentler
│
├── auth/                         # Kimlik doğrulama sayfaları
│   ├── login/
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   └── verify-email/
│
├── landing/                      # Public ana sayfa
├── pricing/                      # Fiyatlandırma sayfası
├── features/                     # Özellikler sayfası
├── demo/                         # Demo sayfası
├── enterprise/                   # Enterprise landing
├── enterprise-premium/           # Enterprise Premium landing
├── payment/                      # Ödeme callback sayfaları
├── privacy/                      # Gizlilik politikası
├── terms/                        # Kullanım şartları
├── cookie-policy/                # Çerez politikası
└── kvkk/                         # KVKK metni
```

---

## Mosaic UI Sistemi (`components/mosaic/`)

Projenin kendi UI kütüphanesi. Tüm bileşenler `components/mosaic/index.ts`'den export edilir.

```typescript
import { Button, Card, Modal, ... } from '@/components/mosaic'
```

### Bileşen Listesi

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| `Button` | `button.tsx` | Variant'lı buton (primary, secondary, danger) |
| `Card`, `CardHeader`, `CardContent`, `CardFooter` | `card.tsx` | Kart container |
| `Input` | `input.tsx` | Form input |
| `Select` | `select.tsx` | Dropdown seçici (Radix UI tabanlı) |
| `Textarea` | `textarea.tsx` | Çok satırlı metin girişi |
| `Checkbox` | `checkbox.tsx` | Onay kutusu |
| `Switch` | `switch.tsx` | Toggle |
| `Label` | `label.tsx` | Form etiketi |
| `FormField` | `form-field.tsx` | Label + Input + Error mesajı wrapper |
| `Modal` | `modal.tsx` | Radix Dialog tabanlı modal |
| `Dialog` | `dialog.tsx` | Alternatif dialog |
| `Drawer` | `drawer.tsx` | Yan panel drawer |
| `ConfirmDialog` | `confirm-dialog.tsx` | Silme/onay diyalogu (variant: danger/warning/primary) |
| `ConfirmationDialog` | `confirmation-dialog.tsx` | Alternatif onay diyalogu (confirmButtonClass prop'u ile) |
| `Alert` | `alert.tsx` | Uyarı mesajı (info/success/warning/error) |
| `Badge` | `badge.tsx` | Etiket/rozet |
| `Skeleton` | `skeleton.tsx` | Yükleme iskelet animasyonu |
| `Spinner` | `spinner.tsx` | Dönen yükleme göstergesi |
| `EmptyState` | `empty-state.tsx` | Veri yokken gösterilen ekran |
| `ErrorState` | `error-state.tsx` | Hata ekranı |
| `Pagination` | `pagination.tsx` | Sayfalama kontrolü |
| `SearchBox` | `search-box.tsx` | Arama kutusu |
| `FilterBar` | `filter-bar.tsx` | Filtre çubuğu |
| `Tabs` | `tabs.tsx` | Sekme navigasyonu |
| `Accordion` | `accordion.tsx` | Açılır/kapanır panel |
| `Table` | `table.tsx` | Tablo (thead/tbody/tr/td) |
| `DataTable` | `data-table.tsx` | Sıralama ve sayfalama özellikli tablo |
| `StatCard` | `stat-card.tsx` | İstatistik kartı (değer + başlık + trend) |
| `DashboardCard` | `dashboard-card.tsx` | Dashboard içerik kartı |
| `ChartCard` | `chart-card.tsx` | Grafik container kart |
| `PageHeader` | `page-header.tsx` | Sayfa başlığı + breadcrumb |
| `PageShells` | `page-shells.tsx` | Standart sayfa kap şablonları |
| `SectionWrapper` | `section-wrapper.tsx` | Bölüm wrapper |
| `ActionBar` | `action-bar.tsx` | Eylem çubuğu |
| `DistributionBar` | `distribution-bar.tsx` | Dağılım çubuk grafiği |
| `EditNameModal` | `edit-name-modal.tsx` | İsim düzenleme modal'ı |
| `QuickActionTile` | `quick-action-tile.tsx` | Hızlı eylem kartı |

---

## Context'ler (`lib/`)

| Context | Dosya | Açıklama |
|---------|-------|----------|
| `UserContext` | `lib/user-context.tsx` | Giriş yapmış kullanıcı bilgisi, plan bilgisi |
| `PremiumContext` | `lib/premium-context.tsx` | Premium özelliklere erişim durumu |
| `PeriodContext` | `lib/period-context.tsx` | Aktif dönem yönetimi |

```typescript
// Kullanım:
const { user, loading } = useUser()
const { isPremium } = usePremium()
const { activePeriod, setActivePeriod } = usePeriod()
```

---

## Önemli `lib/` Yardımcıları

| Dosya | İçerik |
|-------|--------|
| `lib/utils.ts` | `cn()` (clsx + twMerge), `getDisplayName()`, para birimi formatlama |
| `lib/validators.ts` | `formatCurrency()`, Zod şemaları |
| `lib/plan-config.ts` | Plan limitleri, fiyatları, helper fonksiyonlar |
| `lib/use-premium.ts` | `usePremium()` hook'u |
| `lib/use-toast.tsx` | Toast bildirim hook'u |
| `lib/demo-data.ts` | Demo kullanıcısı için statik veri |
| `lib/finance-calculators.ts` | Tarayıcı tarafı finansal hesaplamalar |
| `lib/finance/` | Bütçe, yatırım, kredi, net worth hesap modülleri |
| `lib/notifications/` | E-posta ve web push bildirim fonksiyonları |
| `lib/paytr.ts` | PayTR ödeme entegrasyonu |
| `lib/shopier.ts` | Shopier ödeme entegrasyonu |
| `lib/shopier-links.ts` | Sabit Shopier ödeme linkleri |
| `lib/email.ts` | Resend e-posta şablonları |
| `lib/google-ads.ts` | Google Ads dönüşüm takibi |
| `lib/rate-limit.ts` | Basit rate limiting |
| `lib/search.ts` | Global arama mantığı |
| `lib/ai-report-pdf-generator.ts` | AI raporu → PDF dönüştürme |

---

## Landing Sayfası Bileşenleri (`components/landing/`)

| Bileşen | İçerik |
|---------|--------|
| `feature-carousel.tsx` | Özellik döngüsü |
| `feedback-form.tsx` | Kullanıcı geri bildirim formu |
| `landing-calculators.tsx` | Hesaplama araçları wrapper |
| `calculators/budget-50-30-20.tsx` | 50/30/20 bütçe hesaplayıcı |
| `calculators/compound-calculator.tsx` | Bileşik faiz hesaplayıcı |
| `calculators/currency-converter.tsx` | Döviz çevirici |
| `calculators/inflation-calculator.tsx` | Enflasyon hesaplayıcı |
| `calculators/loan-calculator.tsx` | Kredi hesaplayıcı |

---

## Önemli Tekil Bileşenler

| Bileşen | Dosya | Açıklama |
|---------|-------|----------|
| `Sidebar` | `components/sidebar.tsx` | Ana navigasyon menüsü (plan bazlı menü öğeleri) |
| `PremiumUpgradeModal` | `components/premium-upgrade-modal.tsx` | Plan yükseltme çağrısı modal'ı |
| `DemoBanner` | `components/demo-banner.tsx` | Demo hesap uyarı bandı |
| `EmailVerificationBanner` | `components/email-verification-banner.tsx` | Doğrulanmamış e-posta uyarısı |
| `PeriodSelector` | `components/period-selector.tsx` | Dönem seçici dropdown |
| `PeriodOnboarding` | `components/period-onboarding.tsx` | İlk dönem oluşturma rehberi |
| `PaymentCheckout` | `components/payment-checkout.tsx` | Ödeme formu |
| `NotificationCenter` | `components/dashboard/notification-center.tsx` | Bildirim paneli |
| `GlobalOmnibox` | `components/dashboard/global-omnibox.tsx` | Global arama kutusu |
| `BrandLogo` | `components/brand-logo.tsx` | Marka logosu SVG |
