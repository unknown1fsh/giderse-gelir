import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, NotFoundError } from '@/server/errors'
import { normalizeReportDataForPDF } from '@/lib/ai-report-pdf-utils'
import { AIReportPDFDocument } from '@/components/ai-report-pdf'
import { pdf } from '@react-pdf/renderer'
import React from 'react'

/**
 * AI Analiz Raporu PDF indirme endpoint'i
 * GET /api/ai-analysis/report/[id]/pdf
 * Sunucu tarafında PDF oluşturur (tarayıcı hasOwnProperty hatasını önler)
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
      status: report.status,
    }

    const documentElement = React.createElement(AIReportPDFDocument, {
      reportData,
      reportInfo,
    }) as React.ReactElement
    const pdfDoc = pdf(documentElement)
    // Node.js ortamında toBuffer() Buffer döndürür (tipler browser build'den gelebilir)
    const buffer = (await pdfDoc.toBuffer()) as unknown as Buffer
    const body = new Uint8Array(buffer)

    const filename = `AI-Analiz-Raporu-${report.monthYear}.pdf`
    return new NextResponse(body, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': body.length.toString(),
      },
    })
  }
)
