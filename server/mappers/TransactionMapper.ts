import { Transaction } from '@prisma/client'
import { TransactionEntity } from '../entities/TransactionEntity'
import { TransactionDTO } from '../dto/TransactionDTO'

// Bu sınıf Transaction entity ve DTO dönüşümlerini sağlar.
export class TransactionMapper {
  // Bu metot Prisma Transaction modelini TransactionEntity'e dönüştürür.
  // Girdi: Prisma Transaction nesnesi
  // Çıktı: TransactionEntity instance
  // Hata: -
  static toEntity(prismaTransaction: Transaction): TransactionEntity {
    return new TransactionEntity({
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      periodId: prismaTransaction.periodId ?? undefined,
      txTypeId: prismaTransaction.txTypeId,
      categoryId: prismaTransaction.categoryId,
      paymentMethodId: prismaTransaction.paymentMethodId,
      accountId: prismaTransaction.accountId ?? undefined,
      creditCardId: prismaTransaction.creditCardId ?? undefined,
      eWalletId: prismaTransaction.eWalletId ?? undefined,
      beneficiaryId: prismaTransaction.beneficiaryId ?? undefined,
      amount: Number(prismaTransaction.amount),
      currencyId: prismaTransaction.currencyId,
      transactionDate: prismaTransaction.transactionDate,
      description: prismaTransaction.description ?? undefined,
      tags: prismaTransaction.tags,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
    })
  }

  // Bu metot TransactionEntity'yi TransactionDTO'ya dönüştürür.
  // Girdi: TransactionEntity
  // Çıktı: TransactionDTO instance
  // Hata: -
  static toDTO(entity: TransactionEntity): TransactionDTO {
    return new TransactionDTO({
      id: entity.id,
      userId: entity.userId,
      periodId: entity.periodId,
      txTypeId: entity.txTypeId,
      categoryId: entity.categoryId,
      paymentMethodId: entity.paymentMethodId,
      accountId: entity.accountId,
      creditCardId: entity.creditCardId,
      eWalletId: entity.eWalletId,
      beneficiaryId: entity.beneficiaryId,
      amount: entity.amount,
      currencyId: entity.currencyId,
      transactionDate: entity.transactionDate,
      description: entity.description,
      tags: entity.tags,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
    })
  }

  // Bu metot Prisma Transaction nesnesini doğrudan TransactionDTO'ya dönüştürür.
  // Girdi: Prisma Transaction nesnesi
  // Çıktı: TransactionDTO instance
  // Hata: -
  static prismaToDTO(prismaTransaction: Transaction): TransactionDTO {
    return new TransactionDTO({
      id: prismaTransaction.id,
      userId: prismaTransaction.userId,
      periodId: prismaTransaction.periodId ?? undefined,
      txTypeId: prismaTransaction.txTypeId,
      categoryId: prismaTransaction.categoryId,
      paymentMethodId: prismaTransaction.paymentMethodId,
      accountId: prismaTransaction.accountId ?? undefined,
      creditCardId: prismaTransaction.creditCardId ?? undefined,
      eWalletId: prismaTransaction.eWalletId ?? undefined,
      beneficiaryId: prismaTransaction.beneficiaryId ?? undefined,
      amount: Number(prismaTransaction.amount),
      currencyId: prismaTransaction.currencyId,
      transactionDate: prismaTransaction.transactionDate,
      description: prismaTransaction.description ?? undefined,
      tags: prismaTransaction.tags,
      createdAt: prismaTransaction.createdAt,
      updatedAt: prismaTransaction.updatedAt,
    })
  }
}
