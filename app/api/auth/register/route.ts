import { NextRequest, NextResponse } from 'next/server'
import { setAuthCookie } from '@/lib/auth-refactored'
import { prisma } from '@/lib/prisma'
import { AuthService } from '@/server/services/impl/AuthService'
import { RegisterUserDTO } from '@/server/dto/UserDTO'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, TooManyRequestsError } from '@/server/errors'
import { sendVerificationEmail } from '@/lib/email'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'
import crypto from 'crypto'

// Bu metot yeni kullanıcı kaydı oluşturur (POST).
// Girdi: NextRequest (JSON body: name, email, password, phone?, plan?)
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

  const { name, email, phone, password, plan } = await request.json()

  // Validation
  if (!name || !email || !password) {
    throw new BadRequestError('Gerekli alanlar eksik (name, email, password)')
  }

  if (password.length < 8) {
    throw new BadRequestError('Şifre en az 8 karakter olmalıdır')
  }

  // E-posta format kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    throw new BadRequestError('Geçersiz e-posta formatı')
  }

  // Premium seçilirse, kullanıcı free olarak kaydedilecek ve destek talebi oluşturulacak
  const requestedPlan = plan || 'free'
  const actualPlan = requestedPlan === 'premium' ? 'free' : requestedPlan
  const isPremiumRequest = requestedPlan === 'premium'

  // AuthService ile kullanıcı kaydı (her zaman free olarak)
  const authService = new AuthService(prisma)

  const registerDTO = new RegisterUserDTO({
    name,
    email,
    phone,
    password,
    plan: actualPlan,
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
  sendVerificationEmail(user.email, user.name, verificationToken).catch(error => {
    console.error('Email gönderme hatası (kayıt sonrası):', error)
    // Email gönderilemese bile kayıt başarılı, kullanıcıya bilgi verilecek
  })

  // Kayıt sonrası otomatik giriş
  const userAgent = request.headers.get('user-agent') || undefined
  const ipAddress =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1'

  const loginResult = await authService.login({ email, password }, userAgent, ipAddress)

  // Cookie ayarla
  await setAuthCookie(loginResult.session.token, loginResult.session.expiresAt)

  // Premium isteği varsa destek talebi oluştur
  if (isPremiumRequest) {
    try {
      // Üyelik kategorisini bul (veya ilk aktif kategoriyi kullan)
      const membershipCategory = await prisma.supportTicketCategory.findFirst({
        where: {
          isActive: true,
          name: {
            contains: 'Üyelik',
            mode: 'insensitive',
          },
        },
      })

      const category =
        membershipCategory ||
        (await prisma.supportTicketCategory.findFirst({
          where: {
            isActive: true,
          },
          orderBy: {
            name: 'asc',
          },
        }))

      if (category) {
        // Benzersiz ticket number oluştur
        function generateTicketNumber(): string {
          const now = new Date()
          const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
          const random = Math.floor(100000 + Math.random() * 900000)
          return `SUP-${dateStr}-${random}`
        }

        let ticketNumber = generateTicketNumber()
        let exists = await prisma.supportTicket.findUnique({
          where: { ticketNumber },
        })

        while (exists) {
          ticketNumber = generateTicketNumber()
          exists = await prisma.supportTicket.findUnique({
            where: { ticketNumber },
          })
        }

        const subject = 'Premium üyelik talebi'
        const description = `Kayıt sırasında Premium üyelik seçildi.

Kullanıcı Bilgileri:
- Ad Soyad: ${name}
- E-posta: ${email}
- Telefon: ${phone || 'Belirtilmemiş'}

Plan: Premium
Kayıt Tarihi: ${new Date().toLocaleString('tr-TR')}

Not: Kullanıcı şu anda Free üye olarak kaydedilmiştir. Premium üyeliği admin onayından sonra aktif edilecektir.`

        // Destek talebini oluştur
        await prisma.supportTicket.create({
          data: {
            ticketNumber,
            userId: user.id,
            categoryId: category.id,
            subject,
            description,
            status: 'pending',
            priority: 'high',
          },
        })

        // Admin'lere bildirim gönder (async, hata olsa bile devam eder)
        const { sendAdminNewTicketNotification } = await import('@/lib/email')
        const admins = await prisma.user.findMany({
          where: {
            role: 'ADMIN',
            isActive: true,
          },
          select: {
            email: true,
          },
        })

        for (const admin of admins) {
          sendAdminNewTicketNotification(
            admin.email,
            ticketNumber,
            name,
            email,
            subject,
            category.name
          ).catch(error => {
            console.error('Admin bildirim email hatası:', error)
          })
        }
      }
    } catch (ticketError) {
      console.error('Premium destek talebi oluşturma hatası:', ticketError)
      // Destek talebi oluşturulamasa bile kayıt başarılı
    }
  }

  const successMessage = isPremiumRequest
    ? 'Kayıt başarılı ve giriş yapıldı. Premium üyelik talebiniz admin onayına gönderildi. Lütfen e-posta adresinizi doğrulayın.'
    : 'Kayıt başarılı ve giriş yapıldı. Lütfen e-posta adresinizi doğrulayın.'

  return NextResponse.json(
    {
      success: true,
      user: loginResult.user,
      session: loginResult.session,
      message: successMessage,
      emailVerificationSent: true,
      premiumRequestCreated: isPremiumRequest,
    },
    { status: 201 }
  )
})
