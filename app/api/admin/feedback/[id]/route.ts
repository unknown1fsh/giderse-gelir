import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'
import { z } from 'zod'

const updateFeedbackSchema = z.object({
  status: z.enum(['pending', 'read', 'replied']).optional(),
  replyMessage: z.string().optional(),
})

export const PATCH = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)
    if (isNaN(id)) {
      throw new BadRequestError('Geçersiz feedback ID')
    }

    const body = await request.json()
    const validatedData = updateFeedbackSchema.parse(body)

    const updateData: any = {}
    if (validatedData.status) {
      updateData.status = validatedData.status
    }
    if (validatedData.replyMessage) {
      updateData.replyMessage = validatedData.replyMessage
      updateData.repliedAt = new Date()
      if (!updateData.status) {
        updateData.status = 'replied'
      }
    }

    const feedback = await prisma.feedback.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      message: 'Feedback başarıyla güncellendi',
      data: feedback,
    })
  }
)

export const GET = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)
    if (isNaN(id)) {
      throw new BadRequestError('Geçersiz feedback ID')
    }

    const feedback = await prisma.feedback.findUnique({
      where: { id },
    })

    if (!feedback) {
      throw new BadRequestError('Feedback bulunamadı')
    }

    return NextResponse.json({
      success: true,
      data: feedback,
    })
  }
)
