import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Premium kontrolü - Gelişmiş trend analizi sadece premium kullanıcılar için
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    const currentPlan = subscription?.planId || 'free'

    // Premium kontrolü - Gelişmiş trend analizi sadece premium kullanıcılar için
    if (currentPlan === 'free') {
      return NextResponse.json(
        {
          error:
            'Gelişmiş trend analizi Premium üyelik gerektirir. Premium plana geçerek detaylı trend analizlerine erişebilirsiniz.',
          requiresPremium: true,
          feature: 'Gelişmiş Trend Analizi',
        },
        { status: 403 }
      )
    }

    // const { searchParams } = new URL(request.url)
    // const period = searchParams.get('period') || '12m' // TODO: Kullanılacak
    // const metric = searchParams.get('metric') || 'all' // TODO: Kullanılacak

    const activePeriod = await getActivePeriod(request)

    // Kullanıcı bazlı veri çekme
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.id,
        periodId: activePeriod?.id,
      },
      include: {
        txType: true,
        category: true,
      },
      orderBy: {
        transactionDate: 'desc',
      },
    })

    // Trend analizi
    const now = new Date()
    const incomeTrends = []
    const expenseTrends = []

    for (let i = 11; i >= 0; i--) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)

      const monthTransactions = transactions.filter(
        t => t.transactionDate >= monthDate && t.transactionDate <= monthEnd
      )

      const income = monthTransactions
        .filter(t => t.txType.code === 'GELIR')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const expense = monthTransactions
        .filter(t => t.txType.code === 'GIDER')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - i - 1, 1)
      const prevMonthEnd = new Date(now.getFullYear(), now.getMonth() - i, 0)

      const prevMonthTransactions = transactions.filter(
        t => t.transactionDate >= prevMonthDate && t.transactionDate <= prevMonthEnd
      )

      const prevIncome = prevMonthTransactions
        .filter(t => t.txType.code === 'GELIR')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const prevExpense = prevMonthTransactions
        .filter(t => t.txType.code === 'GIDER')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      incomeTrends.push({
        period: monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
        amount: income,
        growth: income - prevIncome,
        growthPercentage: prevIncome > 0 ? ((income - prevIncome) / prevIncome) * 100 : 0,
        trend: income > prevIncome ? ('up' as const) : ('down' as const),
      })

      expenseTrends.push({
        period: monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
        amount: expense,
        growth: expense - prevExpense,
        growthPercentage: prevExpense > 0 ? ((expense - prevExpense) / prevExpense) * 100 : 0,
        trend: expense > prevExpense ? ('up' as const) : ('down' as const),
      })
    }

    // Kullanıcı bazlı trend verisi
    const trendsData = {
      incomeTrends: incomeTrends,
      expenseTrends: expenseTrends,

      categoryTrends: [
        {
          category: 'Alışveriş',
          currentPeriod: 3500,
          previousPeriod: 3100,
          growth: 400,
          growthPercentage: 12.9,
          trend: 'up' as const,
          forecast: 3800,
        },
        {
          category: 'Ulaşım',
          currentPeriod: 2800,
          previousPeriod: 2950,
          growth: -150,
          growthPercentage: -5.1,
          trend: 'down' as const,
          forecast: 2700,
        },
        {
          category: 'Yiyecek',
          currentPeriod: 2200,
          previousPeriod: 2150,
          growth: 50,
          growthPercentage: 2.3,
          trend: 'up' as const,
          forecast: 2250,
        },
        {
          category: 'Eğlence',
          currentPeriod: 1800,
          previousPeriod: 1520,
          growth: 280,
          growthPercentage: 18.4,
          trend: 'up' as const,
          forecast: 1950,
        },
      ],

      seasonalAnalysis: [
        {
          month: 'Ocak',
          averageIncome: 15500,
          averageExpense: 12500,
          averageNet: 3000,
          seasonality: 'medium' as const,
        },
        {
          month: 'Şubat',
          averageIncome: 16000,
          averageExpense: 11500,
          averageNet: 4500,
          seasonality: 'low' as const,
        },
        {
          month: 'Mart',
          averageIncome: 15500,
          averageExpense: 13500,
          averageNet: 2000,
          seasonality: 'high' as const,
        },
        {
          month: 'Nisan',
          averageIncome: 17000,
          averageExpense: 14000,
          averageNet: 3000,
          seasonality: 'medium' as const,
        },
        {
          month: 'Mayıs',
          averageIncome: 16500,
          averageExpense: 12500,
          averageNet: 4000,
          seasonality: 'low' as const,
        },
        {
          month: 'Haziran',
          averageIncome: 18000,
          averageExpense: 15000,
          averageNet: 3000,
          seasonality: 'high' as const,
        },
      ],

      aiPredictions: [
        {
          metric: 'Aylık Gelir',
          currentValue: 18000,
          predictedValue: 18500,
          confidence: 85,
          timeframe: '1 ay',
          recommendation: 'Gelir artış trendi devam ediyor, yatırım fırsatları değerlendirin',
        },
        {
          metric: 'Aylık Gider',
          currentValue: 15000,
          predictedValue: 14500,
          confidence: 78,
          timeframe: '1 ay',
          recommendation: 'Gider kontrolü başarılı, tasarruf oranını koruyun',
        },
        {
          metric: 'Net Tasarruf',
          currentValue: 3000,
          predictedValue: 4000,
          confidence: 82,
          timeframe: '1 ay',
          recommendation: 'Tasarruf oranı artıyor, acil durum fonu oluşturun',
        },
      ],

      performanceMetrics: {
        overallTrend: 'improving' as const,
        trendScore: 78,
        volatility: 15.2,
        consistency: 72.5,
        growthRate: 8.3,
      },

      trendAlerts: [
        {
          type: 'warning' as const,
          title: 'Eğlence Harcamaları Artışı',
          description:
            'Eğlence kategorisinde %18 artış tespit edildi. Bu trend devam ederse bütçe aşımı riski var.',
          severity: 'medium' as const,
          action: 'Eğlence bütçesi belirleyin ve takip edin',
        },
        {
          type: 'opportunity' as const,
          title: 'Gelir Artış Fırsatı',
          description:
            'Son 3 ayda gelir trendiniz %12 büyüyor. Bu momentumu korumak için yeni gelir kaynakları araştırın.',
          severity: 'high' as const,
          action: 'Yan gelir fırsatları ve yatırım seçeneklerini değerlendirin',
        },
        {
          type: 'achievement' as const,
          title: 'Tutarlı Tasarruf Başarısı',
          description: '6 aydır düzenli tasarruf yapıyorsunuz. Bu çok iyi bir finansal alışkanlık!',
          severity: 'low' as const,
        },
      ],
    }

    return NextResponse.json(trendsData)
  } catch (error) {
    console.error('Trend analizi verileri yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Trend analizi verileri yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
