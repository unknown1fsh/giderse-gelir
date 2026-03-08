import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const notificationId = Number(id)
    const body = (await request.json()) as {
      read?: boolean
      dismissed?: boolean
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId: user.id,
      },
      data: {
        ...(body.read ? { readAt: new Date(), status: 'sent' } : {}),
        ...(body.dismissed ? { dismissedAt: new Date() } : {}),
      },
    })

    if (updated.count === 0) {
      return NextResponse.json({ error: 'Bildirim bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Notification PATCH error:', error)
    return NextResponse.json({ error: 'Bildirim güncellenemedi' }, { status: 500 })
  }
}
