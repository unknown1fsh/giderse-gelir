import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, NotFoundError } from '@/server/errors'
import { sendSupportTicketReplyEmail } from '@/lib/email'

/**
 * Destek talebine yanıt ekler (admin)
 * POST /api/admin/support-tickets/[id]/replies
 */
export const POST = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    // ID veya ticket number ile arama yap
    const ticketId = parseInt(params.id)
    const isTicketNumber = params.id.startsWith('SUP-')

    const body = await request.json()
    const { message, isInternal } = body

    if (!message || message.trim().length === 0) {
      throw new BadRequestError('Yanıt mesajı gereklidir')
    }

    let ticket

    if (isTicketNumber) {
      ticket = await prisma.supportTicket.findUnique({
        where: { ticketNumber: params.id },
      })
    } else if (!isNaN(ticketId)) {
      ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      })
    } else {
      throw new BadRequestError('Geçersiz talep ID veya numarası')
    }
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        category: true,
      },
    })

    if (!ticket) {
      throw new NotFoundError('Destek talebi bulunamadı')
    }

    // Yanıt oluştur
    const reply = await prisma.supportTicketReply.create({
      data: {
        ticketId: ticket.id,
        userId: adminCheck.user.id,
        message: message.trim(),
        isInternal: isInternal || false,
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
    })

    // Eğer public yanıtsa kullanıcıya email gönder
    if (!isInternal) {
      try {
        await sendSupportTicketReplyEmail(
          ticket.user.email,
          ticket.user.name,
          ticket.ticketNumber,
          ticket.subject,
          message.trim()
        )
      } catch (emailError) {
        console.error('Email gönderme hatası:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      data: reply,
      message: 'Yanıt başarıyla eklendi',
    })
  }
)

