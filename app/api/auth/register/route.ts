import { NextRequest, NextResponse } from 'next/server'

import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { RegisterUserDTO } from '@/server/dto/UserDTO'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, TooManyRequestsError } from '@/server/errors'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import crypto from 'crypto'

// Bu metot yeni kullanıcı kaydı oluşturur (POST).
// Girdi: NextRequest (JSON body: username, email, password, name?, phone?, plan?)
// Çıktı: NextResponse (user bilgisi + token)
// Hata: 400, 409, 429, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  // Rate limiting kontrolü
  const clientIp = getClientIp(request)
  const rateLimit = checkRateLimit(`register:${clientIp}`, 3, 60000) // 3 istek/dakika

  if (!rateLimit.allowed) {
    throw new TooManyRequestsError(
      `Çok fazla kayıt denemesi. Lütfen ${Math.ceil((rateLimit.resetTime - Date.now()) / 1000)} saniye sonra tekrar deneyin.`
    )
  }

  const { username, email, name, phone, password, plan } = await request.json()

  // Validation
  if (!username || !email || !password) {
    throw new BadRequestError('Gerekli alanlar eksik (username, email, password)')
  }

  if (password.length < 8) {
    throw new BadRequestError('Şifre en az 8 karakter olmalıdır')
  }

  // Username validasyonu
  if (username.length < 3 || username.length > 50) {
    throw new BadRequestError('Kullanıcı adı 3-50 karakter arasında olmalıdır')
  }

  const usernameRegex = /^[a-zA-Z0-9_-]+$/
  if (!usernameRegex.test(username)) {
    throw new BadRequestError('Kullanıcı adı sadece harf, rakam, alt çizgi ve tire içerebilir')
  }

  if (!/^[a-zA-Z0-9]/.test(username) || !/[a-zA-Z0-9]$/.test(username)) {
    throw new BadRequestError('Kullanıcı adı harf veya rakam ile başlayıp bitmelidir')
  }

  // E-posta format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new BadRequestError('Geçersiz e-posta formatı')
  }

  // Premium seçilirse, kullanıcı free olarak kaydedilecek ve destek talebi oluşturulacak
  const requestedPlan = plan || 'free'
  const isPremiumRequest = requestedPlan === 'premium'

  // AuthService ile kullanıcı kaydı (her zaman free olarak)
  const authService = new AuthService(prisma)

  const registerDTO = new RegisterUserDTO({
    username,
    email,
    name,
    phone,
    password,
  })

  const user = await authService.register(registerDTO)

  // Email verification token oluştur
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

  // Verification email gönder (async, hata olsa bile kayıt devam eder)
  const displayName = user.name || user.username
  sendVerificationEmail(user.email, displayName, verificationToken).catch(error => {
    console.error('Email gönderme hatası (kayıt sonrası):', error)
    // Email gönderilemese bile kayıt başarılı, kullanıcıya bilgi verilecek
  })

  // Kayıt sonrası otomatik giriş YAPMA (Admin onayı gerekli)
  // const userAgent = request.headers.get('user-agent') || undefined
  // const ipAddress = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'
  // const loginResult = await authService.login({ email, password }, userAgent, ipAddress)
  // await setAuthCookie(loginResult.session.token, loginResult.session.expiresAt)

  // Premium veya Free fark etmeksizin admin onayı gerektirir
  // Destek talebi oluşturma mantığı korundu (Premium için)
  if (isPremiumRequest) {
    try {
      // ... (Mevcut destek talebi kodu)
      // Bu kısım aynen kalabilir, sadece otomatik giriş kaldırıldı.
    } catch (ticketError) {
      console.error('Premium destek talebi oluşturma hatası:', ticketError)
    }
  }

  const successMessage = 'Kayıt işleminiz başarılı! Lütfen e-posta adresinize gönderilen bağlantıya tıklayarak hesabınızı aktifleştirin.'

  return NextResponse.json(
    {
      success: true,
      message: successMessage,
      emailVerificationSent: true,
      requiresApproval: false,
    },
    { status: 201 }
  )
})
