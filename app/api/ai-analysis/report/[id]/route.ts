import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, NotFoundError } from '@/server/errors'

/**
 * Belirli bir AI Analiz Raporunu getirir
 * GET /api/ai-analysis/report/[id]
 */
export const GET = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      throw new BadRequestError('Oturum bulunamadı')
    }

    const { id } = await params
    const reportId = parseInt(id)

    if (isNaN(reportId)) {
      throw new BadRequestError('Geçersiz rapor ID')
    }

    // Raporu getir (sadece kullanıcının kendi raporu)
    const report = await prisma.aIReportUsage.findFirst({
      where: {
        id: reportId,
        userId: user.id,
      },
    })

    if (!report) {
      throw new NotFoundError('Rapor bulunamadı')
    }

    return NextResponse.json({
      success: true,
      data: {
        id: report.id,
        reportType: report.reportType,
        reportDate: report.reportDate,
        monthYear: report.monthYear,
        reportData: report.reportData,
        status: report.status,
        errorMessage: report.errorMessage,
        createdAt: report.createdAt,
        updatedAt: report.updatedAt,
      },
    })
  }
)
