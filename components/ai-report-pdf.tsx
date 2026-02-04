import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from '@react-pdf/renderer'

export interface AIReportDataForPDF {
  summary: {
    totalIncome: number
    totalExpense: number
    netAmount: number
    savingsRate: number
    period: string
  }
  categoryAnalysis: Array<{
    category: string
    amount: number
    percentage: number
    count: number
  }>
  topCategories: Array<{
    category: string
    amount: number
    trend: string
  }>
  cashFlow: Array<{
    month: string
    income: number
    expense: number
    balance: number
  }>
  insights: Array<{
    type: string
    title: string
    description: string
    priority: string
    impact: string
  }>
  predictions?: {
    next3Months: Array<{
      month: string
      predictedIncome: number
      predictedExpense: number
      confidence: number
    }>
    recommendations: string[]
  }
  riskAnalysis?: {
    overallRisk: string
    riskFactors: Array<{
      factor: string
      level: string
      description: string
    }>
    mitigation: string[]
  }
}

interface ReportInfoForPDF {
  reportDate: string
  monthYear: string
  status: string
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
  },
  coverPage: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#7c3aed',
    padding: 60,
  },
  coverTitle: {
    fontSize: 36,
    fontWeight: 700,
    color: '#ffffff',
    marginBottom: 16,
    textAlign: 'center',
  },
  coverSubtitle: {
    fontSize: 18,
    color: '#e9d5ff',
    marginBottom: 40,
  },
  coverPeriod: {
    fontSize: 14,
    color: '#c4b5fd',
    marginBottom: 8,
  },
  coverDate: {
    fontSize: 12,
    color: '#a78bfa',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: '#7c3aed',
    marginBottom: 16,
    borderBottomWidth: 2,
    borderBottomColor: '#7c3aed',
    paddingBottom: 8,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  summaryCard: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  summaryCardGreen: {
    backgroundColor: '#dcfce7',
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  summaryCardRed: {
    backgroundColor: '#fee2e2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  summaryCardBlue: {
    backgroundColor: '#dbeafe',
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6',
  },
  summaryCardPurple: {
    backgroundColor: '#f3e8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#a855f7',
  },
  summaryLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: 700,
    color: '#1e293b',
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    backgroundColor: '#f8fafc',
    marginBottom: 6,
    borderRadius: 4,
  },
  categoryName: {
    fontSize: 11,
    fontWeight: 600,
    color: '#334155',
    flex: 1,
  },
  categoryAmount: {
    fontSize: 11,
    fontWeight: 600,
    color: '#7c3aed',
  },
  categoryPct: {
    fontSize: 9,
    color: '#64748b',
    marginLeft: 8,
  },
  insightCard: {
    padding: 12,
    backgroundColor: '#faf5ff',
    borderLeftWidth: 4,
    borderLeftColor: '#a855f7',
    marginBottom: 10,
    borderRadius: 4,
  },
  insightTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#581c87',
    marginBottom: 4,
  },
  insightDesc: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  insightImpact: {
    fontSize: 8,
    color: '#a855f7',
    fontWeight: 600,
  },
  priorityBadge: {
    fontSize: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  priorityHigh: {
    backgroundColor: '#fecaca',
    color: '#b91c1c',
  },
  priorityMedium: {
    backgroundColor: '#bfdbfe',
    color: '#1d4ed8',
  },
  priorityLow: {
    backgroundColor: '#d1fae5',
    color: '#047857',
  },
  cashFlowRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
    backgroundColor: '#f1f5f9',
    marginBottom: 6,
    borderRadius: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 8,
    color: '#94a3b8',
  },
})

interface AIReportPDFProps {
  reportData: AIReportDataForPDF
  reportInfo: ReportInfoForPDF
}

