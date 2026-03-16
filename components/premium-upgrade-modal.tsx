'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/mosaic'
import { Button } from '@/components/mosaic'
import { SHOPIER_LINKS } from '@/lib/shopier-links'
import {
  Crown,
  CheckCircle,
  ArrowRight,
  X,
  Shield,
  Infinity,
  BarChart3,
  Download,
  Brain,
  Target,
  Gift,
  AlertTriangle,
} from 'lucide-react'

interface PremiumUpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  featureName?: string
  limitInfo?: {
    current: number
    limit: number
    type: 'transaction' | 'analysis' | 'export'
  }
}

export default function PremiumUpgradeModal({
  isOpen,
  onClose,
  featureName = 'Premium Özellik',
  limitInfo,
}: PremiumUpgradeModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpgrade = () => {
    setIsLoading(true)
    window.open(SHOPIER_LINKS.premium, '_blank', 'noopener,noreferrer')
    setTimeout(() => setIsLoading(false), 1000)
  }

  const getFeatureIcon = () => {
    if (limitInfo?.type === 'transaction') {return Infinity}
    if (limitInfo?.type === 'analysis') {return BarChart3}
    if (limitInfo?.type === 'export') {return Download}
    return Crown
  }

  const getFeatureDescription = () => {
    if (limitInfo?.type === 'transaction') {
      return `Aylık ${limitInfo.limit} işlem limitine ulaştınız. Pro ile sınırsız işlem yapabilirsiniz.`
    }
    if (limitInfo?.type === 'analysis') {
      return `${featureName} Pro üyelik gerektirir. Gelişmiş analizlere erişim kazanın.`
    }
    if (limitInfo?.type === 'export') {
      return `Veri dışa aktarma özelliği Pro üyelik gerektirir. Raporlarınızı Excel ve PDF formatında indirin.`
    }
    return `${featureName} Pro üyelik gerektirir.`
  }

  const FeatureIcon = getFeatureIcon()

  const highlights = [
    { icon: Infinity, label: 'Sınırsız işlem, hesap, kart' },
    { icon: Brain, label: 'AI finansal asistan & tahminler' },
    { icon: BarChart3, label: 'Nakit akış & trend analizleri' },
    { icon: Download, label: 'PDF & Excel export' },
    { icon: Target, label: 'Akıllı hedef takibi' },
    { icon: Shield, label: '7/24 öncelikli destek' },
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg bg-slate-950 border border-white/10 text-white">
        <div className="relative p-6">
          <button
            onClick={onClose}
            className="absolute right-0 top-0 p-2 text-slate-400 hover:text-white transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header */}
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600">
              <FeatureIcon className="h-7 w-7 text-white" />
            </div>
            <DialogTitle className="text-xl font-bold text-white">
              Pro&apos;ya Geç
            </DialogTitle>
            <DialogDescription className="mt-2 text-sm text-slate-400">
              {getFeatureDescription()}
            </DialogDescription>
          </div>

          {/* Trial badge */}
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-amber-400/20 bg-amber-400/10 px-4 py-3 text-sm text-amber-300">
            <Gift className="h-4 w-4 shrink-0" />
            <span><strong>İlk 30 gün ücretsiz.</strong> Taahhüt yok, istediğin zaman iptal.</span>
          </div>

          {/* Highlights */}
          <ul className="mb-6 space-y-2">
            {highlights.map(({ label }) => (
              <li key={label} className="flex items-center gap-3 text-sm text-slate-200">
                <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
                {label}
              </li>
            ))}
          </ul>

          {/* Price */}
          <div className="mb-4 rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-900/40 to-pink-900/30 p-4 text-center">
            <p className="text-xs uppercase tracking-widest text-slate-500">Pro Plan</p>
            <div className="mt-1 flex items-end justify-center gap-1">
              <span className="text-3xl font-extrabold text-white">₺99</span>
              <span className="mb-1 text-sm text-slate-400">/ay</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Veya <a href={SHOPIER_LINKS.family} target="_blank" rel="noopener noreferrer" className="text-cyan-300 font-medium hover:underline">Premium Paketi ₺199/ay</a> — gelişmiş analizler ve yatırım içgörüleri
            </p>
          </div>

          {/* E-posta uyarısı */}
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-amber-400/20 bg-amber-400/10 px-3.5 py-2.5 text-xs text-amber-300">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>
              Ödeme yaparken <strong className="text-amber-200">GiderSE-Gelir hesabınızdaki e-posta adresini</strong> kullanın.
              Aboneliğiniz e-posta eşleştirmesiyle otomatik aktifleşir.
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <Button
              onClick={handleUpgrade}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold"
            >
              {isLoading ? (
                'Yönlendiriliyor...'
              ) : (
                <>
                  <Crown className="mr-2 h-4 w-4" />
                  Shopier ile Satın Al
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="ghost"
              className="w-full text-slate-400 hover:text-white hover:bg-white/5"
            >
              Şimdi Değil
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
