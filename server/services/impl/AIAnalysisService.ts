import {
  PrismaClient,
  Transaction,
  Account,
  CreditCard,
  Investment,
  GoldItem,
  AutoPayment,
} from '@prisma/client'
import { getReportLevelForPlan } from '@/lib/ai-report-limit'
import { OpenAIService } from '@/server/services/OpenAIService'

export interface AIReportData {
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
    trend: 'up' | 'down' | 'stable'
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
    type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
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
    overallRisk: 'low' | 'medium' | 'high'
    riskFactors: Array<{
      factor: string
      level: 'low' | 'medium' | 'high'
      description: string
    }>
    mitigation: string[]
  }
  benchmarks?: {
    category: string
    yourAverage: number
    industryAverage: number
    percentile: number
  }[]
  enterpriseData?: {
    departmentAnalysis?: Array<{
      department: string
      budget: number
      actual: number
      variance: number
    }>
    multiCompanyConsolidation?: Record<string, unknown>
  }
}

export class AIAnalysisService {
  private prisma: PrismaClient
  private openAIService: OpenAIService | null

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    // OpenAI servisini başlat (API key yoksa null olur, hata durumunda exception fırlatılır)
    try {
      this.openAIService = new OpenAIService()
    } catch (error) {
      console.error('OpenAI servisi başlatılamadı:', error)
      this.openAIService = null
      // Plan'a göre fallback olmayacak, exception fırlatılacak
      if (error instanceof Error && error.message.includes('OPENAI_API_KEY')) {
        throw new Error(
          "OpenAI API anahtarı yapılandırılmamış. Lütfen OPENAI_API_KEY environment variable'ını ayarlayın."
        )
      }
      throw error
    }
  }

  /**
   * AI analiz raporu oluşturur
   */
  async generateReport(userId: number, planId: string): Promise<AIReportData> {
    const reportLevel = getReportLevelForPlan(planId)

    // Kullanıcının tüm finansal verilerini topla
    const financialData = await this.collectFinancialData(userId)

    // Plan türüne göre analiz yap
    let reportData: AIReportData

    switch (reportLevel) {
      case 'enterprise_premium':
        reportData = await this.generateEnterprisePremiumReport(financialData, userId)
        break
      case 'enterprise':
        reportData = await this.generateEnterpriseReport(financialData, userId)
        break
      default:
        reportData = await this.generatePremiumReport(financialData, userId)
    }

    return reportData
  }

  /**
   * Kullanıcının finansal verilerini toplar
   */
  private async collectFinancialData(userId: number): Promise<{
    transactions: Array<
      Transaction & {
        txType: {
          code: string
          id: number
          name: string
          createdAt: Date
          updatedAt: Date
          active: boolean
          icon: string | null
          color: string | null
        }
        category: {
          name: string
          id: number
          txTypeId: number
          code: string
          description: string | null
          icon: string | null
          color: string | null
          isDefault: boolean
          active: boolean
          createdAt: Date
          updatedAt: Date
        }
        currency: {
          symbol: string
          id: number
          name: string
          createdAt: Date
          updatedAt: Date
          active: boolean
          code: string
        }
        amount: number | string | bigint
        transactionDate: Date | string
      }
    >
    accounts: Account[]
    creditCards: CreditCard[]
    investments: Investment[]
    goldItems: GoldItem[]
    autoPayments: AutoPayment[]
  }> {
    const now = new Date()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(now.getMonth() - 6)

    // Son 6 ayın transactions
    const transactions = await this.prisma.transaction.findMany({
      where: {
        userId,
        transactionDate: {
          gte: sixMonthsAgo,
        },
      },
      include: {
        txType: true,
        category: true,
        currency: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    })

    // Accounts
    const accounts = await this.prisma.account.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        currency: true,
        bank: true,
      },
    })

    // Credit Cards
    const creditCards = await this.prisma.creditCard.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        currency: true,
        bank: true,
      },
    })

    // Investments
    const investments = await this.prisma.investment.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        currency: true,
      },
    })

    // Gold Items
    const goldItems = await this.prisma.goldItem.findMany({
      where: {
        userId,
      },
      include: {
        goldType: true,
        goldPurity: true,
      },
    })

    // Auto Payments
    const autoPayments = await this.prisma.autoPayment.findMany({
      where: {
        userId,
        active: true,
      },
      include: {
        category: true,
      },
    })

    return {
      transactions: transactions.map(tx => ({
        ...tx,
        amount:
          typeof tx.amount === 'object' && 'toNumber' in tx.amount
            ? tx.amount.toNumber()
            : tx.amount,
      })) as any,
      accounts,
      creditCards,
      investments,
      goldItems,
      autoPayments,
    }
  }

  /**
   * Premium seviyesi rapor oluşturur
   */
  private async generatePremiumReport(
    data: Awaited<ReturnType<typeof this.collectFinancialData>>,
    _userId: number
  ): Promise<AIReportData> {
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Bu ayın transactions
    const thisMonthTransactions = data.transactions.filter(
      t => new Date(t.transactionDate) >= currentMonthStart
    )
    // Gelir/Gider hesaplamaları
    const thisMonthIncome = thisMonthTransactions
      .filter(t => t.txType.code === 'GELIR')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const thisMonthExpense = thisMonthTransactions
      .filter(t => t.txType.code === 'GIDER')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const netAmount = thisMonthIncome - thisMonthExpense
    const savingsRate = thisMonthIncome > 0 ? (netAmount / thisMonthIncome) * 100 : 0

    // Kategori analizi
    const categoryMap = new Map<string, { amount: number; count: number }>()
    thisMonthTransactions
      .filter(t => t.txType.code === 'GIDER')
      .forEach(t => {
        const categoryName = t.category.name
        const existing = categoryMap.get(categoryName) || { amount: 0, count: 0 }
        categoryMap.set(categoryName, {
          amount: existing.amount + Number(t.amount),
          count: existing.count + 1,
        })
      })

    const totalExpense = thisMonthExpense
    const categoryAnalysis = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        amount: data.amount,
        percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
        count: data.count,
        trend: 'stable' as const,
      }))
      .sort((a, b) => b.amount - a.amount)

    // En çok harcama yapılan kategoriler
    const topCategories = categoryAnalysis.slice(0, 5).map(cat => ({
      category: cat.category,
      amount: cat.amount,
      trend: 'stable',
    }))

    // Basit nakit akış (son 3 ay)
    const cashFlow = this.calculateCashFlow(
      data.transactions as Array<{
        txType: { code: string }
        category: { name: string }
        amount: number | string | bigint
        transactionDate: Date | string
      }>,
      3
    )

    // AI Önerileri (5-10 adet)
    const insights = await this.generatePremiumInsights(
      thisMonthIncome,
      thisMonthExpense,
      categoryAnalysis,
      savingsRate,
      {
        cashFlow,
        creditCardDebt: data.creditCards.reduce(
          (sum, card) => sum + Number(card.limitAmount) - Number(card.availableLimit),
          0
        ),
        investmentValue: data.investments.reduce((sum, inv) => {
          const currentPrice = inv.currentPrice
            ? Number(inv.currentPrice)
            : Number(inv.purchasePrice)
          const quantity = Number(inv.quantity)
          return sum + currentPrice * quantity
        }, 0),
        totalAccounts: data.accounts.length,
      }
    )

    return {
      summary: {
        totalIncome: thisMonthIncome,
        totalExpense: thisMonthExpense,
        netAmount,
        savingsRate,
        period: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      },
      categoryAnalysis,
      topCategories,
      cashFlow,
      insights,
    }
  }

  /**
   * Enterprise seviyesi rapor oluşturur
   */
  private async generateEnterpriseReport(
    data: Awaited<ReturnType<typeof this.collectFinancialData>>,
    userId: number
  ): Promise<AIReportData> {
    const premiumReport = await this.generatePremiumReport(data, userId)

    // Enterprise ekstra analizler
    const riskAnalysis = await this.calculateRiskAnalysis(data)
    const predictions = await this.generatePredictions(
      premiumReport.cashFlow,
      premiumReport.summary,
      3
    )

    // 15-20 AI önerisi
    const enterpriseInsights = [
      ...premiumReport.insights,
      ...(await this.generateEnterpriseInsights(data, premiumReport)),
    ]

    return {
      ...premiumReport,
      insights: enterpriseInsights.slice(0, 20),
      predictions,
      riskAnalysis,
    }
  }

  /**
   * Enterprise Premium seviyesi rapor oluşturur
   */
  private async generateEnterprisePremiumReport(
    data: Awaited<ReturnType<typeof this.collectFinancialData>>,
    userId: number
  ): Promise<AIReportData> {
    const enterpriseReport = await this.generateEnterpriseReport(data, userId)

    // Enterprise Premium ekstra analizler
    const advancedPredictions = await this.generatePredictions(
      enterpriseReport.cashFlow,
      enterpriseReport.summary,
      6
    )
    const benchmarks = await this.generateBenchmarks(enterpriseReport)

    // 30+ AI önerisi
    const premiumInsights = [
      ...enterpriseReport.insights,
      ...(await this.generateEnterprisePremiumInsights(data, enterpriseReport)),
    ]

    return {
      ...enterpriseReport,
      insights: premiumInsights.slice(0, 35),
      predictions: advancedPredictions,
      benchmarks,
      enterpriseData: {
        multiCompanyConsolidation: {},
      },
    }
  }

  /**
   * Nakit akış hesaplama
   */
  private calculateCashFlow(
    transactions: Array<{
      txType: { code: string }
      amount: number | string | bigint
      transactionDate: Date | string
    }>,
    months: number
  ): Array<{ month: string; income: number; expense: number; balance: number }> {
    const now = new Date()
    const cashFlow: Array<{ month: string; income: number; expense: number; balance: number }> = []

    for (let i = months - 1; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthTransactions = transactions.filter(
        t => new Date(t.transactionDate) >= monthStart && new Date(t.transactionDate) <= monthEnd
      )

      const income = monthTransactions
        .filter(t => t.txType.code === 'GELIR')
        .reduce((sum, t) => sum + Number(t.amount), 0)
      const expense = monthTransactions
        .filter(t => t.txType.code === 'GIDER')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      cashFlow.push({
        month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
        income,
        expense,
        balance: income - expense,
      })
    }

    return cashFlow
  }

  /**
   * Premium seviyesi AI önerileri
   */
  private async generatePremiumInsights(
    income: number,
    expense: number,
    categoryAnalysis: Array<{ category: string; amount: number; percentage: number }>,
    savingsRate: number,
    additionalData: {
      cashFlow: Array<{ month: string; income: number; expense: number; balance: number }>
      creditCardDebt?: number
      investmentValue?: number
      totalAccounts?: number
    }
  ): Promise<
    Array<{
      type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend'
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      impact: string
    }>
  > {
    if (!this.openAIService) {
      throw new Error('OpenAI servisi kullanılamıyor')
    }

    try {
      const financialData = {
        summary: {
          totalIncome: income,
          totalExpense: expense,
          netAmount: income - expense,
          savingsRate,
        },
        categoryAnalysis: categoryAnalysis.map(cat => ({
          category: cat.category,
          amount: cat.amount,
          percentage: cat.percentage,
          count: (cat as any).count || 0,
        })),
        topCategories: categoryAnalysis.slice(0, 10).map(cat => ({
          category: cat.category,
          amount: cat.amount,
        })),
        cashFlow: additionalData.cashFlow,
        creditCardDebt: additionalData.creditCardDebt,
        investmentValue: additionalData.investmentValue,
        totalAccounts: additionalData.totalAccounts,
      }

      const insights = await this.openAIService.generateInsights(financialData)
      return insights.slice(0, 10)
    } catch (error) {
      console.error('OpenAI generatePremiumInsights error:', error)
      throw error
    }
  }

  /**
   * Enterprise seviyesi AI önerileri
   */
  private async generateEnterpriseInsights(
    data: Awaited<ReturnType<typeof this.collectFinancialData>>,
    premiumReport: AIReportData
  ): Promise<
    Array<{
      type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend'
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      impact: string
    }>
  > {
    if (!this.openAIService) {
      throw new Error('OpenAI servisi kullanılamıyor')
    }

    try {
      const totalCardDebt = data.creditCards.reduce(
        (sum, card) => sum + Number(card.limitAmount) - Number(card.availableLimit),
        0
      )
      const investmentValue = data.investments.reduce((sum, inv) => {
        const currentPrice = inv.currentPrice ? Number(inv.currentPrice) : Number(inv.purchasePrice)
        const quantity = Number(inv.quantity)
        return sum + currentPrice * quantity
      }, 0)

      const financialData = {
        summary: premiumReport.summary,
        categoryAnalysis: premiumReport.categoryAnalysis,
        topCategories: premiumReport.topCategories,
        cashFlow: premiumReport.cashFlow,
        creditCardDebt: totalCardDebt,
        investmentValue,
        totalAccounts: data.accounts.length,
      }

      // Enterprise için daha fazla öneri
      const insights = await this.openAIService.generateInsights(financialData)
      return insights.slice(0, 10) // Premium'dan fazla 10 öneri daha
    } catch (error) {
      console.error('OpenAI generateEnterpriseInsights error:', error)
      throw error
    }
  }

  /**
   * Enterprise Premium seviyesi AI önerileri
   */
  private async generateEnterprisePremiumInsights(
    data: Awaited<ReturnType<typeof this.collectFinancialData>>,
    enterpriseReport: AIReportData
  ): Promise<
    Array<{
      type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend'
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      impact: string
    }>
  > {
    if (!this.openAIService) {
      throw new Error('OpenAI servisi kullanılamıyor')
    }

    try {
      const totalCardDebt = data.creditCards.reduce(
        (sum, card) => sum + Number(card.limitAmount) - Number(card.availableLimit),
        0
      )
      const investmentValue = data.investments.reduce((sum, inv) => {
        const currentPrice = inv.currentPrice ? Number(inv.currentPrice) : Number(inv.purchasePrice)
        const quantity = Number(inv.quantity)
        return sum + currentPrice * quantity
      }, 0)

      const financialData = {
        summary: enterpriseReport.summary,
        categoryAnalysis: enterpriseReport.categoryAnalysis,
        topCategories: enterpriseReport.topCategories,
        cashFlow: enterpriseReport.cashFlow,
        creditCardDebt: totalCardDebt,
        investmentValue,
        totalAccounts: data.accounts.length,
      }

      // Enterprise Premium için daha fazla öneri (15+)
      const insights = await this.openAIService.generateInsights(financialData)
      return insights.slice(0, 15) // Enterprise'dan fazla 15 öneri daha
    } catch (error) {
      console.error('OpenAI generateEnterprisePremiumInsights error:', error)
      throw error
    }
  }

  /**
   * Risk analizi
   */
  private async calculateRiskAnalysis(
    data: Awaited<ReturnType<typeof this.collectFinancialData>>
  ): Promise<{
    overallRisk: 'low' | 'medium' | 'high'
    riskFactors: Array<{
      factor: string
      level: 'low' | 'medium' | 'high'
      description: string
    }>
    mitigation: string[]
  }> {
    if (!this.openAIService) {
      throw new Error('OpenAI servisi kullanılamıyor')
    }

    try {
      const totalCardDebt = data.creditCards.reduce(
        (sum, card) => sum + Number(card.limitAmount) - Number(card.availableLimit),
        0
      )
      const investmentValue = data.investments.reduce((sum, inv) => {
        const currentPrice = inv.currentPrice ? Number(inv.currentPrice) : Number(inv.purchasePrice)
        const quantity = Number(inv.quantity)
        return sum + currentPrice * quantity
      }, 0)

      // Son 3 ayın nakit akışını hesapla
      const now = new Date()
      const cashFlow: Array<{ month: string; income: number; expense: number; balance: number }> =
        []
      for (let i = 2; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

        const monthTransactions = data.transactions.filter(
          t => new Date(t.transactionDate) >= monthStart && new Date(t.transactionDate) <= monthEnd
        )

        const income = monthTransactions
          .filter(t => t.txType.code === 'GELIR')
          .reduce((sum, t) => sum + Number(t.amount), 0)
        const expense = monthTransactions
          .filter(t => t.txType.code === 'GIDER')
          .reduce((sum, t) => sum + Number(t.amount), 0)

        cashFlow.push({
          month: `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, '0')}`,
          income,
          expense,
          balance: income - expense,
        })
      }

      const avgIncome = cashFlow.reduce((sum, m) => sum + m.income, 0) / cashFlow.length
      const avgExpense = cashFlow.reduce((sum, m) => sum + m.expense, 0) / cashFlow.length
      const netAmount = avgIncome - avgExpense
      const savingsRate = avgIncome > 0 ? (netAmount / avgIncome) * 100 : 0

      const riskAnalysis = await this.openAIService.generateRiskAnalysis({
        summary: {
          totalIncome: avgIncome,
          totalExpense: avgExpense,
          netAmount,
          savingsRate,
        },
        creditCardDebt: totalCardDebt,
        cashFlow,
        investmentValue,
        totalAccounts: data.accounts.length,
      })

      return riskAnalysis
    } catch (error) {
      console.error('OpenAI calculateRiskAnalysis error:', error)
      throw error
    }
  }

  /**
   * Gelecek tahminleri
   */
  private async generatePredictions(
    cashFlow: Array<{ month: string; income: number; expense: number; balance: number }>,
    summary: { totalIncome: number; totalExpense: number; savingsRate: number },
    months: number
  ): Promise<{
    next3Months: Array<{
      month: string
      predictedIncome: number
      predictedExpense: number
      confidence: number
    }>
    recommendations: string[]
  }> {
    if (!this.openAIService) {
      throw new Error('OpenAI servisi kullanılamıyor')
    }

    try {
      const predictions = await this.openAIService.generatePredictions({
        cashFlow,
        summary,
      })

      // İstenen ay sayısına göre ayarla (OpenAI her zaman 3 ay döner, biz 6 ay isteyebiliriz)
      if (months > 3) {
        // Ek aylar için basit ekstrapolasyon
        const lastPrediction = predictions.next3Months[predictions.next3Months.length - 1]
        const firstPrediction = predictions.next3Months[0]
        if (firstPrediction && lastPrediction) {
          const growthRateIncome =
            lastPrediction.predictedIncome /
            (firstPrediction.predictedIncome || lastPrediction.predictedIncome)
          const growthRateExpense =
            lastPrediction.predictedExpense /
            (firstPrediction.predictedExpense || lastPrediction.predictedExpense)

          const now = new Date()
          for (let i = 3; i < months; i++) {
            const futureMonth = new Date(now.getFullYear(), now.getMonth() + i + 1, 1)
            predictions.next3Months.push({
              month: `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, '0')}`,
              predictedIncome: lastPrediction.predictedIncome * Math.pow(growthRateIncome, i - 2),
              predictedExpense:
                lastPrediction.predictedExpense * Math.pow(growthRateExpense, i - 2),
              confidence: Math.max(50, lastPrediction.confidence - (i - 2) * 5),
            })
          }
        }
      } else {
        // 3 aydan az ise sadece ilk N ayı al
        predictions.next3Months = predictions.next3Months.slice(0, months)
      }

      return predictions
    } catch (error) {
      console.error('OpenAI generatePredictions error:', error)
      throw error
    }
  }

  /**
   * Benchmark karşılaştırmaları
   */
  private async generateBenchmarks(report: AIReportData): Promise<
    Array<{
      category: string
      yourAverage: number
      industryAverage: number
      percentile: number
    }>
  > {
    if (!this.openAIService) {
      throw new Error('OpenAI servisi kullanılamıyor')
    }

    try {
      const benchmarks = await this.openAIService.generateBenchmarks({
        topCategories: report.topCategories,
        summary: report.summary,
      })

      return benchmarks
    } catch (error) {
      console.error('OpenAI generateBenchmarks error:', error)
      throw error
    }
  }
}
