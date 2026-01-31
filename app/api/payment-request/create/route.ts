import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'

export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new BadRequestError('Oturum bulunamadı')
  }

  const body = (await request.json()) as {
    planId: string
    amount: number
    description?: string
  }
  const { planId, amount, description } = body

  // Validation
  if (!planId || typeof planId !== 'string') {
    throw new BadRequestError('Plan ID gerekli')
  }

  if (!amount || amount <= 0) {
    throw new BadRequestError('Geçerli bir tutar gerekli')
  }

  // Plan kontrolü
  const validPlans = ['premium', 'enterprise']
  if (!validPlans.includes(planId)) {
    throw new BadRequestError('Geçersiz plan')
  }

  // Plan fiyatları kontrolü
  const planPrices: { [key: string]: number } = {
    premium: 250,
    enterprise: 450,
  }

  const expectedAmount = planPrices[planId]
  if (Math.abs(amount - expectedAmount) > 0.01) {
    throw new BadRequestError(`Plan fiyatı ${expectedAmount}₺ olmalıdır. Girilen tutar: ${amount}₺`)
  }

  // Ödeme talebi oluştur
  const paymentRequest = await prisma.paymentRequest.create({
    data: {
      userId: user.id,
      planId,
      amount,
      currency: 'TRY',
      description: description || `${user.email} - BAĞIŞ`,
      status: 'pending',
    },
  })

  return NextResponse.json(
    {
      success: true,
      message: 'Ödeme talebiniz alındı. Admin onayından sonra premium üyeliğiniz aktif olacaktır.',
      paymentRequest: {
        id: paymentRequest.id,
        planId: paymentRequest.planId,
        amount: paymentRequest.amount,
        status: paymentRequest.status,
        createdAt: paymentRequest.createdAt,
      },
    },
    { status: 201 }
  )
})
