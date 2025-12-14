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
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const { id } = await params

    // ID veya ticket number ile arama yap
    const ticketId = parseInt(id)
    const isTicketNumber = id.startsWith('SUP-')

    const body = (await request.json()) as { message?: string; isInternal?: boolean }
    const { message, isInternal } = body

    if (!message || message.trim().length === 0) {
      throw new BadRequestError('Yanıt mesajı gereklidir')
    }

    type TicketWithRelations = {
      id: number
      ticketNumber: string
      subject: string
      user: {
        id: number
        name: string
        email: string
      }
      category: {
        id: number
        name: string
      }
    }

    let ticket: TicketWithRelations | null = null

    if (isTicketNumber) {
      ticket = (await prisma.supportTicket.findUnique({
        where: { ticketNumber: id },
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
      })) as TicketWithRelations | null
    } else if (!isNaN(ticketId)) {
      ticket = (await prisma.supportTicket.findUnique({
        where: { id: ticketId },
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
      })) as TicketWithRelations | null
    } else {
      throw new BadRequestError('Geçersiz talep ID veya numarası')
    }

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
