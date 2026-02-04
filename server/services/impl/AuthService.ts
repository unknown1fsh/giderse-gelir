import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import { UserRepository } from '../../repositories/UserRepository'
import { UserService } from './UserService'
import { UserMapper } from '../../mappers/UserMapper'
import { UserDTO, RegisterUserDTO, LoginUserDTO } from '../../dto/UserDTO'
import { UnauthorizedError, ConflictError } from '../../errors'
import { PlanId } from '../../enums'

interface SessionData {
  id: string
  token: string
  expiresAt: Date
}

interface LoginResult {
  user: UserDTO
  session: SessionData
}

// Bu sınıf kimlik doğrulama iş mantığını yönetir.
export class AuthService {
  private prisma: PrismaClient
  private userRepository: UserRepository
  private userService: UserService
  private jwtSecret: string
  private sessionDurationDays: number

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
    this.userRepository = new UserRepository(prisma)
    this.userService = new UserService(prisma)
    this.jwtSecret = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'
    this.sessionDurationDays = parseInt(process.env.SESSION_DURATION_DAYS || '30', 10)
  }

  // Bu metot kullanıcı kaydı oluşturur.
  // Girdi: RegisterUserDTO
  // Çıktı: UserDTO
  // Hata: ConflictError
  async register(data: RegisterUserDTO): Promise<UserDTO> {
    // Email kontrolü
    const existingUserByEmail = await this.userRepository.findByEmail(data.email)
    if (existingUserByEmail) {
      throw new ConflictError('Bu e-posta adresi zaten kullanılıyor')
    }

    // Username kontrolü
    const existingUserByUsername = await this.userRepository.findByUsername(data.username)
    if (existingUserByUsername) {
      throw new ConflictError('Bu kullanıcı adı zaten kullanılıyor')
    }

    const user = await this.userService.create(data)

    await this.prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: PlanId.FREE, // Her zaman free olarak başlat
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        amount: 0,
        currency: 'TRY',
      },
    })

    // ✅ Otomatik Nakit Hesabı Oluştur
    await this.createDefaultCashAccount(user.id)

    return user
  }

  // Bu metot her kullanıcı için otomatik "Nakit" hesabı oluşturur
  // Girdi: userId
  // Çıktı: void
  // Hata: -
  private async createDefaultCashAccount(userId: number): Promise<void> {
    // TRY para birimini bul
    const tryCurrency = await this.prisma.refCurrency.findFirst({
      where: { code: 'TRY' },
    })

    if (!tryCurrency) {
      return // TRY bulunamazsa nakit hesabı oluşturma
    }

    // Nakit için varsayılan bir "banka" oluştur veya bul
    let cashBank = await this.prisma.refBank.findFirst({
      where: { name: 'Nakit' },
    })

    if (!cashBank) {
      cashBank = await this.prisma.refBank.create({
        data: {
          name: 'Nakit',
          asciiName: 'Nakit',
          swiftBic: null,
          bankCode: null,
          website: null,
          active: true,
        },
      })
    }

    // Vadesiz hesap tipini bul
    const accountType = await this.prisma.refAccountType.findFirst({
      where: { code: 'VADESIZ' },
    })

    if (!accountType) {
      return
    }

    // Nakit hesabı oluştur
    await this.prisma.account.create({
      data: {
        userId,
        name: 'Nakit',
        bankId: cashBank.id,
        accountTypeId: accountType.id,
        currencyId: tryCurrency.id,
        balance: 0, // Başlangıçta 0
        active: true,
      },
    })
  }

  // Bu metot kullanıcı girişi yapar.
  // Girdi: LoginUserDTO, userAgent, ipAddress
  // Çıktı: LoginResult
  // Hata: UnauthorizedError
  async login(data: LoginUserDTO, userAgent?: string, ipAddress?: string): Promise<LoginResult> {
    try {
      const user = await this.userRepository.findByEmailWithSubscriptions(data.email)
      if (!user) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Login başarısız - kullanıcı bulunamadı:', data.email)
        throw new UnauthorizedError('Geçersiz e-posta veya şifre')
      }

      if (!user.isActive) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Login başarısız - kullanıcı aktif değil:', user.id)
        throw new UnauthorizedError('Hesabınız deaktif edilmiş')
      }

      const isValidPassword = await bcrypt.compare(data.password, user.passwordHash)
      if (!isValidPassword) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Login başarısız - şifre yanlış:', user.id)
        throw new UnauthorizedError('Geçersiz e-posta veya şifre')
      }

      const plan = user.subscriptions[0]?.planId || PlanId.FREE

      // Önceki aktif sessionları pasif hale getir (her kullanıcı tek session)
      await this.prisma.userSession.updateMany({
        where: { userId: user.id, isActive: true },
        data: { isActive: false },
      })

      const token = this.generateToken(user.id, user.email, plan)
      const expiresAt = new Date(Date.now() + this.sessionDurationDays * 24 * 60 * 60 * 1000)

      const session = await this.prisma.userSession.create({
        data: {
          userId: user.id,
          token,
          expiresAt,
          userAgent,
          ipAddress,
        },
      })

      // Aktif dönem yoksa, kullanıcının ilk aktif dönemini otomatik ata
      const activePeriod = await this.prisma.period.findFirst({
        where: { userId: user.id, isActive: true, isClosed: false },
        orderBy: { startDate: 'desc' },
      })
      if (activePeriod) {
        await this.prisma.userSession.update({
          where: { id: session.id },
          data: { activePeriodId: activePeriod.id },
        })
      }

      await this.userService.updateLastLogin(user.id)

      // eslint-disable-next-line no-console
      console.log('[AUTH] Login başarılı:', {
        userId: user.id,
        email: user.email,
        sessionId: session.id,
        expiresAt: expiresAt.toISOString(),
      })

      return {
        user: UserMapper.prismaToDTO(user),
        session: {
          id: session.id,
          token: session.token,
          expiresAt: session.expiresAt,
        },
      }
    } catch (error) {
      if (error instanceof UnauthorizedError) {
        throw error
      }
      console.error('[AUTH] Login error:', error)
      throw new UnauthorizedError('Giriş yapılırken bir hata oluştu')
    }
  }

  // Bu metot JWT token oluşturur.
  // Girdi: userId, email, plan
  // Çıktı: JWT token
  // Hata: -
  private generateToken(userId: number, email: string, plan: string): string {
    // Her token'ın unique olması için iat (issued at) ekle
    return jwt.sign(
      {
        userId,
        email,
        plan,
        iat: Math.floor(Date.now() / 1000), // Unix timestamp (seconds)
        nonce: Math.random().toString(36).substring(7), // Ekstra uniqueness
      },
      this.jwtSecret,
      {
        expiresIn: `${this.sessionDurationDays}d`,
      }
    )
  }

  // Bu metot JWT token'ı doğrular.
  // Girdi: token
  // Çıktı: Decoded token veya null
  // Hata: -
  private verifyToken(token: string): { userId: number; email: string; plan: string } | null {
    try {
      return jwt.verify(token, this.jwtSecret) as {
        userId: number
        email: string
        plan: string
      }
    } catch {
      return null
    }
  }

  // Bu metot session'ı doğrular.
  // Girdi: token
  // Çıktı: UserDTO veya null
  // Hata: -
  async validateSession(token: string): Promise<UserDTO | null> {
    try {
      const decoded = this.verifyToken(token)
      if (!decoded) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Token doğrulanamadı - JWT geçersiz veya süresi dolmuş')
        return null
      }

      const session = await this.prisma.userSession.findUnique({
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

      if (!session) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Session bulunamadı - token veritabanında yok')
        return null
      }

      if (!session.isActive) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Session aktif değil - isActive: false')
        return null
      }

      if (session.expiresAt < new Date()) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Session süresi dolmuş - expiresAt:', session.expiresAt.toISOString())
        return null
      }

      if (!session.user.isActive) {
        // eslint-disable-next-line no-console
        console.log('[AUTH] Kullanıcı aktif değil - userId:', session.userId)
        return null
      }

      const userDTO = UserMapper.prismaToDTO(session.user)

      // eslint-disable-next-line no-console
      console.log('🔐 User authenticated:', {
        id: userDTO.id,
        email: userDTO.email,
        plan: userDTO.plan,
        hasActiveSubscription: session.user.subscriptions.length > 0,
        subscriptionPlan: session.user.subscriptions[0]?.planId || 'none',
      })

      return userDTO
    } catch (error) {
      console.error('[AUTH] validateSession error:', error)
      return null
    }
  }

  // Bu metot çıkış yapar.
  // Girdi: token
  // Çıktı: void
  // Hata: -
  async logout(token: string): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { token },
      data: { isActive: false },
    })
  }

  // Bu metot kullanıcı bilgilerini günceller.
  async updateUser(
    userId: number,
    data: {
      name?: string
      username?: string
      phone?: string
      avatar?: string
      timezone?: string
      notifications?: any
      settings?: any
    }
  ): Promise<{ success: boolean; user?: UserDTO; error?: string }> {
    try {
      if (data.username) {
        const currentUser = await this.userRepository.findById(userId)
        if (!currentUser) {
          throw new Error('Kullanıcı bulunamadı')
        }

        if (data.username !== currentUser.username) {
          if (currentUser.usernameChangeCount >= 1) {
            throw new Error('Kullanıcı adınızı sadece 1 kez değiştirebilirsiniz.')
          }

          const existingUser = await this.userRepository.findByUsername(data.username)
          if (existingUser) {
            throw new Error('Bu kullanıcı adı zaten alınmış.')
          }

          ; (data as any).usernameChangeCount = { increment: 1 }
        } else {
          delete data.username
        }
      }

      const user = await this.prisma.user.update({
        where: { id: userId },
        data,
        include: {
          subscriptions: {
            where: { status: 'active' },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      })

      return {
        success: true,
        user: UserMapper.prismaToDTO(user),
      }
    } catch (error) {
      console.error('[AUTH] Update user error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Güncelleme başarısız',
      }
    }
  }

  // Bu metot kullanıcının şifresini değiştirir.
  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      })

      if (!user) {
        throw new Error('Kullanıcı bulunamadı')
      }

      const isValidPassword = await bcrypt.compare(currentPassword, user.passwordHash)
      if (!isValidPassword) {
        throw new Error('Mevcut şifre yanlış')
      }

      const newPasswordHash = await bcrypt.hash(newPassword, 12)

      await this.prisma.user.update({
        where: { id: userId },
        data: { passwordHash: newPasswordHash },
      })

      await this.logoutAll(userId)

      return { success: true }
    } catch (error) {
      console.error('[AUTH] Change password error:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Şifre değiştirme başarısız',
      }
    }
  }

  // Bu metot tüm session'ları sonlandırır.
  // Girdi: userId
  // Çıktı: void
  // Hata: -
  async logoutAll(userId: number): Promise<void> {
    await this.prisma.userSession.updateMany({
      where: { userId },
      data: { isActive: false },
    })
  }
}
