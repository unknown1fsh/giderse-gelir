import { PrismaClient, Prisma } from '@prisma/client'
import { BaseService } from '../BaseService'
import { TransactionRepository } from '../../repositories/TransactionRepository'
import { TransactionMapper } from '../../mappers/TransactionMapper'
import { TransactionDTO, CreateTransactionDTO } from '../../dto/TransactionDTO'
import { TransactionValidationService } from './TransactionValidationService'
import { LoanService } from './LoanService'
import { ValidationError } from '../../errors'
import { getPlanLimits } from '../../../lib/plan-config'

// Bu sınıf işlem (transaction) iş mantığını yönetir.
export class TransactionService extends BaseService<TransactionDTO> {
  private prisma: PrismaClient
  private transactionRepository: TransactionRepository
  private validationService: TransactionValidationService
  private loanService: LoanService

  constructor(prisma: PrismaClient) {
    super()
    this.prisma = prisma
    this.transactionRepository = new TransactionRepository(prisma)
    this.validationService = new TransactionValidationService(prisma)
    this.loanService = new LoanService(prisma)
  }

  // Bu metot ID'ye göre işlem getirir.
  // Girdi: İşlem ID'si
  // Çıktı: TransactionDTO veya null
  // Hata: NotFoundError
  async findById(id: number): Promise<TransactionDTO | null> {
    const transaction = await this.transactionRepository.findById(id)
    if (!transaction) {
      return null
    }
    return TransactionMapper.prismaToDTO(transaction)
  }

  // Bu metot ID'ye göre işlemi ilişkili verilerle getirir.
  // Girdi: İşlem ID'si
  // Çıktı: İşlem ve ilişkili veriler veya null
  // Hata: NotFoundError
  async findByIdWithRelations(id: number) {
    return this.transactionRepository.findByIdWithRelations(id)
  }

  // Bu metot kullanıcıya ait işlemleri getirir.
  // Girdi: Kullanıcı ID'si ve opsiyonel limit
  // Çıktı: İşlemler dizisi
  // Hata: -
  async findByUserId(userId: number, limit?: number) {
    return this.transactionRepository.findByUserIdWithRelations(userId, limit)
  }

  // Bu metot tüm işlemleri getirir.
  // Girdi: -
  // Çıktı: TransactionDTO dizisi
  // Hata: -
  async findAll(): Promise<TransactionDTO[]> {
    const transactions = await this.transactionRepository.findAll()
    return transactions.map(tx => TransactionMapper.prismaToDTO(tx))
  }

