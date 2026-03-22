import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  verifyShopierWebhook,
  verifyOrderViaApi,
  parseShopierWebhook,
  ShopierWebhookData,
} from '@/lib/shopier'

// Shopier v2 webhook endpoint — sipariş oluşturulduğunda veya tamamlandığında çağrılır
// Kullanıcı eşleştirmesi alıcı e-posta adresi üzerinden yapılır
export async function POST(request: NextRequest) {
  try {
    // Ham body'yi al (imza doğrulaması için)
    const rawBody = await request.text()

    // İmza doğrulaması — X-Shopier-Hmac-Sha256 header'ıyla
    const signatureHeader = request.headers.get('x-shopier-hmac-sha256') || ''

    if (signatureHeader) {
      const isValid = verifyShopierWebhook(rawBody, signatureHeader)
      if (!isValid) {
        console.error('[Shopier Webhook] İmza doğrulaması başarısız')
        return NextResponse.json(
          { success: false, message: 'Geçersiz imza' },
          { status: 401 }
        )
      }
    } else {
      console.warn('[Shopier Webhook] İmza header\'ı eksik, doğrulama atlandı')
    }

    // Body'yi parse et
    let webhookData: ShopierWebhookData
    try {
      webhookData = JSON.parse(rawBody) as ShopierWebhookData
    } catch {
      console.error('[Shopier Webhook] JSON parse hatası')
      return NextResponse.json(
        { success: false, message: 'Geçersiz JSON' },
        { status: 400 }
      )
    }

    // Sadece sipariş olaylarını işle
    if (webhookData.event !== 'order.created' && webhookData.event !== 'order.fulfilled') {
      return NextResponse.json({ success: true, message: 'Olay atlandı' }, { status: 200 })
    }

    // Webhook verisini parse et
    const parsed = parseShopierWebhook(webhookData)

    // API üzerinden sipariş doğrulaması (ek güvenlik)
    if (parsed.orderId) {
      await verifyOrderViaApi(parsed.orderId)
    }

    // Plan belirlenebilir mi?
    if (!parsed.planId) {
      console.error('[Shopier Webhook] Plan belirlenemedi. Tutar:', parsed.amount, 'Ürün:', parsed.productId)
      return NextResponse.json(
        { success: false, message: 'Geçersiz ürün veya tutar' },
        { status: 400 }
      )
    }

    // E-posta ile kullanıcıyı bul
    if (!parsed.email) {
      console.error('[Shopier Webhook] Alıcı e-posta adresi bulunamadı')
      return NextResponse.json(
        { success: false, message: 'E-posta adresi eksik' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.email },
    })

    if (!user) {
      console.error('[Shopier Webhook] Kullanıcı bulunamadı. E-posta:', parsed.email)
      return NextResponse.json(
        { success: false, message: 'Kullanıcı bulunamadı' },
        { status: 404 }
      )
    }

    // Aynı sipariş için daha önce abonelik oluşturulmuş mu kontrol et (duplicate koruma)
    const existingTransaction = await prisma.userSubscription.findFirst({
      where: {
        transactionId: `shopier_${parsed.orderId}`,
      },
    })

    if (existingTransaction) {
      return NextResponse.json({ success: true, message: 'Sipariş zaten işlenmiş' }, { status: 200 })
    }

    // Mevcut aktif aboneliği kontrol et
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: user.id,
        status: 'active',
      },
      orderBy: { createdAt: 'desc' },
    })

    // Yeni abonelik oluştur (30 günlük)
    const startDate = new Date()
    const endDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

    await prisma.userSubscription.create({
      data: {
        userId: user.id,
        planId: parsed.planId,
        status: 'active',
        startDate,
        endDate,
        amount: parsed.amount,
        currency: 'TRY',
        paymentMethod: 'shopier',
        transactionId: `shopier_${parsed.orderId}`,
        autoRenew: true,
      },
    })

    // Eski aboneliği iptal et (eğer varsa ve farklı plan ise)
    if (existingSubscription && existingSubscription.planId !== parsed.planId) {
      await prisma.userSubscription.update({
        where: { id: existingSubscription.id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
        },
      })
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error('[Shopier Webhook] Hata:', error)
    return NextResponse.json(
      { success: false, message: 'Sunucu hatası' },
      { status: 500 }
    )
  }
}
