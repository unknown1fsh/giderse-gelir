import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'
import { ExceptionMapper } from '@/server/errors'
import { UnauthorizedError, NotFoundError } from '@/server/errors'

/**
 * Destek talebi detayını getirir
 * GET /api/help/tickets/[id]
 */
export const GET = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const user = await getCurrentUser(request)

    if (!user) {
      throw new UnauthorizedError('Oturum bulunamadı')
    }

    // ID veya ticket number ile arama yap
    const ticketId = parseInt(params.id)
    const isTicketNumber = params.id.startsWith('SUP-')

    const where: { userId: number; ticketNumber?: string; id?: number } = {
      userId: user.id, // Kullanıcı sadece kendi taleplerini görebilir
    }

    if (isTicketNumber) {
      where.ticketNumber = params.id
    } else if (!isNaN(ticketId)) {
      where.id = ticketId
    } else {
      throw new NotFoundError('Geçersiz talep ID veya numarası')
    }

    const ticket = await prisma.supportTicket.findFirst({
      where,
      include: {
        category: true,
        attachments: {
          orderBy: {
            uploadedAt: 'desc',
          },
        },
        replies: {
          where: {
            isInternal: false, // Kullanıcılar sadece public yanıtları görür
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!ticket) {
      throw new NotFoundError('Destek talebi bulunamadı')
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    })
  }
)

