import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'

// Alıcı/Kişi listesi getir
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const beneficiaries = await prisma.beneficiary.findMany({
      where: {
        userId: user.id,
        active: true,
      },
      include: {
        bank: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(beneficiaries)
  } catch (error) {
    console.error('Alıcı listesi alınamadı:', error)
    return NextResponse.json({ error: 'Alıcı listesi alınamadı' }, { status: 500 })
  }
}

// Yeni alıcı ekle
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = await request.json()
    const { name, iban, accountNo, bankId, phoneNumber, email, description } = body

    // Validasyon
    if (!name) {
      return NextResponse.json({ error: 'Alıcı adı zorunludur' }, { status: 400 })
    }

    const beneficiary = await prisma.beneficiary.create({
      data: {
        userId: user.id,
        name,
        iban,
        accountNo,
        bankId,
        phoneNumber,
        email,
        description,
      },
      include: {
        bank: true,
      },
    })

    return NextResponse.json(beneficiary, { status: 201 })
  } catch (error) {
    console.error('Alıcı eklenemedi:', error)
    return NextResponse.json({ error: 'Alıcı eklenemedi' }, { status: 500 })
  }
}
