import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import type { AIReportDataForPDF } from './ai-report-pdf-utils'

const A4_WIDTH = 595
const A4_HEIGHT = 842
const MARGIN = 40
const PAGE_WIDTH = A4_WIDTH - MARGIN * 2

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

/** pdf-lib WinAnsi encoding için Türkçe karakterleri ASCII karşılıklarına çevirir */
function sanitizeForWinAnsi(text: string): string {
  const map: Record<string, string> = {
    'ğ': 'g',
    'ü': 'u',
    'ş': 's',
    'ç': 'c',
    'ö': 'o',
    'ı': 'i',
    'Ğ': 'G',
    'Ü': 'U',
    'Ş': 'S',
    'Ç': 'C',
    'Ö': 'O',
    'İ': 'I',
    '₺': 'TL ',
  }
  return text.replace(/[ğüşçöıĞÜŞÇÖİ₺]/g, (c) => map[c] ?? c)
}

function wrapText(text: string, maxWidth: number, fontSize: number): string[] {
  const words = text.split(/\s+/)
  const lines: string[] = []
  let currentLine = ''
  const approxCharWidth = fontSize * 0.5

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word
    if (testLine.length * approxCharWidth <= maxWidth) {
      currentLine = testLine
    } else {
      if (currentLine) {
        lines.push(currentLine)
      }
      currentLine = word
    }
  }
  if (currentLine) {
    lines.push(currentLine)
  }
  return lines
}

