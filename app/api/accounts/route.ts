import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Aktif dönemi al (opsiyonel)
    const { getActivePeriod } = await import('@/lib/auth-refactored')
    const activePeriod = await getActivePeriod(request)

    // Where clause hazırla
    const accountWhere: { userId: number; active: boolean; periodId?: number } = {
      userId: user.id,
      active: true,
    }
    const cardWhere: { userId: number; active: boolean; periodId?: number } = {
      userId: user.id,
      active: true,
    }
    const goldWhere: { userId: number; periodId?: number } = { userId: user.id }

    if (activePeriod) {
      accountWhere.periodId = activePeriod.id
      cardWhere.periodId = activePeriod.id
      goldWhere.periodId = activePeriod.id
    }

    // Default Nakit hesabı kontrolü ve oluşturma
    // accountNumber='CASH' veya ismi 'nakit' içeren hesap varsa oluşturma
    const existingCashAccount = await prisma.account.findFirst({
      where: {
        userId: user.id,
        active: true,
        OR: [
          { accountNumber: 'CASH' },
          { name: { contains: 'nakit', mode: 'insensitive' } },
        ],
      },
    })

    if (!existingCashAccount) {
      // TRY para birimini ve varsayılan banka/hesap türünü bul
      const [tryCurrency, defaultBank, defaultAccountType] = await Promise.all([
        prisma.refCurrency.findFirst({ where: { code: 'TRY', active: true } }),
        prisma.refBank.findFirst({ where: { active: true } }),
        prisma.refAccountType.findFirst({ where: { code: 'VADESIZ', active: true } }),
      ])

      if (tryCurrency && defaultBank && defaultAccountType) {
        await prisma.account.create({
          data: {
            userId: user.id,
            name: 'Nakit',
            bankId: defaultBank.id,
            accountTypeId: defaultAccountType.id,
            currencyId: tryCurrency.id,
            balance: 0,
            accountNumber: 'CASH',
            iban: null,
            active: true,
            periodId: activePeriod?.id,
          },
        })
      }
    }

    // Tüm hesap türlerini paralel olarak çek
    const [accounts, creditCards, goldItems] = await Promise.all([
      prisma.account.findMany({
        include: {
          accountType: true,
          bank: true,
          currency: true,
        },
        where: accountWhere,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.creditCard.findMany({
        include: {
          bank: true,
          currency: true,
        },
        where: cardWhere,
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.goldItem.findMany({
        include: {
          goldType: true,
          goldPurity: true,
        },
        where: goldWhere,
        orderBy: {
          name: 'asc',
        },
      }),
    ])

    // Tüm hesapları birleştir ve tip bilgisi ekle
    const allAccounts = [
      ...accounts.map(account => ({
        ...account,
        accountType: 'bank',
        uniqueId: `bank_${account.id}`,
      })),
      ...creditCards.map(card => ({
        ...card,
        accountType: 'credit_card',
        uniqueId: `card_${card.id}`,
      })),
      ...goldItems.map(gold => ({ ...gold, accountType: 'gold', uniqueId: `gold_${gold.id}` })),
    ]

    return NextResponse.json(allAccounts)
  } catch (error) {
    console.error('Accounts API error:', error)
    return NextResponse.json({ error: 'Hesaplar alınamadı' }, { status: 500 })
  }
}

interface CreateAccountBody {
  accountType: string
  name: string
  bankId: number
  accountTypeId: number
  currencyId: number
  balance?: number
  accountNumber?: string
  iban?: string
  limitAmount?: number
  availableLimit?: number
  dueDay?: number
  goldTypeId?: number
  goldPurityId?: number
  weight?: number
  purchasePrice?: number
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = (await request.json()) as CreateAccountBody

    // Aktif dönemi al (opsiyonel)
    const { getActivePeriod } = await import('@/lib/auth-refactored')
    const activePeriod = await getActivePeriod(request)

    // Hesap türüne göre farklı işlemler
    // eslint-disable-next-line no-console
    console.log('[DEBUG] Account creation request body:', JSON.stringify(body, null, 2))
    if (body.accountType === 'bank') {
      // Validasyon: Zorunlu alanları kontrol et
      if (!body.bankId || body.bankId === 0) {
        return NextResponse.json({ error: 'Lütfen bir banka seçin' }, { status: 400 })
      }
      if (!body.accountTypeId || body.accountTypeId === 0) {
        return NextResponse.json({ error: 'Lütfen bir hesap türü seçin' }, { status: 400 })
      }
      if (!body.currencyId || body.currencyId === 0) {
        return NextResponse.json({ error: 'Lütfen bir para birimi seçin' }, { status: 400 })
      }

      // Veritabanı validasyonu: Referans verilerinin var olduğunu kontrol et
      const [currency, bank, accountType] = await Promise.all([
        prisma.refCurrency.findUnique({ where: { id: body.currencyId } }),
        prisma.refBank.findUnique({ where: { id: body.bankId } }),
        prisma.refAccountType.findUnique({ where: { id: body.accountTypeId } }),
      ])

      if (!currency) {
        console.error('Currency not found:', body.currencyId)
        return NextResponse.json({ error: 'Seçilen para birimi bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.' }, { status: 400 })
      }
      if (!bank) {
        console.error('Bank not found:', body.bankId)
        return NextResponse.json({ error: 'Seçilen banka bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.' }, { status: 400 })
      }
      if (!accountType) {
        console.error('Account type not found:', body.accountTypeId)
        return NextResponse.json({ error: 'Seçilen hesap türü bulunamadı. Lütfen sayfayı yenileyip tekrar deneyin.' }, { status: 400 })
      }
      const accountData: {
        userId: number
        name: string
        bankId: number
        accountTypeId: number
        currencyId: number
        balance: number
        accountNumber: string | null
        iban: string | null
        active: boolean
        periodId?: number
      } = {
        userId: user.id,
        name: body.name,
        bankId: body.bankId,
        accountTypeId: body.accountTypeId,
        currencyId: body.currencyId,
        balance: body.balance || 0,
        accountNumber: body.accountNumber || null,
        iban: body.iban || null,
        active: true,
      }

      if (activePeriod) {
        accountData.periodId = activePeriod.id
      }

      const account = await prisma.account.create({
        data: accountData,
        include: {
          accountType: true,
          bank: true,
          currency: true,
        },
      })
      return NextResponse.json(account, { status: 201 })
    }

    if (body.accountType === 'credit_card') {
      // Validasyon: Zorunlu alanları kontrol et
      if (!body.bankId || body.bankId === 0) {
        return NextResponse.json({ error: 'Lütfen bir banka seçin' }, { status: 400 })
      }
      if (!body.currencyId || body.currencyId === 0) {
        return NextResponse.json({ error: 'Lütfen bir para birimi seçin' }, { status: 400 })
      }
      const cardData: {
        userId: number
        name: string
        bankId: number
        currencyId: number
        limitAmount: number
        availableLimit: number
        statementDay: number
        dueDay: number
        active: boolean
        periodId?: number
      } = {
        userId: user.id,
        name: body.name,
        bankId: body.bankId,
        currencyId: body.currencyId,
        limitAmount: body.limitAmount || 0,
        availableLimit: body.limitAmount || 0,
        statementDay: 1, // Varsayılan hesap kesim günü
        dueDay: body.dueDay || 1,
        active: true,
      }

      if (activePeriod) {
        cardData.periodId = activePeriod.id
      }

      const creditCard = await prisma.creditCard.create({
        data: cardData,
        include: {
          bank: true,
          currency: true,
        },
      })
      return NextResponse.json(creditCard, { status: 201 })
    }

    if (body.accountType === 'gold') {
      // Validasyon: Zorunlu alanları kontrol et
      if (!body.goldTypeId || body.goldTypeId === 0) {
        return NextResponse.json({ error: 'Lütfen bir altın türü seçin' }, { status: 400 })
      }
      if (!body.goldPurityId || body.goldPurityId === 0) {
        return NextResponse.json({ error: 'Lütfen bir ayar seçin' }, { status: 400 })
      }
      const goldData: {
        userId: number
        name: string
        goldTypeId: number
        goldPurityId: number
        weightGrams: number
        purchasePrice: number
        purchaseDate: Date
        currentValueTry: number
        description: null
        periodId?: number
      } = {
        userId: user.id,
        name: body.name,
        goldTypeId: body.goldTypeId ? parseInt(String(body.goldTypeId)) : 0,
        goldPurityId: body.goldPurityId ? parseInt(String(body.goldPurityId)) : 0,
        weightGrams: body.weight || 0,
        purchasePrice: body.purchasePrice || 0,
        purchaseDate: new Date(),
        currentValueTry: body.purchasePrice || 0, // Başlangıçta alış fiyatı ile aynı
        description: null,
      }

      if (activePeriod) {
        goldData.periodId = activePeriod.id
      }

      const goldItem = await prisma.goldItem.create({
        data: goldData,
      })
      return NextResponse.json(goldItem, { status: 201 })
    }

    return NextResponse.json({ error: 'Geçersiz hesap türü' }, { status: 400 })
  } catch (error) {
    console.error('Account creation error:', error)
    return NextResponse.json({ error: 'Hesap oluşturulamadı' }, { status: 500 })
  }
}
