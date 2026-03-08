'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { formatCurrency } from '@/lib/validators'
import { useUser } from '@/lib/user-context'
import { getDisplayName } from '@/lib/utils'
import { useToast } from '@/lib/use-toast'
import { cn } from '@/lib/utils'
import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton'
import {
    Button,
    Card,
    CardContent,
    DistributionBar,
    EmptyState,
    ErrorState,
    QuickActionTile,
    StatCard,
    StatsGrid,
} from '@/components/mosaic'
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts'
import {
    ArrowDownRight,
    ArrowUpRight,
    Award,
    BarChart3,
    Brain,
    Calendar,
    ChevronRight,
    Clock,
    CreditCard,
    Crown,
    DollarSign,
    PiggyBank,
    Plus,
    Receipt,
    RefreshCw,
    Shield,
    Sparkles,
    Star,
    TrendingUp,
    Wallet,
    Zap,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SnapshotPoint {
    date: string
    totalAssets: number
    totalLiabilities: number
    netWorth: number
}

interface DashboardData {
    kpi: {
        total_income: string
        total_expense: string
        net_amount: string
        income_count: string
        expense_count: string
    }
    upcomingPayments: Array<{
        id: number
        name: string
        bank_name: string
        limit_amount: string
        available_limit: string
        due_day: number
        next_due_date: string
        current_debt: string
        min_payment: string
    }>
    categoryBreakdown: Array<{
        category_name: string
        tx_type_name: string
        total_amount: string
        transaction_count: string
    }>
    assets: {
        totalAccountBalance: string
        totalGoldValue: string
        totalCardDebt: string
        totalAssets: string
        totalLiabilities: string
        netWorth: string
        breakdown?: {
            assets: { cash: number; eWallets: number; investments: number; gold: number }
            liabilities: { creditCards: number; loans: number }
        }
        snapshots?: SnapshotPoint[]
    }
    budgets?: {
        totalBudgeted: number
        totalSpent: number
        remainingBudget: number
        overBudgetCount: number
        items?: Array<{
            categoryName: string
            budgeted: number
            spent: number
            progress: number
            isOverBudget: boolean
        }>
    }
    notifications?: { unreadCount: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysUntilDate(dateStr: string): number {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(dateStr)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target.getTime() - today.getTime()) / 86400000)
}

function formatShortDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
    return (
        <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            {children}
        </p>
    )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
    const { user, loading, refreshUser } = useUser()
    const { error: toastError } = useToast()
    const [data, setData] = useState<DashboardData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [currentTime, setCurrentTime] = useState(new Date())
    const fetchedRef = useRef(false)

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 60000)
        return () => clearInterval(timer)
    }, [])

    useEffect(() => {
        const handlePlanChange = () => void refreshUser()
        window.addEventListener('plan-changed', handlePlanChange)
        return () => window.removeEventListener('plan-changed', handlePlanChange)
    }, [refreshUser])

    useEffect(() => {
        if (fetchedRef.current || loading) {return}
        fetchedRef.current = true
        void fetchDashboardData()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, loading])

    async function fetchDashboardData() {
        try {
            setError(null)
            const res = await fetch('/api/dashboard', { credentials: 'include' })
            if (!res.ok) {
                if (res.status === 401) { setData(null); return }
                throw new Error('Dashboard verileri alınamadı')
            }
            setData((await res.json()) as DashboardData)
        } catch (err) {
            if (err instanceof Error && !err.message.includes('401')) {
                setError('Dashboard verileri yüklenirken bir hata oluştu')
                toastError('Hata', 'Dashboard verileri yüklenemedi')
            }
        }
    }

    const handleRefresh = () => {
        fetchedRef.current = false
        void fetchDashboardData()
    }

    // ── Greeting ──────────────────────────────────────────────────────────────
    const getGreeting = () => {
        const h = currentTime.getHours()
        if (h < 6) {return 'İyi geceler'}
        if (h < 12) {return 'Günaydın'}
        if (h < 18) {return 'İyi günler'}
        return 'İyi akşamlar'
    }

    // ── Health score ──────────────────────────────────────────────────────────
    const calculateHealth = () => {
        if (!data) {return { score: 0, label: '-', stroke: '#64748b', chip: 'bg-slate-500/10 text-slate-400' }}
        const income = parseFloat(data.kpi.total_income) || 0
        const expense = parseFloat(data.kpi.total_expense) || 0
        const netWorth = parseFloat(data.assets.netWorth) || 0
        const cardDebt = parseFloat(data.assets.totalCardDebt) || 0
        let score = 50
        if (income > expense) {
            const sr = ((income - expense) / income) * 100
            score += sr >= 20 ? 25 : sr >= 10 ? 15 : 5
        } else if (income < expense) {score -= 20}
        if (netWorth > 0) {score += 15}
        else if (netWorth < 0) {score -= 10}
        if (cardDebt === 0) {score += 10}
        else if (cardDebt > income * 0.5) {score -= 15}
        score = Math.min(100, Math.max(0, score))
        if (score >= 80) {return { score, label: 'Mükemmel', stroke: '#22c55e', chip: 'bg-green-500/12 text-green-300' }}
        if (score >= 60) {return { score, label: 'İyi', stroke: '#38bdf8', chip: 'bg-cyan-500/12 text-cyan-300' }}
        if (score >= 40) {return { score, label: 'Orta', stroke: '#f59e0b', chip: 'bg-amber-500/12 text-amber-300' }}
        return { score, label: 'Dikkat', stroke: '#f43f5e', chip: 'bg-rose-500/12 text-rose-300' }
    }

    // ── Plan badge ────────────────────────────────────────────────────────────
    const getPlanBadge = () => {
        if (!user || user.plan === 'free') {return null}
        if (user.plan === 'enterprise_premium') {return { icon: Award, label: 'Kurumsal Premium', cls: 'border-amber-500/25 bg-amber-500/10 text-amber-200' }}
        if (user.plan === 'enterprise') {return { icon: Star, label: 'Kurumsal', cls: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-200' }}
        return { icon: Crown, label: 'Premium', cls: 'border-violet-500/25 bg-violet-500/10 text-violet-200' }
    }

    // ── Early returns ─────────────────────────────────────────────────────────
    if (loading || !user) {return <DashboardSkeleton />}
    if (error) {return (
        <div className="space-y-6">
            <ErrorState title="Dashboard yüklenemedi" description={error} onRetry={handleRefresh} className="min-h-[320px]" />
        </div>
    )}
    if (!data) {return <DashboardSkeleton />}

    // ── Derived values ────────────────────────────────────────────────────────
    const totalIncome = parseFloat(data.kpi.total_income) || 0
    const totalExpense = parseFloat(data.kpi.total_expense) || 0
    const netAmount = parseFloat(data.kpi.net_amount) || 0
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0
    const totalAssets = parseFloat(data.assets.totalAssets) || 0
    const totalCardDebt = parseFloat(data.assets.totalCardDebt) || 0
    const totalAccountBalance = parseFloat(data.assets.totalAccountBalance) || 0
    const totalGoldValue = parseFloat(data.assets.totalGoldValue) || 0
    const netWorth = parseFloat(data.assets.netWorth) || 0
    const totalLiabilities = parseFloat(data.assets.totalLiabilities || '0') || 0
    const eWallets = data.assets.breakdown?.assets.eWallets ?? 0
    const investments = data.assets.breakdown?.assets.investments ?? 0
    const loans = data.assets.breakdown?.liabilities.loans ?? 0
    const assetBase = Math.max(totalAssets + totalLiabilities, 1)

    const health = calculateHealth()
    const planBadge = getPlanBadge()
    const snapshots = data.assets.snapshots ?? []

    // sparkline data
    const sparkData = snapshots.slice(-12).map(s => ({
        date: new Date(s.date).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }),
        value: s.netWorth,
    }))

    // category totals for bar widths
    const expenseCategories = data.categoryBreakdown
        .filter(c => c.tx_type_name === 'Gider')
        .sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount))
        .slice(0, 6)
    const totalExpenseCategories = expenseCategories.reduce((s, c) => s + parseFloat(c.total_amount), 0)

    const incomeCategories = data.categoryBreakdown
        .filter(c => c.tx_type_name === 'Gelir')
        .sort((a, b) => parseFloat(b.total_amount) - parseFloat(a.total_amount))
        .slice(0, 3)

    const barData = [
        { name: 'Gelir', value: totalIncome, fill: '#22c55e' },
        { name: 'Gider', value: totalExpense, fill: '#f43f5e' },
    ]

    const month = currentTime.toLocaleDateString('tr-TR', { month: 'long', year: 'numeric' })

    return (
        <div className="space-y-5 animate-fade-in">

            {/* ─── HERO ─────────────────────────────────────────────────────── */}
            <Card className="relative overflow-hidden border-white/8 bg-[radial-gradient(ellipse_at_top_left,rgba(99,102,241,0.25),transparent_45%),radial-gradient(ellipse_at_bottom_right,rgba(45,212,191,0.18),transparent_40%),linear-gradient(160deg,#0f172a,#0d1526,#0a0f1e)]">
                {/* decorative blobs */}
                <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-indigo-600/10 blur-3xl" />
                <div className="pointer-events-none absolute -bottom-16 right-0 h-64 w-64 rounded-full bg-violet-600/10 blur-3xl" />
                <div className="pointer-events-none absolute right-1/3 top-0 h-40 w-40 rounded-full bg-cyan-500/8 blur-2xl" />

                <CardContent className="relative p-6 sm:p-8">
                    {/* top bar: greeting + actions */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-900/40">
                                <span className="text-base font-bold leading-none">
                                    {getDisplayName(user).charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">{getGreeting()}</p>
                                <p className="text-base font-semibold text-white">{getDisplayName(user)}</p>
                            </div>
                            {planBadge && (
                                <div className={cn('flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold', planBadge.cls)}>
                                    <planBadge.icon className="h-3 w-3" />
                                    {planBadge.label}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center gap-2">
                            <p className="hidden text-xs text-slate-500 sm:block">
                                {currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
                                {' · '}{month}
                            </p>
                            <Button variant="ghost" size="icon" onClick={handleRefresh} className="h-8 w-8 text-slate-400 hover:text-white">
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button asChild variant="glow" size="sm">
                                <Link href="/analysis">
                                    <Brain className="mr-1.5 h-3.5 w-3.5" /> Analiz
                                </Link>
                            </Button>
                        </div>
                    </div>

                    {/* main hero content */}
                    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
                        {/* left: net worth + chips */}
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Net Varlık</p>
                            <h1 className={cn(
                                'mt-2 text-5xl font-black tracking-tight sm:text-6xl',
                                netWorth >= 0 ? 'text-white' : 'text-rose-300'
                            )}>
                                {formatCurrency(netWorth, 'TRY')}
                            </h1>

                            <div className="mt-3 flex items-center gap-2">
                                <div className={cn(
                                    'flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold',
                                    netAmount >= 0 ? 'bg-emerald-500/12 text-emerald-300' : 'bg-rose-500/12 text-rose-300'
                                )}>
                                    {netAmount >= 0
                                        ? <ArrowUpRight className="h-4 w-4" />
                                        : <ArrowDownRight className="h-4 w-4" />
                                    }
                                    {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount, 'TRY')} bu ay
                                </div>
                                <div className={cn('rounded-full px-3 py-1 text-xs font-semibold', health.chip)}>
                                    <Shield className="mr-1 inline h-3 w-3" />
                                    {health.score} puan · {health.label}
                                </div>
                            </div>

                            {/* sparkline */}
                            {sparkData.length >= 2 && (
                                <div className="mt-6 h-20 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={sparkData} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                                            <defs>
                                                <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <Tooltip
                                                cursor={false}
                                                contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px', fontSize: '11px', color: '#e2e8f0' }}
                                                formatter={(v: number) => [formatCurrency(v, 'TRY'), 'Net Varlık']}
                                            />
                                            <Area type="monotone" dataKey="value" stroke="#818cf8" strokeWidth={2} fill="url(#sparkGrad)" dot={false} />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                </div>
                            )}

                            {/* income / expense / savings row */}
                            <div className="mt-5 grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Gelir', value: totalIncome, color: 'border-emerald-500/20 bg-emerald-500/8', text: 'text-emerald-300', count: data.kpi.income_count },
                                    { label: 'Gider', value: totalExpense, color: 'border-rose-500/20 bg-rose-500/8', text: 'text-rose-300', count: data.kpi.expense_count },
                                    { label: 'Tasarruf', value: null, suffix: `%${savingsRate.toFixed(1)}`, color: 'border-cyan-500/20 bg-cyan-500/8', text: 'text-cyan-300', count: null },
                                ].map(item => (
                                    <div key={item.label} className={cn('rounded-2xl border p-4', item.color)}>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                                        <p className={cn('mt-1.5 text-lg font-bold', item.text)}>
                                            {item.value !== null ? formatCurrency(item.value, 'TRY') : item.suffix}
                                        </p>
                                        {item.count !== null && (
                                            <p className="mt-0.5 text-[10px] text-slate-600">{item.count} işlem</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* right: health score + asset breakdown */}
                        <div className="flex flex-col gap-4">
                            {/* health score radial */}
                            <div className="rounded-3xl border border-white/8 bg-black/25 p-5 backdrop-blur-sm">
                                <div className="flex items-center justify-between">
                                    <p className="flex items-center gap-2 text-xs text-slate-400">
                                        <Shield className="h-3.5 w-3.5" /> Finansal Sağlık
                                    </p>
                                    <span className={cn('rounded-full px-2.5 py-0.5 text-xs font-semibold', health.chip)}>
                                        {health.label}
                                    </span>
                                </div>
                                <div className="mt-4 flex items-center gap-6">
                                    <div className="relative h-24 w-24 shrink-0">
                                        <svg className="h-24 w-24 -rotate-90">
                                            <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-white/6" />
                                            <circle cx="48" cy="48" r="40" stroke={health.stroke} strokeWidth="8" fill="none"
                                                strokeLinecap="round"
                                                strokeDasharray={`${health.score * 2.51} 251`}
                                                className="transition-all duration-1000"
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-2xl font-black text-white">{health.score}</span>
                                            <span className="text-[9px] uppercase tracking-widest text-slate-500">/ 100</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 text-xs text-slate-400">
                                        <p className="flex items-center gap-2">
                                            <span className={cn('h-1.5 w-1.5 rounded-full', savingsRate >= 20 ? 'bg-emerald-400' : savingsRate >= 10 ? 'bg-amber-400' : 'bg-rose-400')} />
                                            Tasarruf %{savingsRate.toFixed(1)}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className={cn('h-1.5 w-1.5 rounded-full', netWorth >= 0 ? 'bg-emerald-400' : 'bg-rose-400')} />
                                            Net varlık {netWorth >= 0 ? 'pozitif' : 'negatif'}
                                        </p>
                                        <p className="flex items-center gap-2">
                                            <span className={cn('h-1.5 w-1.5 rounded-full', totalCardDebt === 0 ? 'bg-emerald-400' : totalCardDebt > totalIncome * 0.5 ? 'bg-rose-400' : 'bg-amber-400')} />
                                            Kart borcu {totalCardDebt === 0 ? 'yok' : formatCurrency(totalCardDebt, 'TRY')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* quick actions */}
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { href: '/transactions/new-income', label: 'Gelir Ekle', icon: ArrowUpRight, color: 'bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25' },
                                    { href: '/transactions/new-expense', label: 'Gider Ekle', icon: ArrowDownRight, color: 'bg-rose-500/15 text-rose-300 hover:bg-rose-500/25' },
                                    { href: '/accounts', label: 'Hesaplar', icon: Wallet, color: 'bg-blue-500/15 text-blue-300 hover:bg-blue-500/25' },
                                    { href: '/cards', label: 'Kartlar', icon: CreditCard, color: 'bg-purple-500/15 text-purple-300 hover:bg-purple-500/25' },
                                ].map(a => (
                                    <Link
                                        key={a.href}
                                        href={a.href}
                                        className={cn(
                                            'flex items-center gap-2.5 rounded-2xl border border-white/8 px-3.5 py-3 text-sm font-medium transition-all duration-200 hover:-translate-y-0.5',
                                            a.color
                                        )}
                                    >
                                        <a.icon className="h-4 w-4 shrink-0" />
                                        {a.label}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ─── KPI STRIP ────────────────────────────────────────────────── */}
            <StatsGrid>
                <StatCard
                    title="Toplam Gelir"
                    value={formatCurrency(totalIncome, 'TRY')}
                    icon={ArrowUpRight}
                    color="green"
                    subtitle={`${data.kpi.income_count} işlem · Son 30 gün`}
                    variant="premium"
                />
                <StatCard
                    title="Toplam Gider"
                    value={formatCurrency(totalExpense, 'TRY')}
                    icon={ArrowDownRight}
                    color="red"
                    subtitle={`${data.kpi.expense_count} işlem · Son 30 gün`}
                    variant="premium"
                />
                <StatCard
                    title="Net Durum"
                    value={`${netAmount >= 0 ? '+' : ''}${formatCurrency(netAmount, 'TRY')}`}
                    icon={DollarSign}
                    color={netAmount >= 0 ? 'blue' : 'red'}
                    subtitle={netAmount >= 0 ? 'Pozitif nakit dengesi' : 'Negatif nakit dengesi'}
                    variant="premium"
                />
                <StatCard
                    title="Tasarruf Oranı"
                    value={`%${savingsRate.toFixed(1)}`}
                    icon={PiggyBank}
                    color="purple"
                    subtitle={savingsRate >= 20 ? 'Hedef aşıldı 🎯' : savingsRate >= 10 ? 'İyi gidiyorsunuz' : 'Tasarrufu artırın'}
                    variant="premium"
                />
            </StatsGrid>

            {/* ─── CHART ROW ────────────────────────────────────────────────── */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">

                {/* Income vs Expense bar chart */}
                <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-5 py-4">
                        <div>
                            <p className="text-sm font-semibold text-foreground">Gelir & Gider Karşılaştırması</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Son 30 günün nakit akışı</p>
                        </div>
                        <div className="rounded-full border border-white/10 bg-muted/40 px-3 py-1 text-[11px] text-muted-foreground">Son 30 gün</div>
                    </div>
                    <CardContent className="p-5">
                        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_180px]">
                            <div className="h-64">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} barCategoryGap="35%">
                                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                                        <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                                        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                                            tickFormatter={(v: number) => `₺${(v / 1000).toFixed(0)}k`}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'rgba(148,163,184,0.06)' }}
                                            contentStyle={{ backgroundColor: '#020617', border: '1px solid rgba(148,163,184,0.15)', borderRadius: '12px', color: '#e2e8f0', fontSize: '12px' }}
                                            formatter={(v: number) => [formatCurrency(v, 'TRY'), '']}
                                        />
                                        <Bar dataKey="value" radius={[8, 8, 0, 0]} maxBarSize={80}>
                                            {barData.map(entry => <Cell key={entry.name} fill={entry.fill} />)}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="flex flex-col gap-3">
                                {[
                                    { label: 'Gelir ritmi', value: totalIncome, count: data.kpi.income_count, border: 'border-emerald-500/15 bg-emerald-500/8', text: 'text-emerald-300' },
                                    { label: 'Gider baskısı', value: totalExpense, count: data.kpi.expense_count, border: 'border-rose-500/15 bg-rose-500/8', text: 'text-rose-300' },
                                    { label: 'Net fark', value: netAmount, count: null, border: netAmount >= 0 ? 'border-blue-500/15 bg-blue-500/8' : 'border-rose-500/15 bg-rose-500/8', text: netAmount >= 0 ? 'text-blue-300' : 'text-rose-300' },
                                ].map(item => (
                                    <div key={item.label} className={cn('rounded-xl border p-3.5', item.border)}>
                                        <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
                                        <p className={cn('mt-1.5 text-lg font-bold leading-none', item.text)}>
                                            {item.value !== null ? `${item.value >= 0 ? '' : ''}${formatCurrency(item.value, 'TRY')}` : '-'}
                                        </p>
                                        {item.count && <p className="mt-1 text-[10px] text-slate-600">{item.count} hareket</p>}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Upcoming payments */}
                <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg bg-amber-500/15 p-1.5 text-amber-400">
                                <Calendar className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Yaklaşan Ödemeler</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">Kart ödeme takvimi</p>
                            </div>
                        </div>
                        <Link href="/cards" className="flex items-center gap-1 text-xs text-cyan-400 transition-colors hover:text-cyan-300">
                            Kartlar <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <CardContent className="p-4">
                        {data.upcomingPayments.length === 0 ? (
                            <EmptyState
                                title="Yaklaşan ödeme yok"
                                description="Bu dönem için kart ödemesi bulunmuyor."
                                icon={<Sparkles className="h-8 w-8 text-emerald-300" />}
                                className="border-white/8 bg-white/4 py-10"
                            />
                        ) : (
                            <div className="space-y-2.5">
                                {data.upcomingPayments.slice(0, 5).map(p => {
                                    const days = getDaysUntilDate(p.next_due_date)
                                    const debt = parseFloat(p.current_debt)
                                    const urgency = days <= 3 ? { bg: 'bg-red-500/10 border-red-500/25', badge: 'bg-red-500 text-white', text: 'text-red-400' }
                                        : days <= 7 ? { bg: 'bg-amber-500/10 border-amber-500/25', badge: 'bg-amber-500 text-white', text: 'text-amber-400' }
                                            : { bg: 'bg-white/4 border-white/8', badge: 'bg-slate-600 text-slate-200', text: 'text-slate-400' }

                                    return (
                                        <div key={p.id} className={cn('flex items-center justify-between gap-3 rounded-xl border p-3.5 transition-colors hover:bg-white/6', urgency.bg)}>
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-2">
                                                    <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                                                    <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold', urgency.badge)}>
                                                        {days <= 0 ? 'Bugün!' : `${days}g`}
                                                    </span>
                                                </div>
                                                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                                                    <Clock className="h-3 w-3" />
                                                    {formatShortDate(p.next_due_date)} · {p.bank_name}
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={cn('text-sm font-bold', urgency.text)}>
                                                    {formatCurrency(debt, 'TRY')}
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    min. {formatCurrency(parseFloat(p.min_payment), 'TRY')}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* ─── CATEGORY + ASSETS ROW ───────────────────────────────────── */}
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">

                {/* Category breakdown */}
                <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
                    <div className="flex items-center justify-between border-b border-border/50 bg-muted/20 px-5 py-4">
                        <div className="flex items-center gap-2.5">
                            <div className="rounded-lg bg-violet-500/15 p-1.5 text-violet-400">
                                <BarChart3 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Kategori Analizi</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">Son 30 günün harcama dağılımı</p>
                            </div>
                        </div>
                        <Link href="/analysis" className="flex items-center gap-1 text-xs text-cyan-400 transition-colors hover:text-cyan-300">
                            Detaylı analiz <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                    <CardContent className="p-5">
                        {data.categoryBreakdown.length === 0 ? (
                            <EmptyState
                                title="Kategori verisi yok"
                                description="İşlem kaydı oluşturduktan sonra analiz burada görünecek."
                                icon={<Receipt className="h-8 w-8 text-slate-400" />}
                                action={
                                    <Button asChild variant="glow" size="sm">
                                        <Link href="/transactions/new-expense">
                                            <Plus className="mr-1.5 h-3.5 w-3.5" /> İşlem Ekle
                                        </Link>
                                    </Button>
                                }
                                className="border-white/8 bg-white/4 py-10"
                            />
                        ) : (
                            <div className="grid gap-5 sm:grid-cols-2">
                                {/* Expense categories */}
                                <div>
                                    <SectionLabel>Gider kalemleri</SectionLabel>
                                    <div className="space-y-3">
                                        {expenseCategories.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">Bu dönem gider kaydı yok.</p>
                                        ) : expenseCategories.map(cat => {
                                            const amount = parseFloat(cat.total_amount)
                                            const pct = totalExpenseCategories > 0 ? (amount / totalExpenseCategories) * 100 : 0
                                            return (
                                                <div key={cat.category_name}>
                                                    <div className="mb-1 flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-rose-400" />
                                                            <span className="font-medium text-foreground">{cat.category_name}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 text-muted-foreground">
                                                            <span>{cat.transaction_count} işlem</span>
                                                            <span className="font-semibold text-rose-400">{formatCurrency(amount, 'TRY')}</span>
                                                        </div>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-pink-500 transition-all duration-700"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <p className="mt-0.5 text-right text-[10px] text-slate-600">%{pct.toFixed(0)}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Income categories */}
                                <div>
                                    <SectionLabel>Gelir kalemleri</SectionLabel>
                                    <div className="space-y-3">
                                        {incomeCategories.length === 0 ? (
                                            <p className="text-xs text-muted-foreground">Bu dönem gelir kaydı yok.</p>
                                        ) : incomeCategories.map(cat => {
                                            const amount = parseFloat(cat.total_amount)
                                            const pct = totalIncome > 0 ? (amount / totalIncome) * 100 : 0
                                            return (
                                                <div key={cat.category_name}>
                                                    <div className="mb-1 flex items-center justify-between text-xs">
                                                        <div className="flex items-center gap-1.5">
                                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                                            <span className="font-medium text-foreground">{cat.category_name}</span>
                                                        </div>
                                                        <span className="font-semibold text-emerald-400">{formatCurrency(amount, 'TRY')}</span>
                                                    </div>
                                                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                                                        <div
                                                            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700"
                                                            style={{ width: `${pct}%` }}
                                                        />
                                                    </div>
                                                    <p className="mt-0.5 text-right text-[10px] text-slate-600">%{pct.toFixed(0)}</p>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Asset allocation */}
                <div className="space-y-5">
                    <Card className="overflow-hidden border-border/70 bg-card/95 shadow-sm">
                        <div className="flex items-center gap-2.5 border-b border-border/50 bg-muted/20 px-5 py-4">
                            <div className="rounded-lg bg-cyan-500/15 p-1.5 text-cyan-400">
                                <TrendingUp className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">Varlık Dağılımı</p>
                                <p className="mt-0.5 text-xs text-muted-foreground">Portföy bileşimi</p>
                            </div>
                        </div>
                        <CardContent className="space-y-4 p-5">
                            {totalAssets > 0 || totalLiabilities > 0 ? (<>
                                <DistributionBar
                                    label="Hesap Bakiyeleri"
                                    value={formatCurrency(totalAccountBalance, 'TRY')}
                                    percentage={(totalAccountBalance / assetBase) * 100}
                                    tone="blue"
                                />
                                {eWallets > 0 && (
                                    <DistributionBar
                                        label="E-Cüzdanlar"
                                        value={formatCurrency(eWallets, 'TRY')}
                                        percentage={(eWallets / assetBase) * 100}
                                        tone="cyan"
                                    />
                                )}
                                {investments > 0 && (
                                    <DistributionBar
                                        label="Yatırımlar"
                                        value={formatCurrency(investments, 'TRY')}
                                        percentage={(investments / assetBase) * 100}
                                        tone="emerald"
                                    />
                                )}
                                {totalGoldValue > 0 && (
                                    <DistributionBar
                                        label="Altın & Ziynet"
                                        value={formatCurrency(totalGoldValue, 'TRY')}
                                        percentage={(totalGoldValue / assetBase) * 100}
                                        tone="amber"
                                    />
                                )}
                                {totalCardDebt > 0 && (
                                    <DistributionBar
                                        label="Kart Borcu"
                                        value={`-${formatCurrency(totalCardDebt, 'TRY')}`}
                                        percentage={(totalCardDebt / assetBase) * 100}
                                        tone="rose"
                                    />
                                )}
                                {loans > 0 && (
                                    <DistributionBar
                                        label="Krediler"
                                        value={`-${formatCurrency(loans, 'TRY')}`}
                                        percentage={(loans / assetBase) * 100}
                                        tone="purple"
                                    />
                                )}
                            </>) : (
                                <p className="py-4 text-center text-sm text-muted-foreground">Varlık verisi henüz yok.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Navigation tiles */}
                    <div className="grid grid-cols-2 gap-3">
                        {[
                            { href: '/transactions', title: 'İşlemler', desc: 'Tüm hareketler', icon: Receipt, tone: 'indigo' as const },
                            { href: '/investments', title: 'Yatırımlar', desc: 'Portföy takibi', icon: TrendingUp, tone: 'emerald' as const },
                            { href: '/budgets', title: 'Bütçeler', desc: 'Limit yönetimi', icon: Zap, tone: 'amber' as const },
                            { href: '/analysis', title: 'Analiz', desc: 'AI içgörüler', icon: Brain, tone: 'purple' as const },
                        ].map(a => (
                            <QuickActionTile
                                key={a.href}
                                href={a.href}
                                title={a.title}
                                description={a.desc}
                                icon={a.icon}
                                tone={a.tone}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
