import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExceptionMapper } from '@/server/errors'
import { getCurrentUser } from '@/lib/auth-refactored'
import { SystemParameterService } from '@/server/services/impl/SystemParameterService'

// Bu endpoint tüm referans verilerini getirir
// TX_TYPE ve TX_CATEGORY: Ref tablolarından (Transaction tablosu bunlara bağlı)
// BANK, ACCOUNT_TYPE, CURRENCY, GOLD: Ref tablolarından (Foreign Key uyumu için)
// PAYMENT_METHOD, CURRENCY: SystemParameter'dan (UI için)
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  // Kullanıcı kontrolü (opsiyonel - bazı referans veriler public olabilir)
  const user = await getCurrentUser(request)

  // eslint-disable-next-line no-console
  console.log('🔍 Reference data çekiliyor...')

  const parameterService = new SystemParameterService(prisma)

  // TRANSACTION parametreleri için REF TABLOLARINDAN çek (Foreign Key uyumu için)
  // ACCOUNT/GOLD parametreleri için Ref tabloları (Foreign Key direkt uyumlu)
  const [
    refTxTypes,
    refTxCategories,
    paymentMethodParams,
    currencyParams,
    refCurrencies,
    refBanks,
    refAccountTypes,
    refGoldTypes,
    refGoldPurities,
  ] = await Promise.all([
    // Transaction için: Ref tablolarından çek (Transaction tablosu bunlara bağlı)
    prisma.refTxType.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
    prisma.refTxCategory.findMany({
      where: { active: true },
      include: { txType: true },
      orderBy: { name: 'asc' },
    }),
    parameterService.getByGroup('PAYMENT_METHOD'),
    parameterService.getByGroup('CURRENCY'),
    // Para birimleri için: SystemParameter boşsa refCurrency tablosundan fallback
    prisma.refCurrency.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
    // Account/Gold için: Ref tabloları (Foreign Key direkt uyumlu)
    prisma.refBank.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.refAccountType.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
    prisma.refGoldType.findMany({ where: { active: true }, orderBy: { name: 'asc' } }),
    prisma.refGoldPurity.findMany({ where: { active: true }, orderBy: { code: 'asc' } }),
  ])

  // eslint-disable-next-line no-console
  console.log('📊 Reference veriler:', {
    txTypes: refTxTypes.length,
    categories: refTxCategories.length,
    paymentMethods: paymentMethodParams.length,
    currencies: currencyParams.length > 0 ? currencyParams.length : refCurrencies.length,
    currenciesSource: currencyParams.length > 0 ? 'SystemParameter' : 'RefCurrency',
  })

  // Kullanıcıya özel veriler (sadece login olmuşsa)
  const [accounts, creditCards, eWallets, beneficiaries, loans] = await Promise.all([
    user
      ? prisma.account.findMany({
        include: { bank: true, currency: true, accountType: true },
        where: { userId: user.id, active: true },
        orderBy: { name: 'asc' },
      })
      : Promise.resolve([]),
    user
      ? prisma.creditCard.findMany({
        include: { bank: true, currency: true },
        where: { userId: user.id, active: true },
        orderBy: { name: 'asc' },
      })
      : Promise.resolve([]),
    user
      ? prisma.eWallet.findMany({
        include: { currency: true },
        where: { userId: user.id, active: true },
        orderBy: { name: 'asc' },
      })
      : Promise.resolve([]),
    user
      ? prisma.beneficiary.findMany({
        include: { bank: true },
        where: { userId: user.id, active: true },
        orderBy: { name: 'asc' },
      })
      : Promise.resolve([]),
    user
      ? prisma.loan.findMany({
        include: { bank: true, currency: true },
        where: { userId: user.id, isActive: true },
        orderBy: { name: 'asc' },
      })
      : Promise.resolve([]),
  ])

  const response = {
    // İşlem parametreleri (REF TABLOLARINDAN - Transaction tablosu bunlara bağlı)
    txTypes: refTxTypes.map(t => ({
      id: t.id,
      code: t.code,
      name: t.name,
      icon: t.icon || null,
      color: t.color || null,
    })),
    categories: refTxCategories.map(c => ({
      id: c.id,
      name: c.name,
      code: c.code,
      txTypeId: c.txTypeId, // Ref tablosundan direkt txTypeId
      txTypeName: c.txType.name,
      icon: c.icon || null,
      color: c.color || null,
      isDefault: c.isDefault,
      description: c.description || null,
    })),
    paymentMethods: paymentMethodParams.map(p => ({
      id: p.id,
      code: p.paramCode,
      name: p.displayName,
      description: p.description,
    })),

    // ESKİ REF TABLOLARINDAN (Foreign Key uyumu için)
    // Account, CreditCard, GoldItem tabloları bunlara bağlı
    banks: refBanks.map(b => ({
      id: b.id,
      name: b.name,
      asciiName: b.asciiName,
      swiftBic: b.swiftBic,
      bankCode: b.bankCode,
      website: b.website,
    })),
    accountTypes: refAccountTypes.map(a => ({
      id: a.id,
      code: a.code,
      name: a.name,
      description: a.description,
    })),
    // Para birimleri: HER ZAMAN refCurrency tablosundan al (Account/CreditCard foreign key uyumu için)
    // SystemParameter'daki CURRENCY verileri sadece display için kullanılabilir, ID'leri farklı
    currencies: refCurrencies.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      symbol: c.symbol,
    })),
    goldTypes: refGoldTypes.map(g => ({
      id: g.id,
      code: g.code,
      name: g.name,
      description: g.description,
    })),
    goldPurities: refGoldPurities.map(g => ({
      id: g.id,
      code: g.code,
      name: g.name,
      purity: g.purity,
    })),

    // Kullanıcıya özel veriler
    accounts: accounts.map(a => ({
      id: a.id,
      name: a.name,
      accountType: a.accountType ? { id: a.accountType.id, name: a.accountType.name } : null,
      bank: { id: a.bank.id, name: a.bank.name },
      currency: { id: a.currency.id, code: a.currency.code, name: a.currency.name },
    })),
    creditCards: creditCards.map(c => ({
      id: c.id,
      name: c.name,
      bank: { id: c.bank.id, name: c.bank.name },
      currency: { id: c.currency.id, code: c.currency.code, name: c.currency.name },
    })),
    eWallets: eWallets.map(e => ({
      id: e.id,
      name: e.name,
      provider: e.provider,
      balance: e.balance,
      currency: { id: e.currency.id, code: e.currency.code, name: e.currency.name },
    })),
    beneficiaries: beneficiaries.map(b => ({
      id: b.id,
      name: b.name,
      iban: b.iban,
      accountNo: b.accountNo,
      bank: b.bank ? { id: b.bank.id, name: b.bank.name } : null,
      phoneNumber: b.phoneNumber,
      email: b.email,
    })),
    loans: loans.map(l => ({
      id: l.id,
      name: l.name,
      bank: { id: l.bank.id, name: l.bank.name },
      currency: { id: l.currency.id, code: l.currency.code, name: l.currency.name },
      remainingInstallments: l.remainingInstallments,
      totalAmount: l.totalAmount,
    })),

    // Meta bilgi
    _meta: {
      source:
        'Mixed (TX/Category: RefTables, Payment/Currency: SystemParameter, Account/Gold: RefTables)',
      totalBanks: refBanks.length,
      totalGoldTypes: refGoldTypes.length,
      totalGoldPurities: refGoldPurities.length,
      totalCategories: refTxCategories.length,
      totalPaymentMethods: paymentMethodParams.length,
      totalCurrencies: currencyParams.length > 0 ? currencyParams.length : refCurrencies.length,
      timestamp: new Date().toISOString(),
    },
  }

  // eslint-disable-next-line no-console
  console.log('✅ Reference data hazırlandı:', {
    txTypes: response.txTypes.length,
    categories: response.categories.length,
    paymentMethods: response.paymentMethods.length,
    currencies: response.currencies.length,
    accounts: response.accounts.length,
  })

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0',
    },
  })
})
