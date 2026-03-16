import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, NotFoundError } from '@/server/errors'

// Bu metot email doğrulama token'ı ile kullanıcının email'ini doğrular (POST).
// Girdi: NextRequest (JSON body: token)
// Çıktı: NextResponse (success message)
// Hata: 400, 404, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const { token } = await request.json()

  if (!token) {
    throw new BadRequestError("Doğrulama token'ı gerekli")
  }

  // Kullanıcıyı token ile bul
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiry: {
        gt: new Date(), // Token süresi dolmamış
      },
    },
  })

  if (!user) {
    throw new NotFoundError("Geçersiz veya süresi dolmuş doğrulama token'ı")
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

  // Email'i doğrula ve hesabı aktifleştir
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      isActive: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  })

  return NextResponse.json(
    {
      success: true,
      message: 'E-posta adresiniz başarıyla doğrulandı',
    },
    { status: 200 }
  )
})

// GET endpoint - URL'den token almak için
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const searchParams = request.nextUrl.searchParams
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=no-token', request.url))
  }

  // Kullanıcıyı token ile bul
  const user = await prisma.user.findFirst({
    where: {
      emailVerificationToken: token,
      emailVerificationExpiry: {
        gt: new Date(),
      },
    },
  })

  if (!user) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=invalid-token', request.url))
  }

  // Email zaten doğrulanmış mı kontrol et
  if (user.emailVerified) {
    return NextResponse.redirect(new URL('/auth/verify-email?error=already-verified', request.url))
  }

  // Email'i doğrula ve hesabı aktifleştir
  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      isActive: true,
      emailVerificationToken: null,
      emailVerificationExpiry: null,
    },
  })

  return NextResponse.redirect(new URL('/auth/verify-email?success=true', request.url))
})
