import { BaseDTO } from './BaseDTO'
import { Prisma } from '@prisma/client'

export interface LoanDTO extends BaseDTO {
    userId: number
    bankId: number
    name: string
    loanType: string
    totalAmount: number
    installmentCount: number
    remainingInstallments: number
    interestRate?: number
    paymentDay: number
    currencyId: number
    startDate: Date
    description?: string
    isActive: boolean
    bankName?: string
    currencyCode?: string
}

export interface CreateLoanDTO {
    bankId: number
    name: string
    loanType: string
    totalAmount: number
    installmentCount: number
    remainingInstallments: number
    interestRate?: number
    paymentDay: number
    currencyId: number
    startDate: Date
    description?: string
}
