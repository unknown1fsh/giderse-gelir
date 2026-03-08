import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { getPublicVapidKey, isWebPushConfigured } from '@/lib/notifications/web-push'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const subscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: user.id,
        active: true,
      },
      orderBy: { updatedAt: 'desc' },
    })

    return NextResponse.json({
      configured: isWebPushConfigured(),
      publicKey: getPublicVapidKey(),
      subscriptions,
    })
  } catch (error) {
    console.error('Push subscription GET error:', error)
    return NextResponse.json({ error: 'Push bilgileri alinamadi' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = (await request.json()) as {
      endpoint: string
      keys: {
        p256dh: string
        auth: string
      }
    }

    if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
      return NextResponse.json({ error: 'Eksik push subscription verisi' }, { status: 400 })
    }

    const subscription = await prisma.pushSubscription.upsert({
      where: {
        endpoint: body.endpoint,
      },
      update: {
        userId: user.id,
        p256dhKey: body.keys.p256dh,
        authKey: body.keys.auth,
        active: true,
        userAgent: request.headers.get('user-agent'),
        lastSeenAt: new Date(),
      },
      create: {
        userId: user.id,
        endpoint: body.endpoint,
        p256dhKey: body.keys.p256dh,
        authKey: body.keys.auth,
        active: true,
        userAgent: request.headers.get('user-agent'),
        lastSeenAt: new Date(),
      },
    })

    return NextResponse.json({
      configured: isWebPushConfigured(),
      publicKey: getPublicVapidKey(),
      subscription,
    })
  } catch (error) {
    console.error('Push subscription POST error:', error)
    return NextResponse.json({ error: 'Push subscription kaydedilemedi' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = (await request.json()) as { endpoint?: string }
    if (!body.endpoint) {
      return NextResponse.json({ error: 'Endpoint gereklidir' }, { status: 400 })
    }

    await prisma.pushSubscription.updateMany({
      where: {
        userId: user.id,
        endpoint: body.endpoint,
      },
      data: {
        active: false,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Push subscription DELETE error:', error)
    return NextResponse.json({ error: 'Push subscription silinemedi' }, { status: 500 })
  }
}
