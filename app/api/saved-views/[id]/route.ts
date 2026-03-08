import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const viewId = Number(id)
    const body = (await request.json()) as {
      name?: string
      description?: string
      filters?: Record<string, unknown>
      sort?: Record<string, unknown>
      isDefault?: boolean
    }

    const currentView = await prisma.savedView.findFirst({
      where: {
        id: viewId,
        userId: user.id,
      },
    })

    if (!currentView) {
      return NextResponse.json({ error: 'Görünüm bulunamadı' }, { status: 404 })
    }

    const updated = await prisma.$transaction(async tx => {
      if (body.isDefault) {
        await tx.savedView.updateMany({
          where: {
            userId: user.id,
            entityType: currentView.entityType,
            isDefault: true,
          },
          data: {
            isDefault: false,
          },
        })
      }

      return tx.savedView.update({
        where: { id: currentView.id },
        data: {
          ...(body.name !== undefined ? { name: body.name } : {}),
          ...(body.description !== undefined ? { description: body.description } : {}),
          ...(body.filters !== undefined ? { filters: body.filters as Prisma.InputJsonValue } : {}),
          ...(body.sort !== undefined ? { sort: body.sort as Prisma.InputJsonValue } : {}),
          ...(body.isDefault !== undefined ? { isDefault: body.isDefault } : {}),
        },
      })
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Saved views PATCH error:', error)
    return NextResponse.json({ error: 'Görünüm güncellenemedi' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Oturum bulunamadı' }, { status: 401 })
    }

    const { id } = await params
    const viewId = Number(id)

    const deleted = await prisma.savedView.deleteMany({
      where: {
        id: viewId,
        userId: user.id,
      },
    })

    if (deleted.count === 0) {
      return NextResponse.json({ error: 'Görünüm bulunamadı' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Saved views DELETE error:', error)
    return NextResponse.json({ error: 'Görünüm silinemedi' }, { status: 500 })
  }
}
