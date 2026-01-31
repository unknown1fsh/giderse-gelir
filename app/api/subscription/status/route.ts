import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { getPlanById, getPlanLimits, PLAN_IDS } from '@/lib/plan-config'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ success: false, message: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Mevcut abonelik bilgilerini al
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    // Abonelik geçmişi
    const subscriptionHistory = await prisma.userSubscription.findMany({
      where: {
        userId: user.id,
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // Kullanım istatistikleri
    const usageStats = await prisma.transaction.count({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1), // Bu ay
        },
      },
    })

    // Merkezi konfigürasyondan plan bilgilerini al
    const currentPlan = subscription?.planId || PLAN_IDS.FREE
    const planConfig = getPlanById(currentPlan)

    // Plan özelliklerini düzleştir
    const features = planConfig?.categories.flatMap(cat => cat.features) || []

    // Transaction limitini merkezi konfigürasyondan al
    const transactionLimit = getPlanLimits(currentPlan).transactions

    return NextResponse.json({
      success: true,
      subscription: subscription
        ? {
            id: subscription.id,
            planId: subscription.planId,
            status: subscription.status,
            startDate: subscription.startDate,
            endDate: subscription.endDate,
            amount: subscription.amount,
            currency: subscription.currency,
            autoRenew: subscription.autoRenew,
          }
        : null,
      usage: {
        currentPlan,
        transactionsThisMonth: usageStats,
        transactionLimit: transactionLimit,
        isUnlimited: transactionLimit === -1,
        remainingTransactions:
          transactionLimit === -1 ? -1 : Math.max(0, transactionLimit - usageStats),
      },
      features,
      history: subscriptionHistory.map(sub => ({
        id: sub.id,
        planId: sub.planId,
        status: sub.status,
        startDate: sub.startDate,
        endDate: sub.endDate,
        amount: sub.amount,
        currency: sub.currency,
        createdAt: sub.createdAt,
      })),
    })
  } catch (error) {
    console.error('Get subscription status error:', error)
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 })
  }
}
