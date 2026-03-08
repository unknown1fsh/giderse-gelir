import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

function parseDecimal(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// Altın güncelle
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const goldId = parseInt(id)
    const body = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Altın adı boş olamaz' }, { status: 400 })
    }

    if (!body.goldTypeId || !body.goldPurityId) {
      return NextResponse.json({ error: 'Altın türü ve ayar seçimi zorunludur' }, { status: 400 })
    }

    if (parseDecimal(body.weightGrams ?? body.weight) <= 0) {
      return NextResponse.json({ error: 'Geçerli bir gram değeri giriniz' }, { status: 400 })
    }

    if (parseDecimal(body.purchasePrice) <= 0) {
      return NextResponse.json({ error: 'Geçerli bir alış değeri giriniz' }, { status: 400 })
    }

    const existingGold = await prisma.goldItem.findFirst({
      where: {
        id: goldId,
        userId: user.id,
      },
    })

    if (!existingGold) {
      return NextResponse.json({ error: 'Altın kaydı bulunamadı' }, { status: 404 })
    }

    const goldItem = await prisma.goldItem.update({
      where: {
        id: goldId,
      },
      data: {
        name: body.name.trim(),
        goldTypeId: Number(body.goldTypeId),
        goldPurityId: Number(body.goldPurityId),
        weightGrams: parseDecimal(body.weightGrams ?? body.weight),
        purchasePrice: parseDecimal(body.purchasePrice),
        currentValueTry:
          body.currentValueTry === undefined || body.currentValueTry === null
            ? null
            : parseDecimal(body.currentValueTry),
        description: body.description?.trim() || null,
      },
      include: {
        goldType: true,
        goldPurity: true,
      },
    })

    return NextResponse.json({
      ...goldItem,
      weightGrams: goldItem.weightGrams.toString(),
      purchasePrice: goldItem.purchasePrice.toString(),
      currentValueTry: goldItem.currentValueTry?.toString() || null,
    })
  } catch (error) {
    console.error('Gold item update error:', error)
    return NextResponse.json({ error: 'Altın güncellenemedi' }, { status: 500 })
  }
}

// Altın sil (hard delete - GoldItem'da active alanı yok)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const goldId = parseInt(id)

    // GoldItem'da active alanı olmadığı için hard delete
    await prisma.goldItem.delete({
      where: {
        id: goldId,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Altın silindi',
    })
  } catch (error) {
    console.error('Gold item delete error:', error)
    return NextResponse.json({ error: 'Altın silinemedi' }, { status: 500 })
  }
}
