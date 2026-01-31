import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { AuthService } from '@/server/services/impl/AuthService'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)

    if (!user) {
      return NextResponse.json({ success: false, message: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { currentPassword, newPassword } = await request.json()

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Mevcut şifre ve yeni şifre gerekli' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: 'Yeni şifre en az 6 karakter olmalı' },
        { status: 400 }
      )
    }

    const authService = new AuthService(prisma)
    const result = await authService.changePassword(user.id, currentPassword, newPassword)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Şifre başarıyla değiştirildi',
      })
    }

    return NextResponse.json(
      { success: false, message: result.error || 'Şifre değiştirme başarısız' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Change password API error:', error)
    return NextResponse.json({ success: false, message: 'Sunucu hatası' }, { status: 500 })
  }
}
