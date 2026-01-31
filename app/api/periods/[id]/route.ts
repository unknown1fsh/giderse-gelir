import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
import { validatePeriodOverlap, getPeriodSummary } from '@/lib/period-helpers'

// Dönem detayını getir
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const period = await prisma.period.findFirst({
      where: {
        id: periodId,
        userId: user.id,
      },
      include: {
        _count: {
          select: {
            transactions: true,
            accounts: true,
            creditCards: true,
            eWallets: true,
            investments: true,
            goldItems: true,
            autoPayments: true,
          },
        },
      },
    })

    if (!period) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    // Özet bilgiler
    const summary = await getPeriodSummary(periodId)

    return NextResponse.json({ success: true, period, summary })
  } catch (error) {
    console.error('Period GET error:', error)
    return NextResponse.json({ error: 'Dönem bilgisi alınamadı' }, { status: 500 })
  }
}

// Dönemi güncelle
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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
    const existingPeriod = await prisma.period.findFirst({
      where: {
        id: periodId,
        userId: user.id,
      },
    })

    if (!existingPeriod) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    // Kapalı dönemler düzenlenemez
    if (existingPeriod.isClosed) {
      return NextResponse.json({ error: 'Kapalı dönemler düzenlenemez' }, { status: 400 })
    }

    const body = (await request.json()) as {
      name?: string
      periodType?: string
      startDate?: string
      endDate?: string
      description?: string
    }

    // Tarih dönüşümü
    const data = {
      ...body,
      startDate: body.startDate ? new Date(body.startDate) : undefined,
      endDate: body.endDate ? new Date(body.endDate) : undefined,
    }

    // Partial validasyon için
    const updateData: {
      name?: string
      periodType?: string
      startDate?: Date
      endDate?: Date
      description?: string | null
    } = {}

    if (data.name) {
      updateData.name = data.name
    }
    if (data.periodType) {
      updateData.periodType = data.periodType
    }
    if (data.startDate) {
      updateData.startDate = data.startDate
    }
    if (data.endDate) {
      updateData.endDate = data.endDate
    }
    if (data.description !== undefined) {
      updateData.description = data.description
    }

    // Tarih kontrolü
    const startDate = updateData.startDate || existingPeriod.startDate
    const endDate = updateData.endDate || existingPeriod.endDate

    if (startDate >= endDate) {
      return NextResponse.json(
        { error: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır' },
        { status: 400 }
      )
    }

    // Dönem çakışması kontrolü (kendisi hariç)
    if (updateData.startDate || updateData.endDate) {
      const isValid = await validatePeriodOverlap(user.id, startDate, endDate, periodId)

      if (!isValid) {
        return NextResponse.json(
          { error: 'Bu tarih aralığı için zaten başka bir dönem mevcut' },
          { status: 400 }
        )
      }
    }

    // Güncelle
    const period = await prisma.period.update({
      where: { id: periodId },
      data: updateData,
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

    return NextResponse.json({ success: true, period })
  } catch (error) {
    console.error('Period PUT error:', error)
    return NextResponse.json({ error: 'Dönem güncellenemedi' }, { status: 500 })
  }
}

// Dönemi sil
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

    if (!period) {
      return NextResponse.json({ error: 'Dönem bulunamadı' }, { status: 404 })
    }

    // İşlem varsa silinemez
    const totalRecords =
      period._count.transactions +
      period._count.accounts +
      period._count.investments +
      period._count.goldItems

    if (totalRecords > 0) {
      return NextResponse.json(
        {
          error: 'Bu dönemde işlem veya veri bulunduğu için silinemez',
          recordCount: totalRecords,
        },
        { status: 400 }
      )
    }

    // Aktif dönemse, başka bir dönemi aktif yap
    if (period.isActive) {
      const otherPeriod = await prisma.period.findFirst({
        where: {
          userId: user.id,
          id: { not: periodId },
          isClosed: false,
        },
        orderBy: { startDate: 'desc' },
      })

      if (otherPeriod) {
        await prisma.period.update({
          where: { id: otherPeriod.id },
          data: { isActive: true },
        })

        // Session'ı güncelle
        const token = request.cookies.get('auth-token')?.value
        if (token) {
          await prisma.userSession.updateMany({
            where: {
              token,
              userId: user.id,
              isActive: true,
            },
            data: {
              activePeriodId: otherPeriod.id,
            },
          })
        }
      }
    }

    // Sil
    await prisma.period.delete({
      where: { id: periodId },
    })

    return NextResponse.json({ success: true, message: 'Dönem silindi' })
  } catch (error) {
    console.error('Period DELETE error:', error)
    return NextResponse.json({ error: 'Dönem silinemedi' }, { status: 500 })
  }
}
