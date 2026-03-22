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
  const status = searchParams.get('status')
  const planId = searchParams.get('planId')

  const skip = (page - 1) * limit

  const where: {
    userId?: number
    status?: string
    planId?: string
  } = {}

  if (userId) {
    where.userId = parseInt(userId)
  }

  if (status) {
    where.status = status
  }

  if (planId) {
    where.planId = planId
  }

  const total = await prisma.userSubscription.count({ where })

  const subscriptions = await prisma.userSubscription.findMany({
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
    },
  })

  return NextResponse.json({
    success: true,
    data: {
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})
