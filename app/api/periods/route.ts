import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'
import { periodSchema } from '@/lib/validators'
import { validatePeriodOverlap } from '@/lib/period-helpers'

// Kullanıcının tüm dönemlerini listele
export async function GET(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const periods = await prisma.period.findMany({
      where: {
        userId: user.id,
      },
      orderBy: [
        { isClosed: 'asc' }, // Açık dönemler önce
        { startDate: 'desc' }, // Tarih sırasına göre
      ],
      include: {
        _count: {
          select: {
            transactions: true,
            accounts: true,
            creditCards: true,
            eWallets: true,
            investments: true,
            goldItems: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, periods })
  } catch (error) {
    console.error('Periods GET error:', error)
    return NextResponse.json({ error: 'Dönemler alınamadı' }, { status: 500 })
  }
}

// Yeni dönem oluştur
export async function POST(request: NextRequest) {
  try {
    // Kullanıcı doğrulama
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = (await request.json()) as {
      name: string
      periodType: string
      startDate: string
      endDate: string
      description?: string
    }

    // Tarih dönüşümü
    const data = {
      ...body,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
    }

    // Validasyon
    const validatedData = periodSchema.parse(data)

    // Başlangıç tarihi bitiş tarihinden önce olmalı
    if (validatedData.startDate >= validatedData.endDate) {
      return NextResponse.json(
        { error: 'Başlangıç tarihi bitiş tarihinden önce olmalıdır' },
        { status: 400 }
      )
    }

    // Dönem çakışması kontrolü
    const isValid = await validatePeriodOverlap(
      user.id,
      validatedData.startDate,
      validatedData.endDate
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Bu tarih aralığı için zaten bir dönem mevcut' },
        { status: 400 }
      )
    }

    // Kullanıcının aktif dönemi var mı kontrol et
    const existingActivePeriod = await prisma.period.findFirst({
      where: {
        userId: user.id,
        isActive: true,
        isClosed: false,
      },
    })

    // Yeni dönem oluştur
    const period = await prisma.period.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        periodType: validatedData.periodType,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        description: validatedData.description,
        // Eğer aktif dönem yoksa, bu dönem aktif olsun
        isActive: !existingActivePeriod,
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

    // Eğer bu ilk dönemse ve aktif olarak ayarlandıysa, session'ı güncelle
    if (!existingActivePeriod) {
      // Token'dan session'ı bul ve güncelle
      const token = request.cookies.get('auth-token')?.value
      if (token) {
        await prisma.userSession.updateMany({
          where: {
            token,
            userId: user.id,
            isActive: true,
          },
          data: {
            activePeriodId: period.id,
          },
        })
      }
    }

    return NextResponse.json({ success: true, period }, { status: 201 })
  } catch (error) {
    console.error('Period POST error:', error)

    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Geçersiz veri formatı' }, { status: 400 })
    }

    return NextResponse.json({ error: 'Dönem oluşturulamadı' }, { status: 500 })
  }
}
