import { NextRequest } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'

const prisma = new PrismaClient()

export interface User {
  id: number
  email: string
  name?: string | null
  phone?: string
  avatar?: string
  plan: string
  isActive: boolean
  createdAt: Date
  lastLoginAt?: Date
}

export interface Session {
  id: string
  userId: number
  token: string
  expiresAt: Date
  isActive: boolean
}

// JWT Secret - Production'da environment variable'dan alınmalı
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'

// Session süresi (30 gün)
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000 // 30 gün

export class AuthService {
  // Kullanıcı kaydı
  static async register(data: {
    name: string
    email: string
    phone?: string
    password: string
    plan?: string
  }) {
    try {
      // E-posta kontrolü
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      })

      if (existingUser) {
        throw new Error('Bu e-posta adresi zaten kullanılıyor')
      }

      // Email'den username oluştur
      const emailPrefix = data.email.split('@')[0].toLowerCase()
      let baseUsername = emailPrefix.replace(/[^a-z0-9_]/g, '_')
      if (baseUsername.length < 3) {
        baseUsername = 'user_' + baseUsername
      }
      // 50 karakter sınırına uy (sayaç için yer bırak)
      if (baseUsername.length > 45) {
        baseUsername = baseUsername.substring(0, 45)
      }

      // Benzersiz username oluştur
      let username = baseUsername
      let counter = 1
      let existingUserByUsername = await prisma.user.findUnique({
        where: { username },
      })

      while (existingUserByUsername) {
        const counterSuffix = `_${counter}`
        // Toplam uzunluğu 50 karakteri aşmaması için kısalt
        const maxBaseLength = 50 - counterSuffix.length
        username = `${baseUsername.substring(0, maxBaseLength)}${counterSuffix}`
        existingUserByUsername = await prisma.user.findUnique({
          where: { username },
        })
        counter++
        // Sonsuz döngü önleme
        if (counter > 1000) {
          username = `user_${Date.now()}`.substring(0, 50)
          break
        }
      }

      // Şifre hash'leme
      const passwordHash = await bcrypt.hash(data.password, 12)

      // Kullanıcı oluştur
      const user = await prisma.user.create({
        data: {
          username,
          name: data.name,
          email: data.email,
          phone: data.phone,
          passwordHash,
          // plan: data.plan || 'free', // TODO: User modelinde yok, UserSubscription'da tutuluyor
        },
      })

