import { PrismaClient } from '@prisma/client'
import { ValidationError, BadRequestError } from '../../errors'

// Bu sınıf işlem (transaction) validasyonlarını yönetir.
export class TransactionValidationService {
  private prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  private async isCashPayment(paymentMethodId?: number): Promise<boolean> {
    if (!paymentMethodId) {
      return false
    }

    // Frontend genelde SystemParameter ID gönderir
    const systemParam = await this.prisma.systemParameter.findUnique({
      where: { id: paymentMethodId },
      select: { paramCode: true },
    })
    if (systemParam?.paramCode) {
      return systemParam.paramCode === 'NAKIT'
    }

    // Bazı yerlerde RefPaymentMethod ID gelebilir (fallback)
    const refPaymentMethod = await this.prisma.refPaymentMethod.findUnique({
      where: { id: paymentMethodId },
      select: { code: true },
    })
    return refPaymentMethod?.code === 'NAKIT'
  }

  // Bu metot kategori ve işlem tipinin uyumlu olup olmadığını kontrol eder.
  // Girdi: categoryId (RefTxCategory ID), txTypeId (RefTxType ID)
  // Çıktı: void (hata fırlatır veya devam eder)
  // Hata: ValidationError
  async validateCategoryMatchesType(categoryId: number, txTypeId: number): Promise<void> {
    if (!categoryId || categoryId <= 0) {
      throw new ValidationError('Geçersiz kategori ID')
    }

    if (!txTypeId || txTypeId <= 0) {
      throw new ValidationError('Geçersiz işlem tipi ID')
    }

    const category = await this.prisma.refTxCategory.findUnique({
      where: { id: categoryId },
      select: { txTypeId: true },
    })

    if (!category) {
      throw new ValidationError('Kategori bulunamadı')
    }

    if (category.txTypeId !== txTypeId) {
      throw new ValidationError('Kategori ile işlem tipi uyumsuz')
    }
  }

  // Bu metot işlem tipinin aktif olup olmadığını kontrol eder.
  // Girdi: txTypeId (RefTxType ID)
  // Çıktı: void
  // Hata: BadRequestError
  async validateTransactionTypeIsActive(txTypeId: number): Promise<void> {
    if (!txTypeId || txTypeId <= 0) {
      throw new BadRequestError('Geçersiz işlem tipi ID')
    }

    const txType = await this.prisma.refTxType.findUnique({
      where: { id: txTypeId },
      select: { active: true },
    })

    if (!txType) {
      throw new BadRequestError('İşlem tipi bulunamadı')
    }

    if (!txType.active) {
      throw new BadRequestError('İşlem tipi pasif')
    }
  }

  // Bu metot kategorinin aktif olup olmadığını kontrol eder.
  // Girdi: categoryId (RefTxCategory ID)
  // Çıktı: void
  // Hata: BadRequestError
  async validateCategoryIsActive(categoryId: number): Promise<void> {
    if (!categoryId || categoryId <= 0) {
      throw new BadRequestError('Geçersiz kategori ID')
    }

    const category = await this.prisma.refTxCategory.findUnique({
      where: { id: categoryId },
      select: { active: true },
    })

    if (!category) {
      throw new BadRequestError('Kategori bulunamadı')
    }

    if (!category.active) {
      throw new BadRequestError('Kategori pasif')
    }
  }

  // Bu metot ödeme kaynağının doğru seçildiğini kontrol eder.
  // NOT: Nakit ödemeler için kaynak zorunlu değildir (otomatik Nakit hesabı kullanılır)
  // Girdi: accountId, creditCardId, eWalletId, paymentMethodId
  // Çıktı: void
  // Hata: ValidationError
  async validatePaymentSource(data: {
    accountId?: number
    creditCardId?: number
    eWalletId?: number
    paymentMethodId?: number
  }): Promise<void> {
    const isCash = await this.isCashPayment(data.paymentMethodId)
    if (isCash) {
      return
    }

    const sources = [data.accountId, data.creditCardId, data.eWalletId].filter(
      v => typeof v === 'number' && v > 0
    )

    if (sources.length === 0) {
      throw new ValidationError('Hesap, kredi kartı veya e-cüzdandan birini seçmelisiniz')
    }
    if (sources.length > 1) {
      throw new ValidationError(
        'Aynı anda sadece 1 ödeme kaynağı seçebilirsiniz (hesap/kart/e-cüzdan)'
      )
    }
  }

  // Bu metot tutar değerinin pozitif olduğunu kontrol eder.
  // Girdi: amount
  // Çıktı: void
  // Hata: ValidationError
  validateAmount(amount: number): void {
    if (amount <= 0) {
      throw new ValidationError("Tutar 0'dan büyük olmalıdır")
    }

    if (amount > 999999999.99) {
      throw new ValidationError('Tutar çok yüksek (max: 999,999,999.99)')
    }
  }

  // Bu metot işlem tarihinin geçerli olduğunu kontrol eder.
  // Girdi: transactionDate
  // Çıktı: void
  // Hata: ValidationError
  validateTransactionDate(transactionDate: Date): void {
    if (isNaN(transactionDate.getTime())) {
      throw new ValidationError('Geçersiz tarih formatı')
    }

    // Gelecek tarih kontrolü (1 gün tolerans)
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(23, 59, 59, 999)

    if (transactionDate > tomorrow) {
      throw new ValidationError('İşlem tarihi gelecek bir tarih olamaz')
    }
  }

  // Bu metot tüm işlem validasyonlarını bir arada çalıştırır.
  // Girdi: ValidateTransactionData
  // Çıktı: void
  // Hata: ValidationError, BadRequestError
  async validateTransaction(data: {
    txTypeId: number
    categoryId: number
    accountId?: number
    creditCardId?: number
    eWalletId?: number
    paymentMethodId?: number
    amount: number
    transactionDate: Date
  }): Promise<void> {
    // Sırayla tüm validasyonları çalıştır
    await this.validateTransactionTypeIsActive(data.txTypeId)
    await this.validateCategoryIsActive(data.categoryId)
    await this.validateCategoryMatchesType(data.categoryId, data.txTypeId)
    await this.validatePaymentSource({
      accountId: data.accountId,
      creditCardId: data.creditCardId,
      eWalletId: data.eWalletId,
      paymentMethodId: data.paymentMethodId,
    })
    this.validateAmount(data.amount)
    this.validateTransactionDate(data.transactionDate)
  }
}
