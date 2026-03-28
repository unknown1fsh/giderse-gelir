'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import {
  Crown, Check, X, ArrowRight, Sparkles, Users,
  Brain, BarChart3, Target, Zap, TrendingUp, Shield, Gift,
  BadgeCheck,
} from 'lucide-react'
import { isPremiumPlan, isFamilyPlan } from '@/lib/plan-config'
import { SHOPIER_LINKS } from '@/lib/shopier-links'

const PLANS_UI = [
  {
    id: 'free', name: 'Başlangıç', price: 0, badge: null,
    iconGradient: 'from-slate-500 to-slate-600',
    borderClass: 'border-white/10',
    buttonClass: 'bg-white/10 text-white hover:bg-white/20',
    description: 'Kişisel finans takibine başlamak için',
    features: ['Aylık 30 işlem', '3 banka hesabı', '2 kredi kartı & 2 e-cüzdan', '3 tasarruf hedefi', 'Temel bütçe takibi', 'Dönem yönetimi'],
    missing: ['AI analiz & tahminler', 'Yatırım takibi', 'PDF/Excel export', 'Otomatik ödeme takibi'],
  },
  {
    id: 'premium', name: 'Pro', price: 99, badge: 'En Popüler',
    iconGradient: 'from-purple-500 to-pink-500',
    borderClass: 'border-purple-400/50',
    buttonClass: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white',
    description: 'Sınırsız takip ve AI finans koçu ile büyümek isteyenler için',
    features: ['Sınırsız işlem, hesap, kart', 'AI finansal asistan', 'Harcama & gelir tahminleri', 'Yatırım & portföy takibi', 'Otomatik ödeme takibi', 'PDF & Excel export', 'Nakit akış & trend analizleri', '7/24 öncelikli destek'],
    missing: [],
  },
  {
    id: 'family', name: 'Premium', price: 199, badge: 'İleri Seviye',
    iconGradient: 'from-cyan-500 to-blue-500',
    borderClass: 'border-cyan-400/40',
    buttonClass: 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white',
    description: 'Kredi kartı analizi, borç planı ve yatırım içgörüsü isteyenler için',
    features: ["Pro planın tüm özellikleri", 'Kredi kartı ekstre analizi', 'AI borç kapatma planı', 'Abonelik tespit önerileri', 'Yatırım öneri senaryoları', 'Öncelikli canlı destek', 'Yeni özelliklere erken erişim'],
    missing: [],
  },
]

const COMPARE = [
  { label: 'Aylık işlem',           free: '30',       premium: 'Sınırsız', family: 'Sınırsız' },
  { label: 'Hesap / Kart sayısı',   free: '3 / 2',     premium: 'Sınırsız', family: 'Sınırsız' },
  { label: 'Tasarruf hedefi',       free: '3 hedef',   premium: 'Sınırsız', family: 'Sınırsız' },
  { label: 'AI analiz',             free: false,        premium: true,        family: true },
  { label: 'Harcama tahminleri',    free: false,        premium: true,        family: true },
  { label: 'Yatırım takibi',        free: false,        premium: true,        family: true },
  { label: 'Otomatik ödeme takibi', free: false,        premium: true,        family: true },
  { label: 'PDF / Excel export',    free: false,        premium: true,        family: true },
  { label: 'Kredi kartı analiz',    free: false,        premium: false,       family: true },
  { label: 'AI borç kapatma planı',    free: false,        premium: false,       family: true },
  { label: 'Yatırım önerileri',     free: false,        premium: false,       family: true },
]

