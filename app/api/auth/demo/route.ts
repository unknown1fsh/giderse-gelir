import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { setAuthCookie } from '@/lib/auth'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import { ExceptionMapper } from '@/server/errors'
import { TooManyRequestsError } from '@/server/errors'

export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit(`demo:${clientIp}`, 10, 15 * 60 * 1000) // 10 istek/15 dakika

  if (!rateLimit.allowed) {
    throw new TooManyRequestsError(
      `Çok fazla demo denemesi. Lütfen ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} saniye sonra tekrar deneyin.`
    )
  }

  const demoUser = await prisma.user.findFirst({
    where: { role: 'DEMO', isActive: true },
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  if (!demoUser) {
    return NextResponse.json({ error: 'Demo hesabı şu an kullanılamıyor.' }, { status: 503 })
  }

  const plan = demoUser.subscriptions[0]?.planId || 'free'
  const authService = new AuthService(prisma)
  const session = await authService.createDemoSession(demoUser.id, demoUser.email, plan, 'DEMO', clientIp)

  await setAuthCookie(session.token, session.expiresAt)

  return NextResponse.json({ success: true })
})
