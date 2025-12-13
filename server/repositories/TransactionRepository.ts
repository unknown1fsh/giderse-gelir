import { PrismaClient, Transaction, Prisma } from '@prisma/client'
import { BaseRepository } from './BaseRepository'

// Bu sınıf Transaction entity'si için veritabanı işlemlerini yönetir.
export class TransactionRepository extends BaseRepository<Transaction> {
  constructor(prisma: PrismaClient) {
    super(prisma)
  }

  // Bu metot ID'ye göre işlem getirir.
  // Girdi: İşlem ID'si
  // Çıktı: Bulunan işlem veya null
  // Hata: Prisma hataları
  async findById(id: number): Promise<Transaction | null> {
    return this.prisma.transaction.findUnique({
      where: { id },
    })
  }

  // Bu metot ID'ye göre işlemi ilişkili verilerle getirir.
  // Girdi: İşlem ID'si
  // Çıktı: İşlem ve ilişkili veriler veya null
  // Hata: Prisma hataları
  async findByIdWithRelations(id: number) {
    return this.prisma.transaction.findUnique({
      where: { id },
      include: {
        period: true,
        txType: true,
        category: true,
        paymentMethod: true,
        account: {
          include: {
            bank: true,
            currency: true,
          },
        },
        creditCard: {
          include: {
            bank: true,
            currency: true,
          },
        },
        eWallet: {
          include: {
            currency: true,
          },
        },
        beneficiary: {
          include: {
            bank: true,
          },
        },
        currency: true,
      },
    })
  }

  // Bu metot kullanıcıya ait tüm işlemleri getirir.
  // Girdi: Kullanıcı ID'si
  // Çıktı: Kullanıcının işlemleri dizisi
  // Hata: Prisma hataları
  async findByUserId(userId: number): Promise<Transaction[]> {
    return this.prisma.transaction.findMany({
      where: { userId },
      orderBy: { transactionDate: 'desc' },
    })
  }

  // Bu metot kullanıcıya ait işlemleri ilişkili verilerle ve limit ile getirir.
  // Girdi: Kullanıcı ID'si ve limit
  // Çıktı: İşlemler dizisi
  // Hata: Prisma hataları
  async findByUserIdWithRelations(userId: number, limit?: number) {
    return this.prisma.transaction.findMany({
      where: { userId },
      include: {
        period: true,
        txType: true,
        category: true,
        paymentMethod: true,
        account: {
          include: {
            bank: true,
            currency: true,
          },
        },
        creditCard: {
          include: {
            bank: true,
            currency: true,
          },
        },
        eWallet: {
          include: {
            currency: true,
          },
        },
        beneficiary: {
          include: {
            bank: true,
          },
        },
        currency: true,
      },
      orderBy: { transactionDate: 'desc' },
      take: limit,
    })
  }

  // Bu metot kullanıcının belirli aydaki işlem sayısını getirir.
  // Girdi: Kullanıcı ID'si ve başlangıç tarihi
  // Çıktı: İşlem sayısı
  // Hata: Prisma hataları
  async countByUserIdAndMonth(userId: number, startDate: Date): Promise<number> {
    return this.prisma.transaction.count({
      where: {
        userId,
        createdAt: {
          gte: startDate,
        },
      },
    })
  }

  // Bu metot tüm işlemleri getirir.
  // Girdi: -
  // Çıktı: Tüm işlemler dizisi
  // Hata: Prisma hataları
  async findAll(): Promise<Transaction[]> {
    return this.prisma.transaction.findMany()
  }

  // Bu metot yeni işlem oluşturur.
  // Girdi: İşlem verileri
  // Çıktı: Oluşturulan işlem
  // Hata: Prisma hataları
  async create(data: Prisma.TransactionCreateInput): Promise<Transaction> {
    return this.prisma.transaction.create({
      data,
    })
  }

  // Bu metot işlem oluşturur ve ilişkili verilerle döner.
  // Girdi: İşlem verileri
  // Çıktı: Oluşturulan işlem ve ilişkili veriler
  // Hata: Prisma hataları
  async createWithRelations(data: Prisma.TransactionCreateInput) {
    return this.prisma.transaction.create({
      data,
      include: {
        period: true,
        txType: true,
        category: true,
        paymentMethod: true,
        account: {
          include: {
            bank: true,
            currency: true,
          },
        },
        creditCard: {
          include: {
            bank: true,
            currency: true,
          },
        },
        eWallet: {
          include: {
            currency: true,
          },
        },
        beneficiary: {
          include: {
            bank: true,
          },
        },
        currency: true,
      },
    })
  }

  // Bu metot işlem bilgilerini günceller.
  // Girdi: İşlem ID'si ve güncellenecek veriler
  // Çıktı: Güncellenmiş işlem
  // Hata: Prisma hataları
  async update(id: number, data: Partial<Transaction>): Promise<Transaction> {
    return this.prisma.transaction.update({
      where: { id },
      data: data as never,
    })
  }

  // Bu metot işlemi siler.
  // Girdi: İşlem ID'si
  // Çıktı: Silinen işlem
  // Hata: Prisma hataları
  async delete(id: number): Promise<Transaction> {
    return this.prisma.transaction.delete({
      where: { id },
    })
  }
}