export function AIReportPDFDocument({ reportData, reportInfo }: AIReportPDFProps) {
  const reportDateFormatted = new Date(reportInfo.reportDate).toLocaleDateString('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return styles.priorityHigh
      case 'medium':
        return styles.priorityMedium
      default:
        return styles.priorityLow
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'Yüksek Öncelik'
      case 'medium':
        return 'Orta Öncelik'
      default:
        return 'Düşük Öncelik'
    }
  }

  return (
    <Document
      title={`AI Analiz Raporu - ${reportInfo.monthYear}`}
      author="GiderSE-Gelir"
      subject="Finansal Analiz Raporu"
    >
      {/* Kapak Sayfası */}
      <Page size="A4" style={styles.coverPage}>
        <View style={{ alignItems: 'center' }}>
          <Text style={styles.coverTitle}>AI Analiz Raporu</Text>
          <Text style={styles.coverSubtitle}>Yapay Zeka Destekli Finansal Analiz</Text>
          <Text style={styles.coverPeriod}>Dönem: {reportData.summary.period}</Text>
          <Text style={styles.coverDate}>{reportDateFormatted}</Text>
          <View style={{ marginTop: 60, padding: 20, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 12 }}>
            <Text style={{ color: '#fff', fontSize: 12, textAlign: 'center' }}>
              Bu rapor GiderSE-Gelir platformu tarafından otomatik oluşturulmuştur.
            </Text>
          </View>
        </View>
      </Page>

      {/* Finansal Özet */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Finansal Özet</Text>
        <View style={styles.summaryGrid}>
          <View style={[styles.summaryCard, styles.summaryCardGreen]}>
            <Text style={styles.summaryLabel}>Toplam Gelir</Text>
            <Text style={styles.summaryValue}>{formatCurrency(reportData.summary.totalIncome)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardRed]}>
            <Text style={styles.summaryLabel}>Toplam Gider</Text>
            <Text style={styles.summaryValue}>{formatCurrency(reportData.summary.totalExpense)}</Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardBlue]}>
            <Text style={styles.summaryLabel}>Net Tutar</Text>
            <Text
              style={[
                styles.summaryValue,
                { color: reportData.summary.netAmount >= 0 ? '#1d4ed8' : '#b91c1c' },
              ]}
            >
              {formatCurrency(reportData.summary.netAmount)}
            </Text>
          </View>
          <View style={[styles.summaryCard, styles.summaryCardPurple]}>
            <Text style={styles.summaryLabel}>Tasarruf Oranı</Text>
            <Text style={styles.summaryValue}>%{reportData.summary.savingsRate.toFixed(1)}</Text>
          </View>
        </View>

        {/* Kategori Analizi */}
        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Kategori Analizi</Text>
        <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 12 }}>
          En çok harcama yapılan kategoriler
        </Text>
        {reportData.topCategories.slice(0, 8).map((cat, i) => {
          const catData = reportData.categoryAnalysis.find(c => c.category === cat.category)
          return (
            <View key={i} style={styles.categoryRow}>
              <Text style={styles.categoryName}>{cat.category}</Text>
              <Text style={styles.categoryAmount}>{formatCurrency(cat.amount)}</Text>
              {catData && (
                <Text style={styles.categoryPct}>%{catData.percentage.toFixed(1)}</Text>
              )}
            </View>
          )
        })}
        <View style={styles.footer} fixed>
          <Text>GiderSE-Gelir AI Rapor | {reportDateFormatted}</Text>
        </View>
      </Page>

      {/* AI Önerileri */}
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>AI Önerileri</Text>
        <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 16 }}>
          Yapay zeka destekli finansal öneriler ve analizler ({reportData.insights.length} öneri)
        </Text>
        {reportData.insights.map((insight, i) => (
          <View key={i} style={styles.insightCard} wrap={false}>
            <Text style={[styles.priorityBadge, getPriorityStyle(insight.priority)]}>
              {getPriorityLabel(insight.priority)}
            </Text>
            <Text style={styles.insightTitle}>{insight.title}</Text>
            <Text style={styles.insightDesc}>{insight.description}</Text>
            <Text style={styles.insightImpact}>{insight.impact}</Text>
          </View>
        ))}
        <View style={styles.footer} fixed>
          <Text>GiderSE-Gelir AI Rapor | {reportDateFormatted}</Text>
        </View>
      </Page>

      {/* Nakit Akış */}
      {reportData.cashFlow.length > 0 && (
        <Page size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>Nakit Akış Analizi</Text>
          <Text style={{ fontSize: 9, color: '#64748b', marginBottom: 16 }}>
            Son ayların gelir/gider trendi
          </Text>
          {reportData.cashFlow.map((flow, i) => (
            <View key={i} style={styles.cashFlowRow}>
              <Text style={{ fontSize: 11, fontWeight: 600, color: '#334155' }}>{flow.month}</Text>
              <View style={{ flexDirection: 'row', gap: 24 }}>
                <Text style={{ fontSize: 10, color: '#22c55e' }}>
                  Gelir: {formatCurrency(flow.income)}
                </Text>
                <Text style={{ fontSize: 10, color: '#ef4444' }}>
                  Gider: {formatCurrency(flow.expense)}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    color: flow.balance >= 0 ? '#3b82f6' : '#b91c1c',
                  }}
                >
                  Net: {formatCurrency(flow.balance)}
                </Text>
              </View>
            </View>
          ))}
          <View style={styles.footer} fixed>
            <Text>GiderSE-Gelir AI Rapor | {reportDateFormatted}</Text>
          </View>
        </Page>
      )}
    </Document>
  )
}
