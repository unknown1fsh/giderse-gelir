'use client'

import { Button } from '@/components/ui/button'
import { BrainCircuit, Play, Rocket, ShieldCheck, Sparkles, Target, TrendingUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'
import LandingCalculators from '@/components/landing/landing-calculators'
import FeatureCarousel from '@/components/landing/feature-carousel'
import FeedbackForm from '@/components/landing/feedback-form'

export default function LandingPage() {
  const router = useRouter()

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
                <BrandLogo
                  size={32}
                  priority
                  variant="dark"
                  textClassName="text-white font-medium text-sm sm:text-base"
                />
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
              Gelir–gider alışkanlıklarınızı anlayan yapay zekâ ile harcamalarınızı netleştirin,
              tasarruf fırsatlarını yakalayın ve hedeflerinize daha hızlı yaklaşın.
            </p>

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

            {/* AI Highlights */}
            <div className="max-w-5xl mx-auto px-4 pb-6 sm:pb-10 animate-scale-up">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5 text-left">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <BrainCircuit className="h-5 w-5 text-purple-300" />
                    <span className="font-semibold">AI Tavsiyeler</span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                    İşlem geçmişinize göre kişiselleştirilmiş öneriler: gereksiz giderler, tekrar
                    eden ödemeler ve optimizasyon fırsatları.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5 text-left">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <TrendingUp className="h-5 w-5 text-blue-300" />
                    <span className="font-semibold">Trend & İçgörü</span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                    Aylık karşılaştırmalar, kategori bazlı eğilimler ve “bu ay neden arttı?”
                    sorusuna hızlı, anlaşılır cevaplar.
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5 text-left">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <Target className="h-5 w-5 text-pink-300" />
                    <span className="font-semibold">Hedef Odaklı</span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                    Hedefinize göre bütçe önerisi ve aksiyon planı: “Bu ay şuradan kısarsan hedefe
                    şu kadar yaklaşır.”
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/5 backdrop-blur-sm p-4 sm:p-5 text-left">
                  <div className="flex items-center gap-2 text-white mb-2">
                    <ShieldCheck className="h-5 w-5 text-emerald-300" />
                    <span className="font-semibold">Kontrol Sizde</span>
                  </div>
                  <p className="text-sm sm:text-[15px] text-slate-300 leading-relaxed">
                    Tavsiyeler, yalnızca uygulamadaki verileriniz ve tercihleriniz doğrultusunda
                    üretilir. Ne paylaştığınıza siz karar verirsiniz.
                  </p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-400">
                <Sparkles className="h-4 w-4 text-purple-300" />
                <span>
                  Daha akıllı harcama kararları için{' '}
                  <span className="text-slate-200 font-medium">veri + AI</span> birleşimi.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Carousel */}
      <FeatureCarousel />

      {/* Demo CTA Section */}
      <div className="relative py-12 sm:py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-blue-600/20 backdrop-blur-sm rounded-3xl border border-white/10 p-8 sm:p-12 shadow-2xl">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
              Uygulamayı Denemek İster misiniz?
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 mb-6 max-w-2xl mx-auto">
              Demo sayfasında uygulamanın özelliklerini keşfedin, işlemler ekleyin ve finansal
              yönetimin nasıl çalıştığını görün.
            </p>
            <Button
              size="lg"
              variant="premium"
              className="w-full sm:w-auto"
              onClick={() => router.push('/demo')}
            >
              <Play className="h-5 w-5 mr-2" />
              Demo'yu Hemen Dene
            </Button>
          </div>
        </div>
      </div>

      <LandingCalculators />

      {/* Feedback Form Section */}
      <FeedbackForm />

      {/* Footer */}
      <div className="py-8 sm:py-12 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 sm:space-x-3 mb-3 sm:mb-4">
              <BrandLogo
                size={36}
                variant="dark"
                priority
                textClassName="text-xl sm:text-2xl font-bold text-white"
              />
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
