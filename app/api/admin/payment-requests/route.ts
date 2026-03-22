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
  const status = searchParams.get('status') || ''

  const skip = (page - 1) * limit

  // Filtreleme koşulları
  const where: { status?: string } = {}

  if (status) {
    where.status = status
  }

  // Toplam sayfa sayısı için count
  const total = await prisma.paymentRequest.count({ where })

  // Ödeme taleplerini getir
  const paymentRequests = await prisma.paymentRequest.findMany({
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
      paymentRequests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})
