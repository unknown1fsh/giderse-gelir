import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth-refactored'
import { ExceptionMapper } from '@/server/errors'
import { UnauthorizedError, BadRequestError } from '@/server/errors'
import { sendSupportTicketCreatedEmail, sendAdminNewTicketNotification } from '@/lib/email'

/**
 * Benzersiz ticket number oluşturur
 */
function generateTicketNumber(): string {
  const now = new Date()
  const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '')
  const random = Math.floor(100000 + Math.random() * 900000)
  return `SUP-${dateStr}-${random}`
}

/**
 * Kullanıcının destek taleplerini listeler
 * GET /api/help/tickets
 */
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new UnauthorizedError('Oturum bulunamadı')
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')

  const where: { userId: number; status?: string } = {
    userId: user.id,
  }

  if (status) {
    where.status = status
  }

  const tickets = await prisma.supportTicket.findMany({
    where,
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json({
    success: true,
    data: tickets,
  })
})

/**
 * Yeni destek talebi oluşturur
 * POST /api/help/tickets
 */
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new UnauthorizedError('Oturum bulunamadı')
  }

  const body = (await request.json()) as {
    categoryId?: number | string
    subject?: string
    description?: string
    priority?: string
  }
  const { categoryId: rawCategoryId, subject, description, priority } = body

  if (!rawCategoryId || !subject || !description) {
    throw new BadRequestError('Kategori, konu ve açıklama gereklidir')
  }

  const categoryId = typeof rawCategoryId === 'string' ? parseInt(rawCategoryId, 10) : rawCategoryId

  if (isNaN(categoryId)) {
    throw new BadRequestError('Geçersiz kategori ID')
  }

  // Kategori kontrolü
  const category = await prisma.supportTicketCategory.findFirst({
    where: {
      id: categoryId,
      isActive: true,
    },
  })

  if (!category) {
    throw new BadRequestError('Geçersiz kategori')
  }

  // Benzersiz ticket number oluştur
  let ticketNumber = generateTicketNumber()
  let exists = await prisma.supportTicket.findUnique({
    where: { ticketNumber },
  })

  // Eğer varsa yeni bir tane oluştur
  while (exists) {
    ticketNumber = generateTicketNumber()
    exists = await prisma.supportTicket.findUnique({
      where: { ticketNumber },
    })
  }

  // Destek talebini oluştur
  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber,
      userId: user.id,
      categoryId,
      subject,
      description,
      status: 'pending',
      priority: priority || 'medium',
    },
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

  // Email bildirimleri gönder
  try {
    const { getDisplayName } = await import('@/lib/utils')
    const displayName = getDisplayName(user)
    await sendSupportTicketCreatedEmail(user.email, displayName, ticketNumber, subject)

    // Admin'lere bildirim gönder
    const admins = await prisma.user.findMany({
      where: {
        role: 'ADMIN',
        isActive: true,
      },
      select: {
        email: true,
      },
    })

    for (const admin of admins) {
      await sendAdminNewTicketNotification(
        admin.email,
        ticketNumber,
        displayName,
        user.email,
        subject,
        category.name
      )
    }
  } catch (emailError) {
    console.error('Email gönderme hatası:', emailError)
    // Email hatası ticket oluşturmayı engellemez
  }

  return NextResponse.json({
    success: true,
    data: ticket,
    message: 'Destek talebi başarıyla oluşturuldu',
  })
})
