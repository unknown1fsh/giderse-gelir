import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { LoanService } from '@/server/services/impl/LoanService'
import { getCurrentUser } from '@/lib/auth'

const loanService = new LoanService(prisma)

export async function GET(request: Request) {
    try {
        const user = await getCurrentUser(request instanceof NextRequest ? request : new NextRequest(request))

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const loans = await loanService.findByUserId(Number(user.id))
        return NextResponse.json(loans)
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        const user = await getCurrentUser(request instanceof NextRequest ? request : new NextRequest(request))

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const body = await request.json()
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