const SPOTLIGHTS = [
  { icon: Brain,      title: 'AI Finansal Asistan',    desc: 'Harcamalarını analiz eder, tasarruf önerileri sunar, 3–6 ay ilerisi için nakit akış tahminleri yapar.', gradient: 'from-purple-500 to-pink-500' },
  { icon: BarChart3,  title: 'Gelişmiş Raporlar',      desc: 'İnteraktif grafikler, kategori bazlı derin analizler, PDF ve Excel formatında indirilebilir raporlar.', gradient: 'from-blue-500 to-cyan-500' },
  { icon: Target,     title: 'Akıllı Hedef Takibi',    desc: 'Tasarruf hedeflerini belirle, ilerlemeyi izle. AI hangi kategoriden kısarsan daha hızlı ulaşırsın hesaplar.', gradient: 'from-orange-500 to-red-500' },
  { icon: TrendingUp, title: 'Yatırım & Portföy',      desc: 'Hisse, kripto, altın ve yatırım fonu portföyünü tek ekranda gör. Canlı fiyat güncellemesi.', gradient: 'from-green-500 to-emerald-500' },
  { icon: Zap,        title: 'Otomatik Ödeme Takibi',  desc: 'Kira, fatura, Netflix, abonelik — tüm tekrarlayan ödemelerini kaçırmadan takip et.', gradient: 'from-indigo-500 to-purple-500' },
  { icon: Users,      title: 'Borç & Yatırım Motoru',           desc: 'Borçları snowball yaklaşımıyla sıralar, tasarruf alanlarını çıkarır ve yatırım potansiyelini görünür kılar.', gradient: 'from-pink-500 to-rose-500' },
]

function CellValue({ value }: { value: string | boolean }) {
  if (value === true) {return <Check className="mx-auto h-4 w-4 text-emerald-400" />}
  if (value === false) {return <X className="mx-auto h-4 w-4 text-slate-600" />}
  return <span className="text-sm font-medium text-white">{value}</span>
}