  // Bu metot yeni işlem oluşturur.
  // Girdi: CreateTransactionDTO ve kullanıcı ID'si
  // Çıktı: Oluşturulan işlem
  // Hata: ValidationError, BusinessRuleError
  async create(data: CreateTransactionDTO & { userId: number; periodId?: number; loanId?: number }) {
    // ✅ ÖNEMLİ: Tüm validasyonları çalıştır
    await this.validationService.validateTransaction({
      txTypeId: data.txTypeId,
      categoryId: data.categoryId,
      accountId: data.accountId,
      creditCardId: data.creditCardId,
      eWalletId: data.eWalletId,
      paymentMethodId: data.paymentMethodId,
      amount: data.amount,
      transactionDate: data.transactionDate,
    })

    // PAYMENT_METHOD UI'dan SystemParameter ID olarak gelir, RefPaymentMethod ID'ye map edilir.
    // CURRENCY UI'dan zaten RefCurrency ID (id: 4 gibi) olarak geliyor.
    const [refPaymentMethodId, txType] = await Promise.all([
      this.mapSystemParameterToRefPaymentMethod(data.paymentMethodId),
      this.prisma.refTxType.findUnique({ where: { id: data.txTypeId }, select: { code: true } }),
    ])
    const refCurrencyId = data.currencyId

    if (!txType) {
      throw new ValidationError(`Geçersiz işlem tipi ID: ${data.txTypeId}`)
    }

    // ✅ NAKİT ÖDEMELERİ: Hesap/Kart/E-Cüzdan seçilmemişse otomatik "Nakit" hesabına ata
    // Mapping SONRASI refPaymentMethodId kullan
    let effectiveAccountId = data.accountId
    if (!data.accountId && !data.creditCardId && !data.eWalletId) {
      effectiveAccountId = await this.ensureCashAccount(
        data.userId,
        refPaymentMethodId,
        data.periodId
      )
    }

    const createData: Prisma.TransactionCreateInput = {
      user: { connect: { id: data.userId } },
      txType: { connect: { id: data.txTypeId } },
      category: { connect: { id: data.categoryId } },
      paymentMethod: { connect: { id: refPaymentMethodId } }, // RefPaymentMethod ID
      currency: { connect: { id: refCurrencyId } }, // RefCurrency ID
      amount: new Prisma.Decimal(data.amount),
      transactionDate: data.transactionDate,
      description: data.description,
      tags: data.tags || [],
    }

    // ✅ LOAN: loanId geldiyse transaction'ı krediyle ilişkilendir
    if (data.loanId) {
      createData.loan = { connect: { id: data.loanId } }
    }

    // ✅ PERIOD: periodId geldiyse transaction'ı aktif döneme bağla
    if (data.periodId) {
      createData.period = { connect: { id: data.periodId } }
    }

    // Hesap/Kart/E-Cüzdan/Alıcı bağlantısı
    if (effectiveAccountId) {
      createData.account = { connect: { id: effectiveAccountId } }
    } else if (data.creditCardId) {
      createData.creditCard = { connect: { id: data.creditCardId } }
    }

    if (data.eWalletId) {
      createData.eWallet = { connect: { id: data.eWalletId } }
    }

    if (data.beneficiaryId) {
      createData.beneficiary = { connect: { id: data.beneficiaryId } }
    }

    // Transaction oluştur
    const transaction = await this.transactionRepository.createWithRelations(createData)

    // ✅ İŞ MANTIĞI: Hesap/Kart/E-Cüzdan bakiyesini güncelle
    const balanceUpdateData = {
      ...data,
      accountId: effectiveAccountId,
      eWalletId: data.eWalletId,
    }
    await this.updateAccountBalance(balanceUpdateData, txType.code)

    // ✅ LOAN: Kalan taksit sayısını düş
    if (data.loanId) {
      await this.loanService.processPayment(data.loanId)
    }

    return TransactionMapper.prismaToDTO(transaction)
  }

  // Bu metot kullanıcının "Nakit" hesabını bulur veya oluşturur
  // Girdi: userId, refPaymentMethodId (RefPaymentMethod ID - mapping yapılmış)
  // Çıktı: Nakit hesap ID
  private async ensureCashAccount(
    userId: number,
    refPaymentMethodId: number,
    periodId?: number
  ): Promise<number> {
    // Nakit ödeme kontrolü (Ref tablo ID ile)
    const refPaymentMethod = await this.prisma.refPaymentMethod.findUnique({
      where: { id: refPaymentMethodId },
    })

    const isNakitPayment = refPaymentMethod?.code === 'NAKIT'

    if (!isNakitPayment) {
      return 0 // Nakit değilse hesap zorunlu (validation hata vermiştir)
    }

    // Kullanıcının "Nakit" hesabını ara
    let cashAccount = await this.prisma.account.findFirst({
      where: {
        userId,
        name: 'Nakit',
        active: true,
        periodId: periodId ?? undefined,
      },
    })

    // Yoksa oluştur
    if (!cashAccount) {
      // Nakit "bankası"nı bul veya oluştur
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

      // TRY para birimini bul
      const tryCurrency = await this.prisma.refCurrency.findFirst({
        where: { code: 'TRY' },
      })

      if (!accountType || !tryCurrency) {
        throw new ValidationError('Nakit hesabı oluşturulamadı: Ref veriler eksik')
      }

      // Nakit hesabı oluştur
      cashAccount = await this.prisma.account.create({
        data: {
          userId,
          periodId: periodId ?? undefined,
          name: 'Nakit',
          bankId: cashBank.id,
          accountTypeId: accountType.id,
          currencyId: tryCurrency.id,
          balance: 0,
          active: true,
        },
      })
    }

    return cashAccount.id
  }

