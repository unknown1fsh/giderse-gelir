import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'
import { Prisma } from '@prisma/client'

/**
 * Tüm SSS listesini getirir (admin)
 * GET /api/admin/faq
 */
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
  const category = searchParams.get('category') || ''
  const isActive = searchParams.get('isActive')

  const skip = (page - 1) * limit

  const where: Prisma.FAQWhereInput = {}

  if (search) {
    where.OR = [
      { question: { contains: search, mode: 'insensitive' } },
      { answer: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (category) {
    where.category = category
  }

  if (isActive !== null && isActive !== undefined) {
    where.isActive = isActive === 'true'
  }

  const [faqs, total] = await Promise.all([
    prisma.fAQ.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ displayOrder: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.fAQ.count({ where }),
  ])

  return NextResponse.json({
    success: true,
    data: faqs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  })
})

/**
 * Yeni SSS oluşturur
 * POST /api/admin/faq
 */
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  const body = await request.json()
  const { question, answer, category, displayOrder, isActive } = body

  if (!question || !answer) {
    throw new BadRequestError('Soru ve cevap gereklidir')
  }

  const faq = await prisma.fAQ.create({
    data: {
      question,
      answer,
      category: category || null,
      displayOrder: displayOrder || 0,
      isActive: isActive !== undefined ? isActive : true,
    },
  })

  return NextResponse.json({
    success: true,
    data: faq,
    message: 'SSS başarıyla oluşturuldu',
  })
})
