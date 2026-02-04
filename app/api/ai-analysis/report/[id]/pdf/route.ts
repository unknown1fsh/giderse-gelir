import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, NotFoundError } from '@/server/errors'
import { normalizeReportDataForPDF } from '@/lib/ai-report-pdf-utils'
import { generateAIReportPDF } from '@/lib/ai-report-pdf-generator'
import { Logger } from '@/server/utils/Logger'

export const runtime = 'nodejs'

/**
 * AI Analiz Raporu PDF indirme endpoint'i
 * GET /api/ai-analysis/report/[id]/pdf
 * pdf-lib ile sunucu tarafında PDF oluşturur
 */
export const GET = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const user = await getCurrentUser(request)
    if (!user) {
      throw new BadRequestError('Oturum bulunamadı')
    }

    const { id } = await params
    const reportId = parseInt(id)

    if (isNaN(reportId)) {
      throw new BadRequestError('Geçersiz rapor ID')
    }

    const report = await prisma.aIReportUsage.findFirst({
      where: {
        id: reportId,
        userId: user.id,
      },
    })

    if (!report) {
      throw new NotFoundError('Rapor bulunamadı')
    }

    if (report.status !== 'completed') {
      throw new BadRequestError('Bu rapor henüz PDF indirmeye hazır değil')
    }

    const reportData = normalizeReportDataForPDF(report.reportData)
    const reportInfo = {
      reportDate: report.reportDate.toISOString(),
      monthYear: report.monthYear,
    }

    let body: Uint8Array
    try {
      body = await generateAIReportPDF(reportData, reportInfo)
    } catch (pdfError) {
      Logger.error('PDF oluşturma hatası', pdfError)
      console.error('PDF generation error details:', pdfError)
      throw pdfError
    }

    const filename = `AI-Analiz-Raporu-${report.monthYear}.pdf`

    return new NextResponse(body as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': body.length.toString(),
      },
    })
  }
)