  // Bu metot transaction sonrası hesap/kart/e-cüzdan bakiyesini günceller
  // Girdi: Transaction data ve işlem tipi
  // Çıktı: void
  // Hata: -
  private async updateAccountBalance(
    data: CreateTransactionDTO & { userId: number; eWalletId?: number },
    txTypeCode: string
  ): Promise<void> {
    const amount = new Prisma.Decimal(data.amount)
    const isIncome = txTypeCode === 'GELIR' // GELIR: +, GIDER: -

    // Hesap seçiliyse
    if (data.accountId) {
      const currentAccount = await this.prisma.account.findUnique({
        where: { id: data.accountId },
      })

      if (currentAccount) {
        const newBalance = isIncome
          ? currentAccount.balance.add(amount) // Gelir: bakiye artar
          : currentAccount.balance.sub(amount) // Gider: bakiye azalır

        await this.prisma.account.update({
          where: { id: data.accountId },
          data: { balance: newBalance },
        })
      }
    }

    // Kredi kartı seçiliyse
    if (data.creditCardId) {
      const currentCard = await this.prisma.creditCard.findUnique({
        where: { id: data.creditCardId },
      })

      if (currentCard) {
        const newAvailableLimit = isIncome
          ? currentCard.availableLimit.add(amount) // Gelir: limit artar (ödeme yapılmış)
          : currentCard.availableLimit.sub(amount) // Gider: limit azalır (harcama)

        await this.prisma.creditCard.update({
          where: { id: data.creditCardId },
          data: { availableLimit: newAvailableLimit },
        })
      }
    }

    // E-Cüzdan seçiliyse
    if (data.eWalletId) {
      const currentWallet = await this.prisma.eWallet.findUnique({
        where: { id: data.eWalletId },
      })

      if (currentWallet) {
        const newBalance = isIncome
          ? currentWallet.balance.add(amount) // Gelir: bakiye artar
          : currentWallet.balance.sub(amount) // Gider: bakiye azalır

        await this.prisma.eWallet.update({
          where: { id: data.eWalletId },
          data: { balance: newBalance },
        })
      }
    }
  }

  // Bu metot SystemParameter PAYMENT_METHOD ID'sini RefPaymentMethod ID'sine map eder
  // Girdi: SystemParameter paymentMethodId
  // Çıktı: RefPaymentMethod ID
  private async mapSystemParameterToRefPaymentMethod(systemParamId: number): Promise<number> {
    const systemParam = await this.prisma.systemParameter.findUnique({
      where: { id: systemParamId },
    })

    if (!systemParam) {
      throw new ValidationError(`Geçersiz ödeme yöntemi ID: ${systemParamId}`)
    }

    const refPaymentMethod = await this.prisma.refPaymentMethod.findFirst({
      where: { code: systemParam.paramCode },
    })

    if (!refPaymentMethod) {
      throw new ValidationError(`RefPaymentMethod bulunamadı: ${systemParam.paramCode}`)
    }

    return refPaymentMethod.id
  }

  // Bu metot işlem günceller.
  // Girdi: İşlem ID'si ve güncellenecek veriler
  // Çıktı: Güncellenmiş TransactionDTO
  // Hata: NotFoundError, ValidationError
  async update(id: number, data: Partial<CreateTransactionDTO>): Promise<TransactionDTO> {
    const transaction = await this.transactionRepository.update(id, data as never)
    return TransactionMapper.prismaToDTO(transaction)
  }

