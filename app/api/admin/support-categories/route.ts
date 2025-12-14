import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'

/**
 * Destek talebi kategorilerini listeler (admin)
 * GET /api/admin/support-categories
 */
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  const categories = await prisma.supportTicketCategory.findMany({
    orderBy: {
      name: 'asc',
    },
  })

  return NextResponse.json({
    success: true,
    data: categories,
  })
})

/**
 * Yeni kategori oluşturur
 * POST /api/admin/support-categories
 */
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  const body = await request.json()
  const { name, description, icon, color, isActive } = body

  if (!name) {
    throw new BadRequestError('Kategori adı gereklidir')
  }

  const category = await prisma.supportTicketCategory.create({
    data: {
      name,
      description: description || null,
      icon: icon || null,
      color: color || null,
      isActive: isActive !== undefined ? isActive : true,
    },
  })

  return NextResponse.json({
    success: true,
    data: category,
    message: 'Kategori başarıyla oluşturuldu',
  })
})
