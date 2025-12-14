import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from './auth-refactored'
import { PrismaClient } from '@prisma/client'
import { isPremiumPlan, isEnterprisePlan, PLAN_IDS, getPlanLimits } from './plan-config'

const prisma = new PrismaClient()

// Premium özellik gereksinimleri
export type PremiumRequirement = 'premium' | 'enterprise' | 'enterprise_premium'

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
  // Kullanıcı authentication kontrolü
  const user = await getCurrentUser(request)

  if (!user) {
    return {
      allowed: false,
      currentPlan: PLAN_IDS.FREE,
      requiredPlan: requirement,
      message: 'Oturum bulunamadı. Lütfen giriş yapın.',
    }
  }

  // Aktif subscription kontrolü
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })

  const currentPlan = subscription?.planId || PLAN_IDS.FREE

  // Plan gereksinimi kontrolü
  let allowed = false
  let message = ''

  switch (requirement) {
    case 'premium':
      // Premium, Enterprise veya Enterprise Premium planı gerekiyor
      allowed = isPremiumPlan(currentPlan)
      message = allowed
        ? ''
        : 'Bu özellik Premium üyelik gerektirir. Premium plana geçerek bu özelliği kullanabilirsiniz.'
      break

    case 'enterprise':
      // Enterprise veya Enterprise Premium planı gerekiyor
      allowed = isEnterprisePlan(currentPlan)
      message = allowed
        ? ''
        : 'Bu özellik Enterprise üyelik gerektirir. Enterprise plana geçerek bu özelliği kullanabilirsiniz.'
      break

    case 'enterprise_premium':
      // Sadece Enterprise Premium planı gerekiyor
      allowed = currentPlan === PLAN_IDS.ENTERPRISE_PREMIUM
      message = allowed
        ? ''
        : 'Bu özellik Enterprise Premium üyelik gerektirir. Ekibimizle iletişime geçerek Enterprise Premium plana geçebilirsiniz.'
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
 *
 * Kullanım:
 * ```typescript
 * export const GET = withPremium(async (request: NextRequest) => {
 *   // Premium kullanıcılar için kod
 * })
 * ```
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
 * Frontend'de kullanılabilir şekilde plan bilgisini döner
 */
export function getPremiumFeatureAccess(currentPlan: string) {
  const isPremium = isPremiumPlan(currentPlan)
  const isEnterprise = isEnterprisePlan(currentPlan)
  const isEnterprisePremium = currentPlan === PLAN_IDS.ENTERPRISE_PREMIUM

  return {
    // Özellik erişimleri
    hasAIAssistant: isPremium,
    hasAdvancedReports: isPremium,
    hasExportFeature: isPremium,
    hasPredictiveAnalytics: isPremium,
    hasAutoCategorization: isPremium,
    hasInvestmentTracking: isPremium,
    hasGoalTracking: isPremium,

    // Enterprise özellikleri
    hasMultiUser: isEnterprise,
    hasAPIAccess: isEnterprise,
    hasDepartmentManagement: isEnterprise,
    hasCustomIntegrations: isEnterprise,
    hasDedicatedSupport: isEnterprise,

    // Enterprise Premium özellikleri
    hasConsolidation: isEnterprisePremium,
    hasGlobalNetwork: isEnterprisePremium,
    hasQuantumSecurity: isEnterprisePremium,
    hasWhiteLabel: isEnterprisePremium,
    hasVIPSupport: isEnterprisePremium,

    // Plan bilgileri
    currentPlan,
    isPremium,
    isEnterprise,
    isEnterprisePremium,
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

  // Premium planlar için limit yok
  if (isPremiumPlan(currentPlan)) {
    return {
      allowed: true,
      limit: -1, // Sınırsız
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