  // Bu metot işlemi siler.
  // Girdi: İşlem ID'si
  // Çıktı: Silinen TransactionDTO
  // Hata: NotFoundError
  async delete(id: number): Promise<TransactionDTO> {
    // Önce transaction'ı al (bakiye güncellemesi için)
    const transaction = await this.prisma.transaction.findUnique({
      where: { id },
      include: {
        txType: true,
        account: true,
        creditCard: true,
        eWallet: true,
        loan: true,
      },
    })

    if (!transaction) {
      throw new ValidationError(`Transaction bulunamadı: ${id}`)
    }

    // ✅ İŞ MANTIĞI: Silme öncesi bakiyeyi geri ekle
    await this.reverseAccountBalance(transaction)

    // ✅ LOAN: Gider siliniyorsa ve krediye bağlıysa taksiti geri ekle
    if (transaction.loanId && transaction.txType.code === 'GIDER') {
      await this.loanService.reversePayment(transaction.loanId)
    }

    // Transaction'ı sil
    const deletedTransaction = await this.transactionRepository.delete(id)
    return TransactionMapper.prismaToDTO(deletedTransaction)
  }

  // Bu metot silinen transaction'ın etkisini geri alır (bakiye düzeltmesi)
  // Girdi: Transaction entity
  // Çıktı: void
  private async reverseAccountBalance(transaction: any): Promise<void> {
    const amount = new Prisma.Decimal(transaction.amount)
    const isIncome = transaction.txType.code === 'GELIR'

    // Hesaptan yapılmışsa
    if (transaction.accountId && transaction.account) {
      const newBalance = isIncome
        ? transaction.account.balance.sub(amount) // Gelir silindi: bakiye azalır
        : transaction.account.balance.add(amount) // Gider silindi: bakiye artar

      await this.prisma.account.update({
        where: { id: transaction.accountId },
        data: { balance: newBalance },
      })
    }

    // Kredi kartından yapılmışsa
    if (transaction.creditCardId && transaction.creditCard) {
      const newLimit = isIncome
        ? transaction.creditCard.availableLimit.sub(amount) // Gelir silindi: limit azalır
        : transaction.creditCard.availableLimit.add(amount) // Gider silindi: limit artar

      await this.prisma.creditCard.update({
        where: { id: transaction.creditCardId },
        data: { availableLimit: newLimit },
      })
    }

    // E-cüzdandan yapılmışsa
    if (transaction.eWalletId && transaction.eWallet) {
      const newBalance = isIncome
        ? transaction.eWallet.balance.sub(amount) // Gelir silindi: bakiye azalır
        : transaction.eWallet.balance.add(amount) // Gider silindi: bakiye artar

      await this.prisma.eWallet.update({
        where: { id: transaction.eWalletId },
        data: { balance: newBalance },
      })
    }
  }

  // Bu metot kullanıcının aylık işlem sayısını kontrol eder.
  // Girdi: Kullanıcı ID'si
  // Çıktı: İşlem sayısı
  // Hata: -
  async getMonthlyTransactionCount(userId: number): Promise<number> {
    const currentMonth = new Date()
    currentMonth.setDate(1)
    currentMonth.setHours(0, 0, 0, 0)

    return this.transactionRepository.countByUserIdAndMonth(userId, currentMonth)
  }

  // Bu metot kullanıcının aylık işlem limitini kontrol eder.
  // Girdi: Kullanıcı ID'si ve plan
  // Çıktı: { allowed: boolean, current: number, limit: number }
  // Hata: -
  async checkMonthlyLimit(
    userId: number,
    plan: string
  ): Promise<{ allowed: boolean; current: number; limit: number }> {
    const limit = getPlanLimits(plan).transactions
    if (limit === -1) {
      return { allowed: true, current: 0, limit: -1 }
    }
    const current = await this.getMonthlyTransactionCount(userId)

    return {
      allowed: current < limit,
      current,
      limit,
    }
  }
}
