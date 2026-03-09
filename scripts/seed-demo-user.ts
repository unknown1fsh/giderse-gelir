/**
 * Demo kullanıcı seed scripti
 * demo@giderse-gelir.com / demo123
 *
 * Uygulamanın TÜM alanlarını kapsayan gerçekçi Türk kullanıcı verisi oluşturur.
 * Çalıştırmak için: npm run db:seed-demo
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// ─── Yardımcı: Tarih oluştur ───────────────────────────────────────────────
function d(year: number, month: number, day: number): Date {
  return new Date(Date.UTC(year, month - 1, day))
}

// Geçmiş 6 ay içinde rastgele gün offset'li tarih
function daysAgo(days: number): Date {
  const dt = new Date()
  dt.setDate(dt.getDate() - days)
  return dt
}

async function main() {
  console.log('🚀 Demo kullanıcı seed başlatılıyor...\n')

  // ── Referans verileri ────────────────────────────────────────────────────
  const tryC   = await prisma.refCurrency.findUniqueOrThrow({ where: { code: 'TRY' } })
  const usdC   = await prisma.refCurrency.findUniqueOrThrow({ where: { code: 'USD' } })
  await prisma.refCurrency.findUniqueOrThrow({ where: { code: 'EUR' } })

  const vadesiz = await prisma.refAccountType.findUniqueOrThrow({ where: { code: 'VADESIZ' } })
  const vadeli  = await prisma.refAccountType.findUniqueOrThrow({ where: { code: 'VADELI' } })
  const doviz   = await prisma.refAccountType.findUniqueOrThrow({ where: { code: 'DOVIZ' } })

  const gelirType  = await prisma.refTxType.findUniqueOrThrow({ where: { code: 'GELIR' } })
  const giderType  = await prisma.refTxType.findUniqueOrThrow({ where: { code: 'GIDER' } })

  // Gelir kategorileri
  const catMaas       = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: gelirType.id, code: 'MAAS' } })
  const catYemekK     = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: gelirType.id, code: 'YEMEK_KARTI' } })
  const catEkGelir    = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: gelirType.id, code: 'EK_GELIR' } })
  const catFaiz       = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: gelirType.id, code: 'FAIZ_GELIRI' } })
  const catDigerGelir = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: gelirType.id, code: 'DIGER_GELIR' } })

  // Gider kategorileri
  const catMarket   = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'MARKET' } })
  const catKira     = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'KIRA' } })
  const catFatura   = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'FATURA' } })
  const catUlasim   = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'ULASIM' } })
  const catSaglik   = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'SAGLIK' } })
  const catVergi    = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'VERGI' } })
  const catAbonelik = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'ABONELIK' } })
  const catEglence  = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'EGLENCE' } })
  const catDiger    = await prisma.refTxCategory.findFirstOrThrow({ where: { txTypeId: giderType.id, code: 'DIGER_GIDER' } })

  // Ödeme yöntemleri
  await prisma.refPaymentMethod.findUniqueOrThrow({ where: { code: 'NAKIT' } })
  const pmHavale   = await prisma.refPaymentMethod.findUniqueOrThrow({ where: { code: 'HAVALE_EFT' } })
  const pmKredi    = await prisma.refPaymentMethod.findUniqueOrThrow({ where: { code: 'KREDI_KARTI' } })
  const pmDebit    = await prisma.refPaymentMethod.findUniqueOrThrow({ where: { code: 'DEBIT_KARTI' } })
  const pmEcuzdan  = await prisma.refPaymentMethod.findUniqueOrThrow({ where: { code: 'E_CUZDAN' } })

  // Bankalar
  const bkGaranti  = await prisma.refBank.findUniqueOrThrow({ where: { asciiName: 'Garanti BBVA' } })
  const bkZiraat   = await prisma.refBank.findUniqueOrThrow({ where: { asciiName: 'Ziraat Bankasi' } })
  const bkYapiK    = await prisma.refBank.findUniqueOrThrow({ where: { asciiName: 'Yapi Kredi' } })
  const bkIs       = await prisma.refBank.findUniqueOrThrow({ where: { asciiName: 'Is Bankasi' } })
  const bkAkbank   = await prisma.refBank.findUniqueOrThrow({ where: { asciiName: 'Akbank' } })

  // Altın türleri
  const gtCumhuriyet = await prisma.refGoldType.findUniqueOrThrow({ where: { code: 'CUMHURIYET_ALTINI' } })
  const gtCeyrek     = await prisma.refGoldType.findUniqueOrThrow({ where: { code: 'CEYREK_ALTIN' } })
  const gtBilezik    = await prisma.refGoldType.findUniqueOrThrow({ where: { code: 'BILEZIK' } })
  const gtBar        = await prisma.refGoldType.findUniqueOrThrow({ where: { code: 'ALTIN_BAR' } })

  // Altın ayarları
  const gp22K = await prisma.refGoldPurity.findUniqueOrThrow({ where: { code: '22K' } })
  const gp24K = await prisma.refGoldPurity.findUniqueOrThrow({ where: { code: '24K' } })

  console.log('✅ Referans veriler yüklendi')

  // ── Mevcut demo kullanıcısını temizle ─────────────────────────────────────
  const existing = await prisma.user.findUnique({ where: { email: 'demo@giderse-gelir.com' } })
  if (existing) {
    console.log('🗑️  Mevcut demo kullanıcısı siliniyor...')
    await prisma.user.delete({ where: { id: existing.id } })
    console.log('✅ Eski demo verisi silindi')
  }

  // ── Demo kullanıcısını oluştur ─────────────────────────────────────────────
  const passwordHash = await bcrypt.hash('demo123', 10)

  const user = await prisma.user.create({
    data: {
      email: 'demo@giderse-gelir.com',
      username: 'demo',
      name: 'Ahmet Yılmaz',
      phone: '+90 532 456 78 90',
      passwordHash,
      emailVerified: true,
      timezone: 'Europe/Istanbul',
      language: 'tr',
      currency: 'TRY',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1.234,56',
      theme: 'dark',
      role: 'USER',
      isActive: true,
      lastLoginAt: new Date(),
      notifications: {
        email: true,
        push: true,
        budgetAlert: true,
        paymentReminder: true,
      },
      settings: {
        dashboardLayout: 'default',
        defaultCurrency: 'TRY',
        showBalance: true,
      },
    },
  })

  console.log(`✅ Demo kullanıcı oluşturuldu: ${user.email} (id: ${user.id})`)

  // ── Premium abonelik ───────────────────────────────────────────────────────
  await prisma.userSubscription.create({
    data: {
      userId: user.id,
      planId: 'premium',
      status: 'active',
      startDate: d(2025, 9, 1),
      endDate: d(2026, 9, 1),
      amount: 149,
      currency: 'TRY',
      paymentMethod: 'credit_card',
      autoRenew: true,
    },
  })

  console.log('✅ Premium abonelik oluşturuldu')

  // ── Dönem (Period) ─────────────────────────────────────────────────────────
  const period = await prisma.period.create({
    data: {
      userId: user.id,
      name: '2026 Yılı',
      periodType: 'yearly',
      startDate: d(2026, 1, 1),
      endDate: d(2026, 12, 31),
      isActive: true,
      description: 'Demo hesabı aktif dönemi',
    },
  })

  console.log('✅ Aktif dönem oluşturuldu')

  // ── Hesaplar ───────────────────────────────────────────────────────────────
  const accGaranti = await prisma.account.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Garanti Maaş Hesabı',
      accountTypeId: vadesiz.id,
      bankId: bkGaranti.id,
      accountNumber: '6200-5481320',
      iban: 'TR620006200548132000001',
      balance: 28450.75,
      currencyId: tryC.id,
    },
  })

  const accZiraat = await prisma.account.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Ziraat Birikim Hesabı',
      accountTypeId: vadeli.id,
      bankId: bkZiraat.id,
      accountNumber: '1234-5678901',
      iban: 'TR100001200345678901001',
      balance: 125000.00,
      currencyId: tryC.id,
    },
  })

  const accYapiK = await prisma.account.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Yapı Kredi Günlük',
      accountTypeId: vadesiz.id,
      bankId: bkYapiK.id,
      accountNumber: '9820-3341289',
      iban: 'TR670006701982033412890',
      balance: 5820.30,
      currencyId: tryC.id,
    },
  })

  await prisma.account.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'İş Bankası USD Hesabı',
      accountTypeId: doviz.id,
      bankId: bkIs.id,
      accountNumber: '4412-0072183',
      iban: 'TR640006400441200721830',
      balance: 3200.00,
      currencyId: usdC.id,
    },
  })

  console.log('✅ 4 hesap oluşturuldu')

  // ── Kredi Kartları ─────────────────────────────────────────────────────────
  const ccGaranti = await prisma.creditCard.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Garanti Bonus Card',
      bankId: bkGaranti.id,
      limitAmount: 50000,
      availableLimit: 32450,
      currencyId: tryC.id,
      statementDay: 15,
      dueDay: 5,
      minPaymentPercent: 3.0,
    },
  })

  const ccYapiK = await prisma.creditCard.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Yapı Kredi World Card',
      bankId: bkYapiK.id,
      limitAmount: 30000,
      availableLimit: 18200,
      currencyId: tryC.id,
      statementDay: 20,
      dueDay: 10,
      minPaymentPercent: 3.0,
    },
  })

  const ccAkbank = await prisma.creditCard.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Akbank Axess Platinum',
      bankId: bkAkbank.id,
      limitAmount: 20000,
      availableLimit: 14750,
      currencyId: tryC.id,
      statementDay: 25,
      dueDay: 15,
      minPaymentPercent: 3.0,
    },
  })

  console.log('✅ 3 kredi kartı oluşturuldu')

  // ── E-Cüzdanlar ────────────────────────────────────────────────────────────
  const ewPapara = await prisma.eWallet.create({
    data: {
      userId: user.id,
      periodId: period.id,
      provider: 'Papara',
      name: 'Papara Hesabım',
      accountEmail: 'demo@giderse-gelir.com',
      accountPhone: '+905324567890',
      balance: 1250.00,
      currencyId: tryC.id,
    },
  })

  await prisma.eWallet.create({
    data: {
      userId: user.id,
      periodId: period.id,
      provider: 'PayTR',
      name: 'PayTR Cüzdanı',
      accountEmail: 'demo@giderse-gelir.com',
      balance: 850.00,
      currencyId: tryC.id,
    },
  })

  console.log('✅ 2 e-cüzdan oluşturuldu')

  // ── Lehtarlar (Beneficiary) ────────────────────────────────────────────────
  const benEvsahibi = await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Ali Demir (Ev Sahibi)',
      iban: 'TR820006200234567891001',
      bankId: bkGaranti.id,
      description: 'Aylık kira ödemesi',
    },
  })

  const benAnne = await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Fatma Yılmaz (Annem)',
      iban: 'TR100001200123456789001',
      bankId: bkZiraat.id,
      phoneNumber: '+905334567890',
    },
  })

  const benTelekom = await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Türk Telekom',
      description: 'İnternet ve telefon faturaları',
    },
  })

  await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'AYEDAŞ (Elektrik)',
      description: 'Elektrik faturası',
    },
  })

  await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'İGDAŞ (Doğalgaz)',
      description: 'Doğalgaz faturası',
    },
  })

  console.log('✅ 5 lehtar oluşturuldu')

  // ── Krediler ───────────────────────────────────────────────────────────────
  const loanKonut = await prisma.loan.create({
    data: {
      userId: user.id,
      bankId: bkIs.id,
      name: 'İş Bankası Konut Kredisi',
      loanType: 'HOUSING',
      totalAmount: 750000,
      installmentCount: 120,
      remainingInstallments: 84,
      interestRate: 28.50,
      paymentDay: 10,
      currencyId: tryC.id,
      startDate: d(2019, 3, 10),
      monthlyPayment: 8750.00,
      description: 'Kadıköy daire konut kredisi',
      isActive: true,
    },
  })

  const loanArac = await prisma.loan.create({
    data: {
      userId: user.id,
      bankId: bkYapiK.id,
      name: 'Yapı Kredi Araç Kredisi',
      loanType: 'VEHICLE',
      totalAmount: 180000,
      installmentCount: 36,
      remainingInstallments: 18,
      interestRate: 32.00,
      paymentDay: 20,
      currencyId: tryC.id,
      startDate: d(2024, 9, 20),
      monthlyPayment: 6200.00,
      description: '2024 Toyota Corolla - 36 taksit',
      isActive: true,
    },
  })

  console.log('✅ 2 kredi oluşturuldu')

  // ── Yatırımlar ─────────────────────────────────────────────────────────────
  await prisma.investment.createMany({
    data: [
      {
        userId: user.id,
        periodId: period.id,
        name: 'THY - Türk Hava Yolları',
        investmentType: 'stock',
        symbol: 'THYAO',
        quantity: 500,
        purchasePrice: 280.50,
        currentPrice: 321.40,
        purchaseDate: d(2024, 6, 15),
        currencyId: tryC.id,
        riskLevel: 'medium',
        category: 'Havacılık',
        notes: 'Uzun vadeli beklenti yüksek',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Garanti Bankası Hisse',
        investmentType: 'stock',
        symbol: 'GARAN',
        quantity: 1000,
        purchasePrice: 89.20,
        currentPrice: 105.80,
        purchaseDate: d(2024, 8, 3),
        currencyId: tryC.id,
        riskLevel: 'medium',
        category: 'Bankacılık',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Bitcoin',
        investmentType: 'crypto',
        symbol: 'BTC',
        quantity: 0.15,
        purchasePrice: 2850000,
        currentPrice: 3380000,
        purchaseDate: d(2024, 10, 20),
        currencyId: tryC.id,
        riskLevel: 'high',
        category: 'Kripto Para',
        notes: 'Uzun vadeli hodl stratejisi',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Ethereum',
        investmentType: 'crypto',
        symbol: 'ETH',
        quantity: 2.5,
        purchasePrice: 145000,
        currentPrice: 158000,
        purchaseDate: d(2024, 11, 5),
        currencyId: tryC.id,
        riskLevel: 'high',
        category: 'Kripto Para',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'İş Bankası Büyüme Fonu',
        investmentType: 'fund',
        symbol: 'ISBUF',
        quantity: 5000,
        purchasePrice: 8.45,
        currentPrice: 9.82,
        purchaseDate: d(2024, 4, 12),
        currencyId: tryC.id,
        riskLevel: 'low',
        category: 'Yatırım Fonu',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'USD Döviz Pozisyonu',
        investmentType: 'forex',
        symbol: 'USD/TRY',
        quantity: 2000,
        purchasePrice: 38.20,
        currentPrice: 38.95,
        purchaseDate: d(2025, 1, 8),
        currencyId: tryC.id,
        riskLevel: 'medium',
        category: 'Döviz',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Çalık Enerji Tahvil',
        investmentType: 'bond',
        symbol: 'CAHVL',
        quantity: 10,
        purchasePrice: 10000,
        currentPrice: 10650,
        purchaseDate: d(2025, 2, 1),
        currencyId: tryC.id,
        riskLevel: 'low',
        category: 'Tahvil',
        notes: '%32 yıllık getiri, vade: 2 yıl',
        active: true,
      },
    ],
  })

  console.log('✅ 7 yatırım oluşturuldu')

  // ── Altın Varlıkları ───────────────────────────────────────────────────────
  await prisma.goldItem.createMany({
    data: [
      {
        userId: user.id,
        periodId: period.id,
        name: '5 Adet Cumhuriyet Altını',
        goldTypeId: gtCumhuriyet.id,
        goldPurityId: gp22K.id,
        weightGrams: 36.0,  // 5 × 7.2 gr
        purchasePrice: 82500,  // 5 × 16,500 TRY
        purchaseDate: d(2024, 3, 15),
        currentValueTry: 105000,
        description: '2024 yılında alındı, doğum günü hediyesi',
      },
      {
        userId: user.id,
        periodId: period.id,
        name: '8 Adet Çeyrek Altın',
        goldTypeId: gtCeyrek.id,
        goldPurityId: gp22K.id,
        weightGrams: 14.4,  // 8 × 1.8 gr
        purchasePrice: 52800,  // 8 × 6,600 TRY
        purchaseDate: d(2023, 11, 20),
        currentValueTry: 72000,
        description: 'Düğün takısı olarak alındı',
      },
      {
        userId: user.id,
        periodId: period.id,
        name: '22 Ayar Altın Bilezik',
        goldTypeId: gtBilezik.id,
        goldPurityId: gp22K.id,
        weightGrams: 42.0,
        purchasePrice: 210000,
        purchaseDate: d(2022, 6, 5),
        currentValueTry: 294000,
        description: 'Eşin düğün bilezikleri',
      },
      {
        userId: user.id,
        periodId: period.id,
        name: '10 Gram Altın Bar',
        goldTypeId: gtBar.id,
        goldPurityId: gp24K.id,
        weightGrams: 10.0,
        purchasePrice: 23800,
        purchaseDate: d(2025, 1, 10),
        currentValueTry: 28500,
        description: 'Yeni yıl birikim hedefi',
      },
    ],
  })

  console.log('✅ 4 altın varlığı oluşturuldu')

  // ── Tasarruf Hedefleri ─────────────────────────────────────────────────────
  await prisma.goal.createMany({
    data: [
      {
        userId: user.id,
        name: 'Araba Değişimi',
        targetAmount: 800000,
        currentAmount: 185000,
        currencyId: tryC.id,
        targetDate: d(2027, 6, 1),
        category: 'vehicle',
        status: 'active',
        icon: '🚗',
        color: '#3b82f6',
        notes: 'Mevcut araç satışından 250k gelecek',
      },
      {
        userId: user.id,
        name: 'Yaz Tatili Fonu',
        targetAmount: 50000,
        currentAmount: 22500,
        currencyId: tryC.id,
        targetDate: d(2026, 8, 1),
        category: 'vacation',
        status: 'active',
        icon: '✈️',
        color: '#10b981',
        notes: 'Yunanistan - Santorini planı',
      },
      {
        userId: user.id,
        name: 'Çocuk Eğitim Fonu',
        targetAmount: 300000,
        currentAmount: 45000,
        currencyId: tryC.id,
        targetDate: d(2030, 9, 1),
        category: 'education',
        status: 'active',
        icon: '🎓',
        color: '#8b5cf6',
        notes: 'Üniversite masrafları için',
      },
      {
        userId: user.id,
        name: 'Acil Durum Fonu',
        targetAmount: 135000,
        currentAmount: 125000,
        currencyId: tryC.id,
        targetDate: d(2026, 6, 1),
        category: 'emergency',
        status: 'active',
        icon: '🛡️',
        color: '#ef4444',
        notes: '3 aylık gider = 135,000 TRY',
      },
      {
        userId: user.id,
        name: 'Ev Yenileme',
        targetAmount: 120000,
        currentAmount: 18000,
        currencyId: tryC.id,
        targetDate: d(2026, 12, 31),
        category: 'home',
        status: 'active',
        icon: '🏠',
        color: '#f59e0b',
        notes: 'Mutfak ve banyo tadilat planı',
      },
    ],
  })

  console.log('✅ 5 tasarruf hedefi oluşturuldu')

  // ── Otomatik Ödemeler ──────────────────────────────────────────────────────
  await prisma.autoPayment.createMany({
    data: [
      {
        userId: user.id,
        periodId: period.id,
        name: 'Aylık Kira',
        amount: 18000,
        currencyId: tryC.id,
        paymentMethodId: pmHavale.id,
        categoryId: catKira.id,
        accountId: accGaranti.id,
        beneficiaryId: benEvsahibi.id,
        cronSchedule: '0 9 1 * *',
        nextPaymentDate: d(2026, 4, 1),
        description: 'Kadıköy daire aylık kira',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Netflix',
        amount: 399,
        currencyId: tryC.id,
        paymentMethodId: pmKredi.id,
        categoryId: catAbonelik.id,
        creditCardId: ccGaranti.id,
        cronSchedule: '0 9 15 * *',
        nextPaymentDate: d(2026, 4, 15),
        description: 'Netflix Premium plan',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Spotify Premium',
        amount: 49.99,
        currencyId: tryC.id,
        paymentMethodId: pmKredi.id,
        categoryId: catAbonelik.id,
        creditCardId: ccGaranti.id,
        cronSchedule: '0 9 20 * *',
        nextPaymentDate: d(2026, 4, 20),
        description: 'Spotify Premium üyelik',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Türknet İnternet',
        amount: 799,
        currencyId: tryC.id,
        paymentMethodId: pmKredi.id,
        categoryId: catFatura.id,
        creditCardId: ccYapiK.id,
        cronSchedule: '0 9 10 * *',
        nextPaymentDate: d(2026, 4, 10),
        description: '1000 Mbps fiber internet',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Hayat Sigortası',
        amount: 1250,
        currencyId: tryC.id,
        paymentMethodId: pmHavale.id,
        categoryId: catDiger.id,
        accountId: accGaranti.id,
        cronSchedule: '0 9 5 * *',
        nextPaymentDate: d(2026, 4, 5),
        description: 'Güneş Sigorta hayat sigortası poliçesi',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Spor Salonu Üyeliği',
        amount: 450,
        currencyId: tryC.id,
        paymentMethodId: pmKredi.id,
        categoryId: catSaglik.id,
        creditCardId: ccAkbank.id,
        cronSchedule: '0 9 1 * *',
        nextPaymentDate: d(2026, 4, 1),
        description: 'Basic Fit aylık üyelik',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Konut Kredisi Taksiti',
        amount: 8750,
        currencyId: tryC.id,
        paymentMethodId: pmHavale.id,
        categoryId: catDiger.id,
        accountId: accGaranti.id,
        cronSchedule: '0 9 10 * *',
        nextPaymentDate: d(2026, 4, 10),
        description: 'İş Bankası konut kredisi aylık taksit',
        active: true,
      },
      {
        userId: user.id,
        periodId: period.id,
        name: 'Araç Kredisi Taksiti',
        amount: 6200,
        currencyId: tryC.id,
        paymentMethodId: pmHavale.id,
        categoryId: catDiger.id,
        accountId: accGaranti.id,
        cronSchedule: '0 9 20 * *',
        nextPaymentDate: d(2026, 4, 20),
        description: 'Yapı Kredi araç kredisi aylık taksit',
        active: true,
      },
    ],
  })

  console.log('✅ 8 otomatik ödeme oluşturuldu')

  // ── Bütçe Planı ────────────────────────────────────────────────────────────
  const budgetPlan = await prisma.budgetPlan.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Mart 2026 Aylık Bütçe',
      periodType: 'monthly',
      startDate: d(2026, 3, 1),
      endDate: d(2026, 3, 31),
      currencyId: tryC.id,
      zeroBased: true,
      rolloverMode: 'none',
      totalBudgeted: 48000,
      notes: 'Aylık gelir: 48,600 TRY',
      active: true,
    },
  })

  await prisma.budgetAllocation.createMany({
    data: [
      { budgetPlanId: budgetPlan.id, categoryId: catKira.id,     amount: 18000, alertThreshold: 100 },
      { budgetPlanId: budgetPlan.id, categoryId: catMarket.id,   amount: 3500,  alertThreshold: 80  },
      { budgetPlanId: budgetPlan.id, categoryId: catFatura.id,   amount: 2000,  alertThreshold: 80  },
      { budgetPlanId: budgetPlan.id, categoryId: catUlasim.id,   amount: 2500,  alertThreshold: 80  },
      { budgetPlanId: budgetPlan.id, categoryId: catEglence.id,  amount: 2000,  alertThreshold: 75  },
      { budgetPlanId: budgetPlan.id, categoryId: catSaglik.id,   amount: 1500,  alertThreshold: 80  },
      { budgetPlanId: budgetPlan.id, categoryId: catAbonelik.id, amount: 1200,  alertThreshold: 90  },
      { budgetPlanId: budgetPlan.id, categoryId: catDiger.id,    amount: 4500,  alertThreshold: 80  },
    ],
  })

  console.log('✅ Bütçe planı ve tahsisatlar oluşturuldu')

  // ── İşlemler (Son 6 ay: Ekim 2025 - Mart 2026) ───────────────────────────
  console.log('📊 İşlemler oluşturuluyor...')

  type TxInput = {
    userId: number
    periodId: number
    txTypeId: number
    categoryId: number
    amount: number
    currencyId: number
    paymentMethodId: number
    transactionDate: Date
    description?: string
    accountId?: number
    creditCardId?: number
    eWalletId?: number
    loanId?: number
    beneficiaryId?: number
    isRecurring?: boolean
    recurringType?: string
    tags?: string[]
  }

  const transactions: TxInput[] = []

  // Aylık tekrarlayan gelirler ve giderler - her ay için
  const months = [
    { year: 2025, month: 10 },
    { year: 2025, month: 11 },
    { year: 2025, month: 12 },
    { year: 2026, month: 1  },
    { year: 2026, month: 2  },
    { year: 2026, month: 3  },
  ]

  for (const { year, month } of months) {
    // MAAŞ - her ayın 5i
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: gelirType.id, categoryId: catMaas.id,
      amount: 45000, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 5),
      accountId: accGaranti.id,
      description: 'Maaş ödemesi - Teknoloji A.Ş.',
      isRecurring: true, recurringType: 'monthly',
      tags: ['maaş', 'gelir'],
    })

    // YEMEK KARTI - her ayın 5i
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: gelirType.id, categoryId: catYemekK.id,
      amount: 3600, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 5),
      accountId: accGaranti.id,
      description: 'Yemek kartı yüklemesi',
      isRecurring: true, recurringType: 'monthly',
      tags: ['yemek kartı'],
    })

    // KİRA - her ayın 1i
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catKira.id,
      amount: 18000, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 1),
      accountId: accGaranti.id,
      beneficiaryId: benEvsahibi.id,
      description: 'Aylık kira ödemesi - Kadıköy daire',
      isRecurring: true, recurringType: 'monthly',
      tags: ['kira', 'zorunlu'],
    })

    // KONUT KREDİSİ - her ayın 10u
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catDiger.id,
      amount: 8750, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 10),
      accountId: accGaranti.id,
      loanId: loanKonut.id,
      description: 'Konut kredisi taksit ödemesi',
      isRecurring: true, recurringType: 'monthly',
      tags: ['kredi', 'konut'],
    })

    // ARAÇ KREDİSİ - her ayın 20si
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catDiger.id,
      amount: 6200, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 20),
      accountId: accGaranti.id,
      loanId: loanArac.id,
      description: 'Araç kredisi taksit ödemesi - Toyota Corolla',
      isRecurring: true, recurringType: 'monthly',
      tags: ['kredi', 'araç'],
    })

    // ELEKTRİK FATURASI - her ayın 12si
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catFatura.id,
      amount: 480 + Math.floor(Math.random() * 120), currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 12),
      creditCardId: ccYapiK.id,
      description: 'AYEDAŞ Elektrik faturası',
      isRecurring: true, recurringType: 'monthly',
      tags: ['fatura', 'elektrik'],
    })

    // DOĞALGAZ - her ayın 14ü
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catFatura.id,
      amount: 320 + Math.floor(Math.random() * 80), currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 14),
      creditCardId: ccYapiK.id,
      description: 'İGDAŞ Doğalgaz faturası',
      isRecurring: true, recurringType: 'monthly',
      tags: ['fatura', 'doğalgaz'],
    })

    // SU FATURASI - her ayın 18i
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catFatura.id,
      amount: 185 + Math.floor(Math.random() * 50), currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 18),
      creditCardId: ccYapiK.id,
      description: 'İSKİ Su faturası',
      isRecurring: true, recurringType: 'monthly',
      tags: ['fatura', 'su'],
    })

    // İNTERNET - her ayın 10u
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catFatura.id,
      amount: 799, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 10),
      creditCardId: ccYapiK.id,
      beneficiaryId: benTelekom.id,
      description: 'Türknet fiber internet - 1000 Mbps',
      isRecurring: true, recurringType: 'monthly',
      tags: ['fatura', 'internet'],
    })

    // NETFLIX - her ayın 15i
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catAbonelik.id,
      amount: 399, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 15),
      creditCardId: ccGaranti.id,
      description: 'Netflix Premium abonelik',
      isRecurring: true, recurringType: 'monthly',
      tags: ['abonelik', 'eğlence'],
    })

    // SPOTIFY - her ayın 20si
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catAbonelik.id,
      amount: 49.99, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 20),
      creditCardId: ccGaranti.id,
      description: 'Spotify Premium abonelik',
      isRecurring: true, recurringType: 'monthly',
      tags: ['abonelik', 'müzik'],
    })

    // HAYat SİGORTASI - her ayın 5i
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catDiger.id,
      amount: 1250, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 5),
      accountId: accGaranti.id,
      description: 'Güneş Sigorta hayat sigortası poliçesi',
      isRecurring: true, recurringType: 'monthly',
      tags: ['sigorta'],
    })

    // SPOR SALONU - her ayın 1i
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catSaglik.id,
      amount: 450, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 1),
      creditCardId: ccAkbank.id,
      description: 'Basic Fit spor salonu aylık üyelik',
      isRecurring: true, recurringType: 'monthly',
      tags: ['sağlık', 'spor'],
    })

    // MARKET alışverişleri - haftada 1-2 kez
    const marketAmounts = [850, 1200, 650, 980, 1450]
    const marketDays = [3, 8, 13, 19, 25]
    for (let i = 0; i < 3; i++) {
      transactions.push({
        userId: user.id, periodId: period.id,
        txTypeId: giderType.id, categoryId: catMarket.id,
        amount: marketAmounts[i % 5], currencyId: tryC.id,
        paymentMethodId: pmDebit.id,
        transactionDate: d(year, month, marketDays[i]),
        accountId: accYapiK.id,
        description: ['Migros market alışverişi', 'CarrefourSA market', 'Şok market'][i],
        tags: ['market', 'gıda'],
      })
    }

    // AKARYAKIT - ayda 2-3 kez
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catUlasim.id,
      amount: 1200 + Math.floor(Math.random() * 400), currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 7),
      creditCardId: ccYapiK.id,
      description: 'Shell benzin istasyonu',
      tags: ['akaryakıt', 'ulaşım'],
    })

    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catUlasim.id,
      amount: 1100 + Math.floor(Math.random() * 300), currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(year, month, 22),
      creditCardId: ccYapiK.id,
      description: 'Opet akaryakıt',
      tags: ['akaryakıt', 'ulaşım'],
    })

    // RESTORAN & CAFE - haftada 1-2 kez
    const restaurants = ['Burger King', 'Starbucks', 'Güneş Restaurant', 'Pizza House', 'Sushi Bar', 'Nusret']
    const cafeAmounts = [180, 95, 420, 380, 650, 890]
    for (let i = 0; i < 4; i++) {
      transactions.push({
        userId: user.id, periodId: period.id,
        txTypeId: giderType.id, categoryId: catEglence.id,
        amount: cafeAmounts[i % 6], currencyId: tryC.id,
        paymentMethodId: i % 2 === 0 ? pmKredi.id : pmDebit.id,
        transactionDate: d(year, month, [6, 11, 17, 26][i]),
        creditCardId: i % 2 === 0 ? ccGaranti.id : undefined,
        accountId: i % 2 !== 0 ? accYapiK.id : undefined,
        description: restaurants[i % 6],
        tags: ['restoran', 'yemek'],
      })
    }
  }

  // EK Gelir - Freelance projeler (bazı aylarda)
  const freelanceMonths = [
    { year: 2025, month: 10, amount: 12000, day: 20, desc: 'Freelance web projesi - E-ticaret sitesi' },
    { year: 2025, month: 12, amount: 8500,  day: 15, desc: 'UI/UX tasarım danışmanlığı' },
    { year: 2026, month: 1,  amount: 15000, day: 25, desc: 'Mobil uygulama geliştirme projesi' },
    { year: 2026, month: 3,  amount: 9500,  day: 10, desc: 'API entegrasyon danışmanlığı' },
  ]
  for (const fl of freelanceMonths) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: gelirType.id, categoryId: catEkGelir.id,
      amount: fl.amount, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(fl.year, fl.month, fl.day),
      accountId: accGaranti.id,
      description: fl.desc,
      tags: ['freelance', 'ek gelir'],
    })
  }

  // FAİZ GELİRİ - Ziraat vadeli hesap faizi (her ay)
  for (const { year, month } of months) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: gelirType.id, categoryId: catFaiz.id,
      amount: Math.round(125000 * 0.385 / 12),  // ~%38.5 yıllık faiz
      currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 28),
      accountId: accZiraat.id,
      description: 'Ziraat vadeli hesap faiz getirisi',
      isRecurring: true, recurringType: 'monthly',
      tags: ['faiz', 'gelir'],
    })
  }

  // SAĞLIK harcamaları
  const healthItems = [
    { year: 2025, month: 10, amount: 850,  day: 16, desc: 'Özel hastane muayene ve tahlil' },
    { year: 2025, month: 11, amount: 280,  day: 8,  desc: 'Eczane - ilaç' },
    { year: 2025, month: 12, amount: 1200, day: 20, desc: 'Diş hekimi - dolgu tedavisi' },
    { year: 2026, month: 1,  amount: 450,  day: 12, desc: 'Göz doktoru muayenesi' },
    { year: 2026, month: 2,  amount: 320,  day: 5,  desc: 'Eczane - reçeteli ilaç' },
    { year: 2026, month: 3,  amount: 750,  day: 18, desc: 'Fizyoterapi seansı' },
  ]
  for (const h of healthItems) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catSaglik.id,
      amount: h.amount, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(h.year, h.month, h.day),
      creditCardId: ccGaranti.id,
      description: h.desc,
      tags: ['sağlık'],
    })
  }

  // EĞLENcE & alışveriş harcamaları
  const entertainment = [
    { year: 2025, month: 10, amount: 480,  day: 22, desc: 'Sinema + popcorn (aile)' },
    { year: 2025, month: 10, amount: 1200, day: 28, desc: 'Giyim - Zara' },
    { year: 2025, month: 11, amount: 2800, day: 14, desc: 'Elektronik - laptop aksesuarı' },
    { year: 2025, month: 11, amount: 650,  day: 22, desc: 'Çocuk kıyafeti - Defacto' },
    { year: 2025, month: 12, amount: 3500, day: 20, desc: 'Yılbaşı alışverişi' },
    { year: 2025, month: 12, amount: 1800, day: 27, desc: 'Yılbaşı yemeği - restoran' },
    { year: 2026, month: 1,  amount: 890,  day: 15, desc: 'Kitap ve kırtasiye' },
    { year: 2026, month: 2,  amount: 1450, day: 9,  desc: 'Sevgililer günü akşam yemeği' },
    { year: 2026, month: 2,  amount: 2200, day: 20, desc: 'Giyim - Mango / LC Waikiki' },
    { year: 2026, month: 3,  amount: 750,  day: 8,  desc: 'Hobi malzemeleri - fotoğrafçılık' },
  ]
  for (const e of entertainment) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catEglence.id,
      amount: e.amount, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(e.year, e.month, e.day),
      creditCardId: ccGaranti.id,
      description: e.desc,
      tags: ['eğlence', 'alışveriş'],
    })
  }

  // VERGİ ödemeleri
  transactions.push({
    userId: user.id, periodId: period.id,
    txTypeId: giderType.id, categoryId: catVergi.id,
    amount: 3200, currencyId: tryC.id,
    paymentMethodId: pmHavale.id,
    transactionDate: d(2025, 11, 30),
    accountId: accGaranti.id,
    description: 'Motorlu taşıt vergisi (MTV)',
    tags: ['vergi', 'araç'],
  })

  transactions.push({
    userId: user.id, periodId: period.id,
    txTypeId: giderType.id, categoryId: catVergi.id,
    amount: 1850, currencyId: tryC.id,
    paymentMethodId: pmHavale.id,
    transactionDate: d(2026, 2, 15),
    accountId: accGaranti.id,
    description: 'Gelir vergisi beyannamesi',
    tags: ['vergi'],
  })

  // ULAŞIM - park, köprü, taksimetre
  const transportItems = [
    { year: 2025, month: 10, amount: 85,  day: 9,  desc: 'İETT akbil yükleme' },
    { year: 2025, month: 10, amount: 245, day: 18, desc: 'Otopark ücreti - AVM' },
    { year: 2025, month: 11, amount: 92,  day: 5,  desc: 'İETT akbil yükleme' },
    { year: 2025, month: 11, amount: 180, day: 25, desc: 'Taksi - havalimanı' },
    { year: 2025, month: 12, amount: 350, day: 10, desc: 'HGS yükleme - köprü geçişleri' },
    { year: 2026, month: 1,  amount: 95,  day: 8,  desc: 'İETT akbil yükleme' },
    { year: 2026, month: 1,  amount: 425, day: 18, desc: 'HGS yükleme' },
    { year: 2026, month: 2,  amount: 88,  day: 6,  desc: 'İETT akbil yükleme' },
    { year: 2026, month: 3,  amount: 320, day: 12, desc: 'Otopark aylık kart' },
  ]
  for (const t of transportItems) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catUlasim.id,
      amount: t.amount, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(t.year, t.month, t.day),
      creditCardId: ccYapiK.id,
      description: t.desc,
      tags: ['ulaşım'],
    })
  }

  // DİĞER giderler
  const others = [
    { year: 2025, month: 10, amount: 450, day: 25, desc: 'Ev bakım malzemeleri' },
    { year: 2025, month: 11, amount: 680, day: 20, desc: 'Araç bakımı - lastik değişimi' },
    { year: 2025, month: 12, amount: 320, day: 15, desc: 'Hediye - yılbaşı' },
    { year: 2026, month: 1,  amount: 250, day: 20, desc: 'Ev dekorasyonu' },
    { year: 2026, month: 2,  amount: 1200,day: 28, desc: 'Ev aletleri tamiri' },
    { year: 2026, month: 3,  amount: 890, day: 22, desc: 'Bahçe malzemeleri - balkon düzenleme' },
  ]
  for (const o of others) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catDiger.id,
      amount: o.amount, currencyId: tryC.id,
      paymentMethodId: pmKredi.id,
      transactionDate: d(o.year, o.month, o.day),
      creditCardId: ccAkbank.id,
      description: o.desc,
      tags: ['diğer'],
    })
  }

  // Anneye para transferi
  for (const { year, month } of months.slice(0, 4)) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catDigerGelir.id,
      amount: 3000, currencyId: tryC.id,
      paymentMethodId: pmHavale.id,
      transactionDate: d(year, month, 6),
      accountId: accGaranti.id,
      beneficiaryId: benAnne.id,
      description: 'Anneme aylık destek ödemesi',
      isRecurring: true, recurringType: 'monthly',
      tags: ['aile', 'transfer'],
    })
  }

  // E-cüzdan ile küçük ödemeler
  const walletTx = [
    { year: 2025, month: 10, amount: 85,  day: 14, desc: 'Getir - online market siparişi' },
    { year: 2025, month: 11, amount: 120, day: 9,  desc: 'Yemeksepeti siparişi' },
    { year: 2025, month: 12, amount: 95,  day: 18, desc: 'Trendyol market' },
    { year: 2026, month: 1,  amount: 145, day: 22, desc: 'Yemeksepeti - akşam yemeği' },
    { year: 2026, month: 2,  amount: 88,  day: 14, desc: 'Getir - eczane siparişi' },
    { year: 2026, month: 3,  amount: 110, day: 5,  desc: 'Migros Sanal Market' },
  ]
  for (const w of walletTx) {
    transactions.push({
      userId: user.id, periodId: period.id,
      txTypeId: giderType.id, categoryId: catMarket.id,
      amount: w.amount, currencyId: tryC.id,
      paymentMethodId: pmEcuzdan.id,
      transactionDate: d(w.year, w.month, w.day),
      eWalletId: ewPapara.id,
      description: w.desc,
      tags: ['online', 'e-cüzdan'],
    })
  }

  // Toplu işlem ekle
  let txCount = 0
  for (const tx of transactions) {
    await prisma.transaction.create({ data: tx as Parameters<typeof prisma.transaction.create>[0]['data'] })
    txCount++
  }

  console.log(`✅ ${txCount} işlem oluşturuldu`)

  // ── Bildirimler ────────────────────────────────────────────────────────────
  await prisma.notification.createMany({
    data: [
      {
        userId: user.id,
        type: 'budget_alert',
        channel: 'in_app',
        title: 'Bütçe Uyarısı: Market',
        body: 'Market bütçenizin %92\'sine ulaştınız (3,220 / 3,500 TRY). Dikkatli olun!',
        status: 'delivered',
        priority: 'high',
        readAt: null,
        deliveredAt: daysAgo(2),
        payload: { category: 'market', percent: 92 },
      },
      {
        userId: user.id,
        type: 'payment_reminder',
        channel: 'in_app',
        title: 'Yaklaşan Ödeme: Kira',
        body: 'Kira ödemeniz (18,000 TRY) 2 gün sonra. Hesabınızı kontrol edin.',
        status: 'delivered',
        priority: 'high',
        readAt: null,
        deliveredAt: daysAgo(1),
        payload: { amount: 18000, dueDate: '2026-04-01' },
      },
      {
        userId: user.id,
        type: 'goal_progress',
        channel: 'in_app',
        title: 'Hedef Güncelleme: Acil Durum Fonu',
        body: 'Acil durum fonunuz hedefin %92\'sine ulaştı (125,000 / 135,000 TRY). 🎉',
        status: 'delivered',
        priority: 'normal',
        readAt: daysAgo(3),
        deliveredAt: daysAgo(3),
        payload: { goal: 'Acil Durum Fonu', percent: 92 },
      },
      {
        userId: user.id,
        type: 'ai_report_ready',
        channel: 'in_app',
        title: 'AI Raporu Hazır',
        body: 'Şubat 2026 AI finansal analiz raporunuz hazır. Görüntülemek için tıklayın.',
        status: 'delivered',
        priority: 'normal',
        readAt: daysAgo(5),
        deliveredAt: daysAgo(5),
        payload: { month: '2026-02' },
      },
      {
        userId: user.id,
        type: 'transaction_large',
        channel: 'in_app',
        title: 'Büyük İşlem Kaydedildi',
        body: '15,000 TRY tutarında gelir işlemi kaydedildi: Mobil uygulama geliştirme projesi.',
        status: 'delivered',
        priority: 'normal',
        readAt: daysAgo(8),
        deliveredAt: daysAgo(8),
        payload: { amount: 15000, type: 'income' },
      },
    ],
  })

  console.log('✅ 5 bildirim oluşturuldu')

  // ── AI Rapor ─────────────────────────────────────────────────────────────
  await prisma.aIReportUsage.create({
    data: {
      userId: user.id,
      reportType: 'premium',
      reportDate: daysAgo(5),
      monthYear: '2026-02',
      status: 'completed',
      reportData: {
        summary: {
          totalIncome: 52600,
          totalExpense: 42180,
          netAmount: 10420,
          savingsRate: 19.81,
          period: 'Şubat 2026',
        },
        categoryAnalysis: [
          { category: 'Kira', amount: 18000, percentage: 42.7, count: 1, trend: 'stable' },
          { category: 'Konut Kredisi', amount: 8750, percentage: 20.7, count: 1, trend: 'stable' },
          { category: 'Araç Kredisi', amount: 6200, percentage: 14.7, count: 1, trend: 'stable' },
          { category: 'Market', amount: 2980, percentage: 7.1,  count: 5, trend: 'down'   },
          { category: 'Fatura',  amount: 1825, percentage: 4.3,  count: 3, trend: 'up'     },
          { category: 'Eğlence', amount: 4250, percentage: 10.1, count: 6, trend: 'up'     },
        ],
        topCategories: [
          { category: 'Kira', amount: 18000, trend: 'stable' },
          { category: 'Konut Kredisi', amount: 8750, trend: 'stable' },
          { category: 'Araç Kredisi', amount: 6200, trend: 'stable' },
          { category: 'Eğlence', amount: 4250, trend: 'up' },
          { category: 'Market', amount: 2980, trend: 'down' },
        ],
        cashFlow: [
          { month: 'Ekim 2025',   income: 57000, expense: 43250, balance: 13750 },
          { month: 'Kasım 2025',  income: 48600, expense: 41800, balance: 6800  },
          { month: 'Aralık 2025', income: 48600, expense: 52300, balance: -3700 },
          { month: 'Ocak 2026',   income: 63600, expense: 42500, balance: 21100 },
          { month: 'Şubat 2026',  income: 52600, expense: 42180, balance: 10420 },
        ],
        insights: [
          {
            type: 'savings',
            title: 'Tasarruf Oranı Artırılabilir',
            description: 'Gelirin %19.8\'ini biriktiriyorsunuz. Eğlence harcamalarını %15 azaltarak tasarruf oranınızı %25\'e çıkarabilirsiniz.',
            priority: 'high',
            impact: 'Aylık +2,600 TRY ek tasarruf',
          },
          {
            type: 'optimization',
            title: 'Abonelik Optimizasyonu',
            description: 'Netflix + Spotify toplamda 449 TRY/ay. Aile planına geçerek 30% tasarruf sağlayabilirsiniz.',
            priority: 'medium',
            impact: 'Aylık -135 TRY tasarruf',
          },
          {
            type: 'investment',
            title: 'Birikim Hesabı Faizi',
            description: 'Ziraat vadeli hesabınız aylık ~4,010 TRY faiz getiriyor. Mevduatı artırarak pasif gelirinizi yükseltebilirsiniz.',
            priority: 'medium',
            impact: 'Her 10,000 TRY ek mevduata 321 TRY/ay',
          },
          {
            type: 'risk',
            title: 'Araç Kredisi Risk',
            description: 'Araç kredinizin faiz oranı %32 ile yüksek. 18 taksit kaldı. Erken kapatmak için ek 75,000 TRY tasarrufu düşünün.',
            priority: 'high',
            impact: 'Erken kapamada toplam 8,500 TRY faiz tasarrufu',
          },
        ],
        predictions: {
          next3Months: [
            { month: 'Nisan 2026',   predictedIncome: 48600, predictedExpense: 41200, confidence: 88 },
            { month: 'Mayıs 2026',   predictedIncome: 48600, predictedExpense: 42800, confidence: 82 },
            { month: 'Haziran 2026', predictedIncome: 48600, predictedExpense: 45200, confidence: 75 },
          ],
          recommendations: [
            'Tatil bütçesi için Haziran\'dan önce 20,000 TRY ayırın',
            'Acil durum fonunu tamamlamak için 10,000 TRY kaldı',
            'Araç kredisini erken kapatmayı değerlendirin',
          ],
        },
        riskAnalysis: {
          overallRisk: 'medium',
          riskFactors: [
            { factor: 'Araç Kredisi Faizi', level: 'high', description: '%32 faiz oranı piyasa ortalamasının üzerinde' },
            { factor: 'Kira/Gelir Oranı',   level: 'medium', description: 'Kiranın gelire oranı %37 - ideal sınır %30' },
            { factor: 'Acil Durum Fonu',    level: 'low',    description: 'Acil durum fonunuz hedefin %92\'sinde - iyi durumda' },
          ],
          mitigation: [
            'Araç kredisi için erken ödeme planı yapın',
            'Acil durum fonunu bu ay tamamlayın (10,000 TRY)',
            'Aylık sabit giderler toplam gelirin %63\'ü - yönetilebilir',
          ],
        },
      },
    },
  })

  console.log('✅ AI raporu oluşturuldu')

  // ── Portföy Snapshot ──────────────────────────────────────────────────────
  await prisma.portfolioSnapshot.createMany({
    data: [
      {
        userId: user.id,
        snapshotDate: daysAgo(30),
        totalAssets: 892500,
        totalLiabilities: 728250,
        netWorth: 164250,
        breakdown: {
          accounts: 159271,
          creditCards: -35350,
          investments: 495850,
          gold: 499500,
          loans: -692900,
        },
      },
      {
        userId: user.id,
        snapshotDate: daysAgo(15),
        totalAssets: 912800,
        totalLiabilities: 720100,
        netWorth: 192700,
        breakdown: {
          accounts: 161850,
          creditCards: -33550,
          investments: 511200,
          gold: 499500,
          loans: -686550,
        },
      },
      {
        userId: user.id,
        snapshotDate: daysAgo(1),
        totalAssets: 935271,
        totalLiabilities: 712250,
        netWorth: 223021,
        breakdown: {
          accounts: 168271,  // 28450 + 125000 + 5820
          creditCards: -34550,  // -(50000-32450) - (30000-18200) - (20000-14750)
          investments: 512500,
          gold: 499500,
          loans: -677700,
        },
      },
    ],
  })

  console.log('✅ Portföy snapshots oluşturuldu')

  // ── Kayıtlı Görünümler (SavedView) ────────────────────────────────────────
  await prisma.savedView.createMany({
    data: [
      {
        userId: user.id,
        entityType: 'transaction',
        name: 'Aylık Giderler',
        description: 'Bu ayki tüm gider işlemleri',
        isDefault: true,
        isSystem: false,
        filters: { txType: 'GIDER', dateRange: 'this_month' },
        sort: { field: 'transactionDate', direction: 'desc' },
      },
      {
        userId: user.id,
        entityType: 'transaction',
        name: 'Büyük İşlemler',
        description: '1000 TRY üzeri işlemler',
        isDefault: false,
        isSystem: false,
        filters: { minAmount: 1000 },
        sort: { field: 'amount', direction: 'desc' },
      },
      {
        userId: user.id,
        entityType: 'transaction',
        name: 'Kredi Kartı İşlemleri',
        description: 'Tüm kredi kartı harcamaları',
        isDefault: false,
        isSystem: false,
        filters: { paymentMethod: 'KREDI_KARTI' },
        sort: { field: 'transactionDate', direction: 'desc' },
      },
    ],
  })

  console.log('✅ 3 kayıtlı görünüm oluşturuldu')

  // ── Özet ──────────────────────────────────────────────────────────────────
  console.log('\n🎉 Demo kullanıcı başarıyla oluşturuldu!\n')
  console.log('━'.repeat(50))
  console.log('📧 E-posta  : demo@giderse-gelir.com')
  console.log('🔑 Şifre    : demo123')
  console.log('👤 Ad Soyad : Ahmet Yılmaz')
  console.log('📋 Plan     : Premium')
  console.log('━'.repeat(50))
  console.log('📊 Oluşturulan veriler:')
  console.log('   ✓ 1 aktif dönem (2026 Yılı)')
  console.log('   ✓ 4 banka hesabı')
  console.log('   ✓ 3 kredi kartı')
  console.log('   ✓ 2 e-cüzdan')
  console.log('   ✓ 5 lehtar')
  console.log('   ✓ 2 aktif kredi')
  console.log('   ✓ 7 yatırım (hisse, kripto, fon, döviz, tahvil)')
  console.log('   ✓ 4 altın varlığı')
  console.log('   ✓ 5 tasarruf hedefi')
  console.log('   ✓ 8 otomatik ödeme')
  console.log('   ✓ 1 aylık bütçe planı (8 kategori)')
  console.log(`   ✓ ${txCount} işlem (Ekim 2025 - Mart 2026)`)
  console.log('   ✓ 5 bildirim')
  console.log('   ✓ 1 AI raporu')
  console.log('   ✓ 3 portföy snapshot')
  console.log('   ✓ 3 kayıtlı görünüm')
  console.log('━'.repeat(50))
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async e => {
    console.error('❌ Hata:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
