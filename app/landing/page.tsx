'use client'

import { useState, useEffect } from 'react'
import {
  ArrowRight, BrainCircuit, TrendingUp, TrendingDown,
  CreditCard, Wallet, Bell, Gift, X, Play,
  CheckCircle2, Lock, EyeOff, Database, ShieldCheck,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'

function useMouseParallax(i = 0.012) {
  const [o, setO] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setO({ x: (e.clientX - window.innerWidth / 2) * i, y: (e.clientY - window.innerHeight / 2) * i })
    window.addEventListener('mousemove', h); return () => window.removeEventListener('mousemove', h)
  }, [i])
  return o
}

function LiveTicker() {
  const [v, setV] = useState('₺248.750')
  useEffect(() => {
    const vs = ['₺248.750', '₺248.912', '₺248.831', '₺249.104', '₺248.990']
    let i = 0; const t = setInterval(() => { i = (i + 1) % vs.length; setV(vs[i]) }, 2200)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono tabular-nums text-emerald-400/80 text-[11px]">{v}</span>
}

function AIBar() {
  const [hs, setHs] = useState([40, 65, 30, 55, 45])
  useEffect(() => {
    const t = setInterval(() => setHs(prev => prev.map(() => 20 + Math.random() * 75)), 1400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-end gap-[3px] h-3">
      {hs.map((h, i) => <div key={i} className="w-[3px] rounded-sm bg-violet-400/60 transition-all duration-700" style={{ height: `${h}%` }} />)}
    </div>
  )
}

function DashboardMock() {
  const bars = [55, 80, 45, 92, 67, 73, 58]
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem']
  return (
    <div className="relative">
      <div className="absolute -inset-8 bg-gradient-to-br from-violet-600/12 via-fuchsia-600/6 to-cyan-600/8 blur-3xl rounded-full" />
      <div className="relative rounded-2xl border border-white/[0.07] bg-slate-900/70 backdrop-blur-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center gap-1.5 border-b border-white/[0.05] px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-red-500/50" />
          <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
          <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
          <span className="ml-3 text-[10px] text-slate-600">giderse-gelir.com/dashboard</span>
        </div>
        <div className="p-4 space-y-3">
          <div className="rounded-xl border border-white/[0.05] bg-gradient-to-br from-violet-900/30 to-slate-900/50 p-4">
            <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-0.5">Net Varlık</p>
            <p className="text-xl font-extrabold text-white">₺248.750</p>
            <div className="flex items-center gap-1 mt-1">
              <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">+%12.4 bu ay</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ icon: TrendingUp, l: 'Gelir', v: '₺18.500', c: 'text-emerald-400' }, { icon: TrendingDown, l: 'Gider', v: '₺11.230', c: 'text-rose-400' }].map(({ icon: I, l, v, c }) => (
              <div key={l} className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
                <div className="flex items-center gap-1 mb-0.5"><I className={`h-2.5 w-2.5 ${c}`} /><p className="text-[9px] text-slate-600">{l}</p></div>
                <p className={`text-xs font-bold ${c}`}>{v}</p>
              </div>
            ))}
          </div>
          <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[9px] font-medium text-slate-500">Aylık Harcama</p>
              <span className="text-[9px] text-violet-400">2025</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full rounded-sm bg-gradient-to-t from-violet-600/60 to-violet-400/40" style={{ height: `${h}%` }} />
                  <span className="text-[7px] text-slate-700">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            {[
              { icon: CreditCard, l: 'Market alışverişi', a: '-₺320', c: 'text-rose-400' },
              { icon: Wallet, l: 'Maaş', a: '+₺18.500', c: 'text-emerald-400' },
              { icon: Bell, l: 'Netflix', a: '-₺89', c: 'text-rose-400' },
            ].map((t, i) => {
              const I = t.icon
              return (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md border border-white/[0.04] bg-white/[0.03] p-1"><I className="h-2.5 w-2.5 text-slate-600" /></div>
                    <span className="text-[10px] text-slate-400">{t.l}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${t.c}`}>{t.a}</span>
                </div>
              )
            })}
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-violet-500/15 bg-violet-500/8 px-3 py-2">
            <BrainCircuit className="h-3 w-3 text-violet-400 shrink-0" />
            <p className="text-[10px] text-violet-300 leading-snug"><span className="font-semibold">AI:</span> Market harcamalarını %15 azaltırsan ₺1.200 tasarruf edersin.</p>
          </div>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2.5 rounded-xl border border-emerald-500/12 bg-emerald-950/40 px-3 py-2.5 backdrop-blur-sm">
          <div className="relative shrink-0">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-emerald-300">Canlı güncelleniyor</p>
            <LiveTicker />
          </div>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl border border-violet-500/12 bg-violet-950/40 px-3 py-2.5 backdrop-blur-sm">
          <div className="shrink-0 rounded-lg bg-violet-500/15 p-1">
            <BrainCircuit className="h-2.5 w-2.5 text-violet-400" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-violet-300">AI analiz aktif</p>
            <AIBar />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter()
  const mouse = useMouseParallax()
  const [promoDismissed, setPromoDismissed] = useState(false)

  return (
    <div className="min-h-screen bg-[#050816] text-white overflow-x-hidden">

      {/* Aurora */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[160px] opacity-[0.15]"
          style={{ width: 800, height: 800, background: 'radial-gradient(circle, #7c3aed 0%, #a855f7 50%, transparent 70%)', top: '-10%', left: '-8%', transform: `translate(${mouse.x * 2}px,${mouse.y * 2}px)` }} />
        <div className="absolute rounded-full blur-[130px] opacity-[0.09]"
          style={{ width: 600, height: 600, background: 'radial-gradient(circle, #06b6d4 0%, #3b82f6 60%, transparent 70%)', bottom: '0%', right: '-5%', transform: `translate(${-mouse.x}px,${-mouse.y}px)` }} />
      </div>

      {/* Promo */}
      {!promoDismissed && (
        <div className="relative z-50 flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 px-4 py-2 text-xs font-medium text-black sm:text-sm">
          <Gift className="h-3.5 w-3.5 shrink-0" />
          <span><strong>Nisan ayı sonuna kadar:</strong> Yeni üyelere ilk 1 Ay Premium tamamen ücretsiz!</span>
          <button onClick={() => router.push('/auth/register')} className="inline-flex items-center gap-1 rounded-full bg-black/15 px-2.5 py-0.5 text-xs font-bold hover:bg-black/25 transition">
            Başla <ArrowRight className="h-3 w-3" />
          </button>
          <button onClick={() => setPromoDismissed(true)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 hover:opacity-100 transition" aria-label="Kapat">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Nav */}
      <nav className="relative z-50 border-b border-white/[0.05]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <BrandLogo size={24} priority variant="dark" textClassName="text-white font-bold text-sm sm:text-base" />
          <div className="hidden items-center gap-7 text-sm text-slate-400 sm:flex">
            <Link href="/features" className="transition hover:text-white">Özellikler</Link>
            <Link href="/pricing" className="transition hover:text-white">Fiyatlar</Link>
            <Link href="/demo" className="transition hover:text-white">Demo</Link>
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
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-20 sm:px-8 sm:pt-28 lg:pt-36 lg:pb-32">
        <div className="grid items-center gap-16 lg:grid-cols-2">

          {/* Left */}
          <div className="text-center lg:text-left">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/8 px-3.5 py-1.5 text-xs font-medium text-violet-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
              </span>
              Yapay Zekâ Destekli Finans Yönetimi
            </div>

            <h1 className="mb-6 text-5xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-6xl lg:text-[5.5rem]">
              Paranın gerçek<br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                sahibi ol.
              </span>
            </h1>

            <p className="mx-auto mb-9 max-w-md text-base leading-relaxed text-slate-400 sm:text-lg lg:mx-0">
              Gelir, gider, yatırım ve hedeflerini tek platformda yönet.
              Yapay zekâ ne yapman gerektiğini söyler — sen karar verirsin.
            </p>

            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
              <button onClick={() => router.push('/auth/register')}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.35)] transition hover:shadow-[0_0_45px_rgba(139,92,246,0.55)] sm:w-auto">
                Ücretsiz başla
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </button>
              <button onClick={() => router.push('/demo')}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 px-7 py-3.5 font-medium text-slate-300 transition hover:border-white/20 hover:text-white sm:w-auto">
                <Play className="h-4 w-4 text-violet-400" /> Canlı Demo
              </button>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-slate-600 lg:justify-start">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />Anonim kayıt</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />Kredi kartı gerekmez</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />1 Ay ücretsiz Premium (Nisan sonuna kadar)</span>
            </div>
          </div>

          {/* Right */}
          <div className="lg:pl-6">
            <DashboardMock />
          </div>
        </div>
      </section>

      {/* Feature nav strip — tek satır, arka plan yok */}
      <div className="relative z-10 border-t border-white/[0.04]">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 py-5 text-xs text-slate-600">
            <Link href="/features#ai"        className="transition hover:text-slate-300">AI Finansal Asistan</Link>
            <span className="text-white/10">·</span>
            <Link href="/features#analytics" className="transition hover:text-slate-300">Gelişmiş Analizler</Link>
            <span className="text-white/10">·</span>
            <Link href="/features#budget"    className="transition hover:text-slate-300">Akıllı Bütçe</Link>
            <span className="text-white/10">·</span>
            <Link href="/features#portfolio" className="transition hover:text-slate-300">Portföy Takibi</Link>
            <span className="text-white/10">·</span>
            <Link href="/features#security"  className="transition hover:text-slate-300">Güvenlik</Link>
            <span className="text-white/10">·</span>
            <Link href="/features" className="font-medium text-violet-400/70 transition hover:text-violet-300">
              Tüm özellikler →
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
            <div className="flex flex-col items-center gap-3 sm:items-start">
              <BrandLogo size={22} variant="dark" priority textClassName="text-sm font-bold text-white" />
              <div className="flex items-center gap-4 text-[10px] text-slate-600">
                {[
                  { icon: Lock,       l: 'Şifreli'    },
                  { icon: EyeOff,     l: 'Reklam yok' },
                  { icon: Database,   l: 'Verin sende' },
                  { icon: ShieldCheck,l: 'KVKK'       },
                ].map(({ icon: I, l }) => (
                  <span key={l} className="flex items-center gap-1"><I className="h-3 w-3 text-emerald-600/60" />{l}</span>
                ))}
              </div>
              <p className="text-[10px] text-slate-700">© {new Date().getFullYear()} GiderSE-Gelir</p>
            </div>
            <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs text-slate-600 sm:justify-end">
              <Link href="/features"  className="hover:text-slate-300 transition">Özellikler</Link>
              <Link href="/pricing"   className="hover:text-slate-300 transition">Fiyatlar</Link>
              <Link href="/demo"      className="hover:text-slate-300 transition">Demo</Link>
              <Link href="/privacy"   className="hover:text-slate-300 transition">Gizlilik</Link>
              <Link href="/terms"     className="hover:text-slate-300 transition">Kullanım Şartları</Link>
              <Link href="/kvkk"      className="hover:text-slate-300 transition">KVKK</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  )
}