export async function generateAIReportPDF(
  reportData: AIReportDataForPDF,
  reportInfo: { reportDate: string; monthYear: string }
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold)

  const reportDateFormatted = new Date(reportInfo.reportDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Sayfa 1: Kapak
  const coverPage = doc.addPage([A4_WIDTH, A4_HEIGHT])
  coverPage.drawRectangle({
    x: 0,
    y: 0,
    width: A4_WIDTH,
    height: A4_HEIGHT,
    color: rgb(0.486, 0.227, 0.929),
  })
  coverPage.drawText(sanitizeForWinAnsi('AI Analiz Raporu'), {
    x: A4_WIDTH / 2 - 100,
    y: A4_HEIGHT / 2 + 60,
    size: 36,
    font: fontBold,
    color: rgb(1, 1, 1),
  })
  coverPage.drawText(sanitizeForWinAnsi('Yapay Zeka Destekli Finansal Analiz'), {
    x: A4_WIDTH / 2 - 120,
    y: A4_HEIGHT / 2 + 20,
    size: 18,
    font: font,
    color: rgb(0.91, 0.84, 1),
  })
  coverPage.drawText(sanitizeForWinAnsi(`Dönem: ${reportData.summary.period}`), {
    x: A4_WIDTH / 2 - 60,
    y: A4_HEIGHT / 2 - 20,
    size: 14,
    font: font,
    color: rgb(0.77, 0.71, 0.99),
  })
  coverPage.drawText(sanitizeForWinAnsi(reportDateFormatted), {
    x: A4_WIDTH / 2 - 50,
    y: A4_HEIGHT / 2 - 50,
    size: 12,
    font: font,
    color: rgb(0.65, 0.55, 0.98),
  })
  coverPage.drawText(sanitizeForWinAnsi('Bu rapor GiderSE-Gelir platformu tarafından otomatik oluşturulmuştur.'), {
    x: A4_WIDTH / 2 - 180,
    y: A4_HEIGHT / 2 - 150,
    size: 12,
    font: font,
    color: rgb(1, 1, 1),
  })

  // Sayfa 2: Finansal Özet ve Kategori Analizi
  const page2 = doc.addPage([A4_WIDTH, A4_HEIGHT])
  let y = A4_HEIGHT - MARGIN

  page2.drawText(sanitizeForWinAnsi('Finansal Özet'), {
    x: MARGIN,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.486, 0.227, 0.929),
  })
  y -= 30

  const summaryItems = [
    { label: 'Toplam Gelir', value: formatCurrency(reportData.summary.totalIncome), color: rgb(0.13, 0.77, 0.37) },
    { label: 'Toplam Gider', value: formatCurrency(reportData.summary.totalExpense), color: rgb(0.94, 0.27, 0.27) },
    {
      label: 'Net Tutar',
      value: formatCurrency(reportData.summary.netAmount),
      color: reportData.summary.netAmount >= 0 ? rgb(0.23, 0.51, 0.96) : rgb(0.73, 0.11, 0.11),
    },
    {
      label: 'Tasarruf Oranı',
      value: `%${reportData.summary.savingsRate.toFixed(1)}`,
      color: rgb(0.66, 0.33, 0.98),
    },
  ]

  for (let i = 0; i < summaryItems.length; i += 2) {
    const left = summaryItems[i]
    const right = summaryItems[i + 1]
    const boxWidth = (PAGE_WIDTH - 12) / 2
    const boxHeight = 50

    if (left) {
      page2.drawRectangle({
        x: MARGIN,
        y: y - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: rgb(0.98, 0.98, 0.98),
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1,
      })
      page2.drawText(sanitizeForWinAnsi(left.label), { x: MARGIN + 10, y: y - 25, size: 9, font: font, color: rgb(0.4, 0.4, 0.4) })
      page2.drawText(sanitizeForWinAnsi(left.value), { x: MARGIN + 10, y: y - 42, size: 14, font: fontBold, color: left.color })
    }
    if (right) {
      page2.drawRectangle({
        x: MARGIN + boxWidth + 12,
        y: y - boxHeight,
        width: boxWidth,
        height: boxHeight,
        color: rgb(0.98, 0.98, 0.98),
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 1,
      })
      page2.drawText(sanitizeForWinAnsi(right.label), {
        x: MARGIN + boxWidth + 22,
        y: y - 25,
        size: 9,
        font: font,
        color: rgb(0.4, 0.4, 0.4),
      })
      page2.drawText(sanitizeForWinAnsi(right.value), {
        x: MARGIN + boxWidth + 22,
        y: y - 42,
        size: 14,
        font: fontBold,
        color: right.color,
      })
    }
    y -= boxHeight + 12
  }

  y -= 20
  page2.drawText(sanitizeForWinAnsi('Kategori Analizi'), {
    x: MARGIN,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.486, 0.227, 0.929),
  })
  y -= 25
  page2.drawText(sanitizeForWinAnsi('En çok harcama yapılan kategoriler'), {
    x: MARGIN,
    y,
    size: 9,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })
  y -= 20

  for (const cat of reportData.topCategories.slice(0, 8)) {
    const catData = reportData.categoryAnalysis.find((c) => c.category === cat.category)
    const pct = catData ? `%${catData.percentage.toFixed(1)}` : ''
    page2.drawText(sanitizeForWinAnsi(cat.category), { x: MARGIN, y, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) })
    page2.drawText(sanitizeForWinAnsi(formatCurrency(cat.amount)), {
      x: A4_WIDTH - MARGIN - 80,
      y,
      size: 11,
      font: fontBold,
      color: rgb(0.486, 0.227, 0.929),
    })
    if (pct) {
      page2.drawText(sanitizeForWinAnsi(pct), { x: A4_WIDTH - MARGIN - 40, y, size: 9, font: font, color: rgb(0.4, 0.4, 0.4) })
    }
    y -= 22
  }

  page2.drawText(sanitizeForWinAnsi(`GiderSE-Gelir AI Rapor | ${reportDateFormatted}`), {
    x: MARGIN,
    y: 30,
    size: 8,
    font: font,
    color: rgb(0.58, 0.64, 0.72),
  })

  // Sayfa 3: AI Önerileri
  const page3 = doc.addPage([A4_WIDTH, A4_HEIGHT])
  y = A4_HEIGHT - MARGIN

  page3.drawText(sanitizeForWinAnsi('AI Önerileri'), {
    x: MARGIN,
    y,
    size: 18,
    font: fontBold,
    color: rgb(0.486, 0.227, 0.929),
  })
  y -= 25
  page3.drawText(sanitizeForWinAnsi(`Yapay zeka destekli finansal öneriler ve analizler (${reportData.insights.length} öneri)`), {
    x: MARGIN,
    y,
    size: 9,
    font: font,
    color: rgb(0.4, 0.4, 0.4),
  })
  y -= 30

  const getPriorityLabel = (p: string) => (p === 'high' ? 'Yüksek Öncelik' : p === 'medium' ? 'Orta Öncelik' : 'Düşük Öncelik')

  let insightsPage = page3
  for (const insight of reportData.insights) {
    if (y < 100) {
      insightsPage.drawText(sanitizeForWinAnsi(`GiderSE-Gelir AI Rapor | ${reportDateFormatted}`), {
        x: MARGIN,
        y: 30,
        size: 8,
        font: font,
        color: rgb(0.58, 0.64, 0.72),
      })
      insightsPage = doc.addPage([A4_WIDTH, A4_HEIGHT])
      y = A4_HEIGHT - MARGIN
    }

    insightsPage.drawText(sanitizeForWinAnsi(getPriorityLabel(insight.priority)), {
      x: MARGIN,
      y,
      size: 8,
      font: font,
      color: rgb(0.486, 0.227, 0.929),
    })
    y -= 14
    insightsPage.drawText(sanitizeForWinAnsi(insight.title), { x: MARGIN, y, size: 11, font: fontBold, color: rgb(0.35, 0.22, 0.53) })
    y -= 16

    const descLines = wrapText(sanitizeForWinAnsi(insight.description), PAGE_WIDTH, 9)
    for (const line of descLines) {
      insightsPage.drawText(line, { x: MARGIN, y, size: 9, font: font, color: rgb(0.4, 0.4, 0.4) })
      y -= 12
    }
    insightsPage.drawText(sanitizeForWinAnsi(insight.impact), { x: MARGIN, y, size: 8, font: font, color: rgb(0.66, 0.33, 0.98) })
    y -= 25
  }

  insightsPage.drawText(sanitizeForWinAnsi(`GiderSE-Gelir AI Rapor | ${reportDateFormatted}`), {
    x: MARGIN,
    y: 30,
    size: 8,
    font: font,
    color: rgb(0.58, 0.64, 0.72),
  })

  // Sayfa 4: Nakit Akış (opsiyonel)
  if (reportData.cashFlow.length > 0) {
    const page4 = doc.addPage([A4_WIDTH, A4_HEIGHT])
    y = A4_HEIGHT - MARGIN

    page4.drawText(sanitizeForWinAnsi('Nakit Akış Analizi'), {
      x: MARGIN,
      y,
      size: 18,
      font: fontBold,
      color: rgb(0.486, 0.227, 0.929),
    })
    y -= 25
    page4.drawText(sanitizeForWinAnsi('Son ayların gelir/gider trendi'), {
      x: MARGIN,
      y,
      size: 9,
      font: font,
      color: rgb(0.4, 0.4, 0.4),
    })
    y -= 25

    for (const flow of reportData.cashFlow) {
      page4.drawText(sanitizeForWinAnsi(flow.month), { x: MARGIN, y, size: 11, font: fontBold, color: rgb(0.2, 0.2, 0.2) })
      page4.drawText(sanitizeForWinAnsi(`Gelir: ${formatCurrency(flow.income)}`), {
        x: MARGIN + 150,
        y,
        size: 10,
        font: font,
        color: rgb(0.13, 0.77, 0.37),
      })
      page4.drawText(sanitizeForWinAnsi(`Gider: ${formatCurrency(flow.expense)}`), {
        x: MARGIN + 280,
        y,
        size: 10,
        font: font,
        color: rgb(0.94, 0.27, 0.27),
      })
      page4.drawText(sanitizeForWinAnsi(`Net: ${formatCurrency(flow.balance)}`), {
        x: MARGIN + 410,
        y,
        size: 10,
        font: fontBold,
        color: flow.balance >= 0 ? rgb(0.23, 0.51, 0.96) : rgb(0.73, 0.11, 0.11),
      })
      y -= 22
    }

    page4.drawText(sanitizeForWinAnsi(`GiderSE-Gelir AI Rapor | ${reportDateFormatted}`), {
      x: MARGIN,
      y: 30,
      size: 8,
      font: font,
      color: rgb(0.58, 0.64, 0.72),
    })
  }

  return doc.save()
}
