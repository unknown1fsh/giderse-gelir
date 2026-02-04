import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, getActivePeriod } from '@/lib/auth'
import { ExceptionMapper, BadRequestError, AIReportCapacityError } from '@/server/errors'
import { checkPremiumAccess } from '@/lib/premium-middleware'
import { canGenerateAIReport, getReportLevelForPlan } from '@/lib/ai-report-limit'
import { AIAnalysisService } from '@/server/services/impl/AIAnalysisService'

export const maxDuration = 120 // saniye - OpenAI API yanıt süresi için

/**
 * AI Analiz Raporu oluşturma endpoint'i
 * POST /api/ai-analysis/report/generate
 */
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  // Kullanıcı doğrulama
  const user = await getCurrentUser(request)
  if (!user) {
    throw new BadRequestError('Oturum bulunamadı')
  }

  // Premium kontrolü
  const premiumCheck = await checkPremiumAccess(request, 'premium')
  if (!premiumCheck.allowed) {
    return NextResponse.json(
      {
        error: premiumCheck.message || 'AI Analiz Raporu özelliği Premium üyelik gerektirir.',
        requiresPremium: true,
        requiredPlan: premiumCheck.requiredPlan,
        currentPlan: premiumCheck.currentPlan,
        feature: 'AI Analiz Raporu',
        upgradeUrl: '/premium',
      },
      { status: 403 }
    )
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

  // Limit kontrolü
  const limitCheck = await canGenerateAIReport(user.id, currentPlan)
  if (!limitCheck.allowed) {
    return NextResponse.json(
      {
        error: limitCheck.reason || 'Aylık rapor limitiniz dolmuş.',
        limitExceeded: true,
        remaining: limitCheck.remaining || 0,
      },
      { status: 429 }
    )
  }

  // Rapor seviyesini belirle
  const reportLevel = getReportLevelForPlan(currentPlan)

  // Aktif dönemi al (özet tarih aralığı için)
  const activePeriod = await getActivePeriod(request)

  // Ay-Yıl bilgisi (aktif dönem varsa ondan, yoksa şu anki ay)
  const now = new Date()
  const monthYear = activePeriod
    ? `${new Date(activePeriod.startDate).getFullYear()}-${String(new Date(activePeriod.startDate).getMonth() + 1).padStart(2, '0')}`
    : `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  // Kullanım kaydı oluştur (processing durumunda)
  const usageRecord = await prisma.aIReportUsage.create({
    data: {
      userId: user.id,
      reportType: reportLevel,
      reportDate: now,
      monthYear,
      reportData: {},
      status: 'processing',
    },
  })

  try {
    // AI Analiz Servisini kullanarak rapor oluştur
    const aiAnalysisService = new AIAnalysisService(prisma)
    const reportData = await aiAnalysisService.generateReport(user.id, currentPlan, activePeriod)

    // Kullanım kaydını güncelle (completed)
    await prisma.aIReportUsage.update({
      where: { id: usageRecord.id },
      data: {
        reportData: JSON.parse(JSON.stringify(reportData)) as Prisma.InputJsonValue,
        status: 'completed',
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'AI Analiz Raporu başarıyla oluşturuldu',
        data: {
          reportId: usageRecord.id,
          reportData,
          reportLevel,
          generatedAt: now.toISOString(),
        },
      },
      { status: 201 }
    )
  } catch (error) {
    // Yoğunluk/timeout hatası: rapor hakkı korunmalı - kullanım kaydını sil
    if (error instanceof AIReportCapacityError) {
      await prisma.aIReportUsage.delete({
        where: { id: usageRecord.id },
      })
      return NextResponse.json(
        {
          error: error.message,
          capacityError: true,
          retryLater: true,
        },
        { status: 503 }
      )
    }

    // Diğer hatalar: kullanım kaydını failed olarak güncelle
    await prisma.aIReportUsage.update({
      where: { id: usageRecord.id },
      data: {
        status: 'failed',
        errorMessage: error instanceof Error ? error.message : 'Bilinmeyen hata',
      },
    })

    console.error('AI Report generation error:', error)
    throw new BadRequestError('Rapor oluşturulurken hata oluştu')
  }
})
