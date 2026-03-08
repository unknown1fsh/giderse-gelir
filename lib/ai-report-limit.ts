import { prisma } from '@/lib/prisma'
import { PLAN_IDS, isPremiumPlan } from '@/lib/plan-config'

/**
 * AI Analiz Raporu limit kontrolü
 * Tüm ücretli planlar için ayda 4 rapor limiti
 */

const AI_REPORT_MONTHLY_LIMIT = 4

/**
 * Kullanıcının aylık AI rapor kullanım sayısını getirir
 */
export async function getMonthlyAIReportUsage(userId: number, monthYear?: string): Promise<number> {
  const currentDate = new Date()
  const targetMonthYear =
    monthYear ||
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`

  const count = await prisma.aIReportUsage.count({
    where: {
      userId,
      monthYear: targetMonthYear,
      status: {
        in: ['processing', 'completed'],
      },
    },
  })

  return count
}

/**
 * Kullanıcının AI rapor oluşturup oluşturamayacağını kontrol eder
 */
export async function canGenerateAIReport(
  userId: number,
  currentPlan: string
): Promise<{ allowed: boolean; reason?: string; remaining?: number }> {
  // Sadece ücretli planlar için
  if (!isPremiumPlan(currentPlan)) {
    return {
      allowed: false,
      reason: 'AI Analiz Raporu özelliği Premium üyelik gerektirir.',
    }
  }

  // Aylık kullanım sayısını kontrol et
  const monthlyUsage = await getMonthlyAIReportUsage(userId)
  const remaining = AI_REPORT_MONTHLY_LIMIT - monthlyUsage

  if (monthlyUsage >= AI_REPORT_MONTHLY_LIMIT) {
    return {
      allowed: false,
      reason: `Bu ay için ${AI_REPORT_MONTHLY_LIMIT} rapor limitiniz dolmuş. Limit bir sonraki ayın başında sıfırlanacak.`,
      remaining: 0,
    }
  }

  return {
    allowed: true,
    remaining,
  }
}

/**
 * Kalan rapor sayısını getirir
 */
export async function getRemainingReports(
  userId: number,
  currentPlan: string
): Promise<{ remaining: number; total: number; used: number }> {
  if (!isPremiumPlan(currentPlan)) {
    return {
      remaining: 0,
      total: 0,
      used: 0,
    }
  }

  const used = await getMonthlyAIReportUsage(userId)
  const remaining = Math.max(0, AI_REPORT_MONTHLY_LIMIT - used)

  return {
    remaining,
    total: AI_REPORT_MONTHLY_LIMIT,
    used,
  }
}

/**
 * Plan türüne göre rapor seviyesini belirler
 */
export function getReportLevelForPlan(planId: string): 'premium' | 'family' {
  if (planId === PLAN_IDS.FAMILY) {
    return 'family'
  }
  return 'premium'
}
