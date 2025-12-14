'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Eye,
  EyeOff,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  AlertCircle,
  CheckCircle,
  Loader2,
  Crown,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    plan: 'free',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Şifreler eşleşmiyor')
      setIsLoading(false)
      return
    }

    if (!agreedToTerms) {
      setError('Kullanım şartlarını kabul etmelisiniz')
      setIsLoading(false)
      return
    }

    // Frontend şifre validasyonu
    if (formData.password.length < 8) {
      setError('Şifre en az 8 karakter olmalıdır')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          plan: formData.plan,
        }),
      })

      const data = (await response.json()) as {
        success?: boolean
        message?: string
        error?: string
        errorCode?: string
        premiumRequestCreated?: boolean
      }

      if (!response.ok) {
        // API'den gelen hata mesajını al
        // BaseError.toJSON() formatı: { error: message, errorCode, statusCode }
        const errorMessage = data.error || data.message || 'Kayıt olurken bir hata oluştu'
        setError(errorMessage)
        setIsLoading(false)
        return
      }

      if (data.success) {
        // Premium isteği varsa kullanıcıya bilgi ver
        if (data.premiumRequestCreated) {
          alert(
            'Kayıt başarılı! Premium üyelik talebiniz admin onayına gönderildi. Onaylandıktan sonra premium özelliklere erişebileceksiniz.'
          )
        }
        // Başarılı kayıt sonrası dashboard'a yönlendir (full page reload ile context'leri yenile)
        window.location.href = '/dashboard'
      } else {
        setError(data.message || data.error || 'Kayıt olurken bir hata oluştu')
      }
    } catch (err) {
      console.error('Register error:', err)
      setError('Kayıt olurken bir hata oluştu. Lütfen tekrar deneyin.')
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

  const plans = [
    {
      id: 'free',
      name: 'Ücretsiz',
      price: '0',
      description: 'Temel özellikler',
      features: ['Aylık 50 işlem', 'Temel raporlar', 'Mobil erişim'],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '250',
      description: 'Tüm özellikler',
      features: ['Sınırsız işlem', 'Gelişmiş analizler', 'Öncelikli destek', 'Veri dışa aktarma'],
      popular: true,
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>

      <div className="relative w-full max-w-2xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/landing"
            className="inline-flex items-center text-white/70 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Geri Dön
          </Link>
        </div>

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 mb-4">
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
        </div>

        {/* Register Card */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-bold text-white">Hesap Oluşturun</CardTitle>
            <CardDescription className="text-slate-300">
              Finansal özgürlüğünüze ilk adımı atın
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex items-center space-x-2 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <span className="text-red-400 text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
              {/* Plan Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-300">Plan Seçin</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.plan === plan.id
                          ? 'border-purple-500 bg-purple-500/20'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                      onClick={() => setFormData(prev => ({ ...prev, plan: plan.id }))}
                    >
                      {plan.popular && (
                        <div className="absolute -top-2 -right-2">
                          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center">
                            <Crown className="h-3 w-3 mr-1" />
                            Popüler
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white">{plan.name}</h3>
                        <div className="text-right">
                          <span className="text-2xl font-bold text-white">₺{plan.price}</span>
                          <span className="text-slate-400 text-sm">/ay</span>
                        </div>
                      </div>
                      <p className="text-slate-300 text-sm mb-3">{plan.description}</p>
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-2 text-xs text-slate-400"
                          >
                            <CheckCircle className="h-3 w-3 text-green-400" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Ad Soyad</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Adınızı girin"
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Telefon</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+90 555 123 45 67"
                      className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-300">E-posta</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="ornek@email.com"
                    className="pl-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">
                    Şifre <span className="text-slate-500 text-xs">(en az 8 karakter)</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="En az 8 karakter"
                      minLength={8}
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-300">Şifre Tekrar</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Şifrenizi tekrar girin"
                      className="pl-10 pr-10 bg-white/5 border-white/20 text-white placeholder:text-slate-400 focus:border-purple-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-300"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={e => setAgreedToTerms(e.target.checked)}
                  className="mt-1 rounded border-white/20 bg-white/5 text-purple-600 focus:ring-purple-500"
                />
                <label className="text-sm text-slate-300">
                  <Link href="/terms" className="text-purple-400 hover:text-purple-300">
                    Kullanım şartlarını
                  </Link>{' '}
                  ve{' '}
                  <Link href="/privacy" className="text-purple-400 hover:text-purple-300">
                    gizlilik politikasını
                  </Link>{' '}
                  kabul ediyorum.
                </label>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 text-lg font-semibold shadow-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Hesap oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Hesap Oluştur
                  </>
                )}
              </Button>
            </form>

            <div className="text-center">
              <p className="text-slate-300 text-sm">
                Zaten hesabınız var mı?{' '}
                <Link
                  href="/auth/login"
                  className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                >
                  Giriş yapın
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
