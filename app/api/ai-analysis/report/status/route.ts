import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'
import { getRemainingReports } from '@/lib/ai-report-limit'

/**
 * AI Analiz Raporu limit ve kullanım bilgisi endpoint'i
 * GET /api/ai-analysis/report/status
 */
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  // Kullanıcı doğrulama
  const user = await getCurrentUser(request)
  if (!user) {
    throw new BadRequestError('Oturum bulunamadı')
  }

  // Aktif subscription'ı bul
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId: user.id,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })

  const currentPlan = subscription?.planId || 'free'

  // Limit bilgisini al
  const limitInfo = await getRemainingReports(user.id, currentPlan)

  // Son raporları getir
  const recentReports = await prisma.aIReportUsage.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { reportDate: 'desc' },
    take: 10,
    select: {
      id: true,
      reportType: true,
      reportDate: true,
      status: true,
      createdAt: true,
    },
  })

  // Bu ayki raporları getir
  const now = new Date()
  const monthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const thisMonthReports = await prisma.aIReportUsage.findMany({
    where: {
      userId: user.id,
      monthYear,
      status: {
        in: ['processing', 'completed'],
      },
    },
    orderBy: { reportDate: 'desc' },
    select: {
      id: true,
      reportType: true,
      reportDate: true,
      status: true,
      createdAt: true,
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      currentPlan,
      limitInfo,
      thisMonthReports,
      recentReports,
    },
  })
})
