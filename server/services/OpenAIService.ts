import OpenAI from 'openai'
import { getEnv } from '@/lib/env-validation'

/**
 * OpenAI API ile AI analiz raporları oluşturan servis
 */
export class OpenAIService {
  private client: OpenAI
  private readonly model = 'gpt-4-turbo-preview'
  private readonly maxRetries = 3
  private readonly timeout = 120000 // 120 saniye

  constructor() {
    const apiKey = getEnv('OPENAI_API_KEY')
    if (!apiKey) {
      throw new Error('OPENAI_API_KEY environment variable is not set')
    }

    this.client = new OpenAI({
      apiKey,
      timeout: this.timeout,
      maxRetries: this.maxRetries,
    })
  }

  /**
   * Finansal verileri optimize eder (token tasarrufu için)
   */
  private optimizeFinancialData(data: {
    summary: {
      totalIncome: number
      totalExpense: number
      netAmount: number
      savingsRate: number
    }
    categoryAnalysis: Array<{
      category: string
      amount: number
      percentage: number
      count: number
    }>
    cashFlow: Array<{
      month: string
      income: number
      expense: number
      balance: number
    }>
    topCategories: Array<{
      category: string
      amount: number
    }>
    creditCardDebt?: number
    investmentValue?: number
    totalAccounts?: number
  }): string {
    // Sadece özet bilgileri JSON formatında gönder
    return JSON.stringify({
      summary: data.summary,
      topCategories: data.topCategories.slice(0, 10), // İlk 10 kategori
      categoryBreakdown: data.categoryAnalysis.slice(0, 10).map(cat => ({
        name: cat.category,
        amount: cat.amount,
        percentage: cat.percentage.toFixed(1),
      })),
      recentMonths: data.cashFlow.slice(-6), // Son 6 ay
      creditCardDebt: data.creditCardDebt || 0,
      investmentValue: data.investmentValue || 0,
      totalAccounts: data.totalAccounts || 0,
    })
  }

  /**
   * AI önerileri oluşturur
   */
  async generateInsights(financialData: {
    summary: {
      totalIncome: number
      totalExpense: number
      netAmount: number
      savingsRate: number
    }
    categoryAnalysis: Array<{
      category: string
      amount: number
      percentage: number
      count: number
    }>
    cashFlow: Array<{
      month: string
      income: number
      expense: number
      balance: number
    }>
    topCategories: Array<{
      category: string
      amount: number
    }>
    creditCardDebt?: number
    investmentValue?: number
    totalAccounts?: number
  }): Promise<
    Array<{
      type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend'
      title: string
      description: string
      priority: 'high' | 'medium' | 'low'
      impact: string
    }>
  > {
    const optimizedData = this.optimizeFinancialData(financialData)

    const prompt = `Sen bir finansal danışmansın. Aşağıdaki finansal verilere dayanarak 10-15 adet öneri oluştur. 
Her öneri şu formatta olmalı:
- type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend' 
- title: Kısa ve net başlık (max 50 karakter)
- description: Detaylı açıklama (max 200 karakter)
- priority: 'high' | 'medium' | 'low'
- impact: Önerinin etkisi (max 100 karakter)

Finansal Veriler:
${optimizedData}

Önerileri Türkçe olarak JSON formatında döndür. Sadece öneriler dizisini döndür, başka bir şey ekleme.
Format: {"insights": [{"type": "...", "title": "...", "description": "...", "priority": "...", "impact": "..."}, ...]}`

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'Sen bir finansal danışmansın. Türkçe yanıt ver. Sadece geçerli JSON formatında yanıt ver.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('OpenAI response is empty')
      }

      // JSON parsing
      const parsed = JSON.parse(content) as unknown

      // Response'u normalize et
      const insights: unknown[] = Array.isArray(parsed)
        ? parsed
        : typeof parsed === 'object' &&
            parsed !== null &&
            ('insights' in parsed || 'recommendations' in parsed)
          ? (('insights' in parsed && Array.isArray(parsed.insights)
              ? parsed.insights
              : 'recommendations' in parsed && Array.isArray(parsed.recommendations)
                ? parsed.recommendations
                : []) as unknown[])
          : []

