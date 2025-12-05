import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { UserDTO } from '@/server/dto/UserDTO'

// Bu metot mevcut kullanıcıyı getirir.
// Girdi: NextRequest
// Çıktı: UserDTO veya null
// Hata: -
export async function getCurrentUser(request: NextRequest): Promise<UserDTO | null> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      // eslint-disable-next-line no-console
      console.log('[AUTH] Token bulunamadı - cookie yok')
      return null
    }

    const authService = new AuthService(prisma)
    const user = await authService.validateSession(token)

    if (!user) {
      // eslint-disable-next-line no-console
      console.log('[AUTH] Session doğrulanamadı - token geçersiz veya session aktif değil')
    }

    return user
  } catch (error) {
    console.error('[AUTH] Get current user error:', error)
    return null
  }
}

// Bu metot basit token kontrolü yapar (Edge runtime için).
// Girdi: NextRequest
// Çıktı: Boolean
// Hata: -
export function hasValidToken(request: NextRequest): boolean {
  const token = request.cookies.get('auth-token')?.value
  return !!token
}

// Bu metot auth cookie'si ayarlar.
// Girdi: token, expiresAt
// Çıktı: void
// Hata: -
export async function setAuthCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies()
  // Railway'da HTTPS kullanıldığı için secure flag'i kontrol et
  const isProduction = process.env.NODE_ENV === 'production'
  const isSecure = isProduction || process.env.NEXTAUTH_URL?.startsWith('https://') || false

  cookieStore.set('auth-token', token, {
    expires: expiresAt,
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    // Railway için domain ayarı gerekmez (otomatik)
  })

  // eslint-disable-next-line no-console
  console.log('[AUTH] Cookie ayarlandı:', {
    secure: isSecure,
    expires: expiresAt.toISOString(),
    isProduction,
  })
}

// Bu metot auth cookie'sini temizler.
// Girdi: -
// Çıktı: void
// Hata: -
export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}

// Bu metot kullanıcının aktif dönemini getirir.
// Girdi: NextRequest
// Çıktı: Period veya null
// Hata: -
export async function getActivePeriod(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    const session = await prisma.userSession.findUnique({
      where: { token },
      include: {
        activePeriod: true,
      },
    })

    return session?.activePeriod || null
  } catch (error) {
    console.error('Get active period error:', error)
    return null
  }
}

// Type exports
export type { UserDTO }