      // Varsayılan ücretsiz abonelik oluştur
      if (data.plan === 'free' || !data.plan) {
        await prisma.userSubscription.create({
          data: {
            userId: user.id,
            planId: 'free',
            status: 'active',
            startDate: new Date(),
            endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 yıl
            amount: 0,
            currency: 'TRY',
          },
        })
      }

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          phone: user.phone ?? undefined,
          avatar: user.avatar ?? undefined,
          // plan: data.plan || 'free', // TODO: User modelinde yok, UserSubscription'da tutuluyor
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt ?? undefined,
        },
      }
    } catch (error) {
      console.error('Register error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Kayıt işlemi başarısız',
      }
    }
  }

  // Kullanıcı girişi
  static async login(email: string, password: string, userAgent?: string, ipAddress?: string) {
    try {
      // Kullanıcıyı bul
      const user = await prisma.user.findUnique({
        where: { email },
        include: {
          subscriptions: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })

      if (!user) {
        throw new Error('Geçersiz e-posta veya şifre')
      }

      if (!user.isActive) {
        throw new Error('Hesabınız deaktif edilmiş')
      }

      // Şifre kontrolü
      const isValidPassword = await bcrypt.compare(password, user.passwordHash)
      if (!isValidPassword) {
        throw new Error('Geçersiz e-posta veya şifre')
      }

      // JWT token oluştur
      const token = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          plan: user.subscriptions[0]?.planId || 'free',
        },
        JWT_SECRET,
        { expiresIn: '30d' }
      )

      // Session oluştur
      const session = await prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt: new Date(Date.now() + SESSION_DURATION),
          userAgent,
          ipAddress,
        },
      })

      // Son giriş tarihini güncelle
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      })

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          phone: user.phone ?? undefined,
          avatar: user.avatar ?? undefined,
          plan: user.subscriptions[0]?.planId || 'free',
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: new Date(),
        },
        session: {
          id: session.id,
          token: session.token,
          expiresAt: session.expiresAt,
        },
      }
    } catch (error) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Giriş işlemi başarısız',
      }
    }
  }

  // Session doğrulama
  static async validateSession(token: string): Promise<User | null> {
    try {
      // JWT token doğrula
      jwt.verify(token, JWT_SECRET) // Token doğrulama için kullanılıyor

      // Session'ı veritabanından kontrol et
      const session = await prisma.userSession.findUnique({
        where: { token },
        include: {
          user: {
            include: {
              subscriptions: {
                where: { status: 'active' },
                orderBy: { createdAt: 'desc' },
                take: 1,
              },
            },
          },
        },
      })

      if (!session || !session.isActive || session.expiresAt < new Date()) {
        return null
      }

      if (!session.user.isActive) {
        return null
      }

      return {
        id: session.user.id,
        name: session.user.name ?? undefined,
        email: session.user.email,
        phone: session.user.phone ?? undefined,
        avatar: session.user.avatar ?? undefined,
        plan: session.user.subscriptions[0]?.planId || 'free',
        isActive: session.user.isActive,
        createdAt: session.user.createdAt,
        lastLoginAt: session.user.lastLoginAt ?? undefined,
      }
    } catch (error) {
      console.error('Session validation error:', error)
      return null
    }
  }

  // Çıkış yapma
  static async logout(token: string) {
    try {
      await prisma.userSession.updateMany({
        where: { token },
        data: { isActive: false },
      })

      return { success: true }
    } catch (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Çıkış işlemi başarısız' }
    }
  }

  // Tüm session'ları temizle
  static async logoutAll(userId: number) {
    try {
      await prisma.userSession.updateMany({
        where: { userId },
        data: { isActive: false },
      })

      return { success: true }
    } catch (error) {
      console.error('Logout all error:', error)
      return { success: false, error: 'Çıkış işlemi başarısız' }
    }
  }

  // Kullanıcı bilgilerini güncelle
  static async updateUser(
    userId: number,
    data: {
      name?: string
      phone?: string
      avatar?: string
      timezone?: string
      notifications?: any
      settings?: any
    }
  ) {
    try {
      const user = await prisma.user.update({
        where: { id: userId },
        data,
      })

      return {
        success: true,
        user: {
          id: user.id,
          name: user.name ?? undefined,
          email: user.email,
          phone: user.phone ?? undefined,
          avatar: user.avatar ?? undefined,
          plan: 'free', // Bu bilgi subscription'dan alınmalı
          isActive: user.isActive,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt ?? undefined,
        },
      }
    } catch (error) {
      console.error('Update user error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Güncelleme başarısız',
      }
    }
  }

  // Şifre değiştirme
  static async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('Kullanıcı bulunamadı')
      }

      // Mevcut şifre kontrolü
      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isValidPassword) {
        throw new Error('Mevcut şifre yanlış')
      }

      // Yeni şifre hash'leme
      const newPasswordHash = await bcrypt.hash(newPassword, 12)

      // Şifreyi güncelle
      await prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      })

      // Tüm session'ları temizle (güvenlik için)
      await this.logoutAll(userId)

      return { success: true }
    } catch (error) {
      console.error('Change password error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Şifre değiştirme başarısız',
      }
    }
  }
}

// Middleware için yardımcı fonksiyonlar
export async function getCurrentUser(request: NextRequest): Promise<User | null> {
  try {
    const token = request.cookies.get('auth-token')?.value

    if (!token) {
      return null
    }

    return await AuthService.validateSession(token)
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

// Basit token kontrolü (Edge runtime için)
export function hasValidToken(request: NextRequest): boolean {
  const token = request.cookies.get('auth-token')?.value
  return !!token
}

export async function setAuthCookie(token: string, expiresAt: Date) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    expires: expiresAt,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}