      // Validation ve format kontrolü
      return insights
        .filter(
          (
            insight: unknown
          ): insight is {
            type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend'
            title: string
            description: string
            priority: 'high' | 'medium' | 'low'
            impact: string
          } =>
            typeof insight === 'object' &&
            insight !== null &&
            'type' in insight &&
            'title' in insight &&
            'description' in insight &&
            'priority' in insight &&
            'impact' in insight
        )
        .slice(0, 15) // Maximum 15 öneri
    } catch (error) {
      console.error('OpenAI generateInsights error:', error)
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error(
            'OpenAI API rate limit aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.'
          )
        }
        if (error.status === 401) {
          throw new Error("OpenAI API key geçersiz. Lütfen API key'i kontrol edin.")
        }
        throw new Error(`OpenAI API hatası: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Gelecek tahminleri oluşturur
   */
  async generatePredictions(financialData: {
    cashFlow: Array<{
      month: string
      income: number
      expense: number
      balance: number
    }>
    summary: {
      totalIncome: number
      totalExpense: number
      savingsRate: number
    }
  }): Promise<{
    next3Months: Array<{
      month: string
      predictedIncome: number
      predictedExpense: number
      confidence: number
    }>
    recommendations: string[]
  }> {
    const optimizedData = JSON.stringify({
      cashFlow: financialData.cashFlow.slice(-6), // Son 6 ay
      currentSummary: financialData.summary,
    })

    const prompt = `Sen bir finansal analistsin. Aşağıdaki geçmiş nakit akış verilerine dayanarak gelecek 3 ay için tahminler yap.

Finansal Veriler:
${optimizedData}

Tahminleri JSON formatında döndür:
{
  "next3Months": [
    {
      "month": "YYYY-MM formatında",
      "predictedIncome": sayı,
      "predictedExpense": sayı,
      "confidence": 60-95 arası sayı
    }
  ],
  "recommendations": ["öneri1", "öneri2", ...]
}

Örnek month değerleri: "2024-02", "2024-03", "2024-04"
Sadece JSON döndür, başka bir şey ekleme.`

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'Sen bir finansal analistsin. Türkçe yanıt ver. Sadece geçerli JSON formatında yanıt ver.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5, // Tahminler için daha düşük temperature
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('OpenAI response is empty')
      }

      const parsed = JSON.parse(content) as {
        next3Months?: unknown[]
        recommendations?: unknown[]
      }

      // Validation
      if (!parsed.next3Months || !Array.isArray(parsed.next3Months)) {
        throw new Error('Invalid predictions format')
      }

      return {
        next3Months: parsed.next3Months.slice(0, 3).map((pred: unknown) => ({
          month:
            typeof pred === 'object' && pred !== null && 'month' in pred ? String(pred.month) : '',
          predictedIncome:
            typeof pred === 'object' && pred !== null && 'predictedIncome' in pred
              ? Number(pred.predictedIncome) || 0
              : 0,
          predictedExpense:
            typeof pred === 'object' && pred !== null && 'predictedExpense' in pred
              ? Number(pred.predictedExpense) || 0
              : 0,
          confidence:
            typeof pred === 'object' && pred !== null && 'confidence' in pred
              ? Math.max(60, Math.min(95, Number(pred.confidence) || 70))
              : 70,
        })),
        recommendations: Array.isArray(parsed.recommendations)
          ? parsed.recommendations.slice(0, 5).map(String)
          : [],
      }
    } catch (error) {
      console.error('OpenAI generatePredictions error:', error)
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error(
            'OpenAI API rate limit aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.'
          )
        }
        throw new Error(`OpenAI API hatası: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Risk analizi oluşturur
   */
  async generateRiskAnalysis(financialData: {
    summary: {
      totalIncome: number
      totalExpense: number
      netAmount: number
      savingsRate: number
    }
    creditCardDebt?: number
    cashFlow: Array<{
      month: string
      income: number
      expense: number
      balance: number
    }>
    investmentValue?: number
    totalAccounts?: number
  }): Promise<{
    overallRisk: 'low' | 'medium' | 'high'
    riskFactors: Array<{
      factor: string
      level: 'low' | 'medium' | 'high'
      description: string
    }>
    mitigation: string[]
  }> {
    const optimizedData = JSON.stringify({
      summary: financialData.summary,
      creditCardDebt: financialData.creditCardDebt || 0,
      investmentValue: financialData.investmentValue || 0,
      recentMonths: financialData.cashFlow.slice(-3), // Son 3 ay
      totalAccounts: financialData.totalAccounts || 0,
    })

    const prompt = `Sen bir risk analisti finansal danışmansın. Aşağıdaki finansal verilere dayanarak risk analizi yap.

Finansal Veriler:
${optimizedData}

Risk analizini JSON formatında döndür:
{
  "overallRisk": "low" | "medium" | "high",
  "riskFactors": [
    {
      "factor": "risk faktörü adı",
      "level": "low" | "medium" | "high",
      "description": "açıklama"
    }
  ],
  "mitigation": ["önlem1", "önlem2", ...]
}

Sadece JSON döndür, başka bir şey ekleme.`

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'Sen bir risk analisti finansal danışmansın. Türkçe yanıt ver. Sadece geçerli JSON formatında yanıt ver.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('OpenAI response is empty')
      }

      const parsed = JSON.parse(content) as {
        overallRisk?: unknown
        riskFactors?: unknown[]
        mitigation?: unknown[]
      }

      // Validation
      const overallRisk =
        parsed.overallRisk === 'low' ||
        parsed.overallRisk === 'medium' ||
        parsed.overallRisk === 'high'
          ? (parsed.overallRisk as 'low' | 'medium' | 'high')
          : 'medium'

      const riskFactors = Array.isArray(parsed.riskFactors)
        ? parsed.riskFactors
            .filter((factor: unknown) => typeof factor === 'object' && factor !== null)
            .map((factor: unknown) => {
              const f = factor as {
                factor?: unknown
                level?: unknown
                description?: unknown
              }
              return {
                factor: String(f.factor || ''),
                level:
                  f.level === 'low' || f.level === 'medium' || f.level === 'high'
                    ? (f.level as 'low' | 'medium' | 'high')
                    : 'medium',
                description: String(f.description || ''),
              }
            })
            .slice(0, 10)
        : []

      const mitigation = Array.isArray(parsed.mitigation)
        ? parsed.mitigation.map(String).slice(0, 10)
        : []

      return {
        overallRisk,
        riskFactors,
        mitigation,
      }
    } catch (error) {
      console.error('OpenAI generateRiskAnalysis error:', error)
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error(
            'OpenAI API rate limit aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.'
          )
        }
        throw new Error(`OpenAI API hatası: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Benchmark karşılaştırmaları oluşturur
   */
  async generateBenchmarks(financialData: {
    topCategories: Array<{
      category: string
      amount: number
    }>
    summary: {
      totalIncome: number
      totalExpense: number
    }
  }): Promise<
    Array<{
      category: string
      yourAverage: number
      industryAverage: number
      percentile: number
    }>
  > {
    const optimizedData = JSON.stringify({
      categories: financialData.topCategories.slice(0, 10),
      monthlyExpense: financialData.summary.totalExpense,
      monthlyIncome: financialData.summary.totalIncome,
    })

    const prompt = `Sen bir finansal benchmark uzmanısın. Aşağıdaki kategori bazlı harcama verilerine dayanarak Türkiye ortalamalarıyla karşılaştırma yap.

Finansal Veriler:
${optimizedData}

Benchmark karşılaştırmalarını JSON formatında döndür:
{
  "benchmarks": [
    {
      "category": "kategori adı",
      "yourAverage": kullanıcının aylık ortalama harcaması,
      "industryAverage": Türkiye ortalaması (gerçekçi değerler kullan),
      "percentile": 0-100 arası yüzdelik dilim
    }
  ]
}

Türkiye'deki gerçek harcama ortalamalarını kullan. Sadece JSON döndür, başka bir şey ekleme.`

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content:
              'Sen bir finansal benchmark uzmanısın. Türkçe yanıt ver. Sadece geçerli JSON formatında yanıt ver. Türkiye ortalamaları için gerçekçi değerler kullan.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      })

      const content = response.choices[0]?.message?.content
      if (!content) {
        throw new Error('OpenAI response is empty')
      }

      const parsed = JSON.parse(content) as {
        benchmarks?: unknown[]
      }

      // Validation
      const benchmarks = Array.isArray(parsed.benchmarks)
        ? parsed.benchmarks
            .filter((bench: unknown) => typeof bench === 'object' && bench !== null)
            .map((bench: unknown) => {
              const b = bench as {
                category?: unknown
                yourAverage?: unknown
                industryAverage?: unknown
                percentile?: unknown
              }
              return {
                category: String(b.category || ''),
                yourAverage: Number(b.yourAverage) || 0,
                industryAverage: Number(b.industryAverage) || 0,
                percentile: Math.max(0, Math.min(100, Number(b.percentile) || 50)),
              }
            })
            .slice(0, 10)
        : []

      return benchmarks
    } catch (error) {
      console.error('OpenAI generateBenchmarks error:', error)
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          throw new Error(
            'OpenAI API rate limit aşıldı. Lütfen birkaç dakika sonra tekrar deneyin.'
          )
        }
        throw new Error(`OpenAI API hatası: ${error.message}`)
      }
      throw error
    }
  }
}
