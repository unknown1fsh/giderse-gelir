import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isFamilyPlan } from '@/lib/plan-config'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Aile (Premium) planı kontrolü
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: user.id, status: 'active' },
      orderBy: { createdAt: 'desc' },
    })

    const currentPlan = subscription?.planId || 'free'

    if (!isFamilyPlan(currentPlan)) {
      return NextResponse.json(
        {
          error: 'Kredi Kartı Ekstre Analizi sadece Aile (Premium) planında mevcuttur.',
          requiresPremium: true,
          feature: 'Ekstre Analizi',
          upgradeUrl: '/premium',
        },
        { status: 403 }
      )
    }

    const { creditCardId } = await request.json()

    if (!creditCardId) {
      return NextResponse.json({ error: 'Kredi kartı seçmelisiniz' }, { status: 400 })
    }

    const creditCard = await prisma.creditCard.findUnique({
      where: { id: creditCardId, userId: user.id },
      include: {
        transactions: {
          where: {
            transactionDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)) // Son 1 ay
            }
          },
          include: { category: true }
        }
      }
    })

    if (!creditCard) {
      return NextResponse.json({ error: 'Kredi kartı bulunamadı' }, { status: 404 })
    }

    // Mock AI Analysis Logic
    const totalSpent = creditCard.transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    const categorySpending: Record<string, number> = {};
    creditCard.transactions.forEach(tx => {
       const catName = tx.category.name;
       categorySpending[catName] = (categorySpending[catName] || 0) + Number(tx.amount);
    });

    const highestCategory = Object.entries(categorySpending).sort((a,b) => b[1] - a[1])[0];

    const mockAnalysis = {
      cardName: creditCard.name,
      totalSpentThisMonth: totalSpent,
      highestSpendingCategory: highestCategory ? highestCategory[0] : 'Yok',
      insights: [
        {
          type: 'warning',
          title: 'Harcama Uyarısı',
          description: highestCategory ? `En çok harcamayı ${highestCategory[0]} kategorisinde yaptınız. Bu kategorideki harcamalarınızı gözden geçirebilirsiniz.` : 'Bu ay henüz harcama yapmadınız.'
        },
        {
          type: 'recommendation',
          title: 'Asgari Ödeme Stratejisi',
          description: 'Sadece asgari tutarı ödemek uzun vadede faiz yükünüzü artırabilir. Ekstrenin tamamını ödemeye çalışın.'
        }
      ],
      aiScore: 85,
      summary: 'Kredi kartı harcamalarınız genel olarak kontrol altında, ancak bazı alanlarda tasarruf fırsatları bulunuyor.'
    }

    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error('Ekstre analizi yüklenirken hata:', error)
    return NextResponse.json({ error: 'Analiz oluşturulurken hata oluştu' }, { status: 500 })
  }
}
