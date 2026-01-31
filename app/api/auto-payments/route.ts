import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const autoPayments = await prisma.autoPayment.findMany({
      include: {
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
        category: true,
      },
      where: {
        userId: user.id,
        active: true,
      },
      orderBy: {
        nextPaymentDate: 'asc',
      },
    })

    return NextResponse.json(autoPayments)
  } catch (error) {
    console.error('Auto payments API error:', error)
    return NextResponse.json({ error: 'Otomatik ödemeler alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Premium kontrolü
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    const currentPlan = subscription?.planId || 'free'

    if (currentPlan === 'free') {
      return NextResponse.json(
        {
          error: 'Otomatik Ödemeler/Düzenli Gelir özelliği Premium üyelik gerektirir.',
          requiresPremium: true,
          feature: 'Otomatik Ödemeler',
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    // Frequency'den cron schedule oluştur
    const getCronSchedule = (frequency: string) => {
      switch (frequency.toLowerCase()) {
        case 'daily':
          return '0 0 * * *' // Her gün
        case 'weekly':
          return '0 0 * * 0' // Her pazar
        case 'monthly':
          return '0 0 1 * *' // Her ayın 1'i
        case 'yearly':
          return '0 0 1 1 *' // Her yılın 1 Ocak'ı
        default:
          return '0 0 1 * *' // Varsayılan aylık
      }
    }

    const autoPayment = await prisma.autoPayment.create({
      data: {
        userId: user.id,
        name: body.name,
        description: body.description || null,
        amount: body.amount || 0,
        currencyId: body.currencyId || 1,
        paymentMethodId: body.paymentMethodId || 1,
        cronSchedule: getCronSchedule(body.frequency || 'monthly'),
        nextPaymentDate: body.nextPaymentDate ? new Date(body.nextPaymentDate) : null,
        categoryId: body.categoryId,
        accountId: body.accountId || null,
        creditCardId: body.creditCardId || null,
        eWalletId: body.eWalletId || null,
        beneficiaryId: body.beneficiaryId || null,
        active: true,
      },
      include: {
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
        category: true,
      },
    })

    return NextResponse.json(autoPayment, { status: 201 })
  } catch (error) {
    console.error('Auto payment creation error:', error)
    return NextResponse.json({ error: 'Otomatik ödeme oluşturulamadı' }, { status: 500 })
  }
}
