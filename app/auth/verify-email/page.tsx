'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { CheckCircle2, XCircle, Mail, Loader2, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'
import { useToast } from '@/lib/use-toast'

function VerifyEmailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success: toastSuccess, error: toastError } = useToast()
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'idle'>('idle')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const [resending, setResending] = useState(false)

  const token = searchParams.get('token')
  const error = searchParams.get('error')
  const success = searchParams.get('success')

  useEffect(() => {
    if (success === 'true') {
      setStatus('success')
    } else if (error) {
      setStatus('error')
      if (error === 'invalid-token') {
        setErrorMessage('Geçersiz veya süresi dolmuş doğrulama linki')
      } else if (error === 'already-verified') {
        setErrorMessage('E-posta adresiniz zaten doğrulanmış')
      } else if (error === 'no-token') {
        setErrorMessage("Doğrulama token'ı bulunamadı")
      } else {
        setErrorMessage('Bir hata oluştu')
      }
    } else if (token) {
      // Token varsa otomatik doğrula
      void verifyEmail(token)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, error, success])

  const verifyEmail = async (tokenToVerify: string) => {
    setStatus('loading')
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: tokenToVerify }),
      })

      const data = (await response.json()) as { success?: boolean; message?: string }

      if (response.ok && data.success) {
        setStatus('success')
        // 3 saniye sonra dashboard'a yönlendir
        setTimeout(() => {
          router.push('/dashboard')
        }, 3000)
      } else {
        setStatus('error')
        setErrorMessage(data.message || 'Doğrulama başarısız')
      }
    } catch (error) {
      setStatus('error')
      setErrorMessage('Bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }

  const resendVerification = async () => {
    setResending(true)
    try {
      // Email'i local storage'dan veya başka bir yerden al (örnek: form'dan)
      // Şimdilik kullanıcıdan email isteyeceğiz
      const email = prompt('E-posta adresinizi girin:')

      if (!email) {
        setResending(false)
        return
      }

      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = (await response.json()) as { success?: boolean; message?: string }

      if (response.ok && data.success) {
        toastSuccess('Başarılı', 'Doğrulama e-postası gönderildi. Lütfen e-posta kutunuzu kontrol edin.')
      } else {
        toastError('Hata', data.message || 'E-posta gönderilemedi')
      }
    } catch (error) {
      toastError('Hata', 'Bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <BrandLogo size={36} variant="light" priority textClassName="text-slate-800" />
          </div>
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center">
            <Mail className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-2xl font-bold">E-posta Doğrulama</CardTitle>
          <CardDescription>E-posta adresinizi doğrulayın</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'loading' && (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">E-posta adresiniz doğrulanıyor...</p>
            </div>
          )}

          {status === 'success' && (
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                <strong>Başarılı!</strong> E-posta adresiniz doğrulandı. Dashboard&apos;a
                yönlendiriliyorsunuz...
              </AlertDescription>
            </Alert>
          )}

          {status === 'error' && (
            <>
              <Alert className="border-destructive/50 text-destructive [&>svg]:text-destructive">
                <XCircle className="h-5 w-5" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Button
                  onClick={() => {
                    void resendVerification()
                  }}
                  disabled={resending}
                  className="w-full"
                  variant="outline"
                >
                  {resending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Doğrulama E-postasını Yeniden Gönder
                    </>
                  )}
                </Button>
              </div>
            </>
          )}

          {status === 'idle' && !token && (
            <Alert>
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>
                Doğrulama linki bulunamadı. Lütfen e-posta kutunuzdaki doğrulama linkini kullanın.
              </AlertDescription>
            </Alert>
          )}

          <div className="text-center space-y-2 pt-4">
            <Link href="/auth/login" className="text-sm text-purple-600 hover:underline">
              Giriş sayfasına dön
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VerifyEmailPage() {
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
      <VerifyEmailContent />
    </Suspense>
  )
}
