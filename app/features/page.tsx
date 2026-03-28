'use client'

import {
  BrainCircuit, BarChart3, Target, TrendingUp, Shield,
  Bell, CreditCard, Wallet, PiggyBank, FileText,
  ArrowRight, ShieldCheck, Sparkles, Zap, Menu, X,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'
import { useState } from 'react'

const SECTIONS = [
  {
    id: 'ai',
    label: 'Yapay Zekâ',
    accent: 'text-violet-400',
    dot: 'bg-violet-500',
    items: [
      {
        icon: BrainCircuit,
        title: 'AI Finansal Asistan',
        desc: 'Harcama alışkanlıklarını analiz eder, 3–6 aylık nakit akış tahmini üretir ve kişisel tasarruf önerileri sunar. Sadece senin verilerine göre konuşur.',
      },
      {
        icon: Sparkles,
        title: 'AI Analiz Raporları',
        desc: 'Her ay otomatik üretilen detaylı finansal rapor. Gelir-gider analizi, trend tespiti, kategori bazlı içgörüler ve somut aksiyon önerileri.',
      },
      {
        icon: Zap,
        title: 'Anlık Öneriler',
        desc: 'Dashboard\'da her oturum açtığında güncel finansal durumuna göre kişiselleştirilmiş ipuçları. "Bu ay Netflix harcamanız geçen aya göre %40 arttı."',
      },
    ],
  },
  {
    id: 'analytics',
    label: 'Analizler',
    accent: 'text-cyan-400',
    dot: 'bg-cyan-500',
    items: [
      {
        icon: BarChart3,
        title: 'Gelişmiş Raporlar',
        desc: 'Kategori bazlı harcama dağılımı, dönemsel karşılaştırmalar, gelir-gider trendi ve net varlık grafiği. Finansal geçmişinin tamamına erişim.',
      },
      {
        icon: FileText,
        title: 'PDF & Excel Export',
        desc: 'Tüm verilerini tek tıkla PDF veya Excel formatında dışa aktar. Muhasebe yazılımlarıyla uyumlu, hazır tablolar.',
      },
    ],
  },
  {
    id: 'budget',
    label: 'Bütçe & Hedefler',
    accent: 'text-pink-400',
    dot: 'bg-pink-500',
    items: [
      {
        icon: Target,
        title: 'Akıllı Bütçe',
        desc: '"Bu kategoriden kısarsan hedefe daha hızlı ulaşırsın" diyen bütçe asistanı. Kategorilere özel limitler belirle, aşımda anında bildirim al.',
      },
      {
        icon: PiggyBank,
        title: 'Tasarruf Hedefleri',
        desc: 'Tatil, araba, acil fon, ev — her hedef için ayrı birikim planı oluştur. AI, aylık ne kadar biriktirmen gerektiğini hesaplar.',
      },
    ],
  },
  {
    id: 'portfolio',
    label: 'Yatırım & Varlık',
    accent: 'text-emerald-400',
    dot: 'bg-emerald-500',
    items: [
      {
        icon: TrendingUp,
        title: 'Portföy Takibi',
        desc: 'Hisse senedi, kripto para, altın, döviz, yatırım fonu — tüm varlıklarını canlı fiyatlarla tek ekranda izle. Toplam net varlığını anlık gör.',
      },
      {
        icon: Wallet,
        title: 'Çoklu Hesap & Kart',
        desc: 'Birden fazla banka hesabı, kredi kartı ve dijital cüzdanı tek platformda yönet. Her hesabın bakiyesi ve hareketi ayrı ayrı takip edilir.',
      },
      {
        icon: CreditCard,
        title: 'Otomatik İşlemler',
        desc: 'Abonelikler, düzenli ödemeler ve otomatik transferleri takip et. Yaklaşan ödeme tarihlerinde hatırlatıcı al.',
      },
    ],
  },
  {
    id: 'security',
    label: 'Güvenlik & Gizlilik',
    accent: 'text-amber-400',
    dot: 'bg-amber-500',
    items: [
      {
        icon: Shield,
        title: 'Uçtan Uca Şifreleme',
        desc: 'Tüm finansal verilerin AES-256 ile şifrelenir. Şifreni sadece sen bilirsin — biz dahil hiç kimse göremez.',
      },
      {
        icon: ShieldCheck,
        title: 'KVKK & GDPR Uyumlu',
        desc: 'Türkiye KVKK ve Avrupa GDPR standartlarına tam uyumlu. Verilerini istediğin zaman tamamen sil. Veri satışı yok, reklam yok.',
      },
      {
        icon: Bell,
        title: 'Güvenlik Bildirimleri',
        desc: 'Şüpheli oturum açma, bütçe aşımı ve anormal harcama girişimlerinde anında bildirim. Hesabın her zaman senin kontrolünde.',
      },
    ],
  },
]

export default function FeaturesPage() {
  const router = useRouter()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050816] text-white">

      {/* Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[180px] opacity-[0.10]"
          style={{ width: 700, height: 700, background: 'radial-gradient(circle, #7c3aed 0%, transparent 70%)', top: '-5%', left: '-5%' }} />
        <div className="absolute rounded-full blur-[140px] opacity-[0.07]"
          style={{ width: 500, height: 500, background: 'radial-gradient(circle, #06b6d4 0%, transparent 70%)', bottom: '10%', right: '-5%' }} />
      </div>

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/[0.05]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/landing">
            <BrandLogo size={24} priority variant="dark" textClassName="text-white font-bold text-sm sm:text-base" />
          </Link>
          <div className="hidden items-center gap-7 text-sm text-slate-400 sm:flex">
            <Link href="/landing"  className="transition hover:text-white">Ana Sayfa</Link>
            <Link href="/pricing"  className="transition hover:text-white">Fiyatlar</Link>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/auth/login')} className="hidden px-3 py-1.5 text-slate-400 hover:text-white transition sm:block">Giriş</button>
            <button onClick={() => router.push('/auth/register')} className="hidden rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 font-semibold text-white hover:opacity-90 transition shadow-[0_0_18px_rgba(139,92,246,0.3)] sm:block">
              Ücretsiz Başla
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="sm:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition"
              aria-label="Menüyü aç"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 max-w-[85vw] bg-slate-950 border-l border-white/[0.07] flex flex-col p-6">
            <div className="flex items-center justify-between mb-8">
              <BrandLogo size={20} priority variant="dark" textClassName="text-white font-bold text-sm" />
              <button onClick={() => setMobileOpen(false)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.05] transition">
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1 text-sm">
              <Link href="/landing" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] transition">Ana Sayfa</Link>
              <Link href="/features" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-white bg-white/[0.05] font-medium">Özellikler</Link>
              <Link href="/pricing" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.05] transition">Fiyatlar</Link>
            </nav>
            <div className="mt-auto flex flex-col gap-2">
              <button onClick={() => { setMobileOpen(false); router.push('/auth/login') }} className="w-full px-4 py-2.5 rounded-lg border border-white/[0.08] text-slate-300 hover:text-white hover:bg-white/[0.05] transition text-sm">Giriş Yap</button>
              <button onClick={() => { setMobileOpen(false); router.push('/auth/register') }} className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 font-semibold text-white hover:opacity-90 transition text-sm">Ücretsiz Başla</button>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28">
        <p className="mb-4 text-xs font-bold uppercase tracking-widest text-violet-400">Özellikler</p>
        <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-5xl lg:text-6xl">
          Finansal kontrolü<br />
          <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
            yeniden tanımla.
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-slate-400 sm:text-lg">
          AI&apos;dan portföy takibine, bütçe yönetiminden veri güvenliğine —
          ihtiyacın olan her araç tek platformda.
        </p>

        {/* Anchor nav */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`}
              className="flex items-center gap-1.5 rounded-full border border-white/[0.07] bg-white/[0.03] px-3.5 py-1.5 text-xs text-slate-400 transition hover:border-white/15 hover:text-white">
              <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
              {s.label}
            </a>
          ))}
        </div>
      </div>

      {/* Feature sections */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8">
        <div className="space-y-px">
          {SECTIONS.map((section, si) => (
            <div key={section.id} id={section.id}
              className={`border-t border-white/[0.05] py-16 ${si === SECTIONS.length - 1 ? 'border-b' : ''}`}>
              <div className="grid gap-12 lg:grid-cols-[220px_1fr]">

                {/* Section label */}
                <div className="lg:pt-1">
                  <p className={`text-xs font-bold uppercase tracking-widest ${section.accent}`}>{section.label}</p>
                </div>

                {/* Items */}
                <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
                  {section.items.map((item, i) => {
                    const Icon = item.icon
                    return (
                      <div key={i} className="flex gap-4">
                        <div className="mt-0.5 shrink-0">
                          <Icon className={`h-5 w-5 ${section.accent}`} />
                        </div>
                        <div>
                          <h3 className="mb-2 text-sm font-bold text-white">{item.title}</h3>
                          <p className="text-sm leading-relaxed text-slate-500">{item.desc}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="relative z-10 border-t border-white/[0.04] py-24">
        <div className="mx-auto max-w-2xl px-5 text-center sm:px-8">
          <h2 className="mb-4 text-3xl font-extrabold text-white sm:text-4xl">
            Hepsini 30 gün ücretsiz dene
          </h2>
          <p className="mb-8 text-sm text-slate-500">
            Kredi kartı gerekmez. Taahhüt yok. İstediğin zaman iptal.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <button onClick={() => router.push('/auth/register')}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-8 py-3.5 font-bold text-white shadow-[0_0_32px_rgba(139,92,246,0.35)] transition hover:shadow-[0_0_50px_rgba(139,92,246,0.5)]">
              Ücretsiz Başla <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>
            <Link href="/pricing"
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-8 py-3.5 text-sm font-medium text-slate-400 transition hover:border-white/20 hover:text-white">
              Fiyatları gör
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-8">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-slate-600">
            <Link href="/landing"  className="hover:text-slate-300 transition">Ana Sayfa</Link>
            <Link href="/pricing"  className="hover:text-slate-300 transition">Fiyatlar</Link>
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
