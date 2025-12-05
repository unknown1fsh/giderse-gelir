import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError, NotFoundError } from '@/server/errors'
import { sendSupportTicketStatusChangedEmail } from '@/lib/email'

/**
 * Destek talebi detayını getirir (admin)
 * GET /api/admin/support-tickets/[id]
 */
export const GET = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    // ID veya ticket number ile arama yap
    const ticketId = parseInt(params.id)
    const isTicketNumber = params.id.startsWith('SUP-')

    let ticket

    if (isTicketNumber) {
      ticket = await prisma.supportTicket.findUnique({
        where: { ticketNumber: params.id },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          attachments: {
            orderBy: {
              uploadedAt: 'desc',
            },
          },
          replies: {
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
        },
      })
    } else if (!isNaN(ticketId)) {
      ticket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
        include: {
          category: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          attachments: {
            orderBy: {
              uploadedAt: 'desc',
            },
          },
          replies: {
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
        },
      })
    } else {
      throw new BadRequestError('Geçersiz talep ID veya numarası')
    }

    if (!ticket) {
      throw new NotFoundError('Destek talebi bulunamadı')
    }

    return NextResponse.json({
      success: true,
      data: ticket,
    })
  }
)

/**
 * Destek talebi durumunu günceller
 * PUT /api/admin/support-tickets/[id]
 */
export const PUT = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    // ID veya ticket number ile arama yap
    const ticketId = parseInt(params.id)
    const isTicketNumber = params.id.startsWith('SUP-')

    const body = await request.json()
    const { status, priority, resolvedBy } = body

    let existingTicket

    if (isTicketNumber) {
      existingTicket = await prisma.supportTicket.findUnique({
        where: { ticketNumber: params.id },
      })
    } else if (!isNaN(ticketId)) {
      existingTicket = await prisma.supportTicket.findUnique({
        where: { id: ticketId },
      })
    } else {
      throw new BadRequestError('Geçersiz talep ID veya numarası')
    }

    if (!existingTicket) {
      throw new NotFoundError('Destek talebi bulunamadı')
    }

    const oldStatus = existingTicket.status
    const updateData: any = {}

    if (status !== undefined) {
      updateData.status = status
      if (status === 'resolved' || status === 'closed') {
        updateData.resolvedAt = new Date()
        updateData.resolvedBy = adminCheck.user.id
      }
    }

    if (priority !== undefined) {
      updateData.priority = priority
    }

    if (resolvedBy !== undefined) {
      updateData.resolvedBy = resolvedBy
    }

    const updateWhere = isTicketNumber
      ? { ticketNumber: params.id }
      : { id: ticketId }

    const ticket = await prisma.supportTicket.update({
      where: updateWhere,
      data: updateData,
      include: {
        category: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    // Durum değiştiyse email gönder
    if (status && status !== oldStatus) {
      try {
        await sendSupportTicketStatusChangedEmail(
          ticket.user.email,
          ticket.user.name,
          ticket.ticketNumber,
          ticket.subject,
          oldStatus,
          status
        )
      } catch (emailError) {
        console.error('Email gönderme hatası:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      data: ticket,
      message: 'Destek talebi başarıyla güncellendi',
    })
  }
)

