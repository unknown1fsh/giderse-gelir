import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'
import { ExceptionMapper } from '@/server/errors'
import { UnauthorizedError } from '@/server/errors'

/**
 * Aktif SSS listesini getirir
 * GET /api/help/faq
 */
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new UnauthorizedError('Oturum bulunamadı')
  }

  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  const where: any = {
    isActive: true,
  }

  if (category) {
    where.category = category
  }

  const faqs = await prisma.fAQ.findMany({
    where,
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'desc' },
    ],
  })

  return NextResponse.json({
    success: true,
    data: faqs,
  })
})

