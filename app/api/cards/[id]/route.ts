import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Kredi kartı güncelle (sadece isim)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const cardId = parseInt(id)
    const body = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Kart adı boş olamaz' }, { status: 400 })
    }

    const card = await prisma.creditCard.update({
      where: {
        id: cardId,
        userId: user.id,
      },
      data: {
        name: body.name.trim(),
      },
      include: {
        bank: true,
        currency: true,
      },
    })

    return NextResponse.json({
      ...card,
      limitAmount: card.limitAmount.toString(),
      availableLimit: card.availableLimit.toString(),
      minPaymentPercent: card.minPaymentPercent.toString(),
    })
  } catch (error) {
    console.error('Card update error:', error)
    return NextResponse.json({ error: 'Kart güncellenemedi' }, { status: 500 })
  }
}

// Kredi kartı sil (cascade delete - ilişkili transaction'lar da silinir)
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
    const cardId = parseInt(id)

    // Transaction sayısını kontrol et (bilgi için)
    const txCount = await prisma.transaction.count({
      where: { creditCardId: cardId },
    })

    // Hard delete - Prisma cascade ile ilişkili transaction'lar da silinir
    await prisma.creditCard.delete({
      where: {
        id: cardId,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deletedTransactions: txCount,
      message: txCount > 0 ? `Kart ve ${txCount} işlem kaydı silindi` : 'Kart silindi',
    })
  } catch (error) {
    console.error('Card delete error:', error)
    return NextResponse.json({ error: 'Kart silinemedi' }, { status: 500 })
  }
}
