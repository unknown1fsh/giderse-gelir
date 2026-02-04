#!/usr/bin/env npx tsx
/**
 * Demo kullanıcı ve 2026 test verilerini oluşturur.
 * Giriş: demo@giderse-gelir.com / 123456
 *
 * Çalıştırma: npx tsx scripts/seed-demo-user.ts
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const DEMO_EMAIL = 'demo@giderse-gelir.com'
const DEMO_USERNAME = 'demo2026'
const DEMO_PASSWORD = '123456'

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

  // Şifre hash
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12)

  // Kullanıcı oluştur
  const user = await prisma.user.create({
    data: {
      email: DEMO_EMAIL,
      username: DEMO_USERNAME,
      name: 'Demo Kullanıcı',
      passwordHash,
      emailVerified: true,
      isActive: true,
      currency: 'TRY',
    },
  })
  console.log('✅ Kullanıcı oluşturuldu:', DEMO_EMAIL)

  // Premium abonelik
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
    bankZiraat,
    bankGaranti,
    accountTypeVadesiz,
    accountTypeVadeli,
    txTypeGelir,
    txTypeGider,
    categoryMaas,
    categoryYemekKarti,
    categoryKira,
    categoryMarket,
    categoryFatura,
    categoryUlasim,
    categorySaglik,
    categoryAbonelik,
    paymentMethodHavale,
    goldTypeCeyrek,
    goldPurity22K,
  ] = await Promise.all([
    prisma.refCurrency.findFirst({ where: { code: 'TRY' } }),
    prisma.refBank.findFirst({ where: { asciiName: 'Ziraat Bankasi' } }),
    prisma.refBank.findFirst({ where: { asciiName: 'Garanti BBVA' } }),
    prisma.refAccountType.findFirst({ where: { code: 'VADESIZ' } }),
    prisma.refAccountType.findFirst({ where: { code: 'VADELI' } }),
    prisma.refTxType.findFirst({ where: { code: 'GELIR' } }),
    prisma.refTxType.findFirst({ where: { code: 'GIDER' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GELIR' }, code: 'MAAS' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GELIR' }, code: 'YEMEK_KARTI' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'KIRA' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'MARKET' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'FATURA' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'ULASIM' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'SAGLIK' } }),
    prisma.refTxCategory.findFirst({ where: { txType: { code: 'GIDER' }, code: 'ABONELIK' } }),
    prisma.refPaymentMethod.findFirst({ where: { code: 'HAVALE_EFT' } }),
    prisma.refGoldType.findFirst({ where: { code: 'CEYREK_ALTIN' } }),
    prisma.refGoldPurity.findFirst({ where: { code: '22K' } }),
  ])

  if (!currencyTry || !bankZiraat || !accountTypeVadesiz || !txTypeGelir || !txTypeGider || !categoryMaas || !categoryKira || !paymentMethodHavale) {
    throw new Error('Referans verileri eksik. Önce npx tsx prisma/seed.ts çalıştırın.')
  }

  const bank2 = bankGaranti ?? (await prisma.refBank.findFirst({ where: { NOT: { id: bankZiraat.id } } })) ?? bankZiraat
  const accountTypeVadeliFallback = accountTypeVadeli ?? accountTypeVadesiz

  // 2026 Ocak dönemi
  const period = await prisma.period.create({
    data: {
      userId: user.id,
      name: '2026 Ocak',
      periodType: 'MONTHLY',
      startDate: new Date('2026-01-01'),
      endDate: new Date('2026-01-31'),
      isActive: true,
      isClosed: false,
    },
  })
  console.log('✅ Dönem oluşturuldu: 2026 Ocak')

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
      active: true,
    },
  })
  console.log('✅ Banka hesapları: Ana 25.000 TL, Birikim 45.000 TL')

  // Kredi kartı (50K limit, 42K available = 8K borç)
  await prisma.creditCard.create({
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
  console.log('✅ Kredi kartı: 50.000 limit, 8.000 borç')

  // E-cüzdan
  await prisma.eWallet.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'Papara',
      provider: 'Papara',
      currencyId: currencyTry.id,
      balance: 5000,
      accountPhone: '+905551234567',
      active: true,
    },
  })
  console.log('✅ E-cüzdan: Papara 5.000 TL')

  // Alıcılar
  const evSahibi = await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'Ev Sahibi - Ahmet Yılmaz',
      iban: 'TR330006100519786457841326',
      bankId: bankZiraat.id,
      accountNo: '1234567890',
      active: true,
    },
  })
  await prisma.beneficiary.create({
    data: {
      userId: user.id,
      name: 'BEDAŞ - Elektrik',
      description: 'Elektrik faturası',
      active: true,
    },
  })
  console.log('✅ Alıcılar oluşturuldu')

  // Kredi
  await prisma.loan.create({
    data: {
      userId: user.id,
      name: 'Taşıt Kredisi',
      bankId: bankZiraat.id,
      loanType: 'VEHICLE',
      totalAmount: 300000,
      installmentCount: 36,
      remainingInstallments: 36,
      interestRate: 3,
      paymentDay: 15,
      currencyId: currencyTry.id,
      startDate: new Date('2025-06-01'),
      isActive: true,
      isFictional: false,
      monthlyPayment: 12000,
    },
  })
  console.log('✅ Kredi: Taşıt 300.000 TL, 36 ay')

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
        currentValueTry: 19800,
      },
    })
    console.log('✅ Altın: 2 çeyrek')
  }

  // Yatırım
  await prisma.investment.create({
    data: {
      userId: user.id,
      periodId: period.id,
      name: 'BIST30 Endeks Fonu',
      investmentType: 'FUND',
      symbol: 'BIST30',
      quantity: 100,
      purchasePrice: 100,
      currencyId: currencyTry.id,
      riskLevel: 'medium',
      purchaseDate: new Date('2026-01-15'),
      active: true,
    },
  })
  console.log('✅ Yatırım: BIST30 fon 10.000 TL')

  // Hedef
  await prisma.goal.create({
    data: {
      userId: user.id,
      name: 'Tatil Hedefi',
      targetAmount: 50000,
      currentAmount: 0,
      currencyId: currencyTry.id,
      targetDate: new Date('2026-12-31'),
      category: 'travel',
      status: 'active',
    },
  })
  console.log('✅ Hedef: Tatil 50.000 TL')

  // İşlemler (TransactionService mantığı: gelir hesaba +, gider hesaba -)
  const txData = [
    { type: 'GELIR', category: categoryMaas, amount: 115000, desc: 'Ocak 2026 Maaş', date: '2026-01-15' },
    { type: 'GELIR', category: categoryYemekKarti ?? categoryMaas, amount: 2500, desc: 'Yemek kartı', date: '2026-01-15' },
    { type: 'GIDER', category: categoryKira, amount: 35000, desc: 'Ocak 2026 Kira', date: '2026-01-05' },
    { type: 'GIDER', category: categoryFatura ?? categoryKira, amount: 850, desc: 'Elektrik', date: '2026-01-10' },
    { type: 'GIDER', category: categoryFatura ?? categoryKira, amount: 180, desc: 'Su', date: '2026-01-10' },
    { type: 'GIDER', category: categoryFatura ?? categoryKira, amount: 1200, desc: 'Doğalgaz', date: '2026-01-10' },
    { type: 'GIDER', category: categoryFatura ?? categoryKira, amount: 450, desc: 'İnternet', date: '2026-01-10' },
    { type: 'GIDER', category: categoryMarket ?? categoryKira, amount: 8000, desc: 'Market', date: '2026-01-10' },
    { type: 'GIDER', category: categoryUlasim ?? categoryKira, amount: 3500, desc: 'Ulaşım', date: '2026-01-10' },
    { type: 'GIDER', category: categorySaglik ?? categoryKira, amount: 1500, desc: 'Sağlık sigortası', date: '2026-01-10' },
    { type: 'GIDER', category: categoryAbonelik ?? categoryKira, amount: 350, desc: 'Netflix, Spotify', date: '2026-01-10' },
  ]

  let balance = 25000 // Ana hesap başlangıç
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
        paymentMethodId: paymentMethodHavale.id,
        accountId: anaHesap.id,
        beneficiaryId: tx.desc.includes('Kira') ? evSahibi.id : undefined,
        amount: tx.amount,
        currencyId: currencyTry.id,
        transactionDate: new Date(tx.date),
        description: tx.desc,
      },
    })
    balance += isGelir ? tx.amount : -tx.amount
  }

  // Ana hesap bakiyesini güncelle
  await prisma.account.update({
    where: { id: anaHesap.id },
    data: { balance },
  })
  console.log('✅ İşlemler: Maaş 115K, Kira 35K, faturalar, market vb. (Bakiye:', balance, 'TL)')

  // Otomatik ödeme
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
    },
  })
  console.log('✅ Otomatik ödeme: Kira')

  // Session oluştur ve aktif dönem ata (ilk girişte kullanıcı zaten yeni session alacak;
  // dönem isActive:true olduğu için period selector'da 2026 Ocak görünecek)
  // Not: Login sonrası kullanıcı Dönemler sayfasından "2026 Ocak"ı aktifleştirmeli
  // veya zaten isActive:true ise otomatik seçilecektir.

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
