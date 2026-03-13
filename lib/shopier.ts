import crypto from 'crypto'

// Shopier API konfigürasyonu
const SHOPIER_CLIENT_ID = process.env.SHOPIER_CLIENT_ID || ''
const SHOPIER_CLIENT_SECRET = process.env.SHOPIER_CLIENT_SECRET || ''
const SHOPIER_WEBHOOK_TOKEN = process.env.SHOPIER_WEBHOOK_TOKEN || ''
const SHOPIER_API_KEY = process.env.SHOPIER_API_KEY || ''

export interface ShopierWebhookData {
  // Shopier v2 webhook olay bildirimi verileri
  event: string                   // Olay tipi: order.created, order.fulfilled, vb.
  payload: {
    id: string                    // Sipariş ID
    order_number: string          // Sipariş numarası
    status: string                // Sipariş durumu
    total_price: string           // Toplam tutar
    currency: string              // Para birimi
    customer: {
      email: string               // Müşteri e-posta
      first_name: string          // Müşteri adı
      last_name: string           // Müşteri soyadı
      phone: string               // Müşteri telefon
    }
    line_items: Array<{
      product_id: string          // Ürün ID
      title: string               // Ürün başlığı
      price: string               // Ürün fiyatı
      quantity: number             // Ürün adedi
    }>
    created_at: string            // Oluşturulma tarihi
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * Shopier webhook imzasını doğrular.
 * Shopier, webhook gönderirken X-Shopier-Hmac-Sha256 header'ı ile HMAC imza gönderir.
 * İmza, webhook token veya client secret kullanılarak doğrulanır.
 */
export function verifyShopierWebhook(body: string, signatureHeader: string): boolean {
  // Webhook Token ile doğrula
  const secret = SHOPIER_WEBHOOK_TOKEN || SHOPIER_CLIENT_SECRET

  if (!secret) {
    console.error('[Shopier] Webhook Token veya Client Secret tanımlı değil')
    return false
  }

  try {
    const calculatedHmac = crypto
      .createHmac('sha256', secret)
      .update(body, 'utf8')
      .digest('base64')

    return calculatedHmac === signatureHeader
  } catch (error) {
    console.error('[Shopier] Webhook imza doğrulama hatası:', error)
    return false
  }
}

/**
 * Shopier API üzerinden siparişi doğrular.
 * Kişisel Erişim Anahtarı (JWT) ile Bearer auth kullanarak sipariş bilgisini çeker.
 */
export async function verifyOrderViaApi(orderId: string): Promise<boolean> {
  if (!SHOPIER_API_KEY) {
    console.warn('[Shopier] API_KEY tanımlı değil, API doğrulama yapılamıyor')
    return false
  }

  try {
    const response = await fetch(`https://api.shopier.com/v2/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SHOPIER_API_KEY}`,
        'Accept': 'application/json',
      },
    })

    if (response.ok) {
      console.log('[Shopier] API sipariş doğrulama başarılı:', orderId)
      return true
    }

    console.warn('[Shopier] API sipariş doğrulaması başarısız, HTTP:', response.status)
    return false
  } catch (error) {
    console.error('[Shopier] API sipariş doğrulama hatası:', error)
    return false
  }
}

/**
 * Shopier ödeme tutarından plan ID'sini belirler.
 * Premium: ₺149, Aile: ₺249
 */
export function determinePlanFromAmount(amount: number): 'premium' | 'family' | null {
  if (Math.abs(amount - 149) < 5) { return 'premium' }
  if (Math.abs(amount - 249) < 5) { return 'family' }
  return null
}

/**
 * Shopier ürün ID'sinden plan ID'sini belirler.
 * Shopier ürün linkleri:
 *   Premium: 45196765
 *   Aile:    45196957
 */
export function determinePlanFromProductId(productId: string): 'premium' | 'family' | null {
  if (productId === '45196765') { return 'premium' }
  if (productId === '45196957') { return 'family' }
  return null
}

/**
 * Shopier webhook verisini parse eder ve plan bilgisini döndürür.
 */
export function parseShopierWebhook(data: ShopierWebhookData) {
  const payload = data.payload
  const amount = parseFloat(payload.total_price) || 0
  const email = (payload.customer?.email || '').trim().toLowerCase()
  const lineItem = payload.line_items?.[0]

  // Önce ürün ID'sinden plan belirle, bulamazsa tutardan belirle
  const planId = (lineItem ? determinePlanFromProductId(lineItem.product_id) : null)
    || determinePlanFromAmount(amount)

  return {
    event: data.event,
    orderId: payload.id,
    orderNumber: payload.order_number,
    email,
    buyerName: `${payload.customer?.first_name || ''} ${payload.customer?.last_name || ''}`.trim(),
    amount,
    planId,
    status: payload.status,
    productId: lineItem?.product_id || '',
    productName: lineItem?.title || '',
    createdAt: payload.created_at,
  }
}

// Client ID'yi dışarıya sun (gerekirse)
export { SHOPIER_CLIENT_ID, SHOPIER_CLIENT_SECRET }
