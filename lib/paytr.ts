import crypto from 'crypto'

// PayTR API konfigürasyonu
const MERCHANT_ID = process.env.PAYTR_MERCHANT_ID
const MERCHANT_KEY = process.env.PAYTR_MERCHANT_KEY
const MERCHANT_SALT = process.env.PAYTR_MERCHANT_SALT
const PAYTR_API_URL = process.env.PAYTR_API_URL || 'https://www.paytr.com/odeme'

interface CreatePaymentLinkParams {
  planId?: string
  email: string
  name: string
  amount: number // TL cinsinden (örn: 250.00)
  productType: string // 'subscription', 'premium', 'enterprise', vb.
  productId?: string // Opsiyonel: spesifik ürün ID'si
  userId: number
  description?: string
  successUrl?: string // Opsiyonel: başarılı ödeme sonrası yönlendirme URL'i
  failUrl?: string // Opsiyonel: başarısız ödeme sonrası yönlendirme URL'i
  userIp?: string // Opsiyonel: kullanıcı IP adresi
}

interface PaymentLinkResponse {
  success: boolean
  paymentUrl?: string
  error?: string
  paymentLinkId?: string
}

/**
 * PayTR ödeme linki oluşturur
 * PayTR API dokümantasyonuna göre: https://www.paytr.com/odeme/api
 */
export async function createPaymentLink(
  _params: CreatePaymentLinkParams
): Promise<PaymentLinkResponse> {
  if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
    return {
      success: false,
      error: 'PayTR API bilgileri yapılandırılmamış',
    }
  }

  try {
    const {
      email,
      name,
      amount,
      productType,
      productId,
      userId,
      description,
      successUrl,
      failUrl,
      userIp = '127.0.0.1',
    } = _params

    // PayTR için ödeme linki oluşturma parametreleri
    // PayTR'nin ödeme linki API'si için gerekli alanlar
    const timestamp = Date.now()
    const merchantOrderId = `pay_${userId}_${productType}_${timestamp}${productId ? `_${productId}` : ''}`
    const userBasket = `${productType}${productId ? ` ${productId}` : ''}|${amount}|1`
    const currency = 'TL'

    // Varsayılan açıklama
    const paymentDescription = description || `${productType} ödeme`

    // Varsayılan success/fail URL'leri
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const defaultSuccessUrl = `${baseUrl}/premium/payment-success?merchant_oid=${merchantOrderId}`
    const defaultFailUrl = `${baseUrl}/premium/payment-failed?merchant_oid=${merchantOrderId}`
    const finalSuccessUrl = successUrl || defaultSuccessUrl
    const finalFailUrl = failUrl || defaultFailUrl

    // PayTR hash oluşturma (PayTR dokümantasyonuna göre)
    const hashString = `${MERCHANT_ID}${merchantOrderId}${amount}${userBasket}${MERCHANT_SALT}`
    const hash = crypto.createHash('sha256').update(hashString).digest('base64')

    // PayTR API çağrısı - ödeme linki oluşturma
    // Not: PayTR'nin gerçek API endpoint'i ve formatı dokümantasyonda belirtilmelidir
    // Burada genel bir yapı oluşturulmuştur
    const paymentData: Record<string, string> = {
      merchant_id: MERCHANT_ID ?? '',
      merchant_key: MERCHANT_KEY ?? '',
      merchant_salt: MERCHANT_SALT ?? '',
      merchant_oid: merchantOrderId,
      email: email,
      payment_amount: String(amount * 100), // PayTR kuruş cinsinden istiyor
      user_basket: Buffer.from(userBasket).toString('base64'),
      user_name: name,
      user_address: '', // Şahıs için opsiyonel
      user_phone: '', // Şahıs için opsiyonel
      merchant_ok_url: finalSuccessUrl,
      merchant_fail_url: finalFailUrl,
      user_ip: userIp,
      timeout_limit: '30',
      currency: currency,
      test_mode: process.env.NODE_ENV !== 'production' ? '1' : '0',
      hash: hash,
      description: paymentDescription,
    }

    // PayTR API'ye POST isteği
    // Not: PayTR'nin gerçek endpoint'i dokümantasyonda belirtilmelidir
    // Örnek: https://www.paytr.com/odeme/api/get-token
    const response = await fetch('https://www.paytr.com/odeme/api/get-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams(
        Object.entries(paymentData).map(([key, value]) => [key, String(value)])
      ),
    })

    const responseData: string = await response.text()

    // PayTR response parse etme (genellikle "status=success&token=xxx" formatında)
    const params = new URLSearchParams(responseData)
    const status: string | null = params.get('status')
    const token: string | null = params.get('token')

    if (status === 'success' && token) {
      // PayTR ödeme sayfası URL'i
      const paymentUrl = `${PAYTR_API_URL}?token=${token}`

      return {
        success: true,
        paymentUrl,
        paymentLinkId: merchantOrderId,
      }
    } else {
      const errorMessage: string | null = params.get('reason')
      return {
        success: false,
        error: errorMessage || 'Ödeme linki oluşturulamadı',
      }
    }
  } catch (error) {
    console.error('PayTR payment link creation error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ödeme linki oluşturulamadı',
    }
  }
}

/**
 * PayTR webhook callback'ini doğrular
 */
export function verifyPaytrWebhook(data: Record<string, string>): boolean {
  if (!MERCHANT_KEY || !MERCHANT_SALT) {
    return false
  }

  try {
    const {
      merchant_oid,
      status,
      total_amount,
      hash,
      // ... diğer PayTR webhook parametreleri
    } = data

    // PayTR webhook hash doğrulama
    // PayTR dokümantasyonuna göre hash oluşturma
    const hashString = `${MERCHANT_ID}${merchant_oid}${MERCHANT_SALT}${status}${total_amount}`
    const calculatedHash = crypto.createHash('sha256').update(hashString).digest('base64')

    return calculatedHash === hash
  } catch (error) {
    console.error('PayTR webhook verification error:', error)
    return false
  }
}

/**
 * PayTR ödeme durumunu kontrol eder
 */
export async function checkPaymentStatus(
  merchantOrderId: string
): Promise<{ success: boolean; status?: string; error?: string }> {
  if (!MERCHANT_ID || !MERCHANT_KEY || !MERCHANT_SALT) {
    return {
      success: false,
      error: 'PayTR API bilgileri yapılandırılmamış',
    }
  }

  try {
    // PayTR ödeme durumu sorgulama API'si
    // Not: PayTR'nin gerçek endpoint'i dokümantasyonda belirtilmelidir
    const hashString = `${MERCHANT_ID}${merchantOrderId}${MERCHANT_SALT}`
    const hash = crypto.createHash('sha256').update(hashString).digest('base64')

    const response = await fetch('https://www.paytr.com/odeme/durum-sorgula', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        merchant_id: MERCHANT_ID,
        merchant_oid: merchantOrderId,
        hash: hash,
      }),
    })

    const responseData = await response.text()
    const params = new URLSearchParams(responseData)
    const status = params.get('status')

    if (status === 'success') {
      return {
        success: true,
        status: 'success',
      }
    } else {
      return {
        success: false,
        status: params.get('status') || 'unknown',
        error: params.get('reason') || 'Ödeme durumu sorgulanamadı',
      }
    }
  } catch (error) {
    console.error('PayTR payment status check error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Ödeme durumu sorgulanamadı',
    }
  }
}
