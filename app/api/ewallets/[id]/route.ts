import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// E-cüzdan güncelle (sadece isim)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const walletId = parseInt(id)
    const body = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'E-cüzdan adı boş olamaz' }, { status: 400 })
    }

    const wallet = await prisma.eWallet.update({
      where: {
        id: walletId,
        userId: user.id,
      },
      data: {
        name: body.name.trim(),
      },
      include: {
        currency: true,
      },
    })

    return NextResponse.json({
      ...wallet,
      balance: wallet.balance.toString(),
    })
  } catch (error) {
    console.error('E-wallet update error:', error)
    return NextResponse.json({ error: 'E-cüzdan güncellenemedi' }, { status: 500 })
  }
}

// E-cüzdan sil (cascade delete - ilişkili transaction'lar da silinir)
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
    const walletId = parseInt(id)

    // Transaction sayısını kontrol et (bilgi için)
    const txCount = await prisma.transaction.count({
      where: { eWalletId: walletId },
    })

    // Hard delete - Prisma cascade ile ilişkili transaction'lar da silinir
    await prisma.eWallet.delete({
      where: {
        id: walletId,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deletedTransactions: txCount,
      message: txCount > 0 ? `E-cüzdan ve ${txCount} işlem kaydı silindi` : 'E-cüzdan silindi',
    })
  } catch (error) {
    console.error('E-wallet delete error:', error)
    return NextResponse.json({ error: 'E-cüzdan silinemedi' }, { status: 500 })
  }
}
