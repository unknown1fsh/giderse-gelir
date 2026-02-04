#!/usr/bin/env npx tsx
/**
 * Demo kullanıcı ve 2026 test verilerini oluşturur.
 * Giriş: demo@giderse-gelir.com / 123456
 *
 * Çalıştırma: npx tsx scripts/seed-demo-user.ts
 * Önce: npx prisma db push  veya  npx prisma migrate deploy
 *       npx prisma db seed  (referans veriler için)
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_EMAIL = 'demo@giderse-gelir.com'
const DEMO_USERNAME = 'demo2026'
const DEMO_PASSWORD = '123456'

function generateTicketNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(100000 + Math.random() * 900000)
  return `SUP-${dateStr}-${random}`
}

async function main() {
  console.log('🌱 Demo kullanıcı ve 2026 verileri oluşturuluyor...\n')

  // Mevcut demo kullanıcıyı sil (varsa)
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email: DEMO_EMAIL }, { username: DEMO_USERNAME }] },
  })
  if (existing) {
    console.log('⚠️  Mevcut demo kullanıcı siliniyor...')
    await prisma.user.delete({ where: { id: existing.id } })
  }

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)

  // Kullanıcı oluştur (tüm profil alanları)
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      username: DEMO_USERNAME,
      name: 'Demo Kullanıcı',
      phone: '+90 532 123 4567',
      passwordHash,
      emailVerified: true,
      phoneVerified: false,
      isActive: true,
      currency: 'TRY',
      timezone: 'Europe/Istanbul',
      language: 'tr',
      dateFormat: 'DD/MM/YYYY',
      numberFormat: '1.234,56',
      theme: 'light',
      lastLoginAt: new Date('2026-02-04T10:30:00Z'),
      notifications: {
        emailNotifications: true,
        pushNotifications: true,
        weeklyReports: true,
        monthlyReports: true,
        paymentReminders: true,
      },
      settings: {
        autoBackup: true,
        backupFrequency: 'daily',
        dataRetention: 365,
      },
    },
  })
  console.log('✅ Kullanıcı oluşturuldu:', DEMO_EMAIL)

  await prisma.userSubscription.create({
    data: {
      userId: user.id,
      planId: 'premium',
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      amount: 0,
      currency: 'TRY',
    },
  })
  console.log('✅ Premium abonelik eklendi')

  // Referans verileri al
  const [
    currencyTry,
    currencyUsd,
    bankZiraat,
    bankGaranti,
    bankIsBankasi,
    accountTypeVadesiz,
    accountTypeVadeli,
    accountTypeDoviz,
    txTypeGelir,
    txTypeGider,
    categoryMaas,
    categoryYemekKarti,
    categoryEkGelir,
    categoryKira,
    categoryMarket,
    categoryFatura,
    categoryUlasim,
    categorySaglik,
    categoryAbonelik,
    categoryEglence,
    categoryVergi,
    paymentMethodHavale,
    paymentMethodKrediKarti,
    paymentMethodECuzdan,
    goldTypeCeyrek,
    goldTypeBilezik,
    goldPurity22K,
  ] = await Promise.all([
    prisma.refCurrency.findFirst({ where: { code: 'TRY' } }),
    prisma.refCurrency.findFirst({ where: { code: 'USD' } }),
    prisma.refBank.findFirst({ where: { asciiName: 'Ziraat Bankasi' } }),
    prisma.refBank.findFirst({ where: { asciiName: 'Garanti BBVA' } }),
    prisma.refBank.findFirst({ where: { asciiName: 'Is Bankasi' } }),
    prisma.refAccountType.findFirst({ where: { code: 'VADESIZ' } }),
    prisma.refAccountType.findFirst({ where: { code: 'VADELI' } }),
    prisma.refAccountType.findFirst({ where: { code: 'DOVIZ' } }),
    prisma.refTxType.findFirst({ where: { code: 'GELIR' } }),
    prisma.refTxType.findFirst({ where: { code: 'GIDER' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GELIR' }, code: 'MAAS' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GELIR' }, code: 'YEMEK_KARTI' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GELIR' }, code: 'EK_GELIR' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'KIRA' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'MARKET' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'FATURA' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'ULASIM' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'SAGLIK' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'ABONELIK' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'EGLENCE' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'VERGI' } }),
    prisma.refPaymentMethod.findFirst({ where: { code: 'HAVALE_EFT' } }),
    prisma.refPaymentMethod.findFirst({ where: { code: 'KREDI_KARTI' } }),
    prisma.refPaymentMethod.findFirst({ where: { code: 'E_CUZDAN' } }),
    prisma.refGoldType.findFirst({ where: { code: 'CEYREK_ALTIN' } }),
    prisma.refGoldType.findFirst({ where: { code: 'BILEZIK' } }),
    prisma.refGoldPurity.findFirst({ where: { code: '22K' } }),
  ])

  if (
    !currencyTry ||
    !bankZiraat ||
    !accountTypeVadesiz ||
    !txTypeGelir ||
    !txTypeGider ||
    !categoryMaas ||
    !categoryKira ||
    !paymentMethodHavale
  ) {
    throw new Error('Referans verileri eksik. Önce npx prisma db seed çalıştırın.')
  }

  const bank2 = bankGaranti ?? (await prisma.refBank.findFirst({ where: { NOT: { id: bankZiraat.id } } })) ?? bankZiraat
  const accountTypeVadeliFallback = accountTypeVadeli ?? accountTypeVadesiz
  const accountTypeDovizFallback = accountTypeDoviz ?? accountTypeVadesiz
  const bankIs = bankIsBankasi ?? bank2

  // Dönemler
  const periodAralik = await prisma.period.create({
    data: {
      userId: user.id,
      name: '2025 Aralık',
      periodType: 'MONTHLY',
      startDate: new Date('2025-12-01'),
      endDate: new Date('2025-12-31'),
      isActive: false,
      isClosed: true,
      description: 'Kapatılmış dönem',
    },
  })

  const period = await prisma.period.create({
    data: {
      userId: user.id,
      name: '2026 Ocak',
      periodType: 'MONTHLY',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
      isActive: true,
      isClosed: false,
      description: 'Aktif dönem',
    },
  })

  const periodSubat = await prisma.period.create({
    data: {
      userId: user.id,
      name: '2026 Şubat',
      periodType: 'MONTHLY',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-02-28'),
      isActive: false,
      isClosed: false,
    },
  })
  console.log('✅ Dönemler: 2025 Aralık (kapalı), 2026 Ocak, 2026 Şubat')

  // Banka hesapları
  const anaHesap = await prisma.account.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Ana Hesap',
      bankId: bankZiraat.id,
      accountTypeId: accountTypeVadesiz.id,
      currencyId: currencyTry.id,
      balance: 25000,
      accountNumber: '1234567890',
      iban: 'TR330006100519786457841326',
      active: true,
    },
  })

  const birikimHesap = await prisma.account.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Birikim Hesabı',
      bankId: bank2.id,
      accountTypeId: accountTypeVadeliFallback.id,
      currencyId: currencyTry.id,
      balance: 45000,
      accountNumber: '9876543210',
      iban: 'TR640006200519786457841327',
      active: true,
    },
  })

  if (currencyUsd && accountTypeDovizFallback) {
    await prisma.account.create({
      data: {
        userId: user.id,
        periodId: period.id,
        name: 'Döviz Hesabı (USD)',
        bankId: bankIs.id,
        accountTypeId: accountTypeDovizFallback.id,
        currencyId: currencyUsd.id,
        balance: 2500,
        accountNumber: '5555666677',
        iban: 'TR120006400519786457841328',
        active: true,
      },
    })
  }
  console.log('✅ Banka hesapları: Ana, Birikim, Döviz (USD)')

  // Kredi kartları
  const ziraatKart = await prisma.creditCard.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Ziraat Kredi Kartı',
      bankId: bankZiraat.id,
      currencyId: currencyTry.id,
      limitAmount: 50000,
      availableLimit: 42000,
      statementDay: 15,
      dueDay: 15,
      minPaymentPercent: 3,
      active: true,
    },
  })

  await prisma.creditCard.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Garanti BBVA Kredi Kartı',
      bankId: bank2.id,
      currencyId: currencyTry.id,
      limitAmount: 30000,
      availableLimit: 22000,
      statementDay: 10,
      dueDay: 10,
      minPaymentPercent: 3,
      active: true,
    },
  })
  console.log('✅ Kredi kartları: Ziraat 50K, Garanti 30K')

  // E-cüzdanlar
  const papara = await prisma.eWallet.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Papara',
      provider: 'Papara',
      currencyId: currencyTry.id,
      balance: 5000,
      accountPhone: '+905551234567',
      accountEmail: DEMO_EMAIL,
      active: true,
    },
  })

  await prisma.eWallet.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Ininal',
      provider: 'Ininal',
      currencyId: currencyTry.id,
      balance: 1500,
      accountPhone: '+905559876543',
      active: true,
    },
  })
  console.log('✅ E-cüzdanlar: Papara 5.000 TL, Ininal 1.500 TL')

  // Alıcılar
  const evSahibi = await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Ev Sahibi - Ahmet Yılmaz',
      iban: 'TR330006100519786457841326',
      bankId: bankZiraat.id,
      accountNo: '1234567890',
      description: 'Aylık kira ödemesi',
      email: 'ahmet.yilmaz@email.com',
      phoneNumber: '+90 532 111 2233',
      active: true,
    },
  })

  const bedas = await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'BEDAŞ - Elektrik',
      iban: 'TR330006100519786457841329',
      bankId: bankZiraat.id,
      accountNo: '1112223334',
      description: 'Elektrik faturası',
      email: 'fatura@bedas.com.tr',
      phoneNumber: '0850 123 4567',
      active: true,
    },
  })

  await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Migros A.Ş.',
      description: 'Market alışverişi',
      active: true,
    },
  })

  await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Turkcell',
      description: 'İnternet ve mobil fatura',
      phoneNumber: '444 0 532',
      active: true,
    },
  })
  console.log('✅ Alıcılar: 4 adet')

  // Krediler
  const tasitKredisi = await prisma.loan.create({
    data: {
      userId: user.id,
      name: 'Taşıt Kredisi',
      bankId: bankZiraat.id,
      loanType: 'VEHICLE',
      totalAmount: 300000,
      installmentCount: 36,
      remainingInstallments: 34,
      interestRate: 3,
      paymentDay: 15,
      currencyId: currencyTry.id,
      startDate: new Date('2025-06-01'),
      isActive: true,
      isFictional: false,
      monthlyPayment: 12000,
      description: '2024 Honda Civic - 36 ay vadeli',
    },
  })

  await prisma.loan.create({
    data: {
      userId: user.id,
      name: 'Konut Kredisi (Planlama)',
      bankId: bank2.id,
      loanType: 'HOUSING',
      totalAmount: 2000000,
      installmentCount: 240,
      remainingInstallments: 240,
      interestRate: 4.5,
      paymentDay: 5,
      currencyId: currencyTry.id,
      startDate: new Date('2026-06-01'),
      isActive: true,
      isFictional: true,
      monthlyPayment: 12650,
      description: 'Planlanan ev kredisi - kurgu',
    },
  })
  console.log('✅ Krediler: Taşıt 300K, Konut (planlama) 2M')

  // Altın
  if (goldTypeCeyrek && goldPurity22K) {
    await prisma.goldItem.create({
      data: {
        userId: user.id,
        periodId: period.id,
        name: '2 Çeyrek Altın',
        goldTypeId: goldTypeCeyrek.id,
        goldPurityId: goldPurity22K.id,
        weightGrams: 3.6,
        purchasePrice: 19800,
        purchaseDate: new Date('2026-01-15'),
        currentValueTry: 20700,
        description: 'Düğün için alındı - 2026 güncel değer',
      },
    })
  }
  if (goldTypeBilezik && goldPurity22K) {
    await prisma.goldItem.create({
      data: {
        userId: user.id,
        periodId: period.id,
        name: '22 Ayar Bilezik',
        goldTypeId: goldTypeBilezik.id,
        goldPurityId: goldPurity22K.id,
        weightGrams: 8,
        purchasePrice: 46000,
        purchaseDate: new Date('2025-08-20'),
        currentValueTry: 46000,
        description: 'Ziynet - 8 gram',
      },
    })
  }
  console.log('✅ Altın: 2 çeyrek, 1 bilezik')

  // Yatırımlar
  await prisma.investment.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'BIST30 Endeks Fonu',
      investmentType: 'FUND',
      symbol: 'BIST30',
      quantity: 100,
      purchasePrice: 100,
      currentPrice: 115,
      lastPriceUpdate: new Date('2026-02-04'),
      currencyId: currencyTry.id,
      riskLevel: 'medium',
      purchaseDate: new Date('2026-01-15'),
      category: 'Endeks',
      notes: 'Uzun vadeli birikim',
      active: true,
    },
  })

  await prisma.investment.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'THYAO - Türk Hava Yolları',
      investmentType: 'stock',
      symbol: 'THYAO',
      quantity: 50,
      purchasePrice: 320,
      currentPrice: 350,
      lastPriceUpdate: new Date('2026-02-04'),
      currencyId: currencyTry.id,
      riskLevel: 'medium',
      purchaseDate: new Date('2025-11-10'),
      category: 'Hisse',
      notes: 'BIST hissesi',
      active: true,
    },
  })

  if (currencyTry) {
    await prisma.investment.create({
      data: {
        userId: user.id,
        periodId: period.id,
        name: 'Bitcoin',
        investmentType: 'crypto',
        symbol: 'BTC',
        quantity: 0.002,
        purchasePrice: 2400000,
        currentPrice: 2500000,
        lastPriceUpdate: new Date('2026-02-04'),
        currencyId: currencyTry.id,
        riskLevel: 'high',
        purchaseDate: new Date('2025-12-01'),
        category: 'Kripto',
        notes: 'Küçük miktar deneme',
        active: true,
      },
    })
  }
  console.log('✅ Yatırımlar: BIST30 fon, THYAO hisse, BTC kripto')

  // Hedefler
  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Tatil Hedefi',
      targetAmount: 50000,
      currentAmount: 5000,
      currencyId: currencyTry.id,
      targetDate: new Date('2026-12-31'),
      category: 'travel',
      status: 'active',
      icon: 'Plane',
      color: '#3b82f6',
      notes: 'Yaz tatili için birikim',
    },
  })

  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Araba Yatırımı',
      targetAmount: 150000,
      currentAmount: 25000,
      currencyId: currencyTry.id,
      targetDate: new Date('2027-06-30'),
      category: 'vehicle',
      status: 'active',
      icon: 'Car',
      color: '#10b981',
      notes: 'İkinci araç için',
    },
  })

  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Acil Fon',
      targetAmount: 100000,
      currentAmount: 45000,
      currencyId: currencyTry.id,
      targetDate: new Date('2026-12-31'),
      category: 'emergency',
      status: 'active',
      icon: 'Shield',
      color: '#ef4444',
      notes: '6 aylık gider karşılığı',
    },
  })
  console.log('✅ Hedefler: Tatil, Araba, Acil fon')

  // İşlemler
  const paymentKrediKarti = paymentMethodKrediKarti ?? paymentMethodHavale
  const paymentECuzdan = paymentMethodECuzdan ?? paymentMethodHavale
  const catEkGelir = categoryEkGelir ?? categoryMaas
  const catEglence = categoryEglence ?? categoryAbonelik
  const catVergi = categoryVergi ?? categoryFatura

  const txData = [
    { type: 'GELIR' as const, category: categoryMaas, amount: 115000, desc: 'Ocak 2026 Maaş', date: '2026-01-15', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: 'Aylık maaş', tags: ['maas'], isRecurring: true, recurringType: 'MONTHLY' },
    { type: 'GELIR' as const, category: categoryYemekKarti ?? categoryMaas, amount: 2500, desc: 'Yemek kartı', date: '2026-01-15', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: undefined, tags: [], isRecurring: false, recurringType: undefined },
    { type: 'GELIR' as const, category: catEkGelir, amount: 8500, desc: 'Freelance proje', date: '2026-01-20', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: 'Web sitesi geliştirme', tags: ['ek-gelir'], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryKira, amount: 35000, desc: 'Ocak 2026 Kira', date: '2026-01-05', accountId: anaHesap.id, beneficiaryId: evSahibi.id, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: 'Aylık kira', tags: ['kira'], isRecurring: true, recurringType: 'MONTHLY' },
    { type: 'GIDER' as const, category: categoryFatura ?? categoryKira, amount: 850, desc: 'Elektrik', date: '2026-01-10', accountId: anaHesap.id, beneficiaryId: bedas.id, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: undefined, tags: ['fatura'], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryFatura ?? categoryKira, amount: 180, desc: 'Su', date: '2026-01-10', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: undefined, tags: [], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryFatura ?? categoryKira, amount: 1200, desc: 'Doğalgaz', date: '2026-01-10', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: undefined, tags: ['fatura'], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryFatura ?? categoryKira, amount: 450, desc: 'İnternet', date: '2026-01-10', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: 'Turkcell', tags: [], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryMarket ?? categoryKira, amount: 8000, desc: 'Market', date: '2026-01-10', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: 'Haftalık alışveriş', tags: ['market'], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryUlasim ?? categoryKira, amount: 3500, desc: 'Ulaşım', date: '2026-01-10', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: 'Benzin + toplu taşıma', tags: ['ulasim'], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categorySaglik ?? categoryKira, amount: 1500, desc: 'Sağlık sigortası', date: '2026-01-10', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: undefined, tags: [], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryAbonelik ?? categoryKira, amount: 350, desc: 'Netflix, Spotify', date: '2026-01-10', accountId: undefined, beneficiaryId: undefined, creditCardId: ziraatKart.id, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentKrediKarti.id, notes: 'Abonelikler', tags: ['abonelik'], isRecurring: true, recurringType: 'MONTHLY' },
    { type: 'GIDER' as const, category: catEglence ?? categoryKira, amount: 450, desc: 'Sinema', date: '2026-01-18', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: papara.id, loanId: undefined, paymentMethodId: paymentECuzdan.id, notes: 'Hafta sonu film', tags: ['eglence'], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: catVergi ?? categoryKira, amount: 2500, desc: 'Gelir vergisi', date: '2026-01-25', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: undefined, paymentMethodId: paymentMethodHavale.id, notes: 'Beyanname', tags: ['vergi'], isRecurring: false, recurringType: undefined },
    { type: 'GIDER' as const, category: categoryKira, amount: 12000, desc: 'Taşıt kredisi taksiti', date: '2026-01-15', accountId: anaHesap.id, beneficiaryId: undefined, creditCardId: undefined, eWalletId: undefined, loanId: tasitKredisi.id, paymentMethodId: paymentMethodHavale.id, notes: 'Ocak taksiti', tags: ['kredi'], isRecurring: true, recurringType: 'MONTHLY' },
  ]

  let balance = 25000
  for (const tx of txData) {
    const isGelir = tx.type === 'GELIR'
    const category = tx.category
    if (!category) continue

    await prisma.transaction.create({
      data: {
        userId: user.id,
        periodId: period.id,
        txTypeId: isGelir ? txTypeGelir.id : txTypeGider.id,
        categoryId: category.id,
        paymentMethodId: tx.paymentMethodId,
        accountId: tx.accountId ?? undefined,
        beneficiaryId: tx.beneficiaryId ?? undefined,
        creditCardId: tx.creditCardId ?? undefined,
        eWalletId: tx.eWalletId ?? undefined,
        loanId: tx.loanId ?? undefined,
        amount: tx.amount,
        currencyId: currencyTry.id,
        transactionDate: new Date(tx.date),
        description: tx.desc,
        notes: tx.notes ?? undefined,
        tags: tx.tags ?? [],
        isRecurring: tx.isRecurring ?? false,
        recurringType: tx.recurringType ?? undefined,
      },
    })
    if (tx.accountId === anaHesap.id) {
      balance += isGelir ? tx.amount : -tx.amount
    }
  }

  await prisma.account.update({
    where: { id: anaHesap.id },
    data: { balance },
  })
  console.log('✅ İşlemler: 15 adet (Bakiye:', balance, 'TL)')

  // Otomatik ödemeler
  await prisma.autoPayment.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Aylık Kira',
      amount: 35000,
      currencyId: currencyTry.id,
      paymentMethodId: paymentMethodHavale.id,
      categoryId: categoryKira.id,
      cronSchedule: '0 0 5 * *',
      nextPaymentDate: new Date('2026-02-05'),
      accountId: anaHesap.id,
      beneficiaryId: evSahibi.id,
      active: true,
      description: 'Ev kirası',
    },
  })

  await prisma.autoPayment.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Elektrik Faturası',
      amount: 850,
      currencyId: currencyTry.id,
      paymentMethodId: paymentMethodHavale.id,
      categoryId: categoryFatura?.id ?? categoryKira.id,
      cronSchedule: '0 0 10 * *',
      nextPaymentDate: new Date('2026-02-10'),
      accountId: anaHesap.id,
      beneficiaryId: bedas.id,
      active: true,
      description: 'BEDAŞ elektrik',
    },
  })

  if (paymentKrediKarti) {
    await prisma.autoPayment.create({
      data: {
        userId: user.id,
        periodId: period.id,
        name: 'Kredi Kartı Ödemesi',
        amount: 8000,
        currencyId: currencyTry.id,
        paymentMethodId: paymentMethodHavale.id,
        categoryId: categoryFatura?.id ?? categoryKira.id,
        cronSchedule: '0 0 12 * *',
        nextPaymentDate: new Date('2026-02-15'),
        accountId: anaHesap.id,
        creditCardId: ziraatKart.id,
        active: true,
        description: 'Ziraat kart borcu',
      },
    })
  }
  console.log('✅ Otomatik ödemeler: Kira, Elektrik, Kredi kartı')

  // Portföy anlık görüntüleri
  const totalAssets = 25000 + 45000 + 5000 + 1500 + 20700 + 46000 + 11500 + 17500 + 5000
  const totalLiabilities = 8000 + 8000 + 12000 + 408000
  const netWorth = totalAssets - totalLiabilities

  await prisma.portfolioSnapshot.create({
    data: {
      userId: user.id,
      snapshotDate: new Date('2026-01-01'),
      totalAssets,
      totalLiabilities,
      netWorth,
      breakdown: {
        accounts: 75000,
        cards: -16000,
        ewallets: 6500,
        gold: 66700,
        investments: 34000,
        loans: -428000,
      },
    },
  })

  await prisma.portfolioSnapshot.create({
    data: {
      userId: user.id,
      snapshotDate: new Date('2026-01-31'),
      totalAssets: balance + 45000 + 5000 + 1500 + 20700 + 46000 + 11500 + 17500 + 5000,
      totalLiabilities: 8000 + 8000 + 108000 + 408000,
      netWorth: balance + 45000 + 5000 + 1500 + 20700 + 46000 + 11500 + 17500 + 5000 - 532000,
      breakdown: {
        accounts: balance + 45000,
        cards: -16000,
        ewallets: 6500,
        gold: 66700,
        investments: 34000,
        loans: -516000,
      },
    },
  })
  console.log('✅ Portföy anlık görüntüleri: 2 adet')

  // AI Rapor kullanımı
  await prisma.aIReportUsage.create({
    data: {
      userId: user.id,
      reportType: 'monthly_summary',
      reportDate: new Date('2026-01-31'),
      monthYear: '2026-01',
      reportData: {
        totalIncome: 126000,
        totalExpense: 58480,
        savingsRate: 53.6,
        topCategories: ['Kira', 'Market', 'Ulaşım'],
      },
      status: 'completed',
    },
  })
  console.log('✅ AI rapor kullanımı: 1 adet')

  // Destek talepleri (kategori yoksa oluştur)
  let supportCategory = await prisma.supportTicketCategory.findFirst({
    where: { isActive: true },
  })
  if (!supportCategory) {
    const defaultCats = [
      { name: 'Üyelik', description: 'Üyelik ve abonelik talepleri', icon: 'Crown', color: 'purple' },
      { name: 'Teknik Destek', description: 'Teknik sorunlar', icon: 'Settings', color: 'blue' },
      { name: 'Ödeme', description: 'Ödeme sorunları', icon: 'CreditCard', color: 'orange' },
    ]
    await prisma.supportTicketCategory.createMany({
      data: defaultCats.map(c => ({ ...c, isActive: true })),
    })
    supportCategory = await prisma.supportTicketCategory.findFirst({
      where: { isActive: true },
    })
  }
  if (supportCategory) {
    let ticketNum = generateTicketNumber()
    while (await prisma.supportTicket.findUnique({ where: { ticketNumber: ticketNum } })) {
      ticketNum = generateTicketNumber()
    }
    await prisma.supportTicket.create({
      data: {
        userId: user.id,
        ticketNumber: ticketNum,
        categoryId: supportCategory.id,
        subject: 'Premium özellikler hakkında soru',
        description: 'Merhaba, AI analiz raporlarının kaç kez kullanılabileceğini öğrenmek istiyorum. Premium üyeyim.',
        status: 'resolved',
        priority: 'medium',
        resolvedAt: new Date('2026-01-20'),
      },
    })
    console.log('✅ Destek talebi: 1 adet')
  }

  // 2026 döviz kurları
  if (currencyTry && currencyUsd) {
    const eurCurrency = await prisma.refCurrency.findFirst({ where: { code: 'EUR' } })
    if (eurCurrency) {
      await prisma.fxRate.upsert({
        where: {
          fromCurrencyId_toCurrencyId_rateDate: {
            fromCurrencyId: currencyUsd.id,
            toCurrencyId: currencyTry.id,
            rateDate: new Date('2026-02-04'),
          },
        },
        update: { rate: 43.45 },
        create: {
          fromCurrencyId: currencyUsd.id,
          toCurrencyId: currencyTry.id,
          rate: 43.45,
          rateDate: new Date('2026-02-04'),
          source: 'TCMB',
        },
      })
      await prisma.fxRate.upsert({
        where: {
          fromCurrencyId_toCurrencyId_rateDate: {
            fromCurrencyId: eurCurrency.id,
            toCurrencyId: currencyTry.id,
            rateDate: new Date('2026-02-04'),
          },
        },
        update: { rate: 47.2 },
        create: {
          fromCurrencyId: eurCurrency.id,
          toCurrencyId: currencyTry.id,
          rate: 47.2,
          rateDate: new Date('2026-02-04'),
          source: 'TCMB',
        },
      })
      console.log('✅ Döviz kurları: USD 43.45, EUR 47.2 (2026)')
    }
  }

  // PeriodClosing - 2025 Aralık için
  const aralikAssets = 70000
  const aralikLiabilities = 20000
  await prisma.periodClosing.create({
    data: {
      periodId: periodAralik.id,
      closedAt: new Date('2026-01-01'),
      closedByUserId: user.id,
      totalAssets: aralikAssets,
      totalLiabilities: aralikLiabilities,
      netWorth: aralikAssets - aralikLiabilities,
      transferredToNext: true,
      closingNotes: '2026 Ocak dönemine devir yapıldı',
    },
  })
  console.log('✅ Dönem kapanışı: 2025 Aralık')

  console.log('\n' + '='.repeat(50))
  console.log('✅ DEMO KULLANICI HAZIR')
  console.log('='.repeat(50))
  console.log('📧 E-posta:', DEMO_EMAIL)
  console.log('🔑 Şifre:', DEMO_PASSWORD)
  console.log('\n💡 Giriş yaptıktan sonra Dashboard\'da tüm veriler otomatik görünecektir.')
  console.log('='.repeat(50))
}

main()
  .catch((e) => {
    console.error('❌ Hata:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
