import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'

// Bu metot belirli bir hesabın detaylarını ve transaction'larını döndürür
// Girdi: account ID (route parameter)
// Çıktı: Hesap detayları ve transaction listesi
// Hata: 401, 404
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const accountId = parseInt(id)
    if (isNaN(accountId)) {
      return NextResponse.json({ error: 'Geçersiz hesap ID' }, { status: 400 })
    }

    // Hesabı getir (sadece kullanıcının kendi hesabı)
    const account = await prisma.account.findFirst({
      where: {
        id: accountId,
        userId: user.id,
      },
      include: {
        bank: {
          select: {
            name: true,
          },
        },
        currency: {
          select: {
            code: true,
            name: true,
          },
        },
        accountType: {
          select: {
            name: true,
          },
        },
        transactions: {
          include: {
            txType: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
            category: {
              select: {
                id: true,
                name: true,
              },
            },
            paymentMethod: {
              select: {
                id: true,
                name: true,
              },
            },
            currency: {
              select: {
                code: true,
              },
            },
          },
          orderBy: {
            transactionDate: 'desc',
          },
        },
      },
    })

    if (!account) {
      return NextResponse.json(
        { error: 'Hesap bulunamadı veya erişim yetkiniz yok' },
        { status: 404 }
      )
    }

    // BigInt değerlerini string'e çevir
    const formattedAccount = {
      ...account,
      balance: account.balance.toString(),
      transactions: account.transactions.map(tx => ({
        ...tx,
        amount: tx.amount.toString(),
        accountId: tx.accountId || undefined,
        creditCardId: tx.creditCardId || undefined,
      })),
    }

    return NextResponse.json(formattedAccount)
  } catch (error) {
    console.error('Account detail API error:', error)
    return NextResponse.json({ error: 'Hesap detayları alınamadı' }, { status: 500 })
  }
}

// Hesap güncelle (sadece isim)
export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const accountId = parseInt(id)
    const body = await request.json()

    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: 'Hesap adı boş olamaz' }, { status: 400 })
    }

    const account = await prisma.account.update({
      where: {
        id: accountId,
        userId: user.id,
      },
      data: {
        name: body.name.trim(),
      },
      include: {
        bank: true,
        currency: true,
        accountType: true,
      },
    })

    return NextResponse.json({
      ...account,
      balance: account.balance.toString(),
    })
  } catch (error) {
    console.error('Account update error:', error)
    return NextResponse.json({ error: 'Hesap güncellenemedi' }, { status: 500 })
  }
}

// Hesap sil (cascade delete - ilişkili transaction'lar da silinir)
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
    const accountId = parseInt(id)

    // Transaction sayısını kontrol et (bilgi için)
    const txCount = await prisma.transaction.count({
      where: { accountId },
    })

    // Hard delete - Prisma cascade ile ilişkili transaction'lar da silinir
    await prisma.account.delete({
      where: {
        id: accountId,
        userId: user.id,
      },
    })

    return NextResponse.json({
      success: true,
      deletedTransactions: txCount,
      message: txCount > 0 ? `Hesap ve ${txCount} işlem kaydı silindi` : 'Hesap silindi',
    })
  } catch (error) {
    console.error('Account delete error:', error)
    return NextResponse.json({ error: 'Hesap silinemedi' }, { status: 500 })
  }
}
