'use client'

import { Check, X, ArrowRight, ShieldCheck, Gift, AlertTriangle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'
import { SHOPIER_LINKS, ShopierPlanKey } from '@/lib/shopier-links'


const PLANS = [
  {
    name: 'Başlangıç',
    price: null,
    badge: null,
    highlight: false,
    desc: 'Kişisel finans takibine başlamak için.',
    cta: 'Ücretsiz başla',
    shopierKey: null as ShopierPlanKey | null,
    features: [
      'Aylık 30 işlem',
      '3 hesap & 2 kart',
      'Temel bütçe takibi',
      'Dönem yönetimi',
      '3 aylık veri geçmişi',
      'E-posta destek',
    ],
  },
  {
    name: 'Pro',
    price: 99,
    badge: 'En Popüler',
    highlight: true,
    desc: 'Sınırsız işlem ve AI finans koçu ile bütçeni optimize et.',
    cta: 'Satın Al',
    shopierKey: 'premium' as const,
    features: [
      'Sınırsız işlem & hesap',
      'AI finansal asistan',
      'AI analiz raporları (ayda 4)',
      'Yatırım & portföy takibi',
      'PDF & Excel export',
      'Tüm veri geçmişi',
      '7/24 öncelikli destek',
    ],
  },
  {
    name: 'Premium',
    price: 199,
    badge: null,
    highlight: false,
    desc: 'Gelişmiş analizler, borç planı ve yatırım içgörüleri.',
    cta: 'Satın Al',
    shopierKey: 'family' as const,
    features: [
      "Pro planın tüm özellikleri",
      'Kredi kartı ekstre analizi',
      'AI borç kapatma planı (Snowball)',
      'AI yatırım öneri senaryoları',
      'Öncelikli premium destek',
    ],
  },
]

const COMPARE: { label: string; free: string | boolean; premium: string | boolean; family: string | boolean }[] = [
  { label: 'Aylık işlem limiti',   free: '30',              premium: 'Sınırsız',          family: 'Sınırsız'           },
  { label: 'Hesap & kart',         free: '3 hesap / 2 kart', premium: 'Sınırsız',          family: 'Sınırsız'           },
  { label: 'Veri geçmişi',         free: '3 ay',             premium: 'Tümü',              family: 'Tümü'               },
  { label: 'AI finansal asistan',  free: false,              premium: true,                family: true                 },
  { label: 'AI analiz raporu',     free: false,              premium: 'Ayda 4',            family: 'Ayda 8'             },
  { label: 'Yatırım takibi',       free: false,              premium: true,                family: true                 },
  { label: 'PDF & Excel export',   free: false,              premium: true,                family: true                 },
  { label: 'Kredi kartı analiz',   free: false,              premium: false,               family: true                 },
  { label: 'Destek',               free: 'E-posta',          premium: '7/24 öncelikli',    family: 'Öncelikli + canlı destek' },
]

export default function PricingPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[180px] opacity-[0.10]"
          style={{ width: 700, height: 700, background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', top: '-5%', right: '-5%' }} />
        <div className="absolute rounded-full blur-[140px] opacity-[0.07]"
          style={{ width: 500, height: 500, background: 'radial-gradient(circle, #f59e0b 0%, transparent 70%)', bottom: '10%', left: '-5%' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/[0.05]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/landing">
            <BrandLogo size={24} priority variant="dark" textClassName="text-white font-bold text-sm sm:text-base" />
          </Link>
          <div className="hidden items-center gap-7 text-sm text-slate-400 sm:flex">
            <Link href="/landing"  className="transition hover:text-white">Ana Sayfa</Link>
            <Link href="/features" className="transition hover:text-white">Özellikler</Link>
            <Link href="/demo"     className="transition hover:text-white">Demo</Link>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/auth/login')} className="px-3 py-1.5 text-slate-400 hover:text-white transition">Giriş</button>
            <button onClick={() => router.push('/auth/register')} className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 font-semibold text-white hover:opacity-90 transition shadow-[0_0_18px_rgba(139,92,246,0.3)]">
              Ücretsiz Başla
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-amber-400/15 bg-amber-400/8 px-3.5 py-1.5 text-xs font-medium text-amber-300">
          <Gift className="h-3.5 w-3.5" /> İlk 30 gün her plan ücretsiz
        </div>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Şeffaf,<br />
          <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
            adil fiyatlandırma.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base text-slate-400">
          Taahhüt yok. İstediğin zaman iptal. Kredi kartı gerekmez.
        </p>
      </div>

      {/* Email uyarı banner'ı */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8 mb-8">
        <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-400/[0.06] px-5 py-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="text-sm font-semibold text-amber-300">Ödeme Yaparken Dikkat!</p>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              Shopier üzerinden ödeme yaparken, <strong className="text-amber-200">GiderSE-Gelir hesabınızda kayıtlı olan e-posta adresini</strong> kullanmanız gerekmektedir.
              Aboneliğiniz bu e-posta adresi üzerinden otomatik olarak aktifleştirilecektir.
              Farklı bir e-posta ile ödeme yaparsanız paketiniz aktifleştirilemez.
            </p>
          </div>
        </div>
      </div>

      {/* Plan cards */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-3">
          {PLANS.map((p) => (
            <div key={p.name}
              className={`relative rounded-2xl p-6 ${p.highlight
                ? 'bg-gradient-to-b from-violet-900/30 to-transparent border border-violet-500/30 ring-1 ring-violet-500/10'
                : 'border border-white/[0.07]'}`}>
              {p.badge && (
                <span className="absolute -top-3 left-5 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-0.5 text-[10px] font-bold text-white">
                  {p.badge}
                </span>
              )}
              <p className="text-sm font-bold text-white">{p.name}</p>
              <p className="mt-1 text-xs leading-snug text-slate-500">{p.desc}</p>
              <div className="mt-5 mb-6">
                {p.price
                  ? <><span className="text-3xl font-extrabold text-white">₺{p.price}</span><span className="ml-1 text-sm text-slate-500">/ay</span></>
                  : <span className="text-3xl font-extrabold text-white">Ücretsiz</span>
                }
              </div>
              <ul className="mb-6 space-y-2.5">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-slate-400">
                    <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" /> {f}
                  </li>
                ))}
              </ul>
              {p.shopierKey ? (
                <a
                  href={SHOPIER_LINKS[p.shopierKey]}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`block w-full text-center rounded-xl py-2.5 text-xs font-semibold transition ${p.highlight
                    ? 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white hover:opacity-90'
                    : 'border border-white/10 text-slate-300 hover:bg-white/5'}`}>
                  {p.cta}
                </a>
              ) : (
                <button
                  onClick={() => router.push('/auth/register')}
                  className="w-full rounded-xl py-2.5 text-xs font-semibold transition border border-white/10 text-slate-300 hover:bg-white/5">
                  {p.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="relative z-10 mx-auto mt-6 max-w-5xl px-5 sm:px-8">
        <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.06] px-5 py-4 text-xs text-cyan-100">
          <strong>Lifetime (₺999) erken kullanıcı paketi</strong> için destek ekibine ulaşabilirsin. Sınırlı kontenjanla manuel aktivasyon yapıyoruz.
        </div>
      </div>

      {/* Comparison table */}
      <div className="relative z-10 mx-auto max-w-5xl px-5 py-20 sm:px-8">
        <h2 className="mb-8 text-center text-base font-bold text-white">Plan karşılaştırması</h2>
        <div className="overflow-x-auto rounded-2xl border border-white/[0.07]">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium text-slate-600">Özellik</th>
                <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs font-medium text-slate-500">Başlangıç</th>
                <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs font-bold text-violet-400">Pro</th>
                <th className="px-2 sm:px-4 py-3 sm:py-4 text-center text-xs font-medium text-slate-500">Premium</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.03]">
              {COMPARE.map((row, i) => (
                <tr key={i} className="hover:bg-white/[0.015] transition-colors">
                  <td className="px-3 sm:px-6 py-3 text-xs text-slate-400">{row.label}</td>
                  {(['free', 'premium', 'family'] as const).map((plan) => {
                    const val = row[plan]
                    return (
                      <td key={plan} className="px-2 sm:px-4 py-3 text-center">
                        {typeof val === 'boolean'
                          ? val
                            ? <Check className="mx-auto h-4 w-4 text-emerald-400" />
                            : <X className="mx-auto h-3.5 w-3.5 text-slate-700" />
                          : <span className="text-xs text-slate-300">{val}</span>
                        }
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trust strip */}
      <div className="relative z-10 border-t border-white/[0.04] py-8">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-8 text-xs text-slate-600">
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500/60" />KVKK Uyumlu</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500/60" />Veriler AES-256 şifreli</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500/60" />İstediğin zaman iptal</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-emerald-500/60" />Veri satışı yok</span>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 py-24">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            Başlamak için<br />
            <span className="bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent">mükemmel zaman.</span>
          </h2>
          <p className="mb-8 text-sm text-slate-500">
            İlk 30 gün Pro/Premium özelliklerini ücretsiz dene. Taahhüt yok.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => router.push('/auth/register')}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 font-bold text-white shadow-[0_0_32px_rgba(139,92,246,0.35)] transition hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]">
              Ücretsiz başla <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <Link href="/features"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:text-white">
              Özellikleri gör
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600">
            <Link href="/landing"  className="hover:text-slate-300 transition">Ana Sayfa</Link>
            <Link href="/features" className="hover:text-slate-300 transition">Özellikler</Link>
            <Link href="/demo"     className="hover:text-slate-300 transition">Demo</Link>
            <Link href="/privacy"  className="hover:text-slate-300 transition">Gizlilik</Link>
            <Link href="/terms"    className="hover:text-slate-300 transition">Kullanım Şartları</Link>
            <Link href="/kvkk"     className="hover:text-slate-300 transition">KVKK</Link>
          </div>
          <p className="mt-4 text-center text-[10px] text-slate-700">© {new Date().getFullYear()} GiderSE-Gelir</p>
        </div>
      </footer>

    </div>
  )
}
