import { NextRequest, NextResponse } from 'next/server'
import { clearAuthCookie } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { ExceptionMapper } from '@/server/errors'

// Bu metot kullanıcı çıkışı yapar (POST).
// Girdi: NextRequest (Cookie: auth-token)
// Çıktı: NextResponse (success message)
// Hata: 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const token = request.cookies.get('auth-token')?.value

  if (token) {
    const authService = new AuthService(prisma)
    await authService.logout(token)
  }

  // Cookie'yi temizle
  await clearAuthCookie()

  return NextResponse.json({
    success: true,
    message: 'Çıkış başarılı',
  })
})
