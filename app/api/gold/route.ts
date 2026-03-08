import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

function parseDecimal(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const goldItems = await prisma.goldItem.findMany({
      include: {
        goldType: true,
        goldPurity: true,
      },
      where: {
        userId: user.id,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(goldItems)
  } catch (error) {
    console.error('Gold items API error:', error)
    return NextResponse.json({ error: 'Altın eşyaları alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Premium kontrolü - Altın yönetimi premium kullanıcılar için
    const { checkPremiumAccess } = await import('@/lib/premium-middleware')
    const premiumCheck = await checkPremiumAccess(request, 'premium')

    if (!premiumCheck.allowed) {
      return NextResponse.json(
        {
          error: premiumCheck.message,
          requiresPremium: true,
          requiredPlan: premiumCheck.requiredPlan,
          currentPlan: premiumCheck.currentPlan,
          feature: 'Altın Yönetimi',
          upgradeUrl: '/premium',
        },
        { status: 403 }
      )
    }

    const body = await request.json()

    if (!body.name || !body.goldTypeId || !body.goldPurityId) {
      return NextResponse.json({ error: 'Zorunlu alanlar eksik' }, { status: 400 })
    }

    const weightGrams = parseDecimal(body.weightGrams ?? body.weight)
    const purchasePrice = parseDecimal(body.purchasePrice)
    const currentValueTry = body.currentValueTry !== undefined
      ? parseDecimal(body.currentValueTry)
      : purchasePrice

    const goldItem = await prisma.goldItem.create({
      data: {
        userId: user.id,
        name: body.name,
        goldTypeId: body.goldTypeId,
        goldPurityId: body.goldPurityId,
        weightGrams,
        purchasePrice,
        purchaseDate: new Date(),
        currentValueTry,
        description: body.description || null,
      },
      include: {
        goldType: true,
        goldPurity: true,
      },
    })

    return NextResponse.json(goldItem, { status: 201 })
  } catch (error) {
    console.error('Gold item creation error:', error)
    return NextResponse.json({ error: 'Altın eşyası oluşturulamadı' }, { status: 500 })
  }
}
