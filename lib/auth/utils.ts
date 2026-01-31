import { NextRequest } from 'next/server'

/**
 * Bu metot basit token kontrolü yapar (Edge runtime için).
 * Sadece token'ın varlığını kontrol eder, veritabanı doğrulaması yapmaz.
 */
export function hasValidToken(request: NextRequest): boolean {
    const token = request.cookies.get('auth-token')?.value
    return !!token
}
