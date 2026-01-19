import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { PrismaClient } from '@prisma/client'
import { LoanService } from '../../../server/services/impl/LoanService'
import { AuthService } from '../../../lib/auth'

const prisma = new PrismaClient()
const loanService = new LoanService(prisma)

export async function GET(_req: Request) {
    try {
        const token = (await cookies()).get('auth-token')?.value
        const user = token ? await AuthService.validateSession(token) : null

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loans = await loanService.findByUserId(Number(user.id))
        return NextResponse.json(loans)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const token = (await cookies()).get('auth-token')?.value
        const user = token ? await AuthService.validateSession(token) : null

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const loan = await loanService.create({
            ...body,
            userId: Number(user.id),
            startDate: new Date(body.startDate)
        })

        return NextResponse.json(loan)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
