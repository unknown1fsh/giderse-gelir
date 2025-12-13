import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { transactionSchema } from '@/lib/validators'
import { getCurrentUser } from '@/lib/auth-refactored'
import { TransactionService } from '@/server/services/impl/TransactionService'
import { ExceptionMapper } from '@/server/errors'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Aktif dönemi al (opsiyonel - migration sonrası aktif olacak)
    const { getActivePeriod } = await import('@/lib/auth-refactored')
    const activePeriod = await getActivePeriod(request)

    // Period sistemi henüz aktif değilse, tüm işlemleri getir
    const whereClause: {
      userId: number
      periodId?: number
    } = {
      userId: user.id,
    }

    if (activePeriod) {
      whereClause.periodId = activePeriod.id
    }

    const transactions = await prisma.transaction.findMany({
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
      orderBy: {
        transactionDate: 'desc',
      },
      take: 50,
    })

    return NextResponse.json(transactions)
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
  const { getActivePeriod } = await import('@/lib/auth-refactored')
  const activePeriod = await getActivePeriod(request)

  // Transaction data hazırla
  const transactionData = {
    ...validatedData,
    userId: user.id,
    periodId: activePeriod?.id,
  }

  // ✅ Service katmanı üzerinden oluştur (kategori-tip validation dahil)
  const transaction = await transactionService.create(transactionData)

  return NextResponse.json(transaction, { status: 201 })
})
