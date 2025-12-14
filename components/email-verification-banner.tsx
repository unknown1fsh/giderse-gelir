'use client'

import { useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Mail, X, Loader2, CheckCircle2 } from 'lucide-react'
import { useUser } from '@/lib/user-context'

export default function EmailVerificationBanner() {
  const { user } = useUser()
  const [resending, setResending] = useState(false)
  const [resendSuccess, setResendSuccess] = useState(false)

  // Email doğrulanmamışsa banner göster
  if (!user || user.emailVerified) {
    return null
  }

  const handleResend = async () => {
    if (!user?.email) {
      return
    }

    setResending(true)
    setResendSuccess(false)

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: user.email }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setResendSuccess(true)
        setTimeout(() => setResendSuccess(false), 5000)
      } else {
        alert(data.message || 'E-posta gönderilemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setResending(false)
    }
  }

  return (
    <Alert className="mb-4 border-yellow-200 bg-yellow-50">
      <Mail className="h-5 w-5 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between">
        <div className="flex-1">
          <strong className="text-yellow-800">E-posta adresiniz doğrulanmadı.</strong>
          <p className="text-sm text-yellow-700 mt-1">
            Lütfen e-posta kutunuzu kontrol edin ve doğrulama linkine tıklayın. E-postayı
            görmediyseniz yeniden gönderebilirsiniz.
          </p>
        </div>
        <div className="ml-4 flex items-center gap-2">
          {resendSuccess && (
            <div className="flex items-center text-green-600 text-sm mr-2">
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Gönderildi
            </div>
          )}
          <Button
            onClick={handleResend}
            disabled={resending || resendSuccess}
            size="sm"
            variant="outline"
            className="border-yellow-300 text-yellow-700 hover:bg-yellow-100"
          >
            {resending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gönderiliyor...
              </>
            ) : (
              <>
                <Mail className="mr-2 h-4 w-4" />
                Yeniden Gönder
              </>
            )}
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  )
}
