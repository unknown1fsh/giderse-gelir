import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth'
import { TransactionService } from '@/server/services/impl/TransactionService'
import { ExceptionMapper } from '@/server/errors'
import { buildTransactionWhere, parseTransactionFilters } from '@/lib/search'
import { syncNotificationEvents } from '@/lib/notifications/service'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { getActivePeriod } = await import('@/lib/auth')
    const activePeriod = await getActivePeriod(request)
    const { searchParams } = new URL(request.url)
    const filters = parseTransactionFilters(searchParams)
    const whereClause = buildTransactionWhere(user.id, activePeriod?.id, filters)
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [filters.sortBy]: filters.sortDirection,
    }

    const [transactions, total, categories, txTypes] = await Promise.all([
      prisma.transaction.findMany({
        include: {
          txType: true,
          category: true,
          paymentMethod: true,
          account: {
            include: {
              bank: true,
              currency: true,
            },
          },
          creditCard: {
            include: {
              bank: true,
              currency: true,
            },
          },
          eWallet: {
            include: {
              currency: true,
            },
          },
          beneficiary: {
            include: {
              bank: true,
            },
          },
          currency: true,
        },
        where: whereClause,
        orderBy,
        skip: (filters.page - 1) * filters.limit,
        take: filters.limit,
      }),
      prisma.transaction.count({
        where: whereClause,
      }),
      prisma.refTxCategory.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
      prisma.refTxType.findMany({
        where: {
          active: true,
        },
        orderBy: {
          name: 'asc',
        },
      }),
    ])

    return NextResponse.json({
      items: transactions,
      page: filters.page,
      limit: filters.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / filters.limit)),
      filters,
      categories,
      txTypes,
    })
  } catch (error) {
    console.error('Transactions API error:', error)
    return NextResponse.json({ error: 'İşlemler alınamadı' }, { status: 500 })
  }
}

// Bu metot yeni işlem oluşturur (POST).
// Girdi: NextRequest (JSON body)
// Çıktı: NextResponse (oluşturulan işlem)
// Hata: 401, 403, 422, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  // Kullanıcı doğrulama
  const user = await getCurrentUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
  }

  // Service katmanı başlat
  const transactionService = new TransactionService(prisma)

  // Free plan limit kontrolü
  const limitCheck = await transactionService.checkMonthlyLimit(user.id, user.plan)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: `Aylık işlem limitinize ulaştınız (${limitCheck.limit} işlem). Premium plana geçerek sınırsız işlem yapabilirsiniz.`,
        limitReached: true,
        currentCount: limitCheck.current,
        limit: limitCheck.limit,
      },
      { status: 403 }
    )
  }

  const body = (await request.json()) as {
    txTypeId: number
    categoryId: number
    paymentMethodId: number
    accountId?: number
    creditCardId?: number
    eWalletId?: number
    beneficiaryId?: number
    amount: number
    currencyId: number
    transactionDate: string
    description?: string
    tags?: string[]
  }

  // Zod validasyon
  const validatedData = transactionSchema.parse({
    ...body,
    transactionDate: new Date(body.transactionDate),
  })

  // Aktif dönemi al (opsiyonel)
  const { getActivePeriod } = await import('@/lib/auth')
  const activePeriod = await getActivePeriod(request)

  // Transaction data hazırla
  const transactionData = {
    ...validatedData,
    userId: user.id,
    periodId: activePeriod?.id,
  }

  // ✅ Service katmanı üzerinden oluştur (kategori-tip validation dahil)
  const transaction = await transactionService.create(transactionData)

  await syncNotificationEvents(prisma, {
    userId: user.id,
    activePeriodId: activePeriod?.id,
  })

  return NextResponse.json(transaction, { status: 201 })
})
