import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from './auth-refactored'
import { UserRole } from '@/server/enums/UserRole'

// Admin rolü kontrolü yapar
export async function requireAdmin(
  request: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  const user = await getCurrentUser(request)

  if (!user) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 }),
    }
  }

  if (user.role !== UserRole.ADMIN) {
    return {
      user: null,
      error: NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 }),
    }
  }

  return { user, error: null }
}
