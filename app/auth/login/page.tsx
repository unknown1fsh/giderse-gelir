'use client'

import { useState } from 'react'
import { Alert, AlertDescription, AuthCardShell, AuthShell, Button, CardDescription, CardHeader, CardTitle, Checkbox, FormField, Input, Label } from '@/components/mosaic'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import BrandLogo from '@/components/brand-logo'
import { useToast } from '@/lib/use-toast'

export default function LoginPage() {
  const router = useRouter()
  const { success, error: toastError } = useToast()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [rememberMe, setRememberMe] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = (await response.json()) as { success?: boolean; message?: string }

      if (data.success) {
        success('Giriş Başarılı', 'Yönlendiriliyorsunuz...')
        // Dashboard'a yönlendir (router.push kullanıyoruz ki toast görünebilsin)
        router.push('/dashboard')
        // Sayfa yenilemesi gerekiyorsa dashboard içinde yapılabilir veya 1sn sonra reload
        setTimeout(() => {
          window.location.reload()
        }, 500)
      } else {
        const msg = data.message || 'Giriş yapılırken bir hata oluştu'
        setError(msg)
        toastError('Giriş Başarısız', msg)
      }
    } catch (err) {
      const msg = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.'
      setError(msg)
      toastError('Hata', msg)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  return (
    <AuthShell
      title="Hoş Geldiniz"
      description="Hesabınıza giriş yapın"
      hero={(
        <div className="inline-flex items-center space-x-3">
          <div>
            <BrandLogo
              size={48}
              priority
              variant="dark"
              textClassName="text-2xl font-bold text-white"
            />
            <p className="text-sm text-slate-400">Finans Yönetimi</p>
          </div>
        </div>
      )}
    >
      <AuthCardShell className="mx-auto max-w-md">
        <CardHeader className="px-0 pb-4 text-center">
          <CardTitle className="text-2xl font-bold text-white">Hoş Geldiniz</CardTitle>
          <CardDescription className="text-slate-300">Hesabınıza giriş yapın</CardDescription>
        </CardHeader>
        <div className="space-y-6">
            {error && (
              <Alert className="border-red-500/30 bg-red-500/20 text-red-100">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-sm text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
              <FormField label="E-posta" htmlFor="login-email" className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                    required
                    suppressHydrationWarning
                  />
                </div>
              </FormField>

              <FormField label="Şifre" htmlFor="login-password" className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="Şifrenizi girin"
                    className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                    required
                    suppressHydrationWarning
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2 text-slate-400 hover:text-slate-300"
                    aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </FormField>

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <label className="flex items-center space-x-2 cursor-pointer min-h-[44px]">
                  <Checkbox
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                    className="border-white/20 bg-white/5 text-purple-600"
                    suppressHydrationWarning
                  />
                  <Label className="cursor-pointer text-sm text-slate-300">Beni hatırla</Label>
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-purple-400 hover:text-purple-300 transition-colors min-h-[44px] flex items-center"
                >
                  Şifremi unuttum
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[48px] bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-base sm:text-lg font-semibold shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Giriş yapılıyor...
                  </>
                ) : (
                  'Giriş Yap'
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-slate-300 text-sm">
                Hesabınız yok mu?{' '}
                <Link
                  href="/auth/register"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Kayıt olun
                </Link>
              </p>
            </div>
        </div>
      </AuthCardShell>
    </AuthShell>
  )
}
