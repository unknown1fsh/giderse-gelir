import { NextRequest, NextResponse } from 'next/server'
import { LoanService } from '@/server/services/impl/LoanService'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const loanService = new LoanService(prisma)

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request instanceof NextRequest ? request : new NextRequest(request))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loan = await loanService.findById(Number(id))
        if (!loan) {
            return NextResponse.json({ error: 'Loan not found' }, { status: 404 })
        }

        return NextResponse.json(loan)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request instanceof NextRequest ? request : new NextRequest(request))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
        if (body.startDate) {
            body.startDate = new Date(body.startDate)
        }

        const loan = await loanService.update(Number(id), body)
        return NextResponse.json(loan)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const user = await getCurrentUser(request instanceof NextRequest ? request : new NextRequest(request))
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loan = await loanService.delete(Number(id))
        return NextResponse.json(loan)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
