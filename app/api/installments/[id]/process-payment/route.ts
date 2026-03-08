import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LoanService } from '@/server/services/impl/LoanService'
import { enrichLoanWithInstallmentFields } from '@/lib/finance/installments'
import { getCurrentUser } from '@/lib/auth'

const loanService = new LoanService(prisma)

export async function POST(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const user = await getCurrentUser(
            request instanceof NextRequest ? request : new NextRequest(request)
        )

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loanId = Number(id)
        if (Number.isNaN(loanId)) {
            return NextResponse.json({ error: 'Geçersiz taksit ID' }, { status: 400 })
        }

        const existingLoan = await loanService.findById(loanId)
        if (!existingLoan) {
            return NextResponse.json({ error: 'Taksit bulunamadı' }, { status: 404 })
        }

        if (existingLoan.userId !== Number(user.id)) {
            return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 403 })
        }

        if (existingLoan.remainingInstallments <= 0) {
            return NextResponse.json(
                { error: 'Bu taksit zaten tamamlanmış' },
                { status: 400 }
            )
        }

        await loanService.processPayment(loanId)
        const updatedLoan = await loanService.findById(loanId)

        if (!updatedLoan) {
            return NextResponse.json(
                { error: 'Güncelleme sonrası taksit bulunamadı' },
                { status: 500 }
            )
        }

        return NextResponse.json({
            success: true,
            loan: enrichLoanWithInstallmentFields(updatedLoan),
        })
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Bilinmeyen hata'
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
