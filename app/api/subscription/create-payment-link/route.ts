import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-refactored'
import { createPaymentLink } from '@/lib/paytr'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'

// Bu metot PayTR ödeme linki oluşturur (POST).
// Girdi: NextRequest (JSON body: planId)
// Çıktı: NextResponse (paymentUrl)
// Hata: 400, 401, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new BadRequestError('Oturum bulunamadı')
  }

  const body = (await request.json()) as { planId?: string }
  const { planId } = body

  // Validation
  if (!planId) {
    throw new BadRequestError('Plan ID gerekli')
  }

  // Plan kontrolü
  const validPlans = ['premium', 'enterprise']
  if (!validPlans.includes(planId)) {
    throw new BadRequestError('Geçersiz plan')
  }

  // Plan fiyatları
  const planPrices: { [key: string]: number } = {
    premium: 250,
    enterprise: 450,
  }

  const amount = planPrices[planId]

  if (!amount || amount <= 0) {
    throw new BadRequestError('Geçersiz plan fiyatı')
  }

  // PayTR ödeme linki oluştur
  const paymentResult = await createPaymentLink({
    email: user.email,
    name: user.name,
    amount,
    productType: planId,
    productId: planId,
    userId: user.id,
    description: `${planId} plan abonelik ücreti`,
  })

  if (!paymentResult.success || !paymentResult.paymentUrl) {
    console.error('PayTR payment link creation failed:', paymentResult.error)
    throw new BadRequestError(paymentResult.error || 'Ödeme linki oluşturulamadı')
  }

  return NextResponse.json(
    {
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      paymentLinkId: paymentResult.paymentLinkId,
    },
    { status: 200 }
  )
})
