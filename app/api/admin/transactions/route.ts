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
  const search = searchParams.get('search') || ''
  const userId = searchParams.get('userId')
  const categoryId = searchParams.get('categoryId')
  const txTypeId = searchParams.get('txTypeId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')

  const skip = (page - 1) * limit

  const where: {
    OR?: Array<{
      description?: { contains: string; mode: 'insensitive' }
      notes?: { contains: string; mode: 'insensitive' }
    }>
    userId?: number
    categoryId?: number
    txTypeId?: number
    transactionDate?: { gte?: Date; lte?: Date }
  } = {}

  if (search) {
    where.OR = [
      { description: { contains: search, mode: 'insensitive' } },
      { notes: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (userId) {
    where.userId = parseInt(userId)
  }

  if (categoryId) {
    where.categoryId = parseInt(categoryId)
  }

  if (txTypeId) {
    where.txTypeId = parseInt(txTypeId)
  }

  if (startDate || endDate) {
    where.transactionDate = {}
    if (startDate) {
      where.transactionDate.gte = new Date(startDate)
    }
    if (endDate) {
      where.transactionDate.lte = new Date(endDate)
    }
  }

  const total = await prisma.transaction.count({ where })

  const transactions = await prisma.transaction.findMany({
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
      category: {
        select: {
          id: true,
          name: true,
        },
      },
      txType: {
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
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})
