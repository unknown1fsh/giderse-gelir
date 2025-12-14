'use client'

import { Button } from '@/components/ui/button'
import {
  BrainCircuit,
  Play,
  Rocket,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Lock,
  EyeOff,
  Database,
  CheckCircle2,
} from 'lucide-react'
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

      {/* Veri Gizliliği ve Güvenlik Bölümü */}
      <div className="relative py-16 sm:py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center mb-4">
              <div className="p-3 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-400/30">
                <ShieldCheck className="h-8 w-8 text-emerald-400" />
              </div>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                Verileriniz Sadece Sizindir
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
              Finansal verilerinizin gizliliği ve güvenliği bizim için en önemli önceliktir.
              Verileriniz şifrelenir, korunur ve yalnızca sizin kontrolünüzdedir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {/* Şifreleme */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-blue-500/10 to-purple-500/10 backdrop-blur-sm rounded-2xl border-2 border-emerald-400/30 p-6 sm:p-8 hover:border-emerald-400/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-400/30">
                  <Lock className="h-6 w-6 text-emerald-400" />
                </div>
                <h3 className="text-xl font-bold text-white">End-to-End Şifreleme</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Tüm finansal verileriniz endüstri standardı şifreleme ile korunur. Verileriniz
                sadece sizin erişebileceğiniz şekilde saklanır.
              </p>
            </div>

            {/* Veri Sahipliği */}
            <div className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 backdrop-blur-sm rounded-2xl border-2 border-blue-400/30 p-6 sm:p-8 hover:border-blue-400/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                  <Database className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Tam Veri Sahipliği</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Verileriniz size aittir. İstediğiniz zaman verilerinizi silebilir, dışa aktarabilir
                veya gizlilik ayarlarınızı değiştirebilirsiniz.
              </p>
            </div>

            {/* Gizlilik Kontrolü */}
            <div className="bg-gradient-to-br from-purple-500/10 via-pink-500/10 to-red-500/10 backdrop-blur-sm rounded-2xl border-2 border-purple-400/30 p-6 sm:p-8 hover:border-purple-400/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-purple-500/20 border border-purple-400/30">
                  <EyeOff className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Gizlilik Kontrolü</h3>
              </div>
              <p className="text-slate-300 leading-relaxed">
                Verileriniz üçüncü taraflarla paylaşılmaz. Reklam verileri toplanmaz. Sadece size
                hizmet etmek için gerekli minimum veri işlenir.
              </p>
            </div>
          </div>

          {/* Güvenlik Özellikleri Listesi */}
          <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-3xl border-2 border-white/10 p-8 sm:p-12">
            <h3 className="text-2xl sm:text-3xl font-bold text-white text-center mb-8">
              Güvenlik ve Gizlilik Taahhütlerimiz
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">KVKK ve GDPR Uyumlu</p>
                  <p className="text-slate-300 text-sm">
                    Kişisel Verilerin Korunması Kanunu ve GDPR standartlarına tam uyumluluk
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Güvenli Sunucular</p>
                  <p className="text-slate-300 text-sm">
                    Verileriniz güvenli, şifrelenmiş sunucularda saklanır ve düzenli yedeklenir
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">İki Faktörlü Doğrulama</p>
                  <p className="text-slate-300 text-sm">
                    Hesabınızı ekstra güvenlik katmanı ile koruyun (isteğe bağlı)
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Veri Dışa Aktarma</p>
                  <p className="text-slate-300 text-sm">
                    İstediğiniz zaman tüm verilerinizi standart formatta dışa aktarabilirsiniz
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Anonim Kullanım</p>
                  <p className="text-slate-300 text-sm">
                    İsim-soyisim vermeden, sadece kullanıcı adı ile uygulamayı kullanabilirsiniz
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-400 mt-1 flex-shrink-0" />
                <div>
                  <p className="text-white font-semibold mb-1">Şeffaf Gizlilik Politikası</p>
                  <p className="text-slate-300 text-sm">
                    Verilerinizin nasıl kullanıldığını açık ve net bir şekilde paylaşıyoruz
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-8 text-center">
              <Link
                href="/privacy"
                className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 font-semibold transition-colors underline"
              >
                <ShieldCheck className="h-4 w-4" />
                Detaylı Gizlilik Politikamızı İnceleyin
              </Link>
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
