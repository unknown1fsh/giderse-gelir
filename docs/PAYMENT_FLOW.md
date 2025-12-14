# Ödeme Akışı Dokümantasyonu

## Genel Bakış

GiderSe Gelir uygulaması PayTR entegrasyonu ile güvenli ödeme işlemleri yapar. Bu dokümantasyon ödeme akışını detaylı olarak açıklar.

## Ödeme Yöntemleri

### 1. PayTR Online Ödeme (Premium & Enterprise)

- Kredi Kartı
- Banka Kartı
- 3D Secure
- Taksit seçenekleri

### 2. Manuel Onay (Enterprise Premium)

- Banka Havalesi
- EFT
- Admin onayı gerektirir

## PayTR Entegrasyonu

### Konfigürasyon

Environment variables:

```bash
PAYTR_MERCHANT_ID=your_merchant_id
PAYTR_MERCHANT_KEY=your_merchant_key
PAYTR_MERCHANT_SALT=your_merchant_salt
PAYTR_API_URL=https://www.paytr.com/odeme
```

### PayTR Helper Functions

`lib/paytr.ts` dosyasında tanımlı fonksiyonlar:

```typescript
// Ödeme linki oluştur
createPaymentLink(params: CreatePaymentLinkParams): Promise<PaymentLinkResponse>

// Webhook doğrula
verifyPaytrWebhook(data: Record<string, string>): boolean

// Ödeme durumu sorgula
checkPaymentStatus(merchantOrderId: string): Promise<PaymentStatusResponse>
```

## Ödeme Akışı - Premium/Enterprise

### 1. Kullanıcı İsteği

Kullanıcı `/premium` sayfasından plan seçer:

```typescript
// app/premium/page.tsx
const handleUpgrade = (planId: string, amount: number) => {
  router.push(`/payment?planId=${planId}&productType=${planId}&amount=${amount}&description=...`)
}
```

### 2. Ödeme Sayfası

`/payment` sayfası açılır (`app/payment/page.tsx`):

```typescript
// Query parametreleri kontrol edilir
const productType = searchParams.get('productType')
const amount = parseFloat(searchParams.get('amount'))

// PaymentCheckout komponenti render edilir
<PaymentCheckout
  productType={productType}
  amount={amount}
  onSuccess={() => {}}
  onError={() => {}}
/>
```

### 3. PayTR Ödeme Linki Oluşturma

`components/payment-checkout.tsx` komponenti:

```typescript
const handlePayment = async () => {
  // API çağrısı
  const response = await fetch('/api/payment/create', {
    method: 'POST',
    body: JSON.stringify({
      productType,
      productId,
      amount,
      description,
    }),
  })

  const data = await response.json()

  // PayTR sayfasına yönlendir
  if (data.paymentUrl) {
    window.location.href = data.paymentUrl
  }
}
```

### 4. API Endpoint - Payment Link Creation

`app/api/payment/create/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  const body = await request.json()

  // PayTR ödeme linki oluştur
  const result = await createPaymentLink({
    email: user.email,
    name: user.name,
    amount: body.amount,
    productType: body.productType,
    productId: body.productId,
    userId: user.id,
    description: body.description,
    successUrl: `${APP_URL}/premium/payment-success`,
    failUrl: `${APP_URL}/premium/payment-failed`,
  })

  return NextResponse.json({
    success: result.success,
    paymentUrl: result.paymentUrl,
  })
}
```

### 5. PayTR Ödeme Sayfası

Kullanıcı PayTR sayfasına yönlendirilir:

- Kart bilgilerini girer
- 3D Secure doğrulaması yapar
- Ödemeyi tamamlar

### 6. PayTR Webhook

Ödeme tamamlandığında PayTR webhook çağrısı yapar:

