import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import { ExceptionMapper } from '@/server/errors'
import crypto from 'crypto'

// Bu metot şifre sıfırlama talebi oluşturur (POST).
// Girdi: NextRequest (JSON body: email)
// Çıktı: NextResponse (success message)
// Hata: 400, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
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

  // Token'ı veritabanına kaydet (Yeni şema alanlarını kullanarak)
  await prisma.user.update({
    where: { id: user.id },
    data: {
      resetPasswordToken: resetToken,
      resetPasswordExpiry: resetTokenExpiry,
    },
  })

  // Şifre sıfırlama e-postası gönder
  const displayName = user.name || user.username
  await sendPasswordResetEmail(user.email, displayName, resetToken).catch(error => {
    console.error('Şifre sıfırlama emaili gönderme hatası:', error)
    // Hata olsa bile kullanıcıya başarılı mesajı dönüyoruz (güvenlik/UX tercihi)
  })

  return NextResponse.json({
    success: true,
    message: 'Şifre sıfırlama bağlantısı e-posta adresinize gönderildi.',
  })
})
