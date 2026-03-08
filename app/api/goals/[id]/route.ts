import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { syncNotificationEvents } from '@/lib/notifications/service'

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
        }
        const body = await request.json()
        const { name, targetAmount, currentAmount, currencyId, targetDate, category, icon, color, notes, status } = body

        // Check ownership
        const existing = await prisma.goal.findUnique({
            where: { id, userId: user.id }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Hedef bulunamadı' }, { status: 404 })
        }

        const updated = await prisma.goal.update({
            where: { id },
            data: {
                name,
                targetAmount: targetAmount !== undefined ? parseFloat(targetAmount) : undefined,
                currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : undefined,
                currencyId: currencyId !== undefined ? parseInt(currencyId) : undefined,
                targetDate: targetDate ? new Date(targetDate) : undefined,
                category,
                icon,
                color,
                notes,
                status
            },
            include: { currency: true }
        })

        await syncNotificationEvents(prisma, {
            userId: user.id,
        })

        return NextResponse.json(updated)
    } catch (error) {
        console.error('Goals PATCH error:', error)
        return NextResponse.json({ error: 'Hedef güncellenemedi' }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: idStr } = await params
        const id = parseInt(idStr)
        const user = await getCurrentUser(request)
        if (!user) {
            return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
        }

        // Check ownership
        const existing = await prisma.goal.findUnique({
            where: { id, userId: user.id }
        })

        if (!existing) {
            return NextResponse.json({ error: 'Hedef bulunamadı' }, { status: 404 })
        }

        await prisma.goal.delete({
            where: { id }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Goals DELETE error:', error)
        return NextResponse.json({ error: 'Hedef silinemedi' }, { status: 500 })
    }
}
