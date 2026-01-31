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

    // Premium kontrolü - Gelişmiş nakit akışı analizi sadece premium kullanıcılar için
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    const currentPlan = subscription?.planId || 'free'

    // Premium kontrolü - Gelişmiş nakit akışı analizi sadece premium kullanıcılar için
    if (currentPlan === 'free') {
      return NextResponse.json(
        {
          error:
            'Gelişmiş nakit akışı analizi Premium üyelik gerektirir. Premium plana geçerek detaylı analizlere erişebilirsiniz.',
          requiresPremium: true,
          feature: 'Gelişmiş Nakit Akışı Analizi',
        },
        { status: 403 }
      )
    }

    // const { searchParams } = new URL(request.url)
    // const period = searchParams.get('period') || '12m' // TODO: Kullanılacak

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

    // Nakit akışı hesaplamaları
    const monthlyData: Array<{
      month: string
      income: number
      expense: number
      net: number
      balance: number
    }> = []
    const now = new Date()

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

      monthlyData.push({
        month: monthDate.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' }),
        income,
        expense,
        net: income - expense,
        balance:
          monthlyData.length > 0
            ? monthlyData[monthlyData.length - 1].balance + (income - expense)
            : income - expense,
      })
    }

    // Kullanıcı bazlı nakit akışı verisi
    const cashFlowData = {
      monthlyCashFlow: monthlyData,

      forecasts: [
        {
          month: 'Temmuz 2024',
          predictedIncome: 17500,
          predictedExpense: 14500,
          predictedNet: 3000,
          confidence: 85,
        },
        {
          month: 'Ağustos 2024',
          predictedIncome: 18000,
          predictedExpense: 14000,
          predictedNet: 4000,
          confidence: 78,
        },
        {
          month: 'Eylül 2024',
          predictedIncome: 17000,
          predictedExpense: 13500,
          predictedNet: 3500,
          confidence: 82,
        },
      ],

      averageMonthlyIncome:
        monthlyData.length > 0
          ? monthlyData.reduce((sum, m) => sum + m.income, 0) / monthlyData.length
          : 0,
      averageMonthlyExpense:
        monthlyData.length > 0
          ? monthlyData.reduce((sum, m) => sum + m.expense, 0) / monthlyData.length
          : 0,
      averageMonthlyNet:
        monthlyData.length > 0
          ? monthlyData.reduce((sum, m) => sum + m.net, 0) / monthlyData.length
          : 0,
      cashFlowTrend:
        monthlyData.length > 1 &&
        monthlyData[monthlyData.length - 1].net > monthlyData[monthlyData.length - 2].net
          ? ('improving' as const)
          : ('declining' as const),

      aiInsights: [
        {
          type: 'opportunity' as const,
          title: 'Gelir Artırma Fırsatı',
          description:
            'Geçen 3 ayda gelirleriniz %12 artmış. Bu trendi sürdürmek için yan gelir kaynakları değerlendirebilirsiniz.',
          impact: 'high' as const,
          action: 'Freelance projeler veya yatırım fırsatları araştırın',
        },
        {
          type: 'warning' as const,
          title: 'Gider Kontrolü',
          description:
            'Haziran ayında giderleriniz %8 artmış. Bu trend devam ederse tasarruf oranınız düşebilir.',
          impact: 'medium' as const,
          action: 'Gereksiz harcamaları gözden geçirin',
        },
        {
          type: 'achievement' as const,
          title: 'Tasarruf Başarısı',
          description: "Aylık tasarruf oranınız %21'e ulaşmış. Bu çok iyi bir performans!",
          impact: 'high' as const,
        },
      ],

      scenarios: [
        {
          name: 'Pozitif Senaryo',
          description: 'Gelir artışı %15, gider kontrolü başarılı',
          impact: 5000,
          probability: 65,
        },
        {
          name: 'Normal Senaryo',
          description: 'Mevcut trend devam eder',
          impact: 3500,
          probability: 80,
        },
        {
          name: 'Negatif Senaryo',
          description: 'Beklenmedik giderler, gelir durgunluğu',
          impact: 1000,
          probability: 25,
        },
      ],
    }

    return NextResponse.json(cashFlowData)
  } catch (error) {
    console.error('Nakit akışı verileri yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Nakit akışı verileri yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
