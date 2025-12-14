import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'
import { isPremiumPlan } from '@/lib/plan-config'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Premium kontrolü - Gelişmiş yatırım araçları sadece premium kullanıcılar için
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    const currentPlan = subscription?.planId || 'free'

    // Premium kontrolü - Gelişmiş yatırım araçları sadece premium kullanıcılar için
    if (!isPremiumPlan(currentPlan)) {
      return NextResponse.json(
        {
          error:
            'Gelişmiş yatırım araçları Premium üyelik gerektirir. Premium plana geçerek tüm yatırım araçlarına erişebilirsiniz.',
          requiresPremium: true,
          feature: 'Gelişmiş Yatırım Araçları',
        },
        { status: 403 }
      )
    }

    // Kullanıcının yatırımlarını getir
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

    // Decimal'ları string'e çevir
    const formattedInvestments = investments.map(inv => ({
      ...inv,
      quantity: inv.quantity.toString(),
      purchasePrice: inv.purchasePrice.toString(),
      currentPrice: inv.currentPrice?.toString() || null,
    }))

    return NextResponse.json(formattedInvestments)
  } catch (error) {
    console.error('Yatırımlar yüklenirken hata:', error)
    return NextResponse.json({ error: 'Yatırımlar yüklenirken hata oluştu' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Premium kontrolü - Yatırım ekleme sadece premium kullanıcılar için
    const { checkPremiumAccess } = await import('@/lib/premium-middleware')
    const premiumCheck = await checkPremiumAccess(request, 'premium')

    if (!premiumCheck.allowed) {
      return NextResponse.json(
        {
          error: premiumCheck.message,
          requiresPremium: true,
          requiredPlan: premiumCheck.requiredPlan,
          currentPlan: premiumCheck.currentPlan,
          feature: 'Yatırım Yönetimi',
          upgradeUrl: '/premium',
        },
        { status: 403 }
      )
    }

    const body = (await request.json()) as {
      investmentType?: string
      name?: string
      symbol?: string
      quantity?: string | number
      purchasePrice?: string | number
      currentPrice?: string | number
      purchaseDate?: string
      notes?: string
      category?: string
      riskLevel?: string
      currencyId?: number
      metadata?: Record<string, unknown>
    }
    const {
      investmentType,
      name,
      symbol,
      quantity,
      purchasePrice,
      currentPrice,
      purchaseDate,
      notes,
      category,
      riskLevel,
      currencyId,
      metadata,
    } = body

    // Validasyon
    if (!investmentType || !name || !quantity || !purchasePrice || !currencyId) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar: investmentType, name, quantity, purchasePrice, currencyId' },
        { status: 400 }
      )
    }

    // Yatırım oluştur
    const investment = await prisma.investment.create({
      data: {
        userId: user.id,
        investmentType,
        name,
        symbol,
        quantity: parseFloat(String(quantity)),
        purchasePrice: parseFloat(String(purchasePrice)),
        currentPrice: currentPrice
          ? parseFloat(String(currentPrice))
          : parseFloat(String(purchasePrice)),
        purchaseDate: new Date(String(purchaseDate)),
        notes,
        category,
        riskLevel: riskLevel || 'medium',
        currencyId,
        metadata: (metadata ? JSON.parse(JSON.stringify(metadata)) : {}) as Prisma.InputJsonValue,
        lastPriceUpdate: currentPrice ? new Date() : null,
      },
      include: {
        currency: true,
      },
    })

    return NextResponse.json(
      {
        ...investment,
        quantity: investment.quantity.toString(),
        purchasePrice: investment.purchasePrice.toString(),
        currentPrice: investment.currentPrice?.toString() || null,
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Yatırım oluşturulurken hata:', error)
    return NextResponse.json({ error: 'Yatırım oluşturulurken hata oluştu' }, { status: 500 })
  }
}
