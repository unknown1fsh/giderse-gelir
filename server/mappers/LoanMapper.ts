import { Prisma } from '@prisma/client'
import { LoanDTO } from '../dto/LoanDTO'

export class LoanMapper {
    static prismaToDTO(loan: any): LoanDTO {
        return {
            id: loan.id,
            userId: loan.userId,
            bankId: loan.bankId,
            name: loan.name,
            loanType: loan.loanType,
            totalAmount: Number(loan.totalAmount),
            installmentCount: loan.installmentCount,
            remainingInstallments: loan.remainingInstallments,
            interestRate: loan.interestRate ? Number(loan.interestRate) : undefined,
            paymentDay: loan.paymentDay,
            currencyId: loan.currencyId,
            startDate: loan.startDate,
            description: loan.description || undefined,
            isActive: loan.isActive,
            isFictional: loan.isFictional,
            monthlyPayment: loan.monthlyPayment ? Number(loan.monthlyPayment) : undefined,
            bankName: loan.bank?.name,
            currencyCode: loan.currency?.code,
        }
    }

    static dtoToPrismaCreate(dto: any, userId: number): Prisma.LoanCreateInput {
        return {
            user: { connect: { id: userId } },
            bank: { connect: { id: dto.bankId } },
            name: dto.name,
            loanType: dto.loanType,
            totalAmount: new Prisma.Decimal(dto.totalAmount),
            installmentCount: dto.installmentCount,
            remainingInstallments: dto.remainingInstallments,
            interestRate: dto.interestRate ? new Prisma.Decimal(dto.interestRate) : null,
            paymentDay: dto.paymentDay,
            currency: { connect: { id: dto.currencyId } },
            startDate: dto.startDate,
            description: dto.description || null,
            isActive: true,
            isFictional: dto.isFictional ?? false,
            monthlyPayment: dto.monthlyPayment ? new Prisma.Decimal(dto.monthlyPayment) : null,
        }
    }
}
