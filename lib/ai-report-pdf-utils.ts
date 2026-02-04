import type { AIReportDataForPDF } from '@/components/ai-report-pdf'

/**
 * API/DB'den gelen ham reportData'yı PDF bileşenine uygun formata normalize eder.
 * undefined, null veya eksik alanlar için varsayılan değerler sağlar.
 */
export function normalizeReportDataForPDF(raw: unknown): AIReportDataForPDF {
  const data = raw && typeof raw === 'object' ? (raw as Record<string, unknown>) : {}

  const summaryRaw = data.summary && typeof data.summary === 'object' ? (data.summary as Record<string, unknown>) : {}
  const summary = {
    totalIncome: Number(summaryRaw.totalIncome) || 0,
    totalExpense: Number(summaryRaw.totalExpense) || 0,
    netAmount: Number(summaryRaw.netAmount) || 0,
    savingsRate: Number(summaryRaw.savingsRate) || 0,
    period: String(summaryRaw.period ?? ''),
  }

  const categoryAnalysis = Array.isArray(data.categoryAnalysis)
    ? (data.categoryAnalysis as AIReportDataForPDF['categoryAnalysis'])
    : []

  const topCategories = Array.isArray(data.topCategories)
    ? (data.topCategories as AIReportDataForPDF['topCategories'])
    : []

  const cashFlow = Array.isArray(data.cashFlow)
    ? (data.cashFlow as AIReportDataForPDF['cashFlow'])
    : []

  const insights = Array.isArray(data.insights)
    ? (data.insights as AIReportDataForPDF['insights'])
    : []

  return {
    summary,
    categoryAnalysis,
    topCategories,
    cashFlow,
    insights,
  }
}
