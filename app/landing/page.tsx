'use client'

import { useState, useEffect } from 'react'
import {
  ArrowRight, BrainCircuit, TrendingUp, TrendingDown,
  CreditCard, Wallet, Bell, Gift, X, CheckCircle2,
  Menu, Target, Star,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'

/* ── Hooks ───────────────────────────────────────────────────────────── */
function useMouseParallax(i = 0.012) {
  const [o, setO] = useState({ x: 0, y: 0 })
  useEffect(() => {
    const h = (e: MouseEvent) => setO({ x: (e.clientX - window.innerWidth / 2) * i, y: (e.clientY - window.innerHeight / 2) * i })
    window.addEventListener('mousemove', h)
    return () => window.removeEventListener('mousemove', h)
  }, [i])
  return o
}

/* ── Animated helpers ────────────────────────────────────────────────── */
function LiveTicker() {
  const [v, setV] = useState('₺248.750')
  useEffect(() => {
    const vs = ['₺248.750', '₺248.912', '₺248.831', '₺249.104', '₺248.990']
    let i = 0
    const t = setInterval(() => { i = (i + 1) % vs.length; setV(vs[i]) }, 2200)
    return () => clearInterval(t)
  }, [])
  return <span className="font-mono tabular-nums text-emerald-400/80 text-[11px]">{v}</span>
}

function AIBar() {
  const [hs, setHs] = useState([40, 65, 30, 55, 45])
  useEffect(() => {
    const t = setInterval(() => setHs(() => [0, 0, 0, 0, 0].map(() => 20 + Math.random() * 75)), 1400)
    return () => clearInterval(t)
  }, [])
  return (
    <div className="flex items-end gap-[3px] h-3">
      {hs.map((h, i) => <div key={i} className="w-[3px] rounded-sm bg-violet-400/60 transition-all duration-700" style={{ height: `${h}%` }} />)}
    </div>
  )
}

/* ── DashboardMock ───────────────────────────────────────────────────── */
function DashboardMock() {
  const bars = [55, 80, 45, 92, 67, 73, 58]
  const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem']
  return (
    <div className="relative">
      <div className="absolute -inset-6 bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-cyan-600/5 blur-3xl rounded-full pointer-events-none" />
      <div className="relative rounded-xl border border-white/[0.08] bg-slate-950/80 backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="flex items-center gap-1.5 border-b border-white/[0.05] px-4 py-2.5">
          <div className="h-2 w-2 rounded-full bg-red-500/50" />
          <div className="h-2 w-2 rounded-full bg-yellow-500/50" />
          <div className="h-2 w-2 rounded-full bg-emerald-500/50" />
          <span className="ml-3 text-[10px] text-slate-600">giderse-gelir.com/dashboard</span>
        </div>
        <div className="p-4 space-y-2.5">
          {/* Net Worth */}
          <div className="rounded-xl border border-white/[0.05] bg-gradient-to-br from-violet-900/30 to-slate-900/50 p-3">
            <p className="text-[9px] uppercase tracking-widest text-slate-600 mb-0.5">Net Varlık</p>
            <p className="text-xl font-extrabold text-white">₺248.750</p>
            <div className="flex items-center gap-1 mt-0.5">
              <TrendingUp className="h-2.5 w-2.5 text-emerald-400" />
              <span className="text-[10px] text-emerald-400 font-medium">+%12.4 bu ay</span>
            </div>
          </div>
          {/* Income/Expense */}
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: TrendingUp,   l: 'Gelir', v: '₺18.500', c: 'text-emerald-400' },
              { icon: TrendingDown, l: 'Gider', v: '₺11.230', c: 'text-rose-400' },
            ].map(({ icon: I, l, v, c }) => (
              <div key={l} className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
                <div className="flex items-center gap-1 mb-0.5">
                  <I className={`h-2.5 w-2.5 ${c}`} />
                  <p className="text-[9px] text-slate-600">{l}</p>
                </div>
                <p className={`text-xs font-bold ${c}`}>{v}</p>
              </div>
            ))}
          </div>
          {/* Monthly chart */}
          <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5">
            <p className="text-[9px] font-medium text-slate-500 mb-2">Aylık Harcama</p>
            <div className="flex items-end gap-1 h-10">
              {bars.map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-full rounded-sm bg-gradient-to-t from-violet-600/60 to-violet-400/40" style={{ height: `${h}%` }} />
                  <span className="text-[7px] text-slate-700">{months[i]}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Transactions */}
          <div className="space-y-1">
            {[
              { icon: CreditCard, l: 'Market alışverişi', a: '-₺320',    c: 'text-rose-400' },
              { icon: Wallet,     l: 'Maaş',              a: '+₺18.500', c: 'text-emerald-400' },
              { icon: Bell,       l: 'Netflix',            a: '-₺89',     c: 'text-rose-400' },
            ].map((t, i) => {
              const I = t.icon
              return (
                <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] px-2.5 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className="rounded-md border border-white/[0.04] bg-white/[0.03] p-1">
                      <I className="h-2.5 w-2.5 text-slate-600" />
                    </div>
                    <span className="text-[10px] text-slate-400">{t.l}</span>
                  </div>
                  <span className={`text-[10px] font-semibold ${t.c}`}>{t.a}</span>
                </div>
              )
            })}
          </div>
          {/* AI tip */}
          <div className="flex items-center gap-2 rounded-lg border border-violet-500/15 bg-violet-500/8 px-3 py-2">
            <BrainCircuit className="h-3 w-3 text-violet-400 shrink-0" />
            <p className="text-[10px] text-violet-300 leading-snug">
              <span className="font-semibold">AI:</span> Market harcamalarını %15 azaltırsan ₺1.200 tasarruf edersin.
            </p>
          </div>
        </div>
      </div>
      {/* Status pills */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <div className="flex items-center gap-2 rounded-xl border border-emerald-500/[0.12] bg-emerald-950/40 px-3 py-2 backdrop-blur-sm">
          <div className="relative shrink-0">
            <div className="h-2 w-2 rounded-full bg-emerald-400" />
            <div className="absolute inset-0 animate-ping rounded-full bg-emerald-400 opacity-40" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-emerald-300">Canlı güncelleniyor</p>
            <LiveTicker />
          </div>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-violet-500/[0.12] bg-violet-950/40 px-3 py-2 backdrop-blur-sm">
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

/* ── FIRE Calculator ─────────────────────────────────────────────────── */
function FIRECalculator() {
  const router = useRouter()
  const [monthly, setMonthly] = useState('')
  const [savings, setSavings] = useState('')
  const [monthlyS, setMonthlyS] = useState('')

  const me = parseFloat(monthly.replace(/[^0-9.]/g, '')) || 0
  const sv = parseFloat(savings.replace(/[^0-9.]/g, '')) || 0
  const ms = parseFloat(monthlyS.replace(/[^0-9.]/g, '')) || 0

  const fireTarget = me * 12 * 25
  const gap = Math.max(fireTarget - sv, 0)
  const monthsToFire = ms > 0 ? gap / ms : null
  const yearsToFire = monthsToFire !== null ? Math.floor(monthsToFire / 12) : null
  const remMonths  = monthsToFire !== null ? Math.round(monthsToFire % 12) : null
  const hasResult  = me > 0 && ms > 0
  const alreadyFIRE = hasResult && gap <= 0

  const fields = [
    { label: 'Aylık Gider',    value: monthly,  onChange: setMonthly,  placeholder: '25.000' },
    { label: 'Mevcut Birikim', value: savings,  onChange: setSavings,  placeholder: '500.000' },
    { label: 'Aylık Tasarruf', value: monthlyS, onChange: setMonthlyS, placeholder: '10.000' },
  ]

  return (
    <div className="mt-5 rounded-2xl border border-violet-500/20 bg-black/30 p-4">
      <p className="mb-3 flex items-center gap-2 text-xs font-semibold text-white">
        <Target className="h-3.5 w-3.5 text-violet-400" />
        Finansal Özgürlüğüne Kaç Yılın Kaldı?
      </p>
      <div className="grid grid-cols-1 gap-2 mb-3 sm:grid-cols-3">
        {fields.map(({ label, value, onChange, placeholder }) => (
          <div key={label}>
            <p className="text-[10px] text-slate-500 mb-1">{label}</p>
            <div className="flex items-center rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1.5 focus-within:border-violet-500/40 transition">
              <span className="text-[10px] text-slate-500 mr-1">₺</span>
              <input
                type="text"
                inputMode="numeric"
                placeholder={placeholder}
                value={value}
                onChange={e => onChange(e.target.value)}
                className="w-full bg-transparent text-[11px] text-white placeholder-slate-700 outline-none"
              />
            </div>
          </div>
        ))}
      </div>
      {hasResult ? (
        <div className="rounded-xl border border-violet-500/25 bg-violet-500/10 px-3 py-2.5 flex flex-wrap items-center gap-3 justify-between">
          <div>
            <p className="text-[9px] text-slate-400">FIRE Hedefi</p>
            <p className="text-xs font-bold text-white">₺{fireTarget.toLocaleString('tr-TR')}</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400">Tahmini Süre</p>
            <p className="text-xs font-bold text-violet-300">
              {alreadyFIRE
                ? '🎉 Ulaştın!'
                : yearsToFire === 0
                  ? `${remMonths} ay`
                  : `${yearsToFire} yıl ${remMonths} ay`}
            </p>
          </div>
          <button
            onClick={() => router.push('/auth/register')}
            className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:opacity-90 transition"
          >
            Planı Kaydet →
          </button>
        </div>
      ) : (
        <p className="text-[10px] text-slate-600 text-center">Alanları doldur, FIRE hedefini hesapla</p>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const router = useRouter()
  const mouse = useMouseParallax()
  const [promoDismissed, setPromoDismissed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#050816] text-white flex flex-col items-center justify-center p-4 sm:p-6 relative">

      {/* ── Aurora background ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute rounded-full blur-[160px] opacity-[0.15]"
          style={{ width: 800, height: 800, background: 'radial-gradient(circle, #7c3aed 0%, #a855f7 50%, transparent 70%)', top: '-10%', left: '-8%', transform: `translate(${mouse.x * 2}px,${mouse.y * 2}px)` }} />
        <div className="absolute rounded-full blur-[130px] opacity-[0.09]"
          style={{ width: 600, height: 600, background: 'radial-gradient(circle, #06b6d4 0%, #3b82f6 60%, transparent 70%)', bottom: '0%', right: '-5%', transform: `translate(${-mouse.x}px,${-mouse.y}px)` }} />
      </div>

      {/* ── Single card ── */}
      <div className="relative z-10 w-full max-w-6xl rounded-3xl border border-white/[0.08] bg-white/[0.02] backdrop-blur-2xl overflow-hidden shadow-[0_0_120px_rgba(124,58,237,0.07),inset_0_1px_0_rgba(255,255,255,0.05)]">

        {/* Promo strip */}
        {!promoDismissed && (
          <div className="relative flex items-center justify-center gap-3 bg-gradient-to-r from-amber-500 via-orange-400 to-amber-500 px-4 py-2 text-xs font-medium text-black">
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
        <nav className="flex items-center justify-between gap-4 border-b border-white/[0.06] px-6 py-4">
          <BrandLogo size={22} priority variant="dark" textClassName="text-white font-bold text-sm" />
          <div className="hidden items-center gap-6 text-sm text-slate-400 sm:flex">
            <Link href="/features" className="transition hover:text-white">Özellikler</Link>
            <Link href="/pricing"  className="transition hover:text-white">Fiyatlar</Link>
          </div>
          <div className="hidden sm:flex items-center gap-2 text-sm">
            <button onClick={() => router.push('/auth/login')} className="px-3 py-1.5 text-slate-400 hover:text-white transition">
              Giriş
            </button>
            <button onClick={() => router.push('/auth/register')} className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 font-semibold text-white hover:opacity-90 transition shadow-[0_0_18px_rgba(139,92,246,0.3)]">
              Ücretsiz Başla
            </button>
          </div>
          <button className="sm:hidden p-1.5 text-slate-400 hover:text-white transition" onClick={() => setMenuOpen(v => !v)} aria-label="Menü">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {/* Mobile drawer */}
        {menuOpen && (
          <div className="sm:hidden border-b border-white/[0.05] bg-[#050816]/98 backdrop-blur-xl px-5 py-4 space-y-3">
            <Link href="/features" className="block text-sm text-slate-400 hover:text-white transition py-1" onClick={() => setMenuOpen(false)}>Özellikler</Link>
            <Link href="/pricing"  className="block text-sm text-slate-400 hover:text-white transition py-1" onClick={() => setMenuOpen(false)}>Fiyatlar</Link>
            <div className="border-t border-white/[0.06] pt-3 flex flex-col gap-2">
              <button onClick={() => { router.push('/auth/login'); setMenuOpen(false) }} className="text-left text-sm text-slate-400 hover:text-white transition py-1">Giriş Yap</button>
              <button onClick={() => { router.push('/auth/register'); setMenuOpen(false) }} className="w-full rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 font-semibold text-white text-sm hover:opacity-90 transition">
                Ücretsiz Başla
              </button>
            </div>
          </div>
        )}

        {/* Hero body */}
        <div className="grid items-center gap-8 px-4 py-8 sm:px-6 sm:py-10 md:px-8 lg:grid-cols-2 lg:gap-16 lg:py-12">

          {/* Left column */}
          <div>
            {/* AI badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/[0.08] px-3.5 py-1.5 text-xs font-medium text-violet-300">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-violet-500" />
              </span>
              Yapay Zekâ Destekli Finans Yönetimi
            </div>

            {/* H1 */}
            <h1 className="mb-4 text-4xl font-extrabold leading-[1.06] tracking-tight text-white sm:text-5xl lg:text-[4rem]">
              Paranın gerçek<br />
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                sahibi ol.
              </span>
            </h1>

            {/* Subtitle */}
            <p className="mb-5 max-w-md text-sm leading-relaxed text-slate-400 sm:text-[0.95rem]">
              Gelir, gider, yatırım ve hedeflerini tek platformda yönet.
              Yapay zekâ ne yapman gerektiğini söyler — sen karar verirsin.
            </p>

            {/* Social proof */}
            <div className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm">
              <span className="font-bold text-white">2.400+ <span className="text-xs font-normal text-slate-500">kullanıcı</span></span>
              <span className="select-none text-slate-700">·</span>
              <span className="font-bold text-white">₺180M+ <span className="text-xs font-normal text-slate-500">varlık</span></span>
              <span className="select-none text-slate-700">·</span>
              <span className="inline-flex items-center gap-1 font-bold text-white">
                <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                4.8 <span className="text-xs font-normal text-slate-500">/5</span>
              </span>
            </div>

            {/* Primary CTA */}
            <button
              onClick={() => router.push('/auth/register')}
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 font-semibold text-white shadow-[0_0_28px_rgba(139,92,246,0.35)] transition hover:shadow-[0_0_45px_rgba(139,92,246,0.55)]"
            >
              Ücretsiz başla
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </button>

            {/* FIRE Calculator */}
            <FIRECalculator />

            {/* Trust badges */}
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-slate-600">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />Anonim kayıt</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />Kredi kartı gerekmez</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-emerald-500/80" />1 Ay ücretsiz Premium</span>
            </div>
          </div>

          {/* Right column — hidden on mobile */}
          <div className="hidden lg:block">
            <DashboardMock />
          </div>
        </div>

        {/* Card footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.05] px-6 py-3">
          <p className="text-[11px] text-slate-700">© {new Date().getFullYear()} GiderSE-Gelir</p>
          <div className="flex flex-wrap items-center gap-4">
            {[
              { href: '/features', label: 'Özellikler' },
              { href: '/pricing',  label: 'Fiyatlar' },
              { href: '/privacy',  label: 'Gizlilik' },
              { href: '/kvkk',     label: 'KVKK' },
              { href: '/terms',    label: 'Kullanım Şartları' },
            ].map(({ href, label }) => (
              <Link key={href} href={href} className="text-[11px] text-slate-700 hover:text-slate-400 transition">
                {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
