import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'
import { ExceptionMapper } from '@/server/errors'
import { UnauthorizedError } from '@/server/errors'

/**
 * Destek talebi kategorilerini getirir
 * GET /api/help/categories
 */
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new UnauthorizedError('Oturum bulunamadı')
  }

  const categories = await prisma.supportTicketCategory.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  return NextResponse.json({
    success: true,
    data: categories,
  })
})

