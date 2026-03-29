import { PrismaClient } from '@prisma/client'
import { PlanId, SubscriptionStatus } from '../../enums'
import { NotFoundError, BusinessRuleError } from '../../errors'
import { PLAN_LIMITS } from '../../../lib/plan-config'

// Bu sınıf abonelik iş mantığını yönetir.
export class SubscriptionService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  // Bu metot kullanıcının aktif planını getirir.
  // Girdi: userId
  // Çıktı: Plan ID
  // Hata: NotFoundError
  async getUserPlan(userId: number): Promise<string> {
    const now = new Date()
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      return PlanId.FREE
    }

    // Süresi dolmuş mu kontrol et (Lazy Expiration)
    if (subscription.endDate < now) {
      try {
        await this.prisma.userSubscription.update({
          where: { id: subscription.id },
          data: { status: SubscriptionStatus.EXPIRED },
        })
        // eslint-disable-next-line no-console
        console.log(`[SUBSCRIPTION] User ${userId} subscription ${subscription.id} expired and downgraded to FREE.`)
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[SUBSCRIPTION] Expiration update failed:', error)
      }
      return PlanId.FREE
    }

    return subscription.planId
  }

  // Bu metot kullanıcının aboneliğini yükseltir.
  // Girdi: userId, yeni plan, amount, currency
  // Çıktı: Oluşturulan subscription
  // Hata: BusinessRuleError
  async upgradePlan(
    userId: number,
    newPlan: string,
    amount: number,
    currency: string
  ): Promise<unknown> {
    const currentSubscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (currentSubscription && currentSubscription.planId === newPlan) {
      throw new BusinessRuleError('Zaten bu plandaşınız')
    }

    if (currentSubscription) {
      await this.prisma.userSubscription.update({
        where: { id: currentSubscription.id },
        data: {
          status: SubscriptionStatus.CANCELLED,
          cancelledAt: new Date(),
        },
      })
    }

    return this.prisma.userSubscription.create({
      data: {
        userId,
        planId: newPlan,
        status: SubscriptionStatus.ACTIVE,
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        amount,
        currency,
        autoRenew: true,
      },
    })
  }

  // Bu metot aboneliği iptal eder.
  // Girdi: userId
  // Çıktı: void
  // Hata: NotFoundError
  async cancelSubscription(userId: number): Promise<void> {
    const subscription = await this.prisma.userSubscription.findFirst({
      where: {
        userId,
        status: SubscriptionStatus.ACTIVE,
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      throw new NotFoundError('Aktif abonelik bulunamadı')
    }

    await this.prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
        autoRenew: false,
      },
    })
  }

  // Bu metot kullanıcının özellik limitini kontrol eder.
  // Girdi: userId, feature adı
  // Çıktı: { allowed: boolean, current: number, limit: number }
  // Hata: -
  async checkFeatureLimit(
    userId: number,
    feature: string
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const plan = await this.getUserPlan(userId)

    // Merkezi konfigürasyondan limitleri al
    const planLimits = PLAN_LIMITS[plan as keyof typeof PLAN_LIMITS] || PLAN_LIMITS.free
    const limit = (planLimits as Record<string, number>)[feature] ?? -1

    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1 }
    }

    let current = 0

    if (feature === 'transactions') {
      const currentMonth = new Date()
      currentMonth.setDate(1)
      currentMonth.setHours(0, 0, 0, 0)

      current = await this.prisma.transaction.count({
        where: {
          userId,
          createdAt: { gte: currentMonth },
        },
      })
    }

    return {
      allowed: current < limit,
      current,
      limit,
    }
  }
}
