import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActivePeriod, getCurrentUser } from '@/lib/auth'
import { syncNotificationEvents } from '@/lib/notifications/service'
import { isWebPushConfigured, getPublicVapidKey } from '@/lib/notifications/web-push'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const activePeriod = await getActivePeriod(request)
    const { searchParams } = new URL(request.url)
    const page = Math.max(1, Number(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit') || '20')))
    const unreadOnly = searchParams.get('unreadOnly') === 'true'
    const channel = searchParams.get('channel') || 'in_app'
    const shouldSync = searchParams.get('sync') !== 'false'

    if (shouldSync) {
      await syncNotificationEvents(prisma, {
        userId: user.id,
        activePeriodId: activePeriod?.id,
      })
    }

    const where = {
      userId: user.id,
      channel,
      ...(unreadOnly ? { readAt: null } : {}),
    }

    const [items, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: {
          userId: user.id,
          channel: 'in_app',
          readAt: null,
        },
      }),
    ])

    return NextResponse.json({
      items,
      page,
      limit,
      total,
      unreadCount,
      push: {
        configured: isWebPushConfigured(),
        publicKey: getPublicVapidKey(),
      },
    })
  } catch (error) {
    console.error('Notifications GET error:', error)
    return NextResponse.json({ error: 'Bildirimler alinamadi' }, { status: 500 })
  }
}
