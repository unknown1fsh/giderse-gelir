'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, CreditCard, AlertCircle, CheckCircle2 } from 'lucide-react'

interface PaymentCheckoutProps {
  productType: string
  productId?: string
  amount: number
  description?: string
  productName?: string
  onSuccess?: (paymentLinkId: string) => void
  onError?: (error: string) => void
}

export default function PaymentCheckout({
  productType,
  productId,
  amount,
  description,
  productName,
  onSuccess,
  onError,
}: PaymentCheckoutProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)

  const createPaymentLink = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productType,
          productId,
          amount,
          description,
        }),
      })

      const data = (await response.json()) as {
        success: boolean
        paymentUrl?: string
        paymentLinkId?: string
        error?: string
      }

      if (response.ok && data.success && data.paymentUrl) {
        setPaymentUrl(data.paymentUrl)
        if (onSuccess && data.paymentLinkId) {
          onSuccess(data.paymentLinkId)
        }
        // PayTR sayfasına yönlendir
        window.location.href = data.paymentUrl
      } else {
        const errorMessage = data.error || 'Ödeme linki oluşturulamadı'
        setError(errorMessage)
        if (onError) {
          onError(errorMessage)
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bir hata oluştu'
      setError(errorMessage)
      if (onError) {
        onError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }, [productType, productId, amount, description, onSuccess, onError])

  useEffect(() => {
    // Otomatik olarak ödeme linki oluştur
    void createPaymentLink()
  }, [createPaymentLink])

  const handleRetry = () => {
    void createPaymentLink()
  }

  const displayName = productName || productType

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="h-6 w-6" />
          <span>Ödeme İşlemi</span>
        </CardTitle>
        <CardDescription>{displayName} için ödeme işleminiz hazırlanıyor...</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Ürün Bilgileri */}
        <div className="bg-slate-50 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Ürün:</span>
            <span className="text-sm font-semibold text-slate-900">{displayName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-slate-600">Tutar:</span>
            <span className="text-lg font-bold text-slate-900">{amount.toFixed(2)} ₺</span>
          </div>
          {description && (
            <div className="pt-2 border-t border-slate-200">
              <span className="text-xs text-slate-500">{description}</span>
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
            <p className="text-sm text-slate-600">PayTR ödeme sayfasına yönlendiriliyorsunuz...</p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">Hata</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <Button onClick={handleRetry} className="w-full min-h-[48px]" variant="outline">
              Tekrar Dene
            </Button>
          </div>
        )}

        {/* Success State (genellikle görünmez çünkü yönlendirme yapılır) */}
        {paymentUrl && !isLoading && !error && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start space-x-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Ödeme sayfasına yönlendiriliyorsunuz...
              </p>
            </div>
          </div>
        )}

        {/* Manual Redirect Button (fallback) */}
        {paymentUrl && !isLoading && (
          <Button
            onClick={() => {
              window.location.href = paymentUrl
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            size="lg"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            PayTR Ödeme Sayfasına Git
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
