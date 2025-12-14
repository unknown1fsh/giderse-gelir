'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import {
  BrainCircuit,
  BarChart3,
  Wallet,
  TrendingUp,
  Calendar,
  CalendarDays,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Play,
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Feature {
  id: number
  title: string
  description: string
  icon: React.ElementType
  gradient: string
  details: string[]
}

const features: Feature[] = [
  {
    id: 1,
    title: 'AI Finansal Asistan',
    description:
      'Harcamalarınızı analiz eder, tasarruf önerileri sunar ve finansal hedeflerinize ulaşmanızda yardımcı olur.',
    icon: BrainCircuit,
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    details: [
      'Kişiselleştirilmiş harcama analizi',
      'Otomatik tasarruf önerileri',
      'Finansal hedef takibi',
      'Akıllı bütçe önerileri',
    ],
  },
  {
    id: 2,
    title: 'Gelişmiş Raporlama',
    description:
      'İnteraktif grafikler ve PDF/Excel raporlarıyla finansal durumunuzu her açıdan görün.',
    icon: BarChart3,
    gradient: 'from-blue-500 via-cyan-500 to-teal-500',
    details: [
      'İnteraktif grafikler ve görselleştirmeler',
      'PDF ve Excel export',
      'Kategori bazlı detaylı analizler',
      'Zaman içi trend karşılaştırmaları',
    ],
  },
  {
    id: 3,
    title: 'Hesap Yönetimi',
    description:
      'Tüm banka hesaplarınızı, kredi kartlarınızı ve e-cüzdanlarınızı tek bir yerden yönetin.',
    icon: Wallet,
    gradient: 'from-emerald-500 via-green-500 to-lime-500',
    details: [
      'Çoklu banka hesabı desteği',
      'Kredi kartı yönetimi',
      'E-cüzdan entegrasyonu',
      'Gerçek zamanlı bakiye takibi',
    ],
  },
  {
    id: 4,
    title: 'Yatırım Portföyü',
    description: 'Hisse senetleri, kripto paralar, altın ve diğer yatırım araçlarınızı takip edin.',
    icon: TrendingUp,
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    details: [
      'Hisse senedi takibi',
      'Kripto para yönetimi',
      'Altın ve değerli madenler',
      'Portföy performans analizi',
    ],
  },
  {
    id: 5,
    title: 'Otomatik Ödemeler',
    description:
      'Tekrarlayan ödemelerinizi otomatik olarak kaydedin ve hiçbir faturanızı kaçırmayın.',
    icon: Calendar,
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    details: [
      'Otomatik fatura takibi',
      'Tekrarlayan ödeme hatırlatıcıları',
      'Ödeme geçmişi',
      'Bütçe planlaması',
    ],
  },
  {
    id: 6,
    title: 'Periyod Yönetimi',
    description:
      'Yıl, ay veya özel dönemler oluşturarak finansal durumunuzu dönemsel olarak takip edin.',
    icon: CalendarDays,
    gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
    details: [
      'Yıllık, aylık dönem takibi',
      'Özel dönem oluşturma',
      'Dönemsel karşılaştırmalar',
      'Hedef bazlı raporlama',
    ],
  },
  {
    id: 7,
    title: 'Dashboard & Özet',
    description:
      'Finansal durumunuzu tek bakışta görün, hızlı kararlar alın ve hedeflerinize odaklanın.',
    icon: LayoutDashboard,
    gradient: 'from-slate-600 via-gray-600 to-zinc-600',
    details: [
      'Özet finansal durum',
      'Hızlı erişim menüleri',
      'Önemli bildirimler',
      'Kişiselleştirilebilir görünüm',
    ],
  },
]

export default function FeatureCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const router = useRouter()

  // Otomatik geçiş
  useEffect(() => {
    if (!isAutoPlaying) {
      return
    }

    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % features.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [isAutoPlaying, features.length])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setIsAutoPlaying(false)
    // 10 saniye sonra otomatik oynatmayı tekrar başlat
    setTimeout(() => setIsAutoPlaying(true), 10000)
  }, [])

  const goToPrevious = useCallback(() => {
    goToSlide((currentIndex - 1 + features.length) % features.length)
  }, [currentIndex, goToSlide])

  const goToNext = useCallback(() => {
    goToSlide((currentIndex + 1) % features.length)
  }, [currentIndex, goToSlide])

  const currentFeature = features[currentIndex]
  const Icon = currentFeature.icon

  return (
    <section className="relative py-12 sm:py-16 lg:py-20 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Başlık */}
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Uygulamanın Özellikleri
            </span>
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto">
            Finansal yönetiminizi kolaylaştıran güçlü araçlar
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Ana Slayt */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-800/50 via-purple-900/50 to-slate-800/50 backdrop-blur-sm border border-white/10 shadow-2xl">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${currentFeature.gradient} opacity-20`}
            ></div>

            <div className="relative p-6 sm:p-8 lg:p-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                {/* Sol Taraf - İçerik */}
                <div className="text-center lg:text-left">
                  <div className="inline-flex items-center justify-center lg:justify-start mb-4">
                    <div
                      className={`p-4 rounded-2xl bg-gradient-to-br ${currentFeature.gradient} shadow-lg`}
                    >
                      <Icon className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4">
                    {currentFeature.title}
                  </h3>

                  <p className="text-base sm:text-lg text-slate-300 mb-6 leading-relaxed">
                    {currentFeature.description}
                  </p>

                  {/* Özellik Listesi */}
                  <ul className="space-y-2 mb-6 text-left">
                    {currentFeature.details.map((detail, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <span className="text-purple-400 mt-1">✓</span>
                        <span className="text-sm sm:text-base">{detail}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Buton */}
                  <Button
                    size="lg"
                    variant="premium"
                    className="w-full sm:w-auto"
                    onClick={() => router.push('/demo')}
                  >
                    <Play className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                    Demo'yu Dene
                  </Button>
                </div>

                {/* Sağ Taraf - Görsel/İkon */}
                <div className="flex items-center justify-center">
                  <div className={`relative w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96`}>
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${currentFeature.gradient} rounded-full blur-3xl opacity-30 animate-pulse`}
                    ></div>
                    <div
                      className={`relative w-full h-full bg-gradient-to-br ${currentFeature.gradient} rounded-3xl flex items-center justify-center shadow-2xl transform transition-transform duration-500 hover:scale-105`}
                    >
                      <Icon className="h-32 w-32 sm:h-40 sm:w-40 lg:h-48 lg:w-48 text-white opacity-90" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Navigasyon Okları */}
          <button
            onClick={goToPrevious}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            aria-label="Önceki özellik"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 p-2 sm:p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white hover:bg-white/20 transition-all duration-300 hover:scale-110"
            aria-label="Sonraki özellik"
          >
            <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Nokta Göstergeler */}
          <div className="flex justify-center gap-2 mt-6 sm:mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'w-8 h-2 bg-white'
                    : 'w-2 h-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`${index + 1}. özelliğe git`}
              />
            ))}
          </div>
        </div>

        {/* Özellik Sayacı */}
        <div className="text-center mt-4 text-sm text-slate-400">
          <span>
            {currentIndex + 1} / {features.length}
          </span>
        </div>
      </div>
    </section>
  )
}
