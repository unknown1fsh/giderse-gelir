import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'

export const PUT = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const adminUser = adminCheck.user as { id: number } | null
    const { id } = await params
    const paymentRequestId = parseInt(id)

    if (isNaN(paymentRequestId)) {
      throw new BadRequestError('Geçersiz ödeme talebi ID')
    }

    const body = (await request.json()) as { action: string; adminNotes?: string }
    const { action, adminNotes } = body

    if (!action || !['approve', 'reject'].includes(action)) {
      throw new BadRequestError('Geçerli bir aksiyon gerekli (approve veya reject)')
    }

    // Ödeme talebini bul
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id: paymentRequestId },
      include: {
        user: true,
      },
    })

    if (!paymentRequest) {
      throw new BadRequestError('Ödeme talebi bulunamadı')
    }

    if (paymentRequest.status !== 'pending') {
      throw new BadRequestError('Bu ödeme talebi zaten işleme alınmış')
    }

    if (action === 'approve') {
      // Ödeme talebini onayla
      await prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: {
          status: 'approved',
          approvedBy: adminUser ? adminUser.id : null,
          approvedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      })

      // Mevcut aktif aboneliği kontrol et
      const existingSubscription = await prisma.userSubscription.findFirst({
        where: {
          userId: paymentRequest.userId,
          status: 'active',
        },
        orderBy: { createdAt: 'desc' },
      })

      // Yeni abonelik oluştur
      const startDate = new Date()
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün

      const subscription = await prisma.userSubscription.create({
        data: {
          userId: paymentRequest.userId,
          planId: paymentRequest.planId,
          status: 'active',
          startDate,
          endDate,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          paymentMethod: 'bank_transfer',
          transactionId: `payment_${paymentRequestId}`,
          autoRenew: paymentRequest.planId !== 'free',
        },
      })

      // Eski aboneliği iptal et (eğer varsa ve farklı plan ise)
      if (existingSubscription && existingSubscription.planId !== paymentRequest.planId) {
        await prisma.userSubscription.update({
          where: { id: existingSubscription.id },
          data: {
            status: 'cancelled',
            cancelledAt: new Date(),
          },
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Ödeme talebi onaylandı ve abonelik aktif edildi',
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
      })
    } else {
      // Ödeme talebini reddet
      await prisma.paymentRequest.update({
        where: { id: paymentRequestId },
        data: {
          status: 'rejected',
          rejectedAt: new Date(),
          adminNotes: adminNotes || null,
        },
      })

      return NextResponse.json({
        success: true,
        message: 'Ödeme talebi reddedildi',
      })
    }
  }
)
