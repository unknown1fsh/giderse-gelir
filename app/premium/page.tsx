'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useUser } from '@/lib/user-context'
import {
  Crown,
  Check,
  X,
  Zap,
  Brain,
  BarChart3,
  Target,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Users,
  ArrowLeft,
  Building2,
  Globe,
  Star,
  Rocket,
} from 'lucide-react'

export default function PremiumPage() {
  const router = useRouter()
  const { user } = useUser()
  const [isProcessing, setIsProcessing] = useState(false)

  const isAlreadyPremium = user?.plan === 'premium'

  // Ana premium özellikler - Daha odaklı ve akılda kalıcı
  const keyFeatures = [
    {
      icon: Brain,
      title: 'AI Finansal Asistan',
      description:
        'Harcamalarınızı analiz eder, tasarruf önerileri sunar ve finansal hedeflerinize ulaşmanızda yardımcı olur.',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      icon: BarChart3,
      title: 'Gelişmiş Raporlar',
      description:
        'İnteraktif grafikler ve PDF/Excel raporlarıyla finansal durumunuzu her açıdan görün.',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Target,
      title: 'Akıllı Hedef Takibi',
      description:
        'Tasarruf hedeflerinizi belirleyin, ilerlemenizi izleyin ve motivasyonunuzu yüksek tutun.',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      icon: Zap,
      title: 'Otomatik Kategorileme',
      description:
        'Her işleminiz otomatik olarak doğru kategoriye yerleşir, zamandan tasarruf edin.',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Gelecek Tahminleri',
      description: '3-6 ay sonraki gelir ve harcamalarınızı tahmin edin, finansal kararlar alın.',
      gradient: 'from-indigo-500 to-purple-500',
    },
    {
      icon: Shield,
      title: 'Premium Güvenlik',
      description: 'Bankacılık seviyesinde şifreleme, öncelikli destek ve otomatik yedekleme.',
      gradient: 'from-slate-500 to-gray-600',
    },
  ]

  // Karşılaştırma tablosu için özellikler
  const comparisonFeatures = [
    { name: 'Aylık işlem limiti', free: '50 işlem', premium: 'Sınırsız' },
    { name: 'AI destekli analizler', free: false, premium: true },
    { name: 'Gelişmiş raporlar ve grafikler', free: false, premium: true },
    { name: 'PDF/Excel rapor dışa aktarma', free: false, premium: true },
    { name: 'Akıllı hedef takibi', free: false, premium: true },
    { name: 'Otomatik kategorileme', free: false, premium: true },
    { name: 'Gelecek tahminleri', free: false, premium: true },
    { name: 'Öncelikli destek', free: false, premium: true },
    { name: 'Otomatik bulut yedekleme', free: false, premium: true },
  ]

  const handleUpgrade = (planId: string = 'premium', amount: number = 250) => {
    if (isAlreadyPremium && planId === 'premium') {
      return
    }

    setIsProcessing(true)

    // Enterprise Premium için özel iletişim formu
    if (planId === 'enterprise_premium') {
      router.push('/enterprise-premium')
      return
    }

    // Premium/Enterprise için PayTR ödeme sayfasına yönlendir
    router.push(
      `/payment?planId=${planId}&productType=${planId}&amount=${amount}&description=${encodeURIComponent(`${planId} plan abonelik ücreti`)}`
    )
  }

  const handleUpgradeClick = () => {
    handleUpgrade()
  }

  const handleBack = () => {
    router.back()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50/20 to-pink-50/20">
      {/* Minimal Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri Dön
            </Button>

            {isAlreadyPremium && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                <Crown className="h-4 w-4 text-white" />
                <span className="text-sm font-semibold text-white">Premium Üye</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        {/* Hero Section - Daha güçlü ve odaklı */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-semibold text-purple-700">Premium&apos;a Yükselt</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Finansal Özgürlüğe
            <br />
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
              Bir Adım Kaldı
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
            AI destekli analizler ve akıllı önerilerle{' '}
            <span className="font-semibold text-slate-800">paranızı 10x daha iyi yönetin</span>
          </p>

          {!isAlreadyPremium && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-8">
              <div className="flex flex-col items-center">
                <div className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  250₺
                  <span className="text-2xl text-slate-500 font-semibold">/ay</span>
                </div>
                <p className="text-sm text-slate-500">Tek ödeme, dilediğiniz zaman iptal</p>
              </div>

              <Button
                onClick={handleUpgradeClick}
                disabled={isProcessing}
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold text-lg px-8 py-6 rounded-xl shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105 transition-all duration-200"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>İşleniyor...</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5" />
                    <span>Hemen Premium Ol</span>
                    <ArrowRight className="h-5 w-5" />
                  </div>
                )}
              </Button>
            </div>
          )}

          {isAlreadyPremium && (
            <div className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border-2 border-green-300">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-green-700 font-semibold">
                Premium üyesiniz, tüm özelliklere erişiminiz var!
              </span>
            </div>
          )}

          {/* Sosyal Kanıt */}
          <div className="flex items-center justify-center space-x-2 text-sm text-slate-500 mt-6">
            <Users className="h-4 w-4" />
            <span>5,000+ kullanıcı zaten Premium kullanıyor</span>
          </div>
        </div>

        {/* Ana Özellikler - Grid Layout */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-center text-slate-900 mb-12">
            Premium ile Neler Kazanırsınız?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {keyFeatures.map((feature, index) => (
              <Card
                key={index}
                variant="glass"
                className="group relative overflow-hidden border-2 border-slate-200 hover:border-purple-300 hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${feature.gradient} mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300`}
                  >
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>

                  <h3 className="font-bold text-xl text-slate-900 mb-2 group-hover:text-gradient-premium transition-all duration-300">{feature.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{feature.description}</p>
                </CardContent>

                {/* Hover effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/5 group-hover:to-pink-500/5 transition-all duration-300 pointer-events-none" />
              </Card>
            ))}
          </div>
        </div>

        {/* Plan Seçenekleri */}
        {!isAlreadyPremium && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center text-slate-900 mb-3">
              Size Uygun Planı Seçin
            </h2>
            <p className="text-center text-slate-600 mb-12">
              Bireysel kullanıcıdan büyük şirketlere kadar herkes için çözüm
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-16">
              {/* Premium Plan */}
              <Card variant="glass" className="relative overflow-hidden border-2 border-purple-300 hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-2">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-1 text-sm font-bold rounded-bl-xl">
                  <Star className="h-4 w-4 inline mr-1" />
                  En Popüler
                </div>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Premium</h3>
                    <p className="text-slate-600 mb-4">Bireysel kullanıcılar için</p>
                    <div className="mb-4">
                      <span className="text-5xl font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        250₺
                      </span>
                      <span className="text-slate-600 text-lg">/ay</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Sınırsız işlem</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">AI finansal asistan</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Gelişmiş raporlar</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Akıllı hedef takibi</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">PDF/Excel raporları</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-purple-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Öncelikli destek</span>
                    </li>
                  </ul>

                  <Button
                    onClick={() => handleUpgrade('premium', 250)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-6"
                  >
                    {isProcessing ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                        İşleniyor...
                      </div>
                    ) : (
                      <>
                        Hemen Başla <ArrowRight className="h-5 w-5 ml-2" />
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Plan */}
              <Card variant="glass" className="relative overflow-hidden border-2 border-blue-200 hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-2">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-4">
                      <Building2 className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
                    <p className="text-slate-600 mb-4">KOBİ ve şirketler için</p>
                    <div className="mb-4">
                      <span className="text-5xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                        450₺
                      </span>
                      <span className="text-slate-600 text-lg">/ay</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 font-semibold">Tüm Premium özellikler</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Çoklu kullanıcı desteği</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Departman yönetimi</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">API erişimi</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Özel entegrasyonlar</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Dedicated destek</span>
                    </li>
                  </ul>

                  <Button
                    onClick={() => handleUpgrade('enterprise', 450)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-6"
                  >
                    Hemen Başla <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>

              {/* Enterprise Premium Plan */}
              <Card variant="glass" className="relative overflow-hidden border-2 border-amber-300 hover:shadow-glow-lg transition-all duration-300 hover:-translate-y-2 bg-gradient-to-br from-amber-50 to-orange-50">
                <div className="absolute top-0 right-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 text-sm font-bold rounded-bl-xl">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  Ultra Premium
                </div>
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="inline-flex p-4 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl mb-4">
                      <Rocket className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">Enterprise Premium</h3>
                    <p className="text-slate-600 mb-4">Holding ve büyük kurumlar</p>
                    <div className="mb-4">
                      <span className="text-3xl font-black bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                        Özel Fiyat
                      </span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700 font-semibold">
                        Tüm Enterprise özellikler
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Holding/Konsolidasyon</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Global şube ağı</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Quantum güvenlik</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">Beyaz etiket çözümü</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-slate-700">VIP dedike ekip</span>
                    </li>
                  </ul>

                  <Button
                    onClick={() => handleUpgrade('enterprise_premium', 0)}
                    className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-6"
                  >
                    İletişime Geç <Globe className="h-5 w-5 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Karşılaştırma Tablosu */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-center text-slate-900 mb-8">
                Detaylı Özellik Karşılaştırması
              </h3>

              <Card variant="glass" className="max-w-6xl mx-auto overflow-hidden border-2 border-slate-200 hover:shadow-glow transition-all duration-300">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b-2 border-slate-200">
                        <th className="text-left p-4 font-semibold text-slate-700">Özellik</th>
                        <th className="text-center p-4 font-semibold text-slate-700 bg-slate-50">
                          Ücretsiz
                        </th>
                        <th className="text-center p-4 font-semibold text-white bg-gradient-to-r from-purple-600 to-pink-600">
                          Premium
                        </th>
                        <th className="text-center p-4 font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600">
                          Enterprise
                        </th>
                        <th className="text-center p-4 font-semibold text-white bg-gradient-to-r from-amber-600 to-orange-600">
                          Enterprise Premium
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {comparisonFeatures.map((feature, index) => (
                        <tr
                          key={index}
                          className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                        >
                          <td className="p-4 text-slate-700 font-medium">{feature.name}</td>
                          <td className="p-4 text-center">
                            {typeof feature.free === 'boolean' ? (
                              feature.free ? (
                                <Check className="h-5 w-5 text-green-500 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm text-slate-600">{feature.free}</span>
                            )}
                          </td>
                          <td className="p-4 text-center bg-purple-50/30">
                            {typeof feature.premium === 'boolean' ? (
                              feature.premium ? (
                                <Check className="h-5 w-5 text-purple-600 mx-auto" />
                              ) : (
                                <X className="h-5 w-5 text-slate-300 mx-auto" />
                              )
                            ) : (
                              <span className="text-sm font-semibold text-purple-700">
                                {feature.premium}
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center bg-blue-50/30">
                            <Check className="h-5 w-5 text-blue-600 mx-auto" />
                          </td>
                          <td className="p-4 text-center bg-amber-50/30">
                            <Check className="h-5 w-5 text-amber-600 mx-auto" />
                          </td>
                        </tr>
                      ))}
                      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-700 font-medium">Çoklu kullanıcı</td>
                        <td className="p-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-purple-50/30">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-blue-50/30">
                          <Check className="h-5 w-5 text-blue-600 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-amber-50/30">
                          <Check className="h-5 w-5 text-amber-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-700 font-medium">API erişimi</td>
                        <td className="p-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-purple-50/30">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-blue-50/30">
                          <Check className="h-5 w-5 text-blue-600 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-amber-50/30">
                          <Check className="h-5 w-5 text-amber-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-700 font-medium">Özel entegrasyonlar</td>
                        <td className="p-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-purple-50/30">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-blue-50/30">
                          <Check className="h-5 w-5 text-blue-600 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-amber-50/30">
                          <Check className="h-5 w-5 text-amber-600 mx-auto" />
                        </td>
                      </tr>
                      <tr className="hover:bg-slate-50 transition-colors">
                        <td className="p-4 text-slate-700 font-medium">Holding/Global Yönetim</td>
                        <td className="p-4 text-center">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-purple-50/30">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-blue-50/30">
                          <X className="h-5 w-5 text-slate-300 mx-auto" />
                        </td>
                        <td className="p-4 text-center bg-amber-50/30">
                          <Check className="h-5 w-5 text-amber-600 mx-auto" />
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* Final CTA - Güçlü son çağrı */}
        {!isAlreadyPremium && (
          <div className="text-center">
            <Card variant="glass" className="max-w-3xl mx-auto bg-gradient-to-br from-purple-600 to-pink-600 border-0 shadow-glow-lg hover:shadow-glow-xl transition-all duration-300">
              <CardContent className="p-12">
                <Crown className="h-16 w-16 text-white mx-auto mb-6" />

                <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
                  Şimdi Premium&apos;a Geçin
                </h2>

                <p className="text-xl text-purple-100 mb-8 max-w-2xl mx-auto">
                  Finansal hedeflerinize ulaşmanın en hızlı yolu. Bugün başlayın, farkı hemen görün.
                </p>

                <div className="flex flex-col items-center space-y-4">
                  <Button
                    onClick={handleUpgradeClick}
                    disabled={isProcessing}
                    size="lg"
                    className="bg-white text-purple-600 hover:bg-purple-50 font-bold text-lg px-10 py-6 rounded-xl shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {isProcessing ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-purple-300 border-t-purple-600 rounded-full animate-spin" />
                        <span>İşleniyor...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>250₺/ay ile Başla</span>
                        <ArrowRight className="h-5 w-5" />
                      </div>
                    )}
                  </Button>

                  <p className="text-sm text-purple-100">
                    ✓ Anında aktif olur ✓ İstediğiniz zaman iptal edin ✓ Güvenli ödeme
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Premium Üye Mesajı */}
        {isAlreadyPremium && (
          <div className="text-center">
            <Card variant="glass" className="max-w-2xl mx-auto bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 hover:shadow-glow transition-all duration-300">
              <CardContent className="p-10">
                <div className="inline-flex p-4 bg-green-100 rounded-full mb-6">
                  <Check className="h-10 w-10 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">Harika! Premium Üyesiniz</h2>

                <p className="text-lg text-slate-600 mb-6">
                  Tüm premium özelliklere erişiminiz var. Finansal hedeflerinize ulaşmak için artık
                  her şey elinizde!
                </p>

                <Button
                  onClick={() => router.push('/dashboard')}
                  size="lg"
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold"
                >
                  Dashboard&apos;a Dön
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
