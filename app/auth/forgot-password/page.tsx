'use client'

import { useState } from 'react'
import { AuthCardShell, AuthShell, Button, CardDescription, CardHeader, CardTitle, Input } from '@/components/mosaic'
import { Mail, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react'
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
    <AuthShell
      title="Şifremi Unuttum"
      description="E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim."
      backHref="/auth/login"
      backLabel="Girişe Dön"
      hero={(
        <BrandLogo
          size={48}
          priority
          variant="dark"
          textClassName="text-2xl font-bold text-white"
        />
      )}
    >
      <AuthCardShell className="mx-auto max-w-md">
        <CardHeader className="px-0 pb-4 text-center">
          <CardTitle className="text-2xl font-bold text-white">Şifremi Unuttum</CardTitle>
          <CardDescription className="text-slate-300">
            E-posta adresinizi girin, size şifre sıfırlama bağlantısı gönderelim.
          </CardDescription>
        </CardHeader>
        <div className="space-y-6">
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
                  className="w-full min-h-[48px] border-white/20 text-white hover:bg-white/10"
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
                  className="w-full min-h-[48px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-base sm:text-lg font-semibold shadow-lg"
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
        </div>
      </AuthCardShell>
    </AuthShell>
  )
}
