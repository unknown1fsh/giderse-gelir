import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Altın güncelle (sadece isim)
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

    const goldItem = await prisma.goldItem.update({
      where: {
        id: goldId,
        userId: user.id,
      },
      data: {
        name: body.name.trim(),
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
