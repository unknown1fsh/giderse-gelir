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
          error: 'AI Borç Kapatma (Snowball) Planı sadece Aile (Premium) planında mevcuttur.',
          requiresPremium: true,
          feature: 'Snowball Borç Kapatma',
          upgradeUrl: '/premium',
        },
        { status: 403 }
      )
    }

    // Kullanıcının borçlarını al (Krediler ve Kredi Kartları)
    const [loans, creditCards] = await Promise.all([
      prisma.loan.findMany({
        where: { userId: user.id, isActive: true },
        include: { currency: true }
      }),
      prisma.creditCard.findMany({
        where: { userId: user.id, active: true },
        include: { currency: true }
      })
    ])

    const debts = [
      ...loans.map(loan => ({
        id: `loan-${loan.id}`,
        name: loan.name,
        type: 'loan',
        remainingBalance: Number(loan.totalAmount) - (Number(loan.totalAmount) / loan.installmentCount) * (loan.installmentCount - loan.remainingInstallments),
        interestRate: Number(loan.interestRate) || 0,
        currency: loan.currency.code
      })),
      ...creditCards.map(card => {
        // Kart borcunu simüle et: Limit - Kalan Limit
        const debtAmount = Number(card.limitAmount) - Number(card.availableLimit);
        return {
          id: `card-${card.id}`,
          name: card.name,
          type: 'credit_card',
          remainingBalance: debtAmount > 0 ? debtAmount : 0,
          interestRate: Number(card.minPaymentPercent) || 0, // Sadece örnekleme amaçlı
          currency: card.currency.code
        }
      }).filter(d => d.remainingBalance > 0)
    ]

    // Snowball yöntemi: En küçük bakiye ilk ödenir
    const snowballPlan = debts.sort((a, b) => a.remainingBalance - b.remainingBalance);

    const totalDebt = snowballPlan.reduce((sum, d) => sum + d.remainingBalance, 0);

    const mockAnalysis = {
      totalDebt,
      debtsCount: snowballPlan.length,
      snowballStrategy: snowballPlan.map((debt, index) => ({
        step: index + 1,
        debtName: debt.name,
        type: debt.type === 'loan' ? 'Kredi' : 'Kredi Kartı',
        remainingBalance: debt.remainingBalance,
        currency: debt.currency,
        suggestion: index === 0 
          ? 'Tüm ekstra ödemelerinizi bu borca yönlendirin. Diğer borçlarınız için sadece asgari tutarı ödeyin.' 
          : 'Sadece asgari tutarı ödeyerek bu borcu bekletin.'
      })),
      aiInsights: [
        {
          title: 'Snowball Etkisi',
          description: snowballPlan.length > 0 ? `İlk olarak ${snowballPlan[0].name} borcunu kapatmak size moral kazandıracak ve nakit akışınızı rahatlatacaktır.` : 'Tebrikler, kayıtlı bir borcunuz bulunmuyor!',
          type: 'strategy'
        },
        {
          title: 'Potansiyel Faiz Tasarrufu',
          description: 'Snowball yöntemine sadık kalarak, ödeme sürenizi azaltabilir ve faiz yüklerinden kurtulabilirsiniz.',
          type: 'savings'
        }
      ]
    }

    return NextResponse.json(mockAnalysis)
  } catch (error) {
    console.error('Snowball planı yüklenirken hata:', error)
    return NextResponse.json({ error: 'Plan oluşturulurken hata oluştu' }, { status: 500 })
  }
}
