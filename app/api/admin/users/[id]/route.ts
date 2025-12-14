import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { UserMapper } from '@/server/mappers/UserMapper'

// Kullanıcı detayı
export const GET = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscriptions: {
          orderBy: { createdAt: 'desc' },
        },
        periods: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        accounts: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        transactions: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            accounts: true,
            transactions: true,
            periods: true,
            subscriptions: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const userDTO = UserMapper.prismaToDTO(user)

    return NextResponse.json({
      success: true,
      data: {
        user: userDTO,
        subscriptions: user.subscriptions,
        periods: user.periods,
        accounts: user.accounts,
        transactions: user.transactions,
        counts: user._count,
      },
    })
  }
)

// Kullanıcı silme (soft delete - isActive: false)
export const DELETE = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const { id } = await params
    const userId = parseInt(id)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Geçersiz kullanıcı ID' }, { status: 400 })
    }

    // Kendi hesabını silemez
    if (adminCheck.user?.id === userId) {
      return NextResponse.json({ error: 'Kendi hesabınızı silemezsiniz' }, { status: 400 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
      include: {
        subscriptions: {
          where: { status: 'active' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    const userDTO = UserMapper.prismaToDTO(updatedUser)

    return NextResponse.json({
      success: true,
      data: userDTO,
    })
  }
)
