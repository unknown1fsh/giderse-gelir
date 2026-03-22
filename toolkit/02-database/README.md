# 02 — Database Katmanı

> ORM: Prisma 5 | Provider: PostgreSQL
> Son güncelleme: 2026-03-22

---

## Bağlantı

```
DATABASE_URL=postgresql://user:password@host:5432/giderse_gelir?schema=public
```

---

## Model Kategorileri

### Kategori 1: Referans / Lookup Tabloları
Sistem genelinde paylaşılan sabit veriler. Seed script tarafından doldurulur.

| Model | Tablo | Açıklama |
|-------|-------|----------|
| `SystemParameter` | `system_parameter` | Uygulama konfigürasyonu (group+code key) |
| `RefCurrency` | `ref_currency` | Para birimleri (TRY, USD, EUR...) |
| `RefAccountType` | `ref_account_type` | Hesap tipleri (vadesiz, vadeli...) |
| `RefTxType` | `ref_tx_type` | İşlem tipleri (gelir/gider) |
| `RefTxCategory` | `ref_tx_category` | İşlem kategorileri (tx_type ile ilişkili) |
| `RefPaymentMethod` | `ref_payment_method` | Ödeme yöntemleri (nakit, kart, EFT...) |
| `RefGoldType` | `ref_gold_type` | Altın tipleri (cumhuriyet, gram...) |
| `RefGoldPurity` | `ref_gold_purity` | Altın saflık (14K, 18K, 22K, 24K) |
| `RefBank` | `ref_bank` | Banka listesi (Türkiye'deki bankalar) |

### Kategori 2: Kimlik & Oturum
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `User` | `user` | Ana kullanıcı kaydı |
| `UserSession` | `user_session` | JWT oturumları (token + expiry) |
| `UserSubscription` | `user_subscription` | Abonelik geçmişi |
| `PaymentRequest` | `payment_request` | Admin onaylı ödeme talepleri |

### Kategori 3: Dönem Yönetimi
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `Period` | `period` | Finansal dönemler (aylık/yıllık/özel) |
| `PeriodClosing` | `period_closing` | Kapatılan dönemin net worth özeti |
| `PeriodTransfer` | `period_transfer` | Dönemler arası bakiye transferleri |

### Kategori 4: Finansal Varlıklar
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `Account` | `account` | Banka hesapları |
| `CreditCard` | `credit_card` | Kredi kartları (limit, ekstre, vade) |
| `EWallet` | `e_wallet` | E-cüzdanlar (Papara, PayPal...) |
| `Beneficiary` | `beneficiary` | Kayıtlı alıcılar (IBAN/hesap numarası) |
| `Transaction` | `transaction` | Tüm gelir/gider işlemleri |
| `AutoPayment` | `auto_payment` | Otomatik/tekrarlayan ödemeler |
| `GoldItem` | `gold_item` | Fiziksel altın varlıkları |
| `Investment` | `investment` | Yatırımlar (hisse, kripto, fon, emtia...) |
| `Loan` | `loan` | Krediler (konut, araç, bireysel) |
| `FxRate` | `fx_rate` | Döviz kurları (TCMB kaynaklı) |
| `PortfolioSnapshot` | `portfolio_snapshot` | Günlük net worth anlık görüntüleri |

### Kategori 5: Planlama & Hedefler
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `Goal` | `goal` | Tasarruf hedefleri |
| `BudgetPlan` | `budget_plan` | Bütçe planları |
| `BudgetAllocation` | `budget_allocation` | Kategori bazlı bütçe tahsisi |
| `BudgetAlert` | `budget_alert` | Bütçe aşım uyarıları |

### Kategori 6: Bildirimler & Destek
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `Notification` | `notification` | Uygulama içi bildirimler |
| `PushSubscription` | `push_subscription` | Web Push abonelikleri |
| `SavedView` | `saved_view` | Kullanıcı kayıtlı filtre görünümleri |
| `SupportTicket` | `support_ticket` | Destek talepleri |
| `SupportTicketCategory` | `support_ticket_category` | Destek kategorileri |
| `SupportTicketReply` | `support_ticket_reply` | Ticket yanıtları |
| `SupportTicketAttachment` | `support_ticket_attachment` | Ticket dosya ekleri |
| `Feedback` | `feedback` | Kullanıcı geri bildirimleri |
| `FAQ` | `faq` | Sık Sorulan Sorular |

### Kategori 7: AI & Raporlama
| Model | Tablo | Açıklama |
|-------|-------|----------|
| `AIReportUsage` | `ai_report_usage` | AI analiz raporu kullanım takibi |

---

## Önemli İlişkiler

```
User
 ├── UserSession[]         (1:N, onDelete: Cascade)
 ├── UserSubscription[]    (1:N, onDelete: Cascade)
 ├── Period[]              (1:N, onDelete: Cascade)
 │    ├── Account[]        (Period bazlı varlıklar, onDelete: Cascade)
 │    ├── CreditCard[]
 │    ├── EWallet[]
 │    ├── GoldItem[]
 │    ├── Investment[]
 │    ├── BudgetPlan[]
 │    └── Transaction[]
 ├── Transaction[]         (1:N, doğrudan)
 ├── Loan[]                (1:N)
 ├── Goal[]                (1:N)
 ├── AIReportUsage[]       (1:N)
 └── SupportTicket[]       (1:N)

Transaction
 ├── Account?              (opsiyonel FK)
 ├── CreditCard?           (opsiyonel FK)
 ├── EWallet?              (opsiyonel FK)
 ├── Loan?                 (opsiyonel FK)
 ├── Beneficiary?          (opsiyonel FK)
 ├── RefTxType             (zorunlu FK)
 ├── RefTxCategory         (zorunlu FK)
 ├── RefCurrency           (zorunlu FK)
 └── RefPaymentMethod      (zorunlu FK)

Period
 ├── PeriodClosing?        (1:1)
 └── PeriodTransfer[]      (from/to relation)
```

---

## Önemli Index'ler

```sql
-- Transaction sorguları için kritik
@@index([userId, periodId])
@@index([periodId, transactionDate])
@@index([userId, transactionDate])
@@index([userId, categoryId, transactionDate])
@@index([userId, txTypeId, transactionDate])

-- Notification feed için
@@index([userId, channel, readAt])
@@index([userId, status, createdAt])

-- Period aktif dönem sorgusu
@@index([userId, isActive])
@@index([userId, startDate, endDate])

-- AI rapor sorguları
@@index([userId, monthYear])
```

---

## Migration Geçmişi

| Migration | Tarih | İçerik |
|-----------|-------|--------|
| `20241012_initial` | Ekim 2024 | İlk şema |
| `20250120_add_ai_report_usage` | Ocak 2025 | AI rapor tablosu |
| `20250126_add_email_verification` | Ocak 2025 | E-posta doğrulama alanları |
| `20250126_add_credit_card_active` | Ocak 2025 | Kredi kartı active alanı |
| `20250126_fix_missing_columns` | Ocak 2025 | Eksik kolon düzeltmeleri |
| `20250128_add_help_support_system` | Ocak 2025 | Destek sistemi tabloları |
| `20250128_add_payment_request` | Ocak 2025 | Ödeme talebi tablosu |
| `20250128_add_user_role` | Ocak 2025 | Kullanıcı rol alanı |
| `20250129_remove_unused_tables` | Ocak 2025 | Kullanılmayan tablolar kaldırıldı |
| `20251028_fix_refs` | Ekim 2025 | Referans düzeltmeleri |
| `20251205222218_sonmig` | Aralık 2025 | Çeşitli iyileştirmeler |
| `20251214211221_add_username` | Aralık 2025 | username alanı |
| `20251214_add_feedback_model` | Aralık 2025 | Feedback modeli |
| `20260116_add_password_reset` | Ocak 2026 | Şifre sıfırlama alanları |
| `20260119_add_fictional_loan` | Ocak 2026 | Kurgu kredi alanı |
| `20260307_faz1_ux_foundation` | Mart 2026 | UX temel iyileştirmeleri |

---

## Migration Komutları

```bash
# Yeni migration oluştur (dev)
npx prisma migrate dev --name açıklama_adı

# Production migration uygula
npx prisma migrate deploy

# Şema değişikliğini veritabanına push et (migration oluşturmadan, dikkatli kullan)
npx prisma db push

# Prisma Client'ı yenile
npx prisma generate

# Veritabanı görsel arayüz
npx prisma studio
```

---

## Seed Komutları

```bash
# Temel referans verileri + test kullanıcısı
npm run db:seed            # prisma/seed.ts çalıştırır

# Demo kullanıcısı oluştur (tam verili)
npm run db:seed-demo       # scripts/seed-demo-user.ts çalıştırır
```

---

## Acil Durum SQL

Bkz. [`create_database.sql`](create_database.sql) — Prisma migration'larına erişim olmadığında kullanılabilecek tam DDL scripti.

> **Not:** Mümkün olduğunca `prisma migrate deploy` tercih edilmeli. SQL scripti yalnızca migration history kaybında veya direct DB erişiminin gerektiği durumlarda kullanılmalı.
