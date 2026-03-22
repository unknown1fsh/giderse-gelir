import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'

export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  const { searchParams } = new URL(request.url)
  const pageRaw = parseInt(searchParams.get('page') || '1')
  const page = isNaN(pageRaw) || pageRaw < 1 ? 1 : pageRaw
  const limitRaw = parseInt(searchParams.get('limit') || '50')
  const limit = isNaN(limitRaw) || limitRaw < 1 ? 50 : Math.min(limitRaw, 500)
  const userId = searchParams.get('userId')
  const bankId = searchParams.get('bankId')

  const skip = (page - 1) * limit

  const where: {
    userId?: number
    bankId?: number
  } = {}

  if (userId) {
    where.userId = parseInt(userId)
  }

  if (bankId) {
    where.bankId = parseInt(bankId)
  }

  const total = await prisma.account.count({ where })

  const accounts = await prisma.account.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      bank: {
        select: {
          id: true,
          name: true,
        },
      },
      accountType: {
        select: {
          id: true,
          name: true,
        },
      },
      currency: {
        select: {
          code: true,
          symbol: true,
        },
      },
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      accounts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})
