import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth-refactored'
import { createPaymentLink } from '@/lib/paytr'
import { getClientIp } from '@/lib/rate-limit'
import { prisma } from '@/lib/prisma'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'

// Bu metot genel ödeme linki oluşturur (POST).
// Girdi: NextRequest (JSON body: productType, productId?, amount, description?)
// Çıktı: NextResponse (paymentUrl, paymentLinkId)
// Hata: 400, 401, 500
export const POST = ExceptionMapper.asyncHandler(async (request: NextRequest) => {
  const user = await getCurrentUser(request)

  if (!user) {
    throw new BadRequestError('Oturum bulunamadı')
  }

  const body = (await request.json()) as {
    productType: string
    productId?: string
    amount: number
    description?: string
  }

  const { productType, productId, amount, description } = body

  // Validation
  if (!productType || typeof productType !== 'string') {
    throw new BadRequestError('Ürün tipi gerekli')
  }

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    throw new BadRequestError('Geçerli bir tutar gerekli')
  }

  // Plan kontrolü (premium/enterprise için)
  if (productType === 'subscription' || productType === 'premium' || productType === 'enterprise') {
    const validPlans = ['premium', 'enterprise']
    const planId = productId || productType === 'subscription' ? productId : productType

    if (planId && !validPlans.includes(planId)) {
      throw new BadRequestError('Geçersiz plan')
    }

    // Plan fiyatları kontrolü
    const planPrices: { [key: string]: number } = {
      premium: 250,
      enterprise: 450,
    }

    const expectedAmount = planId ? planPrices[planId] : null
    if (expectedAmount && Math.abs(amount - expectedAmount) > 0.01) {
      throw new BadRequestError(
        `Plan fiyatı ${expectedAmount}₺ olmalıdır. Girilen tutar: ${amount}₺`
      )
    }
  }

  // Kullanıcı IP adresini al
  const userIp = getClientIp(request)

  // PayTR ödeme linki oluştur
  const { getDisplayName } = await import('@/lib/utils')
  const displayName = getDisplayName(user)
  const paymentResult = await createPaymentLink({
    email: user.email,
    name: displayName,
    amount,
    productType,
    productId,
    userId: user.id,
    description: description || `${productType} ödeme`,
    userIp,
  })

  if (!paymentResult.success || !paymentResult.paymentUrl || !paymentResult.paymentLinkId) {
    console.error('PayTR payment link creation failed:', paymentResult.error)
    throw new BadRequestError(paymentResult.error || 'Ödeme linki oluşturulamadı')
  }

  // Ödeme kaydı oluştur (PaymentRequest modelinde)
  // merchant_oid formatı: pay_{userId}_{productType}_{timestamp}
  const merchantOid = paymentResult.paymentLinkId
  const planIdForDb =
    productId ||
    (productType === 'premium'
      ? 'premium'
      : productType === 'enterprise'
        ? 'enterprise'
        : productType)

  await prisma.paymentRequest.create({
    data: {
      userId: user.id,
      planId: planIdForDb,
      amount,
      currency: 'TRY',
      description: description || `${productType} ödeme - ${merchantOid}`,
      status: 'pending',
    },
  })

  return NextResponse.json(
    {
      success: true,
      paymentUrl: paymentResult.paymentUrl,
      paymentLinkId: paymentResult.paymentLinkId,
    },
    { status: 200 }
  )
})
