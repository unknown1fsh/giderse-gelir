import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// Dönemi aktif dönem olarak ayarla
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const periodId = parseInt(id)
    if (isNaN(periodId)) {
      return NextResponse.json({ error: 'Geçersiz dönem ID' }, { status: 400 })
    }

    // Dönemin varlığını ve sahipliğini kontrol et
    const period = await prisma.period.findFirst({
      where: {
        id: periodId,
        userId: user.id,
      },
    })

    if (!period) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    // Kapalı dönem aktif yapılamaz
    if (period.isClosed) {
      return NextResponse.json({ error: 'Kapalı dönem aktif yapılamaz' }, { status: 400 })
    }

    // Transaction ile işlem yap
    await prisma.$transaction(async tx => {
      // Önce tüm dönemleri pasif yap
      await tx.period.updateMany({
        where: {
          userId: user.id,
        },
        data: {
          isActive: false,
        },
      })

      // Seçilen dönemi aktif yap
      await tx.period.update({
        where: { id: periodId },
        data: { isActive: true },
      })

      // Session'ı güncelle
      const token = request.cookies.get('auth-token')?.value
      if (token) {
        await tx.userSession.updateMany({
          where: {
            token,
            userId: user.id,
            isActive: true,
          },
          data: {
            activePeriodId: periodId,
          },
        })
      }
    })

    // Güncellenmiş dönemi getir
    const updatedPeriod = await prisma.period.findUnique({
      where: { id: periodId },
      include: {
        _count: {
          select: {
            transactions: true,
            accounts: true,
            investments: true,
            goldItems: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, period: updatedPeriod })
  } catch (error) {
    console.error('Period activate error:', error)
    return NextResponse.json({ error: 'Dönem aktif yapılamadı' }, { status: 500 })
  }
}
