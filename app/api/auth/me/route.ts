import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { UnauthorizedError } from '@/server/errors'
import { ExceptionMapper } from '@/server/errors'

// Bu metot mevcut kullanıcı bilgilerini getirir (GET).
// Girdi: NextRequest (Cookie: auth-token)
// Çıktı: NextResponse (user bilgisi)
// Hata: 401, 500
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new UnauthorizedError('Oturum bulunamadı')
  }

  return NextResponse.json({
    success: true,
    user,
  })
})
