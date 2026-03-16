import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser, getActivePeriod } from '@/lib/auth'
import { checkPremiumAccess } from '@/lib/premium-middleware'
import { prisma } from '@/lib/prisma'
import { generateAICoachSummary } from '@/lib/finance/ai-coach'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const premiumCheck = await checkPremiumAccess(request, 'premium')
    if (!premiumCheck.allowed) {
      return NextResponse.json(
        {
          error: premiumCheck.message || 'AI Finans Koçu Pro/Premium üyelik gerektirir.',
          requiresPremium: true,
          requiredPlan: premiumCheck.requiredPlan,
          currentPlan: premiumCheck.currentPlan,
          feature: 'AI Finans Koçu',
          upgradeUrl: '/premium',
        },
        { status: 403 }
      )
    }

    const activePeriod = await getActivePeriod(request)

    const data = await generateAICoachSummary(prisma, {
      userId: user.id,
      activePeriodId: activePeriod?.id,
    })

    return NextResponse.json(
      {
        success: true,
        data,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('AI coach summary error:', error)
    return NextResponse.json({ error: 'AI Finans Koçu verisi oluşturulamadı' }, { status: 500 })
  }
}
