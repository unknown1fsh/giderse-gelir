'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Shield,
  BarChart3,
  CreditCard,
  Calendar,
  Check,
  Star,
  ArrowRight,
  Play,
  Users,
  Rocket,
  Brain,
  TrendingUp,
  Target,
  Lightbulb,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const router = useRouter()

  // Ana özellikler - 5 ana özellik
  const features: {
    icon: LucideIcon
    title: string
    description: string
    color: string
  }[] = [
      {
        icon: Brain,
        title: 'AI Destekli Analiz',
        description: 'Ayda 4 kez detaylı finansal analiz ve kişiselleştirilmiş öneriler',
        color: 'from-purple-500 to-pink-600',
      },
      {
        icon: BarChart3,
        title: 'Gelişmiş Raporlar',
        description: 'Detaylı finansal raporlar ve trend analizleri',
        color: 'from-blue-500 to-indigo-600',
      },
      {
        icon: CreditCard,
        title: 'Kredi Kartı Yönetimi',
        description: 'Tüm kartlarınızı tek yerden yönetin ve takip edin',
        color: 'from-green-500 to-emerald-600',
      },
      {
        icon: Calendar,
        title: 'Otomatik Ödemeler',
        description: 'Tekrarlayan ödemeleri otomatik takip edin',
        color: 'from-orange-500 to-red-600',
      },
      {
        icon: Shield,
        title: 'Güvenli Veri',
        description: 'End-to-end şifreleme ile güvenli saklama',
        color: 'from-cyan-500 to-blue-600',
      },
    ]

  const pricingPlans = [
    {
      name: 'Ücretsiz',
      price: '0',
      period: 'ay',
      description: 'Bireysel kullanıcılar için',
      features: [
        'Aylık 50 işlem',
        'Temel raporlar',
        'Mobil erişim',
        'E-posta desteği',
        'Kişisel bütçe takibi',
      ],
      color: 'from-slate-500 to-slate-600',
      popular: false,
    },
    {
      name: 'Premium',
      price: '250',
      period: 'ay',
      description: 'Bireysel kullanıcılar için',
      features: [
        'AI Analiz Raporu (Ayda 4 kez)',
        'Sınırsız işlem',
        'Gelişmiş analizler',
        '5-10 AI önerisi',
        'Öncelikli destek',
        'Veri dışa aktarma',
      ],
      color: 'from-purple-500 to-pink-600',
      popular: true,
    },
    {
      name: 'Kurumsal',
      price: '450',
      period: 'ay',
      description: 'Şirketler için',
      features: [
        'AI Analiz Raporu (Ayda 4 kez)',
        '15-20 AI önerisi',
        'Sınırsız kullanıcı',
        'Şirket bazlı raporlama',
        'Muhasebe entegrasyonu',
        'API erişimi',
      ],
      color: 'from-blue-500 to-indigo-600',
      popular: false,
    },
    {
      name: 'Kurumsal Premium',
      price: '1000',
      period: 'ay',
      description: 'Büyük şirketler için',
      features: [
        'AI Analiz Raporu (Ayda 4 kez)',
        '30+ AI önerisi',
        'Blockchain entegrasyonu',
        '7/24 VIP destek',
        'Özel danışman',
        'API limiti yok',
      ],
      color: 'from-amber-500 to-orange-600',
      popular: false,
      ultra: true,
    },
  ]

  const stats: { number: string; label: string; icon: LucideIcon }[] = [
    { number: '50K+', label: 'Aktif Kullanıcı', icon: Users },
    { number: '1M+', label: 'İşlem Kaydı', icon: TrendingUp },
    { number: '99.9%', label: 'Uptime', icon: Shield },
    { number: '4.9/5', label: 'Kullanıcı Puanı', icon: Star },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background Mesh */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-50"></div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 animate-gradient-x"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-12 sm:pb-16">
          <div className="text-center">
            {/* Logo */}
            <div className="flex justify-center mb-6 sm:mb-8 animate-scale-up">
              <div className="flex items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600 shadow-glow">
                  <span className="text-lg sm:text-2xl font-bold text-white">₺</span>
                </div>
                <span className="text-white font-medium text-sm sm:text-base">GiderSE-Gelir</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 px-4 animate-scale-up">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x">
                Finansal
              </span>
              <br />
              <span className="text-white">Özgürlüğünüz</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto px-4 animate-scale-up">
              Gelir ve giderlerinizi akıllıca yönetin, finansal hedeflerinize ulaşın.
            </p>

            {/* AI Badge - Küçük ve sade */}
            <div className="flex justify-center mb-6 sm:mb-8 animate-scale-up">
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-full px-4 py-2 border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 hover:shadow-glow transition-all duration-300">
                <Brain className="h-4 w-4 text-purple-400 animate-pulse-slow" />
                <span className="text-sm text-purple-300 font-medium">
                  AI Destekli Finansal Analiz
                </span>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4 animate-scale-up">
              <Button
                size="lg"
                variant="premium"
                className="w-full sm:w-auto"
                onClick={() => router.push('/auth/register')}
              >
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Ücretsiz Başla
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
                onClick={() => router.push('/auth/login')}
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Giriş Yap
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto px-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div key={index} className="text-center group hover:scale-105 transition-transform duration-300">
                    <div className="flex justify-center mb-2">
                      <div className="p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:bg-white/20 group-hover:shadow-glow transition-all duration-300">
                        <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                      </div>
                    </div>
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-1">
                      {stat.number}
                    </div>
                    <div className="text-slate-400 text-xs sm:text-sm">{stat.label}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* AI Analizler Section - Merkez Bölüm */}
      <div className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-purple-900/50 via-pink-900/30 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600/30 to-pink-600/30 backdrop-blur-sm rounded-full px-4 sm:px-6 py-2 sm:py-3 border border-purple-500/40 mb-4 sm:mb-6">
              <Brain className="h-5 w-5 sm:h-6 sm:w-6 text-purple-300" />
              <span className="text-purple-200 font-semibold text-sm sm:text-base">
                Yapay Zeka Destekli Finansal Analiz
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                AI Analizler
              </span>{' '}
              ile Finansal Geleceğinizi Şekillendirin
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Ayda 4 kez detaylı finansal analiz raporu alın ve yapay zeka destekli önerilerle
              finansal kararlarınızı optimize edin
            </p>
          </div>

          {/* AI Avantajları Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-12 md:mb-16">
            <Card className="backdrop-blur-sm bg-gradient-to-br from-purple-500/20 to-pink-600/20 border-purple-400/30 hover:border-purple-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Akıllı Harcama Analizi</h3>
                <p className="text-slate-300 text-sm sm:text-base mb-4">
                  AI, harcama kalıplarınızı analiz ederek gereksiz giderleri tespit eder ve size
                  tasarruf fırsatları sunar.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">
                      Otomatik harcama kategorilendirme
                    </span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Gereksiz gider tespiti</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-purple-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Tasarruf önerileri</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-blue-500/20 to-indigo-600/20 border-blue-400/30 hover:border-blue-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Trend Tahminleri</h3>
                <p className="text-slate-300 text-sm sm:text-base mb-4">
                  Gelecek finansal durumunuzu öngören AI tahminleri ile proaktif kararlar alın ve
                  riskleri önceden görün.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">3-6 ay finansal tahmin</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Gelir-gider trend analizi</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Risk uyarıları</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-amber-500/20 to-orange-600/20 border-amber-400/30 hover:border-amber-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Kişiselleştirilmiş Öneriler
                </h3>
                <p className="text-slate-300 text-sm sm:text-base mb-4">
                  Finansal durumunuza özel, uygulanabilir öneriler alın. Plan türünüze göre 5-30+ AI
                  önerisi ile stratejinizi güçlendirin.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Size özel finansal strateji</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Hedef odaklı öneriler</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Eylem planları</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-400/30 hover:border-green-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 mb-4">
                  <Lightbulb className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Akıllı Tasarruf Önerileri</h3>
                <p className="text-slate-300 text-sm sm:text-base mb-4">
                  Hayat pahalılığına karşı AI destekli tasarruf stratejileri ile bütçenizi optimize
                  edin ve daha fazla birikim yapın.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Alternatif harcama önerileri</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Fiyat karşılaştırmaları</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Tasarruf hedefleri</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border-cyan-400/30 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">Risk Analizi</h3>
                <p className="text-slate-300 text-sm sm:text-base mb-4">
                  Finansal risklerinizi önceden tespit edin ve AI destekli çözümlerle güvenli bir
                  finansal gelecek inşa edin.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Finansal sağlık skoru</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Risk uyarıları</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Önleyici öneriler</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="backdrop-blur-sm bg-gradient-to-br from-pink-500/20 to-rose-600/20 border-pink-400/30 hover:border-pink-400/50 transition-all duration-300 hover:scale-105">
              <CardContent className="p-6">
                <div className="inline-flex p-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">
                  Benchmark Karşılaştırmaları
                </h3>
                <p className="text-slate-300 text-sm sm:text-base mb-4">
                  Finansal durumunuzu benzer profillerle karşılaştırın ve sektör ortalamalarına göre
                  performansınızı değerlendirin.
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-pink-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Sektör karşılaştırmaları</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-pink-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">Performans metrikleri</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <Check className="h-4 w-4 text-pink-400 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-300 text-sm">İyileştirme fırsatları</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* AI Nasıl Çalışır */}
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 border border-purple-500/30">
            <div className="text-center mb-8 sm:mb-10">
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">
                AI Analiz Raporu{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Nasıl Çalışır?
                </span>
              </h3>
              <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
                Ayda 4 kez otomatik olarak finansal verileriniz analiz edilir ve size detaylı rapor
                sunulur
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Veri Toplama</h4>
                <p className="text-slate-300 text-sm">
                  Tüm finansal işlemleriniz otomatik olarak toplanır ve kategorize edilir
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">AI Analizi</h4>
                <p className="text-slate-300 text-sm">
                  Yapay zeka algoritmaları verilerinizi derinlemesine analiz eder
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-amber-500 to-orange-600 mb-4">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Öneri Üretimi</h4>
                <p className="text-slate-300 text-sm">
                  Size özel, uygulanabilir finansal öneriler oluşturulur
                </p>
              </div>
              <div className="text-center">
                <div className="inline-flex p-4 rounded-full bg-gradient-to-r from-green-500 to-emerald-600 mb-4">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <h4 className="text-lg font-semibold text-white mb-2">Rapor Sunumu</h4>
                <p className="text-slate-300 text-sm">
                  Detaylı rapor ve görselleştirmelerle sonuçlar size sunulur
                </p>
              </div>
            </div>

            <div className="mt-8 sm:mt-10 text-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl"
                onClick={() => router.push('/auth/register')}
              >
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                AI Analizler ile Başlayın
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 md:py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Neden{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                GiderSE-Gelir
              </span>
              ?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
              Modern finansal yönetim araçları ile hayatınızı kolaylaştırın
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card
                  key={index}
                  variant="glass"
                  className="group cursor-pointer hover:scale-105 hover:shadow-glow-lg transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div
                      className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} mb-4 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300`}
                    >
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-gradient-premium transition-all duration-300">{feature.title}</h3>
                    <p className="text-slate-300 text-sm sm:text-base">{feature.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* Pricing Section */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Size Uygun{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Planı
              </span>{' '}
              Seçin
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Bireysel kullanıcılar ve şirketler için esnek planlar
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 max-w-7xl mx-auto">
            {pricingPlans.map((plan, index) => {
              return (
                <Card
                  key={index}
                  className={`relative bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-300 ${plan.popular ? 'ring-2 ring-purple-500/50 sm:scale-105' : ''
                    } ${plan.ultra ? 'ring-2 ring-amber-500/50 sm:scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        En Popüler
                      </div>
                    </div>
                  )}
                  {plan.ultra && (
                    <div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
                      <div className="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-semibold">
                        Ultra Lüks
                      </div>
                    </div>
                  )}
                  <CardHeader className="text-center pb-4 pt-6 sm:pt-8">
                    <CardTitle className="text-xl sm:text-2xl font-bold text-white">
                      {plan.name}
                    </CardTitle>
                    <div className="mt-4">
                      <span className="text-3xl sm:text-4xl font-bold text-white">
                        ₺{plan.price}
                      </span>
                      <span className="text-slate-400 text-sm sm:text-base">/{plan.period}</span>
                    </div>
                    <CardDescription className="text-slate-300 mt-2 text-sm">
                      {plan.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-start space-x-2 sm:space-x-3">
                          <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                          <span className="text-slate-300 text-xs sm:text-sm">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className={`w-full ${plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
                        : plan.ultra
                          ? 'bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white'
                          : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                        }`}
                      onClick={() => router.push('/auth/register')}
                    >
                      {plan.name === 'Ücretsiz' ? 'Ücretsiz Başla' : 'Planı Seç'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-12 sm:py-16 md:py-20">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl sm:rounded-3xl p-8 sm:p-12 border border-purple-500/30">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-3 sm:mb-4">
              Finansal Geleceğinizi{' '}
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Bugün
              </span>{' '}
              Şekillendirin
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-6 sm:mb-8">
              Binlerce kullanıcı zaten finansal özgürlüklerine kavuştu. Sıra sizde!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold shadow-2xl w-full sm:w-auto"
                onClick={() => router.push('/auth/register')}
              >
                <Rocket className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Hemen Başla
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold w-full sm:w-auto"
                onClick={() => router.push('/auth/login')}
              >
                <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Giriş Yap
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-xl sm:text-3xl font-bold text-white">₺</span>
              </div>
              <span className="text-xl sm:text-2xl font-bold text-white">GiderSE-Gelir</span>
            </div>
            <p className="text-slate-400 mb-3 sm:mb-4 text-sm sm:text-base">
              Finansal özgürlüğünüz için güvenilir partneriniz
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs sm:text-sm text-slate-400">
              <span>© 2024 GiderSE-Gelir</span>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/privacy"
                className="text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                Gizlilik Politikası
              </Link>
              <span className="hidden sm:inline">•</span>
              <Link
                href="/terms"
                className="text-purple-400 hover:text-purple-300 transition-colors underline"
              >
                Kullanım Şartları
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
