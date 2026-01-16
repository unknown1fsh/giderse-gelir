'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (data.success) {
        setStatus('success')
        setMessage(data.message || 'Şifre sıfırlama bağlantısı gönderildi.')
      } else {
        setStatus('error')
        setMessage(data.message || 'Bir hata oluştu.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Bir hata oluştu. Lütfen bağlantınızı kontrol edip tekrar deneyin.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>

      <div className="relative w-full max-w-md">
        <div className="mb-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Girişe Dön
          </Link>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
            <BrandLogo
              size={48}
              priority
              variant="dark"
              textClassName="text-2xl font-bold text-white"
            />
          </div>
        </div>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white">Şifremi Unuttum</CardTitle>
            <CardDescription className="text-slate-300">
              E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {status === 'success' ? (
              <div className="text-center space-y-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 flex flex-col items-center">
                  <CheckCircle2 className="h-8 w-8 text-green-400 mb-2" />
                  <p className="text-green-100 font-medium">{message}</p>
                </div>
                <p className="text-slate-300 text-sm">
                  E-posta kutunuzu (ve spam klasörünü) kontrol edin.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-white/20 text-white hover:bg-white/10"
                  onClick={() => setStatus('idle')}
                >
                  Tekrar Gönder
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                {status === 'error' && (
                  <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    <span className="text-red-400 text-sm">{message}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">E-posta</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="ornek@email.com"
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold shadow-lg"
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    'Sıfırlama Bağlantısı Gönder'
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
