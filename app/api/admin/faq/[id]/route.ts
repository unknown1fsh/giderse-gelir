import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, NotFoundError } from '@/server/errors'

/**
 * SSS günceller
 * PUT /api/admin/faq/[id]
 */
export const PUT = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const faqId = parseInt(params.id)

    if (isNaN(faqId)) {
      throw new BadRequestError('Geçersiz FAQ ID')
    }

    const body = await request.json()
    const { question, answer, category, displayOrder, isActive } = body

    // FAQ var mı kontrol et
    const existingFaq = await prisma.fAQ.findUnique({
      where: { id: faqId },
    })

    if (!existingFaq) {
      throw new NotFoundError('SSS bulunamadı')
    }

    const updateData: any = {}

    if (question !== undefined) updateData.question = question
    if (answer !== undefined) updateData.answer = answer
    if (category !== undefined) updateData.category = category
    if (displayOrder !== undefined) updateData.displayOrder = displayOrder
    if (isActive !== undefined) updateData.isActive = isActive

    const faq = await prisma.fAQ.update({
      where: { id: faqId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      data: faq,
      message: 'SSS başarıyla güncellendi',
    })
  }
)

/**
 * SSS siler
 * DELETE /api/admin/faq/[id]
 */
export const DELETE = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const faqId = parseInt(params.id)

    if (isNaN(faqId)) {
      throw new BadRequestError('Geçersiz FAQ ID')
    }

    const existingFaq = await prisma.fAQ.findUnique({
      where: { id: faqId },
    })

    if (!existingFaq) {
      throw new NotFoundError('SSS bulunamadı')
    }

    await prisma.fAQ.delete({
      where: { id: faqId },
    })

    return NextResponse.json({
      success: true,
      message: 'SSS başarıyla silindi',
    })
  }
)

