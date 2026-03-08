import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = (await request.json().catch(() => ({}))) as { channel?: string }
    const channel = body.channel || 'in_app'

    await prisma.notification.updateMany({
      where: {
        userId: user.id,
        channel,
        readAt: null,
      },
      data: {
        readAt: new Date(),
        status: 'sent',
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification read-all error:', error)
    return NextResponse.json({ error: 'Bildirimler güncellenemedi' }, { status: 500 })
  }
}
