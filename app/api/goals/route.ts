import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
        }

        const goals = await prisma.goal.findMany({
            where: { userId: user.id },
            include: { currency: true },
            orderBy: { createdAt: 'desc' },
        })

        return NextResponse.json(goals)
    } catch (error) {
        console.error('Goals GET error:', error)
        return NextResponse.json({ error: 'Hedefler alınamadı' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
        }

        const body = await request.json()
        const { name, targetAmount, currencyId, targetDate, category, icon, color, notes } = body

        if (!name || !targetAmount || !currencyId) {
            return NextResponse.json({ error: 'Eksik bilgi' }, { status: 400 })
        }

        const goal = await prisma.goal.create({
            data: {
                userId: user.id,
                name,
                targetAmount: parseFloat(targetAmount),
                currentAmount: 0,
                currencyId: parseInt(currencyId),
                targetDate: targetDate ? new Date(targetDate) : null,
                category,
                icon,
                color,
                notes,
                status: 'active'
            },
            include: { currency: true }
        })

        return NextResponse.json(goal, { status: 201 })
    } catch (error) {
        console.error('Goals POST error:', error)
        return NextResponse.json({ error: 'Hedef oluşturulamadı' }, { status: 500 })
    }
}