export default function PremiumPage() {
  const { user } = useUser()
  const router = useRouter()
  const [upgrading, setUpgrading] = useState<string | null>(null)

  const currentPlan = user?.plan ?? 'free'
  const isCurrentPremium = isPremiumPlan(currentPlan)
  const isCurrentFamily = isFamilyPlan(currentPlan)

  async function handleUpgrade(planId: string) {
    if (planId === currentPlan) {return}

    // Premium/family planlar için Shopier'e yönlendir
    if (planId === 'premium') {
      window.open(SHOPIER_LINKS.premium, '_blank', 'noopener,noreferrer')
      return
    }
    if (planId === 'family') {
      window.open(SHOPIER_LINKS.family, '_blank', 'noopener,noreferrer')
      return
    }

    // Free plana düşmek için API çağır
    setUpgrading(planId)
    try {
      const res = await fetch('/api/subscription/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      })
      if (res.ok) {
        router.refresh()
      }
    } finally {
      setUpgrading(null)
    }
  }

  function getButtonLabel(planId: string) {
    if (planId === currentPlan) {return 'Mevcut Planın'}
    if (planId === 'free') {return 'Ücretsize Geç'}
    if (planId === 'premium') {return '30 Gün Ücretsiz Dene'}
    if (planId === 'family') {return "Premium'a Geç"}
    return 'Seç'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero */}
      <div className="mx-auto max-w-5xl px-4 pb-12 pt-16 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-sm font-medium text-amber-300">
          <Gift className="h-4 w-4" />
          Nisan ayı sonuna kadar: İlk 1 Ay Pro/Premium ücretsiz!
        </div>
        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
          Finansal özgürlüğün<br />
          <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">doğru planı</span> seç
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-base text-slate-400">
          Taahhüt yok. İstediğin zaman iptal et. Pro veya Premium planını ilk 30 gün ücretsiz dene.
        </p>
      </div>

      {/* Plan cards */}
      <div className="mx-auto max-w-5xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          {PLANS_UI.map(plan => {
            const isCurrent = plan.id === currentPlan
            const isLoading = upgrading === plan.id
            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-2xl border bg-white/5 p-6 backdrop-blur transition ${plan.borderClass} ${
                  (currentPlan === 'free' && plan.id === 'premium') ||
                  ((currentPlan === 'premium' || currentPlan === 'enterprise') && plan.id === 'family')
                    ? 'ring-2 ring-purple-500/40'
                    : ''
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${plan.id === 'premium' ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-cyan-600 to-blue-600'}`}>
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${plan.iconGradient}`}>
                  {plan.id === 'free' && <Shield className="h-5 w-5 text-white" />}
                  {plan.id === 'premium' && <Crown className="h-5 w-5 text-white" />}
                  {plan.id === 'family' && <Users className="h-5 w-5 text-white" />}
                </div>

                <h2 className="text-xl font-bold text-white">{plan.name}</h2>
                <p className="mt-1 text-sm text-slate-400">{plan.description}</p>

                <div className="my-5">
                  {plan.price === 0 ? (
                    <span className="text-3xl font-extrabold text-white">Ücretsiz</span>
                  ) : (
                    <div className="flex items-end gap-1">
                      <span className="text-3xl font-extrabold text-white">₺{plan.price}</span>
                      <span className="mb-1 text-sm text-slate-400">/ay</span>
                    </div>
                  )}
                  {plan.id === 'premium' && (
                    <p className="mt-1 text-xs text-purple-300">İlk 1 ay ücretsiz</p>
                  )}
                </div>

                <ul className="mb-6 flex-1 space-y-2">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-200">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
                      {f}
                    </li>
                  ))}
                  {plan.missing.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm text-slate-500 line-through">
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-slate-600" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrent || isLoading}
                  className={`w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:cursor-default disabled:opacity-60 ${isCurrent ? 'border border-white/20 bg-transparent text-slate-400' : plan.buttonClass}`}
                >
                  {isCurrent ? 'Mevcut Planın' : isLoading ? 'Yükleniyor...' : getButtonLabel(plan.id)}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Spotlights */}
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">Pro/Premium ile neler kazanırsın?</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SPOTLIGHTS.map(item => {
            const Icon = item.icon
            return (
              <div key={item.title} className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${item.gradient}`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
                <h3 className="mb-1 text-sm font-semibold text-white">{item.title}</h3>
                <p className="text-xs leading-relaxed text-slate-400">{item.desc}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Comparison table */}
      <div className="mx-auto max-w-5xl px-4 pb-20">
        <h2 className="mb-8 text-center text-2xl font-bold text-white">Plan karşılaştırması</h2>
        <div className="overflow-hidden rounded-2xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-widest text-slate-500">Özellik</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-slate-400">Başlangıç</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-purple-300">Pro</th>
                <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-widest text-cyan-300">Premium</th>
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((row, i) => (
                <tr key={row.label} className={`border-b border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''}`}>
                  <td className="px-5 py-3 text-slate-300">{row.label}</td>
                  <td className="px-4 py-3 text-center"><CellValue value={row.free} /></td>
                  <td className="px-4 py-3 text-center"><CellValue value={row.premium} /></td>
                  <td className="px-4 py-3 text-center"><CellValue value={row.family} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CTA */}
      <div className="mx-auto max-w-2xl px-4 pb-24 text-center">
        <div className="rounded-2xl border border-purple-400/20 bg-gradient-to-br from-purple-900/40 to-pink-900/30 p-10 backdrop-blur">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-300">
            <Sparkles className="h-3 w-3" />
            Nisan ayı sonuna kadar sürecek kampanya
          </div>
          <h2 className="mt-2 text-2xl font-extrabold text-white">Bugün başla, ilk 1 ay bedava</h2>
          <p className="mx-auto mt-3 max-w-sm text-sm text-slate-400">
            Kredi kartı gerekmez. İlk 1 ay tam Pro erişim. Beğenmezsen tek tıkla iptal.
          </p>
          <button
            onClick={() => handleUpgrade('premium')}
            disabled={isCurrentPremium || upgrading === 'premium'}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 text-sm font-semibold text-white transition hover:from-purple-700 hover:to-pink-700 disabled:opacity-60"
          >
            {isCurrentPremium ? (
              <><BadgeCheck className="h-4 w-4" /> Pro aktif</>
            ) : (
              <>Pro ücretsiz dene <ArrowRight className="h-4 w-4" /></>
            )}
          </button>
          {isCurrentFamily && (
            <p className="mt-3 text-xs text-cyan-300">Premium plan aktif — tüm Pro özellikler dahil.</p>
          )}
        </div>
      </div>
    </div>
  )
}
