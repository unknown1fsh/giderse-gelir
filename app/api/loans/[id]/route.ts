import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { LoanService } from '../../../../server/services/impl/LoanService'
import { AuthService } from '../../../../lib/auth'

const prisma = new PrismaClient()
const loanService = new LoanService(prisma)

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const token = (await cookies()).get('auth-token')?.value
        const user = token ? await AuthService.validateSession(token) : null
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

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const token = (await cookies()).get('auth-token')?.value
        const user = token ? await AuthService.validateSession(token) : null
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        if (body.startDate) {
            body.startDate = new Date(body.startDate)
        }

        const loan = await loanService.update(Number(id), body)
        return NextResponse.json(loan)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params
        const token = (await cookies()).get('auth-token')?.value
        const user = token ? await AuthService.validateSession(token) : null
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loan = await loanService.delete(Number(id))
        return NextResponse.json(loan)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
