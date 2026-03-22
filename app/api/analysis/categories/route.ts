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

    // Premium kontrolü - Gelişmiş kategori analizi sadece premium kullanıcılar için
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    const currentPlan = subscription?.planId || 'free'

    // Premium kontrolü - Gelişmiş kategori analizi sadece premium kullanıcılar için
    if (currentPlan === 'free') {
      return NextResponse.json(
        {
          error:
            'Gelişmiş kategori analizi Premium üyelik gerektirir. Premium plana geçerek detaylı kategori analizlerine erişebilirsiniz.',
          requiresPremium: true,
          feature: 'Gelişmiş Kategori Analizi',
        },
        { status: 403 }
      )
    }

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
    })

    // Kategori analizi
    const categoryMap = new Map()
    transactions.forEach(transaction => {
      if (transaction.txType.code === 'GIDER') {
        const categoryName = transaction.category.name
        const amount = Number(transaction.amount)

        if (categoryMap.has(categoryName)) {
          const existing = categoryMap.get(categoryName)
          categoryMap.set(categoryName, {
            ...existing,
            amount: existing.amount + amount,
            transactionCount: existing.transactionCount + 1,
          })
        } else {
          categoryMap.set(categoryName, {
            amount,
            transactionCount: 1,
          })
        }
      }
    })

    const totalExpense = Array.from(categoryMap.values()).reduce((sum, cat) => sum + cat.amount, 0)
    const categories = Array.from(categoryMap.entries())
      .map(([name, data]) => ({
        id: Math.random(),
        name,
        amount: data.amount,
        percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
        transactionCount: data.transactionCount,
        averageAmount: data.transactionCount > 0 ? data.amount / data.transactionCount : 0,
        trend: 'stable' as const,
        monthlyGrowth: 0,
        icon: 'shopping',
        color: 'blue',
      }))
      .sort((a, b) => b.amount - a.amount)

    const categoryData = {
      categories,
      categoryComparison: [] as Array<{ category: string; currentMonth: number; lastMonth: number; change: number; changePercentage: number }>,
      spendingPatterns: [] as Array<{ pattern: string; description: string; frequency: number; averageAmount: number; recommendation: string }>,
      aiRecommendations: [] as Array<{ type: string; category: string; title: string; description: string; potentialSavings: number; difficulty: string }>,
      categoryGoals: [] as Array<{ category: string; currentSpending: number; targetSpending: number; remaining: number; progress: number; status: string }>,
    }

    return NextResponse.json(categoryData)
  } catch (error) {
    console.error('Kategori analizi verileri yüklenirken hata:', error)
    return NextResponse.json(
      { error: 'Kategori analizi verileri yüklenirken hata oluştu' },
      { status: 500 }
    )
  }
}
