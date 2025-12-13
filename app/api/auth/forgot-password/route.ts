import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email: string }
    const { email } = body

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'E-posta adresi gerekli' },
        { status: 400 }
      )
    }

    // Kullanıcıyı bul
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    // Güvenlik için kullanıcı bulunamasa bile başarılı mesajı döndür
    // (E-posta adresinin sistemde olup olmadığını açığa çıkarma)
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          'Eğer bu e-posta adresi sistemimizde kayıtlıysa, şifre sıfırlama bağlantısı gönderilecektir.',
      })
    }

    // Reset token oluştur
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 saat

    // Token'ı veritabanına kaydet
    // Not: User modelinde resetToken/resetTokenExpiry alanları yoksa 500 hatası oluşuyordu.
    // Bu yüzden token'ı settings JSON'u altında saklıyoruz.
    const currentSettings = (user.settings as any) || {}
    await prisma.user.update({
      where: { id: user.id },
      data: {
        settings: {
          ...currentSettings,
          passwordReset: {
            token: resetToken,
            expiresAt: resetTokenExpiry.toISOString(),
          },
        },
      },
    })

    // TODO: Gerçek uygulamada burada e-posta gönderilmeli
    // Şimdilik sadece başarılı response döndür
    // console.log(`Password reset token for ${email}: ${resetToken}`)
    // console.log(`Reset URL: ${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`)

    return NextResponse.json({
      success: true,
      message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { success: false, message: 'Bir hata oluştu. Lütfen tekrar deneyin.' },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
