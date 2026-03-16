import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isFamilyPlan } from '@/lib/plan-config'

export async function GET(request: NextRequest) {
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
          error: 'AI Yatırım Öneri Senaryoları sadece Aile (Premium) planında mevcuttur.',
          requiresPremium: true,
          feature: 'AI Yatırım Senaryoları',
          upgradeUrl: '/premium',
        },
        { status: 403 }
      )
    }

    // Kullanıcının yatırımlarını al
    const investments = await prisma.investment.findMany({
      where: { userId: user.id, active: true },
      include: { currency: true }
    })

    const totalPortfolioValue = investments.reduce((sum, inv) => {
        const currentTotal = Number(inv.quantity) * (Number(inv.currentPrice) || Number(inv.purchasePrice));
        return sum + currentTotal;
    }, 0);

    const assetAllocation = investments.reduce((acc: Record<string, number>, inv) => {
        const type = inv.investmentType;
        const value = Number(inv.quantity) * (Number(inv.currentPrice) || Number(inv.purchasePrice));
        acc[type] = (acc[type] || 0) + value;
        return acc;
    }, {});

    // Risk Profili Simülasyonu
    const mockScenarios = {
        totalPortfolioValue,
        assetAllocation,
        currentRiskLevel: 'Orta',
        scenarios: [
            {
                scenarioName: 'Düşük Risk / Düzenli Temettü',
                description: 'Daha az dalgalanma ve düzenli nakit akışı arayanlar için.',
                suggestedAllocation: {
                    'Tahvil/Bono': '40%',
                    'Temettü Hisseleri': '30%',
                    'Altın': '20%',
                    'Nakit': '10%'
                },
                expectedAnnualReturn: '%15 - %20',
                aiInsights: 'Mevcut portföyünüz daha riskli. Bu senaryoya geçmek için hisse senedi ağırlığınızı azaltıp sabit getirili araçlara yönelebilirsiniz.'
            },
            {
                scenarioName: 'Orta Risk / Dengeli Büyüme',
                description: 'Hem büyüme hem de koruma arayanlar için.',
                suggestedAllocation: {
                    'Hisse Senedi (BIST 30)': '40%',
                    'Eurobond/Yabancı Hisse': '20%',
                    'Altın': '20%',
                    'Nakit/Mevduat': '20%'
                },
                expectedAnnualReturn: '%25 - %40',
                aiInsights: 'Bu senaryo enflasyona karşı korunurken makul bir getiri hedefliyor. Portföyünüz bu dağılıma oldukça yakın.'
            },
            {
                scenarioName: 'Yüksek Risk / Agresif Büyüme',
                description: 'Maksimum sermaye kazancı arayan ve dalgalanmaları tolere edebilenler için.',
                suggestedAllocation: {
                    'Hisse Senedi (Büyüme)': '60%',
                    'Kripto Varlıklar': '15%',
                    'Yabancı Hisse/Fon': '20%',
                    'Nakit': '5%'
                },
                expectedAnnualReturn: '%45+',
                aiInsights: 'Bu senaryoda getiri potansiyeli yüksek olmakla birlikte, kısa vadeli düşüşlere hazırlıklı olunmalıdır.'
            }
        ],
        marketOutlook: 'Şu anki piyasa koşullarında enflasyonun yavaşça düşmesi beklenmektedir, bu da sabit getirili varlıklara ve değerli madenlere olan ilgiyi artırabilir.'
    };

    return NextResponse.json(mockScenarios)
  } catch (error) {
    console.error('Yatırım senaryoları yüklenirken hata:', error)
    return NextResponse.json({ error: 'Senaryolar oluşturulurken hata oluştu' }, { status: 500 })
  }
}
