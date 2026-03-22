# 01 — Bağımlılıklar (Dependencies)

> Kaynak: `package.json` — Son güncelleme: 2026-03-22

---

## Production Dependencies

| Paket | Versiyon | Amaç |
|-------|----------|------|
| `next` | ^15.5.9 | Full-stack React framework (App Router) |
| `react` | ^18.2.0 | UI kütüphanesi |
| `react-dom` | ^18.2.0 | React DOM renderer |
| `@prisma/client` | ^5.7.1 | Tip güvenli veritabanı istemcisi |
| `prisma` | ^5.7.1 | ORM ve migration aracı |
| `jsonwebtoken` | ^9.0.2 | JWT oluşturma ve doğrulama |
| `bcryptjs` | ^3.0.2 | Şifre hashleme |
| `zod` | ^3.22.4 | Schema doğrulama (API input validation) |
| `react-hook-form` | ^7.48.2 | Form yönetimi |
| `@hookform/resolvers` | ^3.3.2 | RHF + Zod entegrasyonu |
| `@tanstack/react-query` | ^5.14.2 | Server state yönetimi, cache |
| `openai` | ^4.20.0 | OpenAI GPT-4 entegrasyonu (AI raporlar) |
| `resend` | ^3.5.0 | E-posta gönderimi (doğrulama, bildirim) |
| `web-push` | ^3.6.7 | Web Push bildirimleri (PWA) |
| `pdf-lib` | ^1.17.1 | PDF rapor oluşturma |
| `xlsx` | ^0.18.5 | Excel/CSV export |
| `recharts` | ^2.8.0 | Grafik/chart kütüphanesi |
| `lucide-react` | ^0.303.0 | SVG ikon seti |
| `clsx` | ^2.0.0 | Koşullu className birleştirme |
| `tailwind-merge` | ^2.2.0 | TailwindCSS class çakışmalarını çözme |
| `class-variance-authority` | ^0.7.0 | Variant tabanlı component stil sistemi |
| `tailwindcss-animate` | ^1.0.7 | TailwindCSS animasyon eklentisi |

### Radix UI Primitives

Headless, erişilebilir UI bileşenleri. Her biri ayrı paket:

| Paket | Kullanım |
|-------|----------|
| `@radix-ui/react-accordion` | Açılır/kapanır paneller |
| `@radix-ui/react-alert-dialog` | Onay diyalogları |
| `@radix-ui/react-avatar` | Kullanıcı avatarı |
| `@radix-ui/react-checkbox` | Checkbox input |
| `@radix-ui/react-dialog` | Modal diyaloglar |
| `@radix-ui/react-dropdown-menu` | Açılır menüler |
| `@radix-ui/react-label` | Form etiketleri |
| `@radix-ui/react-popover` | Tooltip/popover |
| `@radix-ui/react-progress` | İlerleme çubuğu |
| `@radix-ui/react-select` | Dropdown select |
| `@radix-ui/react-separator` | Ayırıcı çizgi |
| `@radix-ui/react-slot` | Component composition |
| `@radix-ui/react-switch` | Toggle switch |
| `@radix-ui/react-tabs` | Sekme navigasyon |
| `@radix-ui/react-toast` | Bildirim toast'ları |

### Type Definitions (Production'da gerekli)

| Paket | Amaç |
|-------|------|
| `@types/bcryptjs` | bcryptjs TS tipleri |
| `@types/jsonwebtoken` | jsonwebtoken TS tipleri |

---

## Development Dependencies

| Paket | Versiyon | Amaç |
|-------|----------|------|
| `typescript` | ^5.3.3 | TypeScript derleyici |
| `vitest` | ^1.1.0 | Test framework |
| `@vitest/coverage-v8` | ^1.1.0 | Coverage raporu (V8 engine) |
| `@testing-library/react` | ^14.1.2 | React component test yardımcıları |
| `@testing-library/jest-dom` | ^6.1.5 | DOM assertion matchers |
| `@playwright/test` | ^1.40.1 | E2E test framework |
| `tsx` | ^4.6.2 | TypeScript dosyalarını direkt çalıştır (ts-node alternatifi) |
| `eslint` | ^8.56.0 | JavaScript/TypeScript linter |
| `eslint-config-next` | ^15.5.9 | Next.js ESLint kuralları |
| `eslint-config-prettier` | ^9.1.0 | ESLint + Prettier çakışma önleme |
| `@typescript-eslint/eslint-plugin` | ^6.15.0 | TypeScript ESLint kuralları |
| `@typescript-eslint/parser` | ^6.15.0 | TypeScript AST parser |
| `prettier` | ^3.1.1 | Kod formatlayıcı |
| `tailwindcss` | ^3.4.0 | Utility-first CSS framework |
| `autoprefixer` | ^10.4.16 | PostCSS vendor prefix ekleme |
| `postcss` | ^8.4.31 | CSS transformation pipeline |
| `husky` | ^8.0.3 | Git hook'ları yönetimi |
| `lint-staged` | ^15.2.0 | Sadece staged dosyalara lint uygulama |
| `@commitlint/cli` | ^18.4.3 | Commit mesajı linting |
| `@commitlint/config-conventional` | ^18.4.3 | Conventional Commits kuralları |
| `npm-run-all` | ^4.1.5 | Paralel/sıralı npm script çalıştırma |
| `@types/node` | ^20.10.5 | Node.js TS tipleri |
| `@types/react` | ^18.2.45 | React TS tipleri |
| `@types/react-dom` | ^18.2.18 | ReactDOM TS tipleri |
| `@types/web-push` | ^3.6.4 | web-push TS tipleri |

---

## Kritik Bağımlılık Notları

### Prisma Schema → Client Senkronizasyonu
`prisma/schema.prisma` değiştirildiğinde mutlaka `npx prisma generate` çalıştırılmalı.
Railway'de `postinstall` script'i bunu otomatik yapar.

### Next.js 15 Uyumluluk
React 18 ile Next.js 15 kullanılıyor. Server Components varsayılan; client component için `'use client'` direktifi gerekli.

### xlsx Güvenlik Notu
`xlsx` paketi (0.18.x) bazı güvenlik açıkları içeriyor. Yükseltme sırasında API uyumluluğunu kontrol et.

### web-push VAPID
`public/sw.js` service worker ile birlikte çalışır. VAPID anahtarları `SystemParameter` tablosunda saklanır.
