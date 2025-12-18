import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { UserMapper } from '@/server/mappers/UserMapper'
import { isValidPlanId, getPlanPrice, PLAN_IDS } from '@/lib/plan-config'
import { Prisma } from '@prisma/client'

// Kullanıcı listesi
export const GET = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const limit = parseInt(searchParams.get('limit') || '50')
  const search = searchParams.get('search') || ''
  const role = searchParams.get('role') || ''
  const isActive = searchParams.get('isActive')

  const skip = (page - 1) * limit

  // Arama ve filtreleme koşulları
  const where: Prisma.UserWhereInput = {}

  if (search) {
    where.OR = [
      { email: { contains: search, mode: 'insensitive' } },
      { name: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ]
  }

  if (role) {
    where.role = role
  }

  if (isActive !== null && isActive !== undefined) {
    where.isActive = isActive === 'true'
  }

  // Toplam sayfa sayısı için count
  const total = await prisma.user.count({ where })

  // Kullanıcıları getir
  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  // UserDTO'ya dönüştür
  const userDTOs = users.map(user => UserMapper.prismaToDTO(user))

  return NextResponse.json({
    success: true,
    data: {
      users: userDTOs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    },
  })
})

// Kullanıcı güncelleme (role, isActive, plan vb.)
export const PUT = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const adminCheck = await requireAdmin(request)
  if (adminCheck.error) {
    return adminCheck.error
  }

  const body = (await request.json()) as {
    userId?: number
    role?: string
    isActive?: boolean
    planId?: string
  }
  const { userId, role, isActive, planId } = body

  if (!userId) {
    return NextResponse.json({ error: 'Kullanıcı ID gerekli' }, { status: 400 })
  }

  const updateData: Prisma.UserUpdateInput = {}

  if (role !== undefined) {
    updateData.role = role
  }

  if (isActive !== undefined) {
    updateData.isActive = isActive
  }

  let subscriptionCreated = false

  // Plan değiştirme işlemi
  if (planId !== undefined) {
    if (!planId || !isValidPlanId(planId)) {
      return NextResponse.json({ error: 'Geçersiz plan ID' }, { status: 400 })
    }

    // Mevcut aktif aboneliği bul
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    // Eğer kullanıcı zaten bu plandaysa, hata döndürme (sessizce başarılı sayalım)
    if (existingSubscription && existingSubscription.planId === planId) {
      // Plan değişikliği yok, sadece user bilgilerini güncelle
      subscriptionCreated = false
    } else {
      // Eski aboneliği iptal et (eğer varsa)
      if (existingSubscription) {
        await prisma.userSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        })
      }

      // Yeni abonelik oluştur
      const planPrice = getPlanPrice(planId)
      const startDate = new Date()
      // 30 gün abonelik (admin manuel değişiklik)
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

      await prisma.userSubscription.create({
        data: {
          userId,
          planId,
          status: 'active',
          startDate,
          endDate,
          amount: planPrice,
          currency: 'TRY',
          paymentMethod: 'admin_manual',
          transactionId: `admin_${Date.now()}_${userId}`,
          autoRenew: planId !== PLAN_IDS.FREE,
        },
      })
      subscriptionCreated = true
    }
  }

  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: updateData,
    include: {
      subscriptions: {
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  })

  const userDTO = UserMapper.prismaToDTO(updatedUser)

  return NextResponse.json({
    success: true,
    data: userDTO,
    subscriptionCreated,
  })
})
