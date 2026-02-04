import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { UserDTO } from '@/server/dto/UserDTO'

/**
 * Bu metot mevcut kullanıcıyı getirir.
 * Girdi: NextRequest
 * Çıktı: UserDTO veya null
 */
export async function getCurrentUser(request: NextRequest): Promise<UserDTO | null> {
    try {
        const token = request.cookies.get('auth-token')?.value

        if (!token) {
            return null
        }

        const authService = new AuthService(prisma)
        const user = await authService.validateSession(token)

        return user
    } catch (error) {
        console.error('[AUTH] Get current user error:', error)
        return null
    }
}

/**
 * Bu metot auth cookie'si ayarlar.
 * Girdi: token, expiresAt
 */
export async function setAuthCookie(token: string, expiresAt: Date): Promise<void> {
    const cookieStore = await cookies()
    const isProduction = process.env.NODE_ENV === 'production'

    // Railway/Production'da her zaman secure olmalı
    const isSecure = isProduction || process.env.NEXTAUTH_URL?.startsWith('https://') || false

    cookieStore.set('auth-token', token, {
        expires: expiresAt,
        httpOnly: true,
        secure: isSecure,
        sameSite: 'lax',
        path: '/',
    })

    // eslint-disable-next-line no-console
    console.log('[AUTH] Cookie set:', {
        secure: isSecure,
        expires: expiresAt.toISOString(),
    })
}

/**
 * Bu metot auth cookie'sini temizler.
 */
export async function clearAuthCookie(): Promise<void> {
    const cookieStore = await cookies()
    cookieStore.delete('auth-token')
}

/**
 * Geçersiz oturum için 401 response oluşturur.
 * İstekte auth-token varsa (veritabanında geçersiz), cookie'yi temizleyerek
 * redirect loop'unu önler.
 */
export function createUnauthorizedResponse(
    request: NextRequest,
    message = 'Oturum bulunamadı'
): NextResponse {
    const token = request.cookies.get('auth-token')?.value
    const isProduction = process.env.NODE_ENV === 'production'
    const isSecure = isProduction || process.env.NEXTAUTH_URL?.startsWith('https://') || false

    const response = NextResponse.json(
        { error: message, errorCode: 'UNAUTHORIZED', statusCode: 401 },
        { status: 401 }
    )

    if (token) {
        response.cookies.set('auth-token', '', {
            path: '/',
            maxAge: 0,
            expires: new Date(0),
            httpOnly: true,
            secure: isSecure,
            sameSite: 'lax',
        })
    }

    return response
}

/**
 * Bu metot kullanıcının aktif dönemini getirir.
 */
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

// Re-export Edge utils
export * from './utils'
// Service export
export { AuthService } from '@/server/services/impl/AuthService'
// Type exports
export type { UserDTO }
