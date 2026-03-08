import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const entityType = searchParams.get('entityType') || 'transactions'

    if (entityType === 'transactions') {
      const expenseType = await prisma.refTxType.findFirst({
        where: { code: 'GIDER' },
        select: { id: true },
      })
      const existingSystemViews = await prisma.savedView.count({
        where: {
          userId: user.id,
          entityType,
          isSystem: true,
        },
      })

      if (existingSystemViews === 0) {
        await prisma.savedView.createMany({
          data: [
            {
              userId: user.id,
              entityType,
              name: 'Bu Ay Giderleri',
              description: 'Bulunulan ayin gider islemlerini filtreler.',
              isSystem: true,
              filters: {
                search: '',
                categoryId: null,
                txTypeId: expenseType?.id ?? null,
                tags: [],
                minAmount: null,
                maxAmount: null,
              } as Prisma.InputJsonValue,
              sort: {
                sortBy: 'transactionDate',
                sortDirection: 'desc',
              } as Prisma.InputJsonValue,
            },
            {
              userId: user.id,
              entityType,
              name: 'Yuksek Tutarli Hareketler',
              description: 'Tutari yuksek hareketleri one cikarir.',
              isSystem: true,
              filters: {
                search: '',
                categoryId: null,
                txTypeId: null,
                tags: [],
                minAmount: 1000,
                maxAmount: null,
              } as Prisma.InputJsonValue,
              sort: {
                sortBy: 'transactionDate',
                sortDirection: 'desc',
              } as Prisma.InputJsonValue,
            },
          ],
        })
      }
    }

    const views = await prisma.savedView.findMany({
      where: {
        userId: user.id,
        entityType,
      },
      orderBy: [{ isSystem: 'desc' }, { isDefault: 'desc' }, { updatedAt: 'desc' }],
    })

    return NextResponse.json(views)
  } catch (error) {
    console.error('Saved views GET error:', error)
    return NextResponse.json({ error: 'Kayıtlı filtreler alınamadı' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const body = (await request.json()) as {
      entityType?: string
      name?: string
      description?: string
      filters?: Record<string, unknown>
      sort?: Record<string, unknown>
      isDefault?: boolean
      isSystem?: boolean
    }

    if (!body.name) {
      return NextResponse.json({ error: 'Görünüm adı gereklidir' }, { status: 400 })
    }

    const entityType = body.entityType || 'transactions'
    const viewName = body.name

    const view = await prisma.$transaction(async tx => {
      if (body.isDefault) {
        await tx.savedView.updateMany({
          where: {
            userId: user.id,
            entityType,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      return tx.savedView.create({
        data: {
          userId: user.id,
          entityType,
          name: viewName,
          description: body.description || null,
          filters: (body.filters || {}) as Prisma.InputJsonValue,
          sort: (body.sort || {}) as Prisma.InputJsonValue,
          isDefault: body.isDefault ?? false,
          isSystem: body.isSystem ?? false,
        },
      })
    })

    return NextResponse.json(view, { status: 201 })
  } catch (error) {
    console.error('Saved views POST error:', error)
    return NextResponse.json({ error: 'Kayıtlı filtre oluşturulamadı' }, { status: 500 })
  }
}
