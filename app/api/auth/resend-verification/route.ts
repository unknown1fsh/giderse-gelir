import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/email'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'
import crypto from 'crypto'

// Bu metot email doğrulama email'ini yeniden gönderir (POST).
// Girdi: NextRequest (JSON body: email)
// Çıktı: NextResponse (success message)
// Hata: 400, 404, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const body = (await request.json()) as { email?: string }
  const { email } = body

  if (!email) {
    throw new BadRequestError('E-posta adresi gerekli')
  }

  // Kullanıcıyı bul
  const user = await prisma.user.findUnique({
    where: { email: String(email).toLowerCase() },
  })

  if (!user) {
    // Güvenlik için kullanıcı bulunamasa bile başarılı mesajı döndür
    return NextResponse.json({
      success: true,
      message:
        'Eğer bu e-posta adresi sistemimizde kayıtlıysa, doğrulama e-postası gönderilecektir.',
    })
  }

  // Email zaten doğrulanmış mı kontrol et
  if (user.emailVerified) {
    return NextResponse.json(
      {
        success: true,
        message: 'E-posta adresiniz zaten doğrulanmış',
      },
      { status: 200 }
    )
  }

  // Yeni verification token oluştur
  const verificationToken = crypto.randomBytes(32).toString('hex')
  const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 saat

  // Token'ı veritabanına kaydet
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerificationToken: verificationToken,
      emailVerificationExpiry: verificationExpiry,
    },
  })

  // Email gönder (hata olsa bile başarılı mesaj döndür)
  const { getDisplayName } = await import('@/lib/utils')
  const displayName = getDisplayName(user)
  await sendVerificationEmail(user.email, displayName, verificationToken).catch(error => {
    console.error('Email gönderme hatası:', error)
    // Hata olsa bile sessizce devam et
  })

  return NextResponse.json({
    success: true,
    message: 'Doğrulama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.',
  })
})
