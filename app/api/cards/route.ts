import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const creditCards = await prisma.creditCard.findMany({
      include: {
        bank: true,
        currency: true,
      },
      where: {
        userId: user.id,
        active: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(creditCards)
  } catch (error) {
    console.error('Credit cards API error:', error)
    return NextResponse.json({ error: 'Kredi kartları alınamadı' }, { status: 500 })
  }
}
