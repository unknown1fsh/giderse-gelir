import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

function parseBalance(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

// E-cüzdan güncelle
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

    if (!body.provider || body.provider.trim() === '') {
      return NextResponse.json({ error: 'Sağlayıcı seçimi zorunludur' }, { status: 400 })
    }

    if (!body.currencyId || Number(body.currencyId) <= 0) {
      return NextResponse.json({ error: 'Geçerli bir para birimi seçiniz' }, { status: 400 })
    }

    if (!body.accountEmail?.trim() && !body.accountPhone?.trim()) {
      return NextResponse.json(
        { error: 'En az bir iletişim bilgisi (E-posta veya Telefon) girilmelidir' },
        { status: 400 }
      )
    }

    const existingWallet = await prisma.eWallet.findFirst({
      where: {
        id: walletId,
        userId: user.id,
        active: true,
      },
    })

    if (!existingWallet) {
      return NextResponse.json({ error: 'E-cüzdan bulunamadı' }, { status: 404 })
    }

    const wallet = await prisma.eWallet.update({
      where: {
        id: walletId,
      },
      data: {
        name: body.name.trim(),
        provider: body.provider.trim(),
        accountEmail: body.accountEmail?.trim() || null,
        accountPhone: body.accountPhone?.trim() || null,
        balance: parseBalance(body.balance),
        currencyId: Number(body.currencyId),
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
