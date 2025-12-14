/**
 * Minimal Production Seed
 * Sadece kritik referans verilerini ekler (Quota-friendly)
 */

/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Minimal seed başlatılıyor...\n')

  // 1. Para Birimleri (Kritik)
  console.log('💰 Para birimleri ekleniyor...')
  const currencies = await Promise.all([
    prisma.refCurrency.upsert({
      where: { code: 'TRY' },
      update: {},
      create: { code: 'TRY', name: 'Türk Lirası', symbol: '₺' },
    }),
    prisma.refCurrency.upsert({
      where: { code: 'USD' },
      update: {},
      create: { code: 'USD', name: 'Amerikan Doları', symbol: '$' },
    }),
    prisma.refCurrency.upsert({
      where: { code: 'EUR' },
      update: {},
      create: { code: 'EUR', name: 'Euro', symbol: '€' },
    }),
  ])
  console.log(`✅ ${currencies.length} para birimi eklendi\n`)

  // 2. İşlem Tipleri (Kritik)
  console.log('📊 İşlem tipleri ekleniyor...')
  const txTypes = await Promise.all([
    prisma.refTxType.upsert({
      where: { code: 'INCOME' },
      update: {},
      create: {
        code: 'INCOME',
        name: 'Gelir',
        category: 'INCOME',
        description: 'Gelir işlemleri',
      },
    }),
    prisma.refTxType.upsert({
      where: { code: 'EXPENSE' },
      update: {},
      create: {
        code: 'EXPENSE',
        name: 'Gider',
        category: 'EXPENSE',
        description: 'Gider işlemleri',
      },
    }),
  ])
  console.log(`✅ ${txTypes.length} işlem tipi eklendi\n`)

  // 3. Ödeme Yöntemleri (Kritik)
  console.log('💳 Ödeme yöntemleri ekleniyor...')
  const paymentMethods = await Promise.all([
    prisma.refPaymentMethod.upsert({
      where: { code: 'CASH' },
      update: {},
      create: { code: 'CASH', name: 'Nakit', requiresAccount: false },
    }),
    prisma.refPaymentMethod.upsert({
      where: { code: 'BANK_TRANSFER' },
      update: {},
      create: { code: 'BANK_TRANSFER', name: 'Banka Havalesi', requiresAccount: true },
    }),
    prisma.refPaymentMethod.upsert({
      where: { code: 'CREDIT_CARD' },
      update: {},
      create: { code: 'CREDIT_CARD', name: 'Kredi Kartı', requiresAccount: false },
    }),
  ])
  console.log(`✅ ${paymentMethods.length} ödeme yöntemi eklendi\n`)

  // 4. Kategoriler (Kritik - Sadece Ana Kategoriler)
  console.log('📁 Kategoriler ekleniyor...')
  const categories = await Promise.all([
    // Gelir Kategorileri
    prisma.refCategory.upsert({
      where: { code: 'SALARY' },
      update: {},
      create: {
        code: 'SALARY',
        name: 'Maaş',
        type: 'INCOME',
        description: 'Maaş geliri',
      },
    }),
    prisma.refCategory.upsert({
      where: { code: 'BUSINESS' },
      update: {},
      create: {
        code: 'BUSINESS',
        name: 'İş Geliri',
        type: 'INCOME',
        description: 'İş ve ticaret geliri',
      },
    }),
    prisma.refCategory.upsert({
      where: { code: 'OTHER_INCOME' },
      update: {},
      create: {
        code: 'OTHER_INCOME',
        name: 'Diğer Gelir',
        type: 'INCOME',
        description: 'Diğer gelir türleri',
      },
    }),
    // Gider Kategorileri
    prisma.refCategory.upsert({
      where: { code: 'FOOD' },
      update: {},
      create: {
        code: 'FOOD',
        name: 'Yiyecek & İçecek',
        type: 'EXPENSE',
        description: 'Yemek, market alışverişi',
      },
    }),
    prisma.refCategory.upsert({
      where: { code: 'TRANSPORT' },
      update: {},
      create: {
        code: 'TRANSPORT',
        name: 'Ulaşım',
        type: 'EXPENSE',
        description: 'Ulaşım giderleri',
      },
    }),
    prisma.refCategory.upsert({
      where: { code: 'BILLS' },
      update: {},
      create: {
        code: 'BILLS',
        name: 'Faturalar',
        type: 'EXPENSE',
        description: 'Elektrik, su, doğalgaz vb.',
      },
    }),
    prisma.refCategory.upsert({
      where: { code: 'SHOPPING' },
      update: {},
      create: {
        code: 'SHOPPING',
        name: 'Alışveriş',
        type: 'EXPENSE',
        description: 'Giyim, elektronik vb.',
      },
    }),
    prisma.refCategory.upsert({
      where: { code: 'OTHER_EXPENSE' },
      update: {},
      create: {
        code: 'OTHER_EXPENSE',
        name: 'Diğer Gider',
        type: 'EXPENSE',
        description: 'Diğer gider türleri',
      },
    }),
  ])
  console.log(`✅ ${categories.length} kategori eklendi\n`)

  // 5. Bankalar (Sadece Büyük Bankalar - Kritik)
  console.log('🏦 Bankalar ekleniyor...')
  const banks = await Promise.all([
    prisma.refBank.upsert({
      where: { asciiName: 'Ziraat Bankasi' },
      update: {},
      create: {
        name: 'Ziraat Bankası',
        asciiName: 'Ziraat Bankasi',
        swiftBic: 'TCZBTR2A',
        bankCode: '0010',
      },
    }),
    prisma.refBank.upsert({
      where: { asciiName: 'Halkbank' },
      update: {},
      create: {
        name: 'Halkbank',
        asciiName: 'Halkbank',
        swiftBic: 'TRHBTR2A',
        bankCode: '0012',
      },
    }),
    prisma.refBank.upsert({
      where: { asciiName: 'VakifBank' },
      update: {},
      create: {
        name: 'VakıfBank',
        asciiName: 'VakifBank',
        swiftBic: 'TVBATR2A',
        bankCode: '0015',
      },
    }),
    prisma.refBank.upsert({
      where: { asciiName: 'Akbank' },
      update: {},
      create: {
        name: 'Akbank',
        asciiName: 'Akbank',
        swiftBic: 'AKBKTRIS',
        bankCode: '0046',
      },
    }),
    prisma.refBank.upsert({
      where: { asciiName: 'Garanti BBVA' },
      update: {},
      create: {
        name: 'Garanti BBVA',
        asciiName: 'Garanti BBVA',
        swiftBic: 'TGBATRIS',
        bankCode: '0062',
      },
    }),
    prisma.refBank.upsert({
      where: { asciiName: 'Is Bankasi' },
      update: {},
      create: {
        name: 'İş Bankası',
        asciiName: 'Is Bankasi',
        swiftBic: 'ISBKTRIS',
        bankCode: '0064',
      },
    }),
    prisma.refBank.upsert({
      where: { asciiName: 'Yapi Kredi' },
      update: {},
      create: {
        name: 'Yapı Kredi',
        asciiName: 'Yapi Kredi',
        swiftBic: 'YAPITRIS',
        bankCode: '0067',
      },
    }),
  ])
  console.log(`✅ ${banks.length} banka eklendi\n`)

  // 6. Hesap Tipleri (Kritik)
  console.log('📋 Hesap tipleri ekleniyor...')
  const accountTypes = await Promise.all([
    prisma.refAccountType.upsert({
      where: { code: 'CHECKING' },
      update: {},
      create: {
        code: 'CHECKING',
        name: 'Vadesiz Hesap',
        description: 'Günlük kullanım için banka hesabı',
      },
    }),
    prisma.refAccountType.upsert({
      where: { code: 'SAVINGS' },
      update: {},
      create: {
        code: 'SAVINGS',
        name: 'Vadeli Hesap',
        description: 'Tasarruf ve vadeli mevduat hesabı',
      },
    }),
    prisma.refAccountType.upsert({
      where: { code: 'CREDIT_CARD' },
      update: {},
      create: {
        code: 'CREDIT_CARD',
        name: 'Kredi Kartı',
        description: 'Kredi kartı hesabı',
      },
    }),
    prisma.refAccountType.upsert({
      where: { code: 'CASH' },
      update: {},
      create: {
        code: 'CASH',
        name: 'Nakit',
        description: 'Nakit para',
      },
    }),
  ])
  console.log(`✅ ${accountTypes.length} hesap tipi eklendi\n`)

  // 7. Sistem Parametreleri (En Kritik Olanlar)
  console.log('⚙️ Sistem parametreleri ekleniyor...')

  // BANK parametreleri
  for (const bank of banks) {
    await prisma.systemParameter.upsert({
      where: {
        paramGroup_paramCode: {
          paramGroup: 'BANK',
          paramCode: bank.asciiName.toUpperCase().replace(/\s+/g, '_'),
        },
      },
      update: {},
      create: {
        paramGroup: 'BANK',
        paramCode: bank.asciiName.toUpperCase().replace(/\s+/g, '_'),
        paramValue: bank.name,
        displayName: bank.name,
        description: `${bank.name}`,
        displayOrder: banks.indexOf(bank) + 1,
        metadata: {
          swiftBic: bank.swiftBic,
          bankCode: bank.bankCode,
          asciiName: bank.asciiName,
        },
        isActive: bank.active,
      },
    })
  }

  // ACCOUNT_TYPE parametreleri
  for (const accType of accountTypes) {
    await prisma.systemParameter.upsert({
      where: {
        paramGroup_paramCode: {
          paramGroup: 'ACCOUNT_TYPE',
          paramCode: accType.code,
        },
      },
      update: {},
      create: {
        paramGroup: 'ACCOUNT_TYPE',
        paramCode: accType.code,
        paramValue: accType.name,
        displayName: accType.name,
        description: accType.description,
        displayOrder: accountTypes.indexOf(accType) + 1,
        metadata: {},
        isActive: accType.active,
      },
    })
  }

  console.log(`✅ ${banks.length + accountTypes.length} sistem parametresi eklendi\n`)

  console.log('🎉 Minimal seed tamamlandı!')
  console.log('\n📊 Eklenen Veriler:')
  console.log(`   - ${currencies.length} para birimi`)
  console.log(`   - ${txTypes.length} işlem tipi`)
  console.log(`   - ${paymentMethods.length} ödeme yöntemi`)
  console.log(`   - ${categories.length} kategori`)
  console.log(`   - ${banks.length} banka`)
  console.log(`   - ${accountTypes.length} hesap tipi`)
  console.log(`   - ${banks.length + accountTypes.length} sistem parametresi`)
  console.log('\n✅ Uygulama artık kullanıma hazır!')
}

main()
  .catch(e => {
    console.error('❌ Seed hatası:', e)
    process.exit(1)
  })
  .finally(() => {
    void prisma.$disconnect()
  })
