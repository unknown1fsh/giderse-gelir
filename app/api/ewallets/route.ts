import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// E-Cüzdan listesi getir
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const eWallets = await prisma.eWallet.findMany({
      where: {
        userId: user.id,
        active: true,
      },
      include: {
        currency: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(eWallets)
  } catch (error) {
    console.error('E-Cüzdan listesi alınamadı:', error)
    return NextResponse.json({ error: 'E-Cüzdan listesi alınamadı' }, { status: 500 })
  }
}

// Yeni e-cüzdan ekle
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = await request.json()
    const { name, provider, accountEmail, accountPhone, balance, currencyId } = body

    // Validasyon
    if (!name || !provider || !currencyId) {
      return NextResponse.json(
        { error: 'Zorunlu alanlar: name, provider, currencyId' },
        { status: 400 }
      )
    }

    const eWallet = await prisma.eWallet.create({
      data: {
        userId: user.id,
        name,
        provider,
        accountEmail,
        accountPhone,
        balance: balance || 0,
        currencyId,
      },
      include: {
        currency: true,
      },
    })

    return NextResponse.json(eWallet, { status: 201 })
  } catch (error) {
    console.error('E-Cüzdan eklenemedi:', error)
    return NextResponse.json({ error: 'E-Cüzdan eklenemedi' }, { status: 500 })
  }
}
