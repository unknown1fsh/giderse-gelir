import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isPremiumPlan } from '@/lib/plan-config'
import {
  buildInvestmentUpsertInput,
  serializeInvestmentRecord,
} from '@/lib/finance/investments'

async function ensurePremiumAccess(userId: number) {
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: 'active',
    },
    orderBy: { createdAt: 'desc' },
  })

  const currentPlan = subscription?.planId || 'free'

  if (!isPremiumPlan(currentPlan)) {
    return NextResponse.json(
      {
        error:
          'Gelişmiş yatırım araçları Premium üyelik gerektirir. Premium plana geçerek tüm yatırım araçlarına erişebilirsiniz.',
        requiresPremium: true,
        feature: 'Yatırım Yönetimi',
        currentPlan,
        upgradeUrl: '/premium',
      },
      { status: 403 }
    )
  }

  return null
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const premiumResponse = await ensurePremiumAccess(user.id)
    if (premiumResponse) {
      return premiumResponse
    }

    const investments = await prisma.investment.findMany({
      where: {
        userId: user.id,
        active: true,
      },
      include: {
        currency: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(investments.map(serializeInvestmentRecord))
  } catch (error) {
    console.error('Yatırımlar yüklenirken hata:', error)
    return NextResponse.json({ error: 'Yatırımlar yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const premiumResponse = await ensurePremiumAccess(user.id)
    if (premiumResponse) {
      return premiumResponse
    }

    const body = await request.json()
    const parsed = buildInvestmentUpsertInput(body)

    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error || 'Geçersiz veri' }, { status: 400 })
    }

    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        investmentType: parsed.data.investmentType,
        name: parsed.data.name,
        symbol: parsed.data.symbol,
        quantity: parsed.data.quantity,
        purchasePrice: parsed.data.purchasePrice,
        currentPrice: parsed.data.currentPrice,
        purchaseDate: parsed.data.purchaseDate,
        notes: parsed.data.notes,
        category: parsed.data.category,
        riskLevel: parsed.data.riskLevel,
        currencyId: parsed.data.currencyId,
        metadata: parsed.data.metadata as Prisma.InputJsonValue,
        lastPriceUpdate: new Date(),
      },
      include: {
        currency: true,
      },
    })

    return NextResponse.json(serializeInvestmentRecord(investment), { status: 201 })
  } catch (error) {
    console.error('Yatırım oluşturulurken hata:', error)
    return NextResponse.json({ error: 'Yatırım oluşturulurken hata oluştu' }, { status: 500 })
  }
}
