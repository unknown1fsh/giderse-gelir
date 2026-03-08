import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { isPremiumPlan } from '@/lib/plan-config'
import {
  buildInvestmentUpsertInput,
  normalizeMetadata,
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
        error: 'Yatırım yönetimi Premium üyelik gerektirir.',
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

async function getOwnedInvestment(userId: number, investmentId: number) {
  return prisma.investment.findFirst({
    where: {
      id: investmentId,
      userId,
      active: true,
    },
    include: {
      currency: true,
    },
  })
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const premiumResponse = await ensurePremiumAccess(user.id)
    if (premiumResponse) {
      return premiumResponse
    }

    const { id } = await params
    const investmentId = Number(id)

    if (!Number.isFinite(investmentId)) {
      return NextResponse.json({ error: 'Geçersiz yatırım kimliği' }, { status: 400 })
    }

    const investment = await getOwnedInvestment(user.id, investmentId)

    if (!investment) {
      return NextResponse.json({ error: 'Yatırım bulunamadı' }, { status: 404 })
    }

    return NextResponse.json(serializeInvestmentRecord(investment))
  } catch (error) {
    console.error('Yatırım detayı yüklenirken hata:', error)
    return NextResponse.json({ error: 'Yatırım detayı yüklenemedi' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const premiumResponse = await ensurePremiumAccess(user.id)
    if (premiumResponse) {
      return premiumResponse
    }

    const { id } = await params
    const investmentId = Number(id)

    if (!Number.isFinite(investmentId)) {
      return NextResponse.json({ error: 'Geçersiz yatırım kimliği' }, { status: 400 })
    }

    const existingInvestment = await getOwnedInvestment(user.id, investmentId)

    if (!existingInvestment) {
      return NextResponse.json({ error: 'Yatırım bulunamadı' }, { status: 404 })
    }

    const body = await request.json()
    const parsed = buildInvestmentUpsertInput(body, {
      fallbackType: existingInvestment.investmentType as
        | 'stock'
        | 'fund'
        | 'bond'
        | 'crypto'
        | 'commodity'
        | 'forex'
        | 'real-estate'
        | 'other',
      preserveMetadata: normalizeMetadata(existingInvestment.metadata),
    })

    if (!parsed.data) {
      return NextResponse.json({ error: parsed.error || 'Geçersiz veri' }, { status: 400 })
    }

    const updatedInvestment = await prisma.investment.update({
      where: {
        id: investmentId,
      },
      data: {
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

    return NextResponse.json(serializeInvestmentRecord(updatedInvestment))
  } catch (error) {
    console.error('Yatirim guncellenirken hata:', error)
    return NextResponse.json({ error: 'Yatırım güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const premiumResponse = await ensurePremiumAccess(user.id)
    if (premiumResponse) {
      return premiumResponse
    }

    const { id } = await params
    const investmentId = Number(id)

    if (!Number.isFinite(investmentId)) {
      return NextResponse.json({ error: 'Geçersiz yatırım kimliği' }, { status: 400 })
    }

    const existingInvestment = await getOwnedInvestment(user.id, investmentId)

    if (!existingInvestment) {
      return NextResponse.json({ error: 'Yatırım bulunamadı' }, { status: 404 })
    }

    await prisma.investment.update({
      where: {
        id: investmentId,
      },
      data: {
        active: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Yatirim silinirken hata:', error)
    return NextResponse.json({ error: 'Yatırım silinemedi' }, { status: 500 })
  }
}