`app/api/subscription/paytr-webhook/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  // Webhook data al
  const formData = await request.formData()
  const webhookData = {}
  for (const [key, value] of formData.entries()) {
    webhookData[key] = String(value)
  }

  // Signature doğrula
  const isValid = verifyPaytrWebhook(webhookData)
  if (!isValid) {
    return NextResponse.json({ success: false }, { status: 400 })
  }

  const { merchant_oid, status, total_amount } = webhookData

  // Ödeme başarılı mı?
  if (status !== 'success') {
    return NextResponse.json({ success: false }, { status: 200 })
  }

  // merchant_oid'den user ID ve plan ID parse et
  // Format: pay_{userId}_{productType}_{timestamp}
  const [, userId, planId] = merchant_oid.split('_')

  // Mevcut subscription'ı iptal et
  await prisma.userSubscription.updateMany({
    where: { userId: parseInt(userId), status: 'active' },
    data: { status: 'cancelled', cancelledAt: new Date() },
  })

  // Yeni subscription oluştur
  await prisma.userSubscription.create({
    data: {
      userId: parseInt(userId),
      planId,
      status: 'active',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      amount: parseFloat(total_amount) / 100,
      currency: 'TRY',
      paymentMethod: 'paytr',
      transactionId: merchant_oid,
      autoRenew: true,
    },
  })

  // Email bildirimi gönder
  await sendPlanUpgradeEmail(user.email, user.name, planName, features)

  return NextResponse.json({ success: true })
}
```

### 7. Başarı/Hata Sayfaları

Kullanıcı otomatik olarak yönlendirilir:

**Başarılı:** `/premium/payment-success?merchant_oid=...`

- Ödeme onay mesajı
- Plan özellikleri gösterilir
- Dashboard linki
- Bonus bilgisi

**Başarısız:** `/premium/payment-failed`

- Hata nedenleri
- Alternatif çözümler
- Tekrar deneme butonu
- Destek bilgileri

## Ödeme Akışı - Enterprise Premium

### 1. İletişim Formu

Kullanıcı `/enterprise-premium` sayfasından "İletişime Geç" butonuna tıklar:

```typescript
// EnterprisePremiumContactModal açılır
<EnterprisePremiumContactModal
  open={isContactModalOpen}
  onOpenChange={setIsContactModalOpen}
/>
```

### 2. Payment Request Oluşturma

```typescript
// components/enterprise-premium-contact-modal.tsx
const handleSubmit = async e => {
  const response = await fetch('/api/payment-request/create', {
    method: 'POST',
    body: JSON.stringify({
      planId: 'enterprise_premium',
      amount: 0,
      description: `Enterprise Premium Talep - ${company}...`,
    }),
  })
}
```

### 3. API Endpoint - Payment Request

`app/api/payment-request/create/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  const user = await getCurrentUser(request)
  const { planId, amount, description } = await request.json()

  // PaymentRequest oluştur
  const paymentRequest = await prisma.paymentRequest.create({
    data: {
      userId: user.id,
      planId,
      amount,
      currency: 'TRY',
      description,
      status: 'pending',
    },
  })

  // Admin'e email gönder
  await sendAdminPaymentRequestNotification(
    'admin@giderse.com',
    user.name,
    user.email,
    'Enterprise Premium'
  )

  // Kullanıcıya email gönder
  await sendEnterprisePremiumRequestEmail(user.email, user.name)

  return NextResponse.json({ success: true })
}
```

### 4. Admin İncelemesi

Admin `/admin/payment-requests` sayfasından talepleri görür:

```typescript
// AdminPaymentRequests komponenti
GET /api/admin/payment-requests  // Tüm talepleri listele

// Admin talep detaylarını görür ve onaylar/reddeder
PUT /api/admin/payment-requests/{id}
{
  "status": "approved" | "rejected",
  "adminNotes": "..."
}
```

### 5. Admin Onayı

`app/api/admin/payment-requests/[id]/route.ts`:

```typescript
export async function PUT(request, { params }) {
  const { status, adminNotes } = await request.json()

  // PaymentRequest güncelle
  await prisma.paymentRequest.update({
    where: { id: parseInt(params.id) },
    data: {
      status,
      adminNotes,
      approvedBy: adminUser.id,
      approvedAt: status === 'approved' ? new Date() : null,
    },
  })

  if (status === 'approved') {
    // Mevcut subscription iptal et
    await prisma.userSubscription.updateMany({
      where: { userId: paymentRequest.userId, status: 'active' },
      data: { status: 'cancelled' },
    })

    // Yeni subscription oluştur
    await prisma.userSubscription.create({
      data: {
        userId: paymentRequest.userId,
        planId: 'enterprise_premium',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        amount: 0,
        currency: 'TRY',
        paymentMethod: 'manual',
      },
    })

    // Email bildirimi
    await sendPlanUpgradeEmail(user.email, user.name, 'Enterprise Premium', features)
  }

  return NextResponse.json({ success: true })
}
```

## Güvenlik

### PayTR Webhook Doğrulama

