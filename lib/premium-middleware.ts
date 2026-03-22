import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { isPremiumPlan, isFamilyPlan, PLAN_IDS, getPlanLimits } from './plan-config'

// Premium özellik gereksinimleri
export type PremiumRequirement = 'premium' | 'family'

export interface PremiumCheckResult {
  allowed: boolean
  currentPlan: string
  requiredPlan: PremiumRequirement
  message?: string
}

/**
 * Kullanıcının premium plan kontrolü
 */
export async function checkPremiumAccess(
  request: NextRequest,
  requirement: PremiumRequirement = 'premium'
): Promise<PremiumCheckResult> {
  const user = await getCurrentUser(request)

  if (!user) {
    return {
      allowed: false,
      currentPlan: PLAN_IDS.FREE,
      requiredPlan: requirement,
      message: 'Oturum bulunamadı. Lütfen giriş yapın.',
    }
  }

  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })

  const currentPlan = subscription?.planId || PLAN_IDS.FREE

  let allowed = false
  let message = ''

  switch (requirement) {
    case 'premium':
      // Premium veya Aile planı gerekiyor
      allowed = isPremiumPlan(currentPlan)
      message = allowed
        ? ''
        : 'Bu özellik Premium üyelik gerektirir. Premium plana geçerek bu özelliği kullanabilirsiniz.'
      break

    case 'family':
      // Sadece Aile planı gerekiyor
      allowed = isFamilyPlan(currentPlan)
      message = allowed
        ? ''
        : 'Bu özellik Aile paketi gerektirir. Aile paketine geçerek bu özelliği kullanabilirsiniz.'
      break

    default:
      allowed = false
      message = 'Geçersiz plan gereksinimi.'
  }

  return {
    allowed,
    currentPlan,
    requiredPlan: requirement,
    message,
  }
}

/**
 * Premium API route'ları için middleware wrapper
 */
export function withPremium(
  handler: (request: NextRequest) => Promise<NextResponse>,
  requirement: PremiumRequirement = 'premium'
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const checkResult = await checkPremiumAccess(request, requirement)

    if (!checkResult.allowed) {
      return NextResponse.json(
        {
          error: checkResult.message,
          requiresPremium: true,
          requiredPlan: checkResult.requiredPlan,
          currentPlan: checkResult.currentPlan,
          upgradeUrl: '/premium',
        },
        { status: 403 }
      )
    }

    return handler(request)
  }
}

/**
 * POST request'ler için premium middleware
 */
export function withPremiumPost(
  handler: (request: NextRequest) => Promise<NextResponse>,
  requirement: PremiumRequirement = 'premium'
) {
  return withPremium(handler, requirement)
}

/**
 * Özellik bazlı premium kontrol helper'ı
 */
export function getPremiumFeatureAccess(currentPlan: string) {
  const isPremium = isPremiumPlan(currentPlan)
  const isFamily = isFamilyPlan(currentPlan)

  return {
    hasAIAssistant: isPremium,
    hasAdvancedReports: isPremium,
    hasExportFeature: isPremium,
    hasPredictiveAnalytics: isPremium,
    hasAutoCategorization: isPremium,
    hasInvestmentTracking: isPremium,
    hasGoalTracking: isPremium,

    // Aile paketi özellikleri
    hasMultiUser: isFamily,
    hasFamilyBudget: isFamily,
    hasFamilyGoals: isFamily,
    hasPhoneSupport: isFamily,

    currentPlan,
    isPremium,
    isFamily,
  }
}

/**
 * Özellik limiti kontrolü
 */
export async function checkFeatureLimit(
  userId: number,
  feature: string,
  currentCount: number
): Promise<{ allowed: boolean; limit: number; current: number }> {
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })

  const currentPlan = subscription?.planId || PLAN_IDS.FREE

  if (isPremiumPlan(currentPlan)) {
    return {
      allowed: true,
      limit: -1,
      current: currentCount,
    }
  }

  const limits = getPlanLimits(currentPlan) as Record<string, number>
  const limit = limits[feature] ?? -1

  return {
    allowed: limit === -1 || currentCount < limit,
    limit,
    current: currentCount,
  }
}

/**
 * Entity oluşturma limit kontrolü
 */
export async function checkCreationLimit(
  userId: number,
  entityType: 'accounts' | 'creditCards' | 'ewallets' | 'goals' | 'budgets'
): Promise<{ allowed: boolean; limit: number; currentCount: number; message?: string }> {
  // 1. Kullanıcının mevcut planını bul
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })
  
  const currentPlan = subscription?.planId || PLAN_IDS.FREE
  const planLimits = getPlanLimits(currentPlan)
  const limit = planLimits[entityType]

  // Sınırsız ise baştan izin ver
  if (limit === -1) {
    return { allowed: true, limit, currentCount: 0 }
  }

  // 2. Mevcut entity sayısını bul
  let currentCount = 0
  switch (entityType) {
    case 'accounts':
      // Altın hesapları 'account' sayısına dahil mi? Projede ayrı tablo.
      // Şimdilik sadece banka hesaplarını sayalım.
      currentCount = await prisma.account.count({ where: { userId, active: true } })
      break
    case 'creditCards':
      currentCount = await prisma.creditCard.count({ where: { userId, active: true } })
      break
    case 'ewallets':
      currentCount = await prisma.eWallet.count({ where: { userId, active: true } })
      break
    case 'goals':
      currentCount = await prisma.goal.count({ where: { userId, status: 'active' } })
      break
    case 'budgets':
      currentCount = await prisma.budgetPlan.count({ where: { userId, active: true } })
      break
  }

  // 3. Karşılaştır
  const allowed = currentCount < limit
  let message = ''
  
  if (!allowed) {
    const entityNames = {
      accounts: 'banka hesabı',
      creditCards: 'kredi kartı',
      ewallets: 'e-cüzdan',
      goals: 'hedef',
      budgets: 'bütçe'
    }
    message = `Ücretsiz (Başlangıç) plan limitinize (${limit} ${entityNames[entityType]}) ulaştınız. Daha fazla oluşturmak için Premium'a geçmelisiniz.`
  }

  return {
    allowed,
    limit,
    currentCount,
    message
  }
}

/**
 * Kullanıcı planına göre işlem geçmişi için izin verilen en eski tarihi döndürür
 * Sınırsız geçmiş erişimi varsa `null` döner.
 */
export async function getHistoryLimitDate(userId: number): Promise<Date | null> {
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })
  
  const currentPlan = subscription?.planId || PLAN_IDS.FREE
  const planLimits = getPlanLimits(currentPlan)
  
  if (planLimits.transactionHistoryMonths === -1) {
    return null
  }
  
  const limitDate = new Date()
  limitDate.setMonth(limitDate.getMonth() - planLimits.transactionHistoryMonths)
  return limitDate
}
