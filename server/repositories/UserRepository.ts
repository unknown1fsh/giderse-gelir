import { PrismaClient, User } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

// Bu sınıf User entity'si için veritabanı işlemlerini yönetir.
export class UserRepository extends BaseRepository<User> {
  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  // Bu metot ID'ye göre kullanıcı getirir.
  // Girdi: Kullanıcı ID'si
  // Çıktı: Bulunan kullanıcı veya null
  // Hata: Prisma hataları
  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    })
  }

  // Bu metot e-posta adresine göre kullanıcı getirir.
  // Girdi: E-posta adresi
  // Çıktı: Bulunan kullanıcı veya null
  // Hata: Prisma hataları
  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    })
  }

  // Bu metot kullanıcı adına göre kullanıcı getirir.
  // Girdi: Kullanıcı adı
  // Çıktı: Bulunan kullanıcı veya null
  // Hata: Prisma hataları
  async findByUsername(username: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { username },
    })
  }

  // Bu metot kullanıcıyı subscriptions ile birlikte getirir.
  // Girdi: Kullanıcı ID'si
  // Çıktı: Kullanıcı ve aktif subscription'ları
  // Hata: Prisma hataları
  async findByIdWithSubscriptions(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
  }

  // Bu metot e-posta ile kullanıcıyı subscriptions ile birlikte getirir.
  // Girdi: E-posta adresi
  // Çıktı: Kullanıcı ve aktif subscription'ları
  // Hata: Prisma hataları
  async findByEmailWithSubscriptions(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
  }

  // Bu metot tüm kullanıcıları getirir.
  // Girdi: -
  // Çıktı: Tüm kullanıcılar dizisi
  // Hata: Prisma hataları
  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany()
  }

  // Bu metot yeni kullanıcı oluşturur.
  // Girdi: Kullanıcı verileri
  // Çıktı: Oluşturulan kullanıcı
  // Hata: Prisma hataları (unique constraint vb.)
  async create(data: Partial<User>): Promise<User> {
    return this.prisma.user.create({
      data: data as never,
    })
  }

  // Bu metot kullanıcı bilgilerini günceller.
  // Girdi: Kullanıcı ID'si ve güncellenecek veriler
  // Çıktı: Güncellenmiş kullanıcı
  // Hata: Prisma hataları
  async update(id: number, data: Partial<User>): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: data as never,
    })
  }

  // Bu metot kullanıcıyı siler.
  // Girdi: Kullanıcı ID'si
  // Çıktı: Silinen kullanıcı
  // Hata: Prisma hataları
  async delete(id: number): Promise<User> {
    return this.prisma.user.delete({
      where: { id },
    })
  }

  // Bu metot kullanıcının son giriş zamanını günceller.
  // Girdi: Kullanıcı ID'si
  // Çıktı: Güncellenmiş kullanıcı
  // Hata: Prisma hataları
  async updateLastLogin(id: number): Promise<User> {
    return this.prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    })
  }
}
