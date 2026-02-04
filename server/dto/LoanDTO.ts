import { BaseDTO } from './BaseDTO'

export interface LoanDTO extends BaseDTO {
    id: number
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
    isFictional: boolean
    monthlyPayment?: number
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
    isFictional?: boolean
    monthlyPayment?: number
}
