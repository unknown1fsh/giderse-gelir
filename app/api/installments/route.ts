import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LoanService } from '@/server/services/impl/LoanService'
import { enrichLoanWithInstallmentFields } from '@/lib/finance/installments'
import { getCurrentUser } from '@/lib/auth'

const loanService = new LoanService(prisma)

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser(
            request instanceof NextRequest ? request : new NextRequest(request)
        )

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loans = await loanService.findByUserId(Number(user.id))
        const installments = loans.map(loan => enrichLoanWithInstallmentFields(loan))

        return NextResponse.json(installments)
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
