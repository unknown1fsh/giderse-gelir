import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-refactored'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ success: false, message: 'Oturum bulunamadı' }, { status: 401 })
    }

    // Mevcut aktif aboneliği bul
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Aktif abonelik bulunamadı' },
        { status: 404 }
      )
    }

    // Aboneliği iptal et
    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: {
        status: 'cancelled',
        cancelledAt: new Date(),
        autoRenew: false,
      },
    })

    // Kullanıcının planını free'e çevir
    // Plan bilgisi UserSubscription modelinde tutuluyor, User modelinde değil
    // await prisma.user.update({
    //   where: { id: user.id },
    //   data: { plan: 'free' },
    // })

    // Ücretsiz plan aboneliği oluştur
    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: 'free',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl
        amount: 0,
        currency: 'TRY',
        autoRenew: false,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Abonelik başarıyla iptal edildi',
    })
  } catch (error) {
    console.error('Cancel subscription error:', error)
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 })
  }
}
