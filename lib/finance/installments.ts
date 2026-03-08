import { LoanCalculator } from '@/server/utils/LoanCalculator'

export function getNextPaymentDate(
    startDate: Date,
    paymentDay: number,
    paidInstallments: number
): string | null {
    if (paidInstallments < 0) {return null}
    const d = new Date(startDate)
    d.setMonth(d.getMonth() + paidInstallments + 1)
    const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
    d.setDate(Math.min(paymentDay, maxDay))
    return d.toISOString().split('T')[0]
}

export interface LoanWithInstallments {
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

export function enrichLoanWithInstallmentFields(loan: LoanWithInstallments) {
    const paidInstallments = loan.installmentCount - loan.remainingInstallments
    const remainingAmount =
        loan.remainingInstallments > 0
            ? LoanCalculator.calculateRemainingDebt(
                  loan.totalAmount,
                  loan.installmentCount,
                  loan.remainingInstallments,
                  loan.interestRate
              )
            : 0

    return {
        ...loan,
        totalInstallments: loan.installmentCount,
        paidInstallments,
        remainingAmount,
        nextPaymentDate:
            loan.remainingInstallments > 0
                ? getNextPaymentDate(
                      new Date(loan.startDate),
                      loan.paymentDay,
                      paidInstallments
                  )
                : null,
    }
}
