import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'
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

  let categories = await prisma.supportTicketCategory.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      name: 'asc',
    },
  })

  // Eğer hiç kategori yoksa varsayılan kategorileri oluştur
  if (categories.length === 0) {
    const defaultCategories = [
      {
        name: 'Üyelik',
        description: 'Üyelik ve abonelik talepleri',
        icon: 'Crown',
        color: 'purple',
      },
      {
        name: 'Teknik Destek',
        description: 'Teknik sorunlar ve yardım',
        icon: 'Settings',
        color: 'blue',
      },
      {
        name: 'Hesap Yönetimi',
        description: 'Hesap ayarları ve yönetimi',
        icon: 'User',
        color: 'green',
      },
      {
        name: 'Ödeme',
        description: 'Ödeme ve faturalama sorunları',
        icon: 'CreditCard',
        color: 'orange',
      },
      {
        name: 'Öneri ve Şikayet',
        description: 'Öneriler ve şikayetler',
        icon: 'MessageSquare',
        color: 'pink',
      },
      { name: 'Diğer', description: 'Diğer konular', icon: 'HelpCircle', color: 'gray' },
    ]

    // Varsayılan kategorileri oluştur
    const createdCategories = await Promise.all(
      defaultCategories.map(cat =>
        prisma.supportTicketCategory.create({
          data: {
            name: cat.name,
            description: cat.description,
            icon: cat.icon,
            color: cat.color,
            isActive: true,
          },
        })
      )
    )

    categories = createdCategories
  }

  return NextResponse.json({
    success: true,
    data: categories,
  })
})
