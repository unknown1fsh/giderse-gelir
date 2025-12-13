'use client'

import { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PaymentCheckout from '@/components/payment-checkout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, ArrowLeft } from 'lucide-react'

function PaymentPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isValid, setIsValid] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const [isRedirecting, setIsRedirecting] = useState(false)

  useEffect(() => {
    // Ücretli üyelik ödeme linkleri artık destek talebine yönlenir (legacy fallback)
    const productTypeOrPlan = searchParams.get('productType') || searchParams.get('planId') || ''
    const productId = searchParams.get('productId') || ''
    const legacyPlanId =
      productTypeOrPlan === 'subscription' ? productId : productTypeOrPlan

    if (legacyPlanId === 'premium' || legacyPlanId === 'enterprise') {
      setIsRedirecting(true)
      router.replace(
        `/help/tickets/new?intent=membership&planId=${legacyPlanId}&source=payment_legacy`
      )
      return
    }

    // Query parametrelerini kontrol et
    const productType = searchParams.get('productType') || searchParams.get('planId')
    const amount = searchParams.get('amount')

    if (productType && amount && !isNaN(parseFloat(amount)) && parseFloat(amount) > 0) {
      setIsValid(true)
    } else {
      setIsValid(false)
    }
    setIsChecking(false)
  }, [searchParams, router])

  const productType = searchParams.get('productType') || searchParams.get('planId') || ''
  const productId = searchParams.get('productId') || undefined
  const amount = parseFloat(searchParams.get('amount') || '0')
  const description = searchParams.get('description') || undefined

  // Plan isimleri
  const planNames: { [key: string]: string } = {
    premium: 'Premium Plan',
    enterprise: 'Enterprise Plan',
    subscription: 'Abonelik',
  }

  const productName = planNames[productType] || productType

  if (isChecking || isRedirecting) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Yönlendiriliyorsunuz...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="py-8 space-y-4">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Geçersiz Ödeme Bilgileri</h2>
              <p className="text-slate-600 mb-6">
                Ödeme sayfasına erişmek için geçerli ürün bilgileri gereklidir.
              </p>
              <Button
                onClick={() => router.push('/premium')}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Premium Sayfasına Dön
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/30 to-pink-50/50 p-4">
      <div className="max-w-2xl mx-auto pt-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mb-4 flex items-center space-x-2 text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Geri</span>
          </Button>
        </div>

        {/* Payment Checkout Component */}
        <PaymentCheckout
          productType={productType}
          productId={productId}
          amount={amount}
          description={description}
          productName={productName}
          onSuccess={() => {
            // Payment link created successfully
          }}
          onError={() => {
            // Payment error handled by component
          }}
        />
      </div>
    </div>
  )
}

export default function PaymentPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="py-8">
              <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
                <p className="text-gray-600">Yükleniyor...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      }
    >
      <PaymentPageContent />
    </Suspense>
  )
}
