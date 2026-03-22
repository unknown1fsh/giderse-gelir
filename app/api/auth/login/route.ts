import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { LoginUserDTO } from '@/server/dto/UserDTO'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, TooManyRequestsError } from '@/server/errors'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

// Bu metot kullanıcı girişi yapar (POST).
// Girdi: NextRequest (JSON body: email, password)
// Çıktı: NextResponse (user + session + token)
// Hata: 400, 401, 429, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  // Rate limiting kontrolü
  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit(`login:${clientIp}`, 5, 60000) // 5 istek/dakika

  if (!rateLimit.allowed) {
    throw new TooManyRequestsError(
      `Çok fazla giriş denemesi. Lütfen ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} saniye sonra tekrar deneyin.`
    )
  }

  const body = (await request.json()) as { email?: string; password?: string }
  const { email, password } = body

  if (!email || !password) {
    throw new BadRequestError('E-posta ve şifre gereklidir')
  }

  // AuthService ile giriş
  const authService = new AuthService(prisma)

  const userAgent = request.headers.get('user-agent') || undefined
  const forwardedFor = request.headers.get('x-forwarded-for')
  const ipAddressRaw = forwardedFor ? forwardedFor.split(',')[0].trim() : (request.headers.get('x-real-ip') || '127.0.0.1')
  const ipAddress = ipAddressRaw.substring(0, 45)

  const loginDTO = new LoginUserDTO({ email, password })
  const result = await authService.login(loginDTO, userAgent, ipAddress)

  // Cookie ayarla
  await setAuthCookie(result.session.token, result.session.expiresAt)

  const response = NextResponse.json(
    {
      success: true,
      user: result.user,
      session: result.session,
      message: 'Giriş başarılı',
    },
    { status: 200 }
  )

  return response
})
