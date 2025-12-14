import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'
import { ExceptionMapper } from '@/server/errors'
import { BadRequestError } from '@/server/errors'

// Ödeme talebi güncelleme (onay/red)
export const PUT = ExceptionMapper.asyncHandler(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const adminCheck = await requireAdmin(request)
    if (adminCheck.error) {
      return adminCheck.error
    }

    const { id: paramId } = await params
    const id = parseInt(paramId)
    if (isNaN(id)) {
      throw new BadRequestError('Geçersiz ID')
    }

    const body = await request.json()
    const { status, adminNotes } = body as { status: string; adminNotes?: string }

    if (!status || !['approved', 'rejected'].includes(status)) {
      throw new BadRequestError('Geçersiz durum. approved veya rejected olmalı.')
    }

    // Payment request'i bul
    const paymentRequest = await prisma.paymentRequest.findUnique({
      where: { id },
      include: { user: true },
    })

    if (!paymentRequest) {
      throw new BadRequestError('Ödeme talebi bulunamadı')
    }

    if (paymentRequest.status !== 'pending') {
      throw new BadRequestError('Bu talep zaten işleme alınmış')
    }

    // Güncelle
    const updated = await prisma.paymentRequest.update({
      where: { id },
      data: {
        status,
        adminNotes,
        approvedBy: adminCheck.user?.id,
        approvedAt: status === 'approved' ? new Date() : null,
        rejectedAt: status === 'rejected' ? new Date() : null,
      },
    })

    // Eğer onaylandıysa subscription oluştur
    if (status === 'approved') {
      // Mevcut aktif subscription'ı iptal et
      await prisma.userSubscription.updateMany({
        where: {
          userId: paymentRequest.userId,
          status: 'active',
        },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      })

      // Yeni subscription oluştur
      const startDate = new Date()
      const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 gün

      await prisma.userSubscription.create({
        data: {
          userId: paymentRequest.userId,
          planId: paymentRequest.planId,
          status: 'active',
          startDate,
          endDate,
          amount: paymentRequest.amount,
          currency: paymentRequest.currency,
          paymentMethod: 'manual',
          transactionId: `manual_${paymentRequest.id}_${Date.now()}`,
          autoRenew: false,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? 'Talep onaylandı' : 'Talep reddedildi',
      data: updated,
    })
  }
)
