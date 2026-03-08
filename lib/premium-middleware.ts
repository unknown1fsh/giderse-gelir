import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import { isPremiumPlan, isFamilyPlan, PLAN_IDS, getPlanLimits } from './plan-config'

const prisma = new PrismaClient()

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
