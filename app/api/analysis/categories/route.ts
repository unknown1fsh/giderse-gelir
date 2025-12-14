import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth-refactored'

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

    // const { searchParams } = new URL(request.url)
    // const period = searchParams.get('period') || '30d' // TODO: Kullanılacak

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
        trend: Math.random() > 0.5 ? ('up' as const) : ('down' as const),
        monthlyGrowth: Math.random() * 20 - 10,
        icon: 'shopping',
        color: 'blue',
      }))
      .sort((a, b) => b.amount - a.amount)

    // Kullanıcı bazlı kategori verisi
    const categoryData = {
      categories: categories,

      categoryComparison: [
        {
          category: 'Alışveriş',
          currentMonth: 3500,
          lastMonth: 3100,
          change: 400,
          changePercentage: 12.9,
        },
        {
          category: 'Ulaşım',
          currentMonth: 2800,
          lastMonth: 2950,
          change: -150,
          changePercentage: -5.1,
        },
        {
          category: 'Yiyecek',
          currentMonth: 2200,
          lastMonth: 2150,
          change: 50,
          changePercentage: 2.3,
        },
      ],

      spendingPatterns: [
        {
          pattern: 'Hafta Sonu Alışverişi',
          description: 'Cumartesi ve Pazar günleri daha fazla harcama yapıyorsunuz',
          frequency: 8,
          averageAmount: 450,
          recommendation: 'Hafta içi indirimlerini takip edin',
        },
        {
          pattern: 'Ay Başı Yoğunluğu',
          description: 'Ayın ilk haftasında harcamalarınız %30 artıyor',
          frequency: 12,
          averageAmount: 650,
          recommendation: 'Ay başında bütçe planlaması yapın',
        },
        {
          pattern: 'Online Alışveriş',
          description: 'Online alışverişleriniz fiziksel mağazalardan %15 daha pahalı',
          frequency: 25,
          averageAmount: 120,
          recommendation: 'Fiyat karşılaştırması yapın',
        },
      ],

      aiRecommendations: [
        {
          type: 'optimization' as const,
          category: 'Alışveriş',
          title: 'İndirim Takibi',
          description: 'Alışveriş kategorisinde %15 tasarruf potansiyeli var',
          potentialSavings: 525,
          difficulty: 'easy' as const,
        },
        {
          type: 'warning' as const,
          category: 'Eğlence',
          title: 'Harcama Kontrolü',
          description: 'Eğlence harcamalarınız %19 artmış, dikkat edin',
          potentialSavings: 342,
          difficulty: 'medium' as const,
        },
        {
          type: 'opportunity' as const,
          category: 'Ulaşım',
          title: 'Toplu Taşıma',
          description: 'Toplu taşıma kullanarak aylık 200 TL tasarruf edebilirsiniz',
          potentialSavings: 200,
          difficulty: 'easy' as const,
        },
      ],

      categoryGoals: [
        {
          category: 'Alışveriş',
          currentSpending: 3500,
          targetSpending: 3000,
          remaining: -500,
          progress: 116.7,
          status: 'over_budget' as const,
        },
        {
          category: 'Ulaşım',
          currentSpending: 2800,
          targetSpending: 3000,
          remaining: 200,
          progress: 93.3,
          status: 'on_track' as const,
        },
        {
          category: 'Yiyecek',
          currentSpending: 2200,
          targetSpending: 2500,
          remaining: 300,
          progress: 88.0,
          status: 'under_budget' as const,
        },
      ],
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
