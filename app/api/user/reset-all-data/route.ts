import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    console.log(`Kullanıcı ${user.email} tüm verilerini sıfırlıyor...`)

    // Tüm kullanıcı verilerini sil
    await prisma.transaction.deleteMany({
      where: { userId: user.id },
    })

    await prisma.creditCard.deleteMany({
      where: { userId: user.id },
    })

    await prisma.account.deleteMany({
      where: { userId: user.id },
    })

    await prisma.autoPayment.deleteMany({
      where: { userId: user.id },
    })

    await prisma.goldItem.deleteMany({
      where: { userId: user.id },
    })

    await prisma.portfolioSnapshot.deleteMany({
      where: { userId: user.id },
    })

    console.log(`Kullanıcı ${user.email} tüm verileri başarıyla sıfırlandı`)

    return NextResponse.json({
      success: true,
      message: 'Tüm veriler başarıyla silindi',
    })
  } catch (error) {
    console.error('Reset all data API error:', error)
    return NextResponse.json({ error: 'Veriler silinirken bir hata oluştu' }, { status: 500 })
  }
}
