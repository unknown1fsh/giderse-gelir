import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'

const prisma = new PrismaClient()

// Bu metot subscription upgrade işlemini başlatır.
// Free plan için direkt aktif eder
// Premium/Enterprise planlar için banka havalesi sistemi kullanılır (frontend'de modal açılır)
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new BadRequestError('Oturum bulunamadı')
  }

  const body = (await request.json()) as { planId: string }
  const { planId } = body

  // Validation
  if (!planId || typeof planId !== 'string') {
    throw new BadRequestError('Plan ID gerekli')
  }

  // Plan kontrolü
  const { isValidPlanId, getPlanPrice } = await import('@/lib/plan-config')

  if (!isValidPlanId(planId)) {
    throw new BadRequestError('Geçersiz plan')
  }

  // Merkezi konfigürasyondan plan fiyatını al
  const amount = getPlanPrice(planId)

  // Free plan için direkt aktif et
  if (planId === 'free') {
    // Mevcut aktif aboneliği kontrol et
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    // Yeni abonelik oluştur
    const startDate = new Date()
    const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 yıl

    const subscription = await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId,
        status: 'active',
        startDate,
        endDate,
        amount,
        currency: 'TRY',
        paymentMethod: 'free',
        transactionId: `txn_${Date.now()}_${user.id}`,
        autoRenew: false,
      },
    })

    // Eski aboneliği iptal et (eğer varsa)
    if (existingSubscription && existingSubscription.planId !== planId) {
      await prisma.userSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Free plan aktif edildi',
      subscription: {
        id: subscription.id,
        planId: subscription.planId,
        status: subscription.status,
        startDate: subscription.startDate,
        endDate: subscription.endDate,
        amount: subscription.amount,
        currency: subscription.currency,
      },
    })
  }

  // Premium/Enterprise planlar için banka havalesi sistemi kullanılır
  // Frontend'de modal açılacak ve kullanıcı ödeme talebi oluşturacak
  // Bu endpoint sadece free plan için kullanılır, diğer planlar için frontend modal açılır
  throw new BadRequestError(
    'Premium ve Enterprise planlar için banka havalesi ile ödeme yapmanız gerekmektedir. Lütfen premium sayfasından devam edin.'
  )
})
