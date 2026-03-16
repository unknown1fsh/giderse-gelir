import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth'
import { getNetWorthSummary } from '@/lib/finance/net-worth'
import { getHistoryLimitDate } from '@/lib/premium-middleware'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '30d'

    // Tarih aralığını hesapla
    const now = new Date()
    const startDate = new Date()

    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      case '90d':
        startDate.setDate(now.getDate() - 90)
        break
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    const historyLimitDate = await getHistoryLimitDate(user.id)
    if (historyLimitDate && startDate < historyLimitDate) {
      startDate.setTime(historyLimitDate.getTime())
    }

    const activePeriod = await getActivePeriod(request)
    const txBaseWhere: { userId: number; periodId?: number } = { userId: user.id }
    if (activePeriod) {
      txBaseWhere.periodId = activePeriod.id
    }

    const pastMonthDate = new Date(startDate.getTime() - (now.getTime() - startDate.getTime()))
    const pastMonthQueryStart = historyLimitDate && pastMonthDate < historyLimitDate ? historyLimitDate : pastMonthDate

    // Paralel veri çekme
    const [transactions, netWorthSummary, lastMonthTransactions] =
      await Promise.all([
        // Bu dönem işlemleri
        prisma.transaction.findMany({
          where: {
            ...txBaseWhere,
            transactionDate: {
              gte: startDate,
              lte: now,
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
        }),
        getNetWorthSummary(prisma, {
          userId: user.id,
          activePeriodId: activePeriod?.id,
        }),
        // Geçen ay işlemleri (trend hesaplama için)
        prisma.transaction.findMany({
          where: {
            ...txBaseWhere,
            transactionDate: {
              gte: pastMonthQueryStart,
              lt: startDate,
            },
          },
          include: {
            txType: true,
            category: true,
          },
        }),
      ])

    // Gelir ve gider hesaplamaları
    const incomeTransactions = transactions.filter(t => t.txType.code === 'GELIR')
    const expenseTransactions = transactions.filter(t => t.txType.code === 'GIDER')

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Number(t.amount), 0)
    const totalExpense = expenseTransactions.reduce((sum, t) => sum + Number(t.amount), 0)

    // Geçen ay verileri
    const lastMonthIncome = lastMonthTransactions
      .filter(t => t.txType.code === 'GELIR')
      .reduce((sum, t) => sum + Number(t.amount), 0)
    const lastMonthExpense = lastMonthTransactions
      .filter(t => t.txType.code === 'GIDER')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    // Trend hesaplamaları
    const incomeGrowth =
      lastMonthIncome > 0 ? ((totalIncome - lastMonthIncome) / lastMonthIncome) * 100 : 0
    const expenseGrowth =
      lastMonthExpense > 0 ? ((totalExpense - lastMonthExpense) / lastMonthExpense) * 100 : 0
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

    const totalAssets = netWorthSummary.totalAssets
    const netWorth = netWorthSummary.netWorth

    // Kategori analizi
    const categoryMap = new Map()
    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.category.name
      const amount = Number(transaction.amount)

      if (categoryMap.has(categoryName)) {
        categoryMap.set(categoryName, categoryMap.get(categoryName) + amount)
      } else {
        categoryMap.set(categoryName, amount)
      }
    })

    const topCategories = Array.from(categoryMap.entries())
      .map(([name, amount]) => ({
        name,
        amount,
        percentage: totalExpense > 0 ? (amount / totalExpense) * 100 : 0,
        trend: Math.random() > 0.5 ? 'up' : ('down' as 'up' | 'down' | 'stable'),
      }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 10)

    // Son işlemler
    const recentTransactions = transactions.slice(0, 10).map(t => ({
      id: t.id,
      description: t.description || 'İşlem',
      amount: Number(t.amount),
      type: t.txType.code === 'GELIR' ? 'income' : ('expense' as 'income' | 'expense'),
      category: t.category.name,
      date: t.transactionDate.toISOString(),
    }))

    // AI Önerileri
    const aiInsights = []

    // Tasarruf oranı önerisi
    if (savingsRate < 10) {
      aiInsights.push({
        type: 'warning',
        title: 'Düşük Tasarruf Oranı',
        description: `Tasarruf oranınız %${savingsRate.toFixed(1)}. Finansal hedeflerinize ulaşmak için tasarruf oranınızı artırmayı düşünün.`,
        priority: 'high',
      })
    } else if (savingsRate > 20) {
      aiInsights.push({
        type: 'achievement',
        title: 'Harika Tasarruf Oranı!',
        description: `%${savingsRate.toFixed(1)} tasarruf oranı ile finansal hedeflerinize doğru ilerliyorsunuz.`,
        priority: 'low',
      })
    }

    // Gider artışı uyarısı
    if (expenseGrowth > 20) {
      aiInsights.push({
        type: 'warning',
        title: 'Gider Artışı',
        description: `Giderleriniz geçen aya göre %${expenseGrowth.toFixed(1)} arttı. Harcama kalıplarınızı gözden geçirin.`,
        priority: 'high',
      })
    }

    // En yüksek kategori önerisi
    if (topCategories.length > 0) {
      const topCategory = topCategories[0]
      if (topCategory.percentage > 30) {
        aiInsights.push({
          type: 'suggestion',
          title: `${topCategory.name} Harcamaları`,
          description: `Harcamalarınızın %${topCategory.percentage.toFixed(1)}'i ${topCategory.name} kategorisinde. Bu alanda tasarruf fırsatları olabilir.`,
          priority: 'medium',
        })
      }
    }

    // Nakit akışı verisi (son 6 ay)
    const cashFlowData = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date()
      monthDate.setMonth(monthDate.getMonth() - i)
      const monthStart = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1)
      const monthEnd = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0)

      let gteDate = monthStart
      if (historyLimitDate && gteDate < historyLimitDate) {
        gteDate = historyLimitDate
      }

      if (gteDate > monthEnd) {
        // Bu ay geçmiş limitinin tamamen dışında kalıyorsa atla
        cashFlowData.push({
          month: monthDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
          income: 0,
          expense: 0,
          net: 0,
        })
        continue;
      }

      // Her ay için ayrı veri çek
      const monthTransactions = await prisma.transaction.findMany({
        where: {
          ...txBaseWhere,
          transactionDate: {
            gte: gteDate,
            lte: monthEnd,
          },
        },
        include: {
          txType: true,
        },
      })

      const monthIncome = monthTransactions
        .filter(t => t.txType.code === 'GELIR')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const monthExpense = monthTransactions
        .filter(t => t.txType.code === 'GIDER')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      cashFlowData.push({
        month: monthDate.toLocaleDateString('tr-TR', { month: 'short', year: 'numeric' }),
        income: monthIncome,
        expense: monthExpense,
        net: monthIncome - monthExpense,
      })
    }

    // Bu ay verileri
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    let thisMonthGte = thisMonthStart
    if (historyLimitDate && thisMonthGte < historyLimitDate) {
      thisMonthGte = historyLimitDate
    }

    const thisMonthTransactions = await prisma.transaction.findMany({
      where: {
        ...txBaseWhere,
        transactionDate: {
          gte: thisMonthGte,
        },
      },
      include: {
        txType: true,
      },
    })

    const monthlyIncome = thisMonthTransactions
      .filter(t => t.txType.code === 'GELIR')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const monthlyExpense = thisMonthTransactions
      .filter(t => t.txType.code === 'GIDER')
      .reduce((sum, t) => sum + Number(t.amount), 0)

    const analysisData = {
      totalIncome,
      totalExpense,
      netWorth,
      totalAssets,
      monthlyIncome,
      monthlyExpense,
      monthlyNet: monthlyIncome - monthlyExpense,
      incomeGrowth,
      expenseGrowth,
      savingsRate,
      topCategories,
      recentTransactions,
      aiInsights,
      cashFlowData,
    }

    return NextResponse.json(analysisData)
  } catch (error) {
    console.error('Analysis API error:', error)
    return NextResponse.json({ error: 'Analiz verileri alınamadı' }, { status: 500 })
  }
}
