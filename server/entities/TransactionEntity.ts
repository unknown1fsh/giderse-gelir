import { BaseEntity } from './BaseEntity'

// Bu sınıf işlem (transaction) entity'sini tanımlar.
// Girdi: İşlem bilgileri
// Çıktı: TransactionEntity instance
// Hata: -
export class TransactionEntity extends BaseEntity {
  userId: number
  periodId?: number
  txTypeId: number
  categoryId: number
  paymentMethodId: number
  accountId?: number
  creditCardId?: number
  eWalletId?: number
  beneficiaryId?: number
  amount: number
  currencyId: number
  transactionDate: Date
  description?: string
  tags: string[]

  constructor(data: {
    id: number
    userId: number
    periodId?: number
    txTypeId: number
    categoryId: number
    paymentMethodId: number
    accountId?: number
    creditCardId?: number
    eWalletId?: number
    beneficiaryId?: number
    amount: number
    currencyId: number
    transactionDate: Date
    description?: string
    tags: string[]
    createdAt: Date
    updatedAt: Date
  }) {
    super(data.id, data.createdAt, data.updatedAt)
    this.userId = data.userId
    this.periodId = data.periodId
    this.txTypeId = data.txTypeId
    this.categoryId = data.categoryId
    this.paymentMethodId = data.paymentMethodId
    this.accountId = data.accountId
    this.creditCardId = data.creditCardId
    this.eWalletId = data.eWalletId
    this.beneficiaryId = data.beneficiaryId
    this.amount = data.amount
    this.currencyId = data.currencyId
    this.transactionDate = data.transactionDate
    this.description = data.description
    this.tags = data.tags
  }
}