```typescript
export function verifyPaytrWebhook(data: Record<string, string>): boolean {
  const { merchant_oid, status, total_amount, hash } = data

  // Hash oluştur
  const hashString = `${MERCHANT_ID}${merchant_oid}${MERCHANT_SALT}${status}${total_amount}`
  const calculatedHash = crypto.createHash('sha256').update(hashString).digest('base64')

  // Hash karşılaştır
  return calculatedHash === hash
}
```

### Merchant Order ID Format

```
pay_{userId}_{productType}_{timestamp}_{productId?}
```

Örnek: `pay_123_premium_1705678900000`

## Test Modu

PayTR test modu için:

```typescript
test_mode: process.env.NODE_ENV !== 'production' ? '1' : '0'
```

Test kartları:

- **Başarılı:** 4506341010205499
- **CVV:** 000
- **Tarih:** 12/30

## Error Handling

### Ödeme Başarısız

Olası nedenler:

1. Yetersiz bakiye
2. Kart limiti aşıldı
3. 3D Secure başarısız
4. Banka reddi

Kullanıcıya gösterilen:

- Hata mesajı
- Alternatif çözümler
- Destek bilgileri

### Webhook Hatası

Webhook başarısız olursa:

1. PayTR otomatik olarak retry yapar (5 kez)
2. Admin panel'den manuel kontrol
3. `checkPaymentStatus()` fonksiyonu ile sorgulama

## Monitoring

### Webhook Logları

```typescript
console.log('PayTR webhook received:', {
  merchant_oid,
  status,
  amount,
  userId,
})
```

### Payment Request Logları

```typescript
console.log('Payment request created:', {
  userId,
  planId,
  amount,
})
```

## API Referansı

### Ödeme Linki Oluşturma

```
POST /api/payment/create
Authorization: Cookie (auth-token)

Request:
{
  "productType": "premium" | "enterprise",
  "amount": 250,
  "description": "Premium plan subscription"
}

Response:
{
  "success": true,
  "paymentUrl": "https://www.paytr.com/odeme?token=...",
  "paymentLinkId": "pay_123_premium_1705678900000"
}
```

### Webhook

```
POST /api/subscription/paytr-webhook
Content-Type: application/x-www-form-urlencoded

Body:
merchant_oid=pay_123_premium_1705678900000
status=success
total_amount=25000
hash=...
```

### Payment Request Oluşturma

```
POST /api/payment-request/create
Authorization: Cookie (auth-token)

Request:
{
  "planId": "enterprise_premium",
  "amount": 0,
  "description": "Enterprise Premium request..."
}

Response:
{
  "success": true,
  "paymentRequest": {
    "id": 1,
    "status": "pending"
  }
}
```

### Admin Payment Request Listesi

```
GET /api/admin/payment-requests?page=1&limit=50&status=pending
Authorization: Cookie (auth-token) + Admin role

Response:
{
  "success": true,
  "data": {
    "paymentRequests": [...],
    "pagination": {
      "page": 1,
      "limit": 50,
      "total": 10,
      "totalPages": 1
    }
  }
}
```

### Admin Payment Request Onay/Red

```
PUT /api/admin/payment-requests/1
Authorization: Cookie (auth-token) + Admin role

Request:
{
  "status": "approved" | "rejected",
  "adminNotes": "Onaylandı, subscription aktif edildi"
}

Response:
{
  "success": true,
  "message": "Talep onaylandı"
}
```

## Troubleshooting

### Ödeme tamamlandı ama webhook gelmedi

1. PayTR admin panel'den webhook loglarını kontrol edin
2. Webhook URL'in doğru olduğundan emin olun
3. Server'ın webhook endpoint'ini dinlediğinden emin olun
4. `checkPaymentStatus()` ile manuel sorgulama yapın

### Test modunda ödeme yapılamıyor

1. `PAYTR_MERCHANT_ID`, `PAYTR_MERCHANT_KEY`, `PAYTR_MERCHANT_SALT` doğru mu?
2. Test kartı bilgileri doğru mu?
3. PayTR test hesabı aktif mi?

### Admin onayı çalışmıyor

1. Admin rolü doğru mu? (`requireAdmin` middleware)
2. PaymentRequest kaydı `pending` durumunda mı?
3. API endpoint doğru çağrılıyor mu?

---

**Son Güncelleme:** 2025-01-19
**Versiyon:** 2.1.1
