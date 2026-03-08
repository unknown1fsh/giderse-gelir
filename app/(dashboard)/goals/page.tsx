'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    AppPageShell,
    Badge,
    Button,
    Card,
    CardContent,
    ConfirmDialog,
    DashboardCard,
    DistributionBar,
    Drawer,
    DrawerBody,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    EmptyState,
    ErrorState,
    FilterBar,
    FormField,
    Input,
    SearchBox,
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
    StatCard,
    StatsGrid,
    Textarea,
} from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import {
    Calendar,
    CheckCircle2,
    CircleDollarSign,
    Edit3,
    Flag,
    Home,
    Plus,
    RefreshCw,
    Target,
    Trash2,
    Trophy,
    TrendingUp,
} from 'lucide-react'

type GoalStatus = 'active' | 'completed' | 'cancelled'
type SortOption = 'closest' | 'furthest' | 'progress-high' | 'progress-low' | 'amount-high' | 'recent'
type DrawerMode = 'create' | 'edit'

interface GoalApi {
    id: number
    name: string
    targetAmount: number | string | null
    currentAmount: number | string | null
    currencyId: number
    targetDate: string | null
    category: string | null
    status: GoalStatus
    icon: string | null
    color: string | null
    notes: string | null
    createdAt?: string
    currency?: {
        code?: string | null
        symbol?: string | null
    } | null
}

interface Goal {
    id: number
    name: string
    targetAmount: number
    currentAmount: number
    currencyId: number
    targetDate: string | null
    category: string | null
    status: GoalStatus
    icon: string | null
    color: string | null
    notes: string | null
    createdAt: string | null
    currency: {
        code: string
        symbol: string
    }
}

interface CurrencyOption {
    id: number
    code: string
    symbol: string
    name?: string
}

interface GoalFormState {
    name: string
    targetAmount: string
    currentAmount: string
    currencyId: string
    targetDate: string
    category: string
    notes: string
    status: GoalStatus
}

const STATUS_LABELS: Record<GoalStatus, string> = {
    active: 'Aktif',
    completed: 'Tamamlandı',
    cancelled: 'İptal',
}

const EMPTY_FORM: GoalFormState = {
    name: '',
    targetAmount: '',
    currentAmount: '0',
    currencyId: '',
    targetDate: '',
    category: 'Genel',
    notes: '',
    status: 'active',
}

function parseAmount(value: unknown) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : 0
}

function normalizeGoal(goal: GoalApi): Goal {
    return {
        id: goal.id,
        name: goal.name,
        targetAmount: parseAmount(goal.targetAmount),
        currentAmount: parseAmount(goal.currentAmount),
        currencyId: goal.currencyId,
        targetDate: goal.targetDate,
        category: goal.category,
        status: goal.status ?? 'active',
        icon: goal.icon,
        color: goal.color,
        notes: goal.notes,
        createdAt: goal.createdAt ?? null,
        currency: {
            code: goal.currency?.code || 'TRY',
            symbol: goal.currency?.symbol || '₺',
        },
    }
}

function calculateProgress(current: number, target: number) {
    if (target <= 0) {
        return 0
    }

    return Math.min(100, Math.max(0, (current / target) * 100))
}

function getDaysRemaining(date: string | null) {
    if (!date) {
        return null
    }

    const target = new Date(date)
    const now = new Date()
    const diff = target.getTime() - now.getTime()

    return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatInputAmount(value: number) {
    return Number.isInteger(value) ? String(value) : value.toFixed(2)
}

function getStatusBadgeVariant(status: GoalStatus) {
    if (status === 'completed') {
        return 'success' as const
    }
    if (status === 'cancelled') {
        return 'destructive' as const
    }

    return 'info' as const
}

function getProgressTone(progress: number, daysRemaining: number | null, status: GoalStatus) {
    if (status === 'completed' || progress >= 100) {
        return 'emerald' as const
    }
    if (status === 'cancelled') {
        return 'slate' as const
    }
    if (daysRemaining !== null && daysRemaining <= 14) {
        return 'rose' as const
    }
    if (progress >= 70) {
        return 'cyan' as const
    }
    if (progress >= 40) {
        return 'amber' as const
    }

    return 'blue' as const
}

export default function GoalsPage() {
    const router = useRouter()
    const { success: toastSuccess, error: toastError } = useToast()

    const [goals, setGoals] = useState<Goal[]>([])
    const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
    const [loading, setLoading] = useState(true)
    const [refreshing, setRefreshing] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [drawerOpen, setDrawerOpen] = useState(false)
    const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
    const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const [deleteCandidate, setDeleteCandidate] = useState<Goal | null>(null)
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [formData, setFormData] = useState<GoalFormState>(EMPTY_FORM)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState<'all' | GoalStatus>('all')
    const [categoryFilter, setCategoryFilter] = useState('all')
    const [sortBy, setSortBy] = useState<SortOption>('closest')
    const fetchedRef = useRef(false)

    useEffect(() => {
        if (fetchedRef.current) {
            return
        }

        fetchedRef.current = true
        void fetchData()
    }, [])

    const fetchData = async ({ silent = false }: { silent?: boolean } = {}) => {
        try {
            setError(null)

            if (silent) {
                setRefreshing(true)
            } else {
                setLoading(true)
            }

            const [goalsRes, referenceRes] = await Promise.all([
                fetch('/api/goals', { credentials: 'include' }),
                fetch('/api/reference-data?type=currency', { credentials: 'include' }),
            ])

            if (!goalsRes.ok) {
                throw new Error('Hedef verileri alınamadı')
            }

            if (!referenceRes.ok) {
                throw new Error('Para birimleri alınamadı')
            }

            const goalsData = (await goalsRes.json()) as GoalApi[]
            const referenceData = (await referenceRes.json()) as { currencies?: CurrencyOption[] }
            const nextCurrencies = Array.isArray(referenceData.currencies) ? referenceData.currencies : []

            setGoals(goalsData.map(normalizeGoal))
            setCurrencies(nextCurrencies)
            setFormData(current => {
                if (current.currencyId || nextCurrencies.length === 0) {
                    return current
                }

                return {
                    ...current,
                    currencyId: String(nextCurrencies[0].id),
                }
            })
        } catch (fetchError) {
            console.error('Goals fetch error:', fetchError)
            setError('Hedef verileri yüklenirken bir hata oluştu.')
            toastError('Hata', 'Hedef sayfası yüklenemedi')
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    const categoryOptions = useMemo(() => {
        return Array.from(
            new Set(
                goals
                    .map(goal => goal.category?.trim())
                    .filter((category): category is string => Boolean(category))
            )
        ).sort((left, right) => left.localeCompare(right, 'tr'))
    }, [goals])

    const summary = useMemo(() => {
        const completedGoals = goals.filter(goal => goal.status === 'completed' || calculateProgress(goal.currentAmount, goal.targetAmount) >= 100)
        const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0)
        const currenciesInUse = Array.from(new Set(goals.map(goal => goal.currency.code)))
        const closestGoal = [...goals]
            .filter(goal => goal.status !== 'cancelled' && goal.targetDate)
            .sort((left, right) => new Date(left.targetDate || '').getTime() - new Date(right.targetDate || '').getTime())[0] ?? null
        const averageProgress = goals.length
            ? goals.reduce((sum, goal) => sum + calculateProgress(goal.currentAmount, goal.targetAmount), 0) / goals.length
            : 0

        return {
            totalGoals: goals.length,
            completedGoals: completedGoals.length,
            totalTarget,
            currenciesInUse,
            closestGoal,
            averageProgress,
        }
    }, [goals])

    const filteredGoals = useMemo(() => {
        const query = searchTerm.trim().toLocaleLowerCase('tr')

        const filtered = goals.filter(goal => {
            const searchableText = [goal.name, goal.category, goal.notes]
                .filter(Boolean)
                .join(' ')
                .toLocaleLowerCase('tr')

            const matchesSearch = !query || searchableText.includes(query)
            const matchesStatus = statusFilter === 'all' || goal.status === statusFilter
            const matchesCategory = categoryFilter === 'all' || (goal.category || 'Genel') === categoryFilter

            return matchesSearch && matchesStatus && matchesCategory
        })

        const dateRank = (goal: Goal) => {
            if (!goal.targetDate) {
                return Number.MAX_SAFE_INTEGER
            }

            return new Date(goal.targetDate).getTime()
        }

        return filtered.sort((left, right) => {
            const leftProgress = calculateProgress(left.currentAmount, left.targetAmount)
            const rightProgress = calculateProgress(right.currentAmount, right.targetAmount)

            switch (sortBy) {
                case 'furthest':
                    return dateRank(right) - dateRank(left)
                case 'progress-high':
                    return rightProgress - leftProgress
                case 'progress-low':
                    return leftProgress - rightProgress
                case 'amount-high':
                    return right.targetAmount - left.targetAmount
                case 'recent':
                    return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
                case 'closest':
                default:
                    return dateRank(left) - dateRank(right)
            }
        })
    }, [categoryFilter, goals, searchTerm, sortBy, statusFilter])

    const highlightedGoals = useMemo(() => {
        const closest = summary.closestGoal
        const topPerformer = [...goals]
            .filter(goal => goal.status !== 'cancelled')
            .sort(
                (left, right) =>
                    calculateProgress(right.currentAmount, right.targetAmount) -
                    calculateProgress(left.currentAmount, left.targetAmount)
            )[0] ?? null
        const atRisk = [...goals]
            .filter(goal => {
                const daysRemaining = getDaysRemaining(goal.targetDate)
                const progress = calculateProgress(goal.currentAmount, goal.targetAmount)

                return goal.status === 'active' && daysRemaining !== null && daysRemaining <= 30 && progress < 100
            })
            .sort((left, right) => (getDaysRemaining(left.targetDate) || 0) - (getDaysRemaining(right.targetDate) || 0))[0] ?? null

        return { closest, topPerformer, atRisk }
    }, [goals, summary.closestGoal])

    const totalTargetLabel = useMemo(() => {
        if (!summary.totalGoals) {
            return 'Hedef yok'
        }

        if (summary.currenciesInUse.length === 1) {
            return formatCurrency(summary.totalTarget, summary.currenciesInUse[0])
        }

        return `${summary.totalTarget.toLocaleString('tr-TR', {
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        })}+`
    }, [summary])

    const totalTargetSubtitle = summary.currenciesInUse.length <= 1
        ? 'Hedeflenen toplam birikim'
        : `${summary.currenciesInUse.length} farklı para biriminde portföy`

    const resetForm = (nextCurrencyId?: string) => {
        setFormData({
            ...EMPTY_FORM,
            currencyId: nextCurrencyId ?? String(currencies[0]?.id ?? 1),
        })
    }

    const openCreateDrawer = () => {
        setDrawerMode('create')
        setEditingGoal(null)
        resetForm(String(currencies[0]?.id ?? 1))
        setDrawerOpen(true)
    }

    const openEditDrawer = (goal: Goal) => {
        setDrawerMode('edit')
        setEditingGoal(goal)
        setFormData({
            name: goal.name,
            targetAmount: formatInputAmount(goal.targetAmount),
            currentAmount: formatInputAmount(goal.currentAmount),
            currencyId: String(goal.currencyId),
            targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
            category: goal.category || 'Genel',
            notes: goal.notes || '',
            status: goal.status,
        })
        setDrawerOpen(true)
    }

    const closeDrawer = () => {
        setDrawerOpen(false)
        setEditingGoal(null)
        resetForm()
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()

        const payload =
            drawerMode === 'create'
                ? {
                    name: formData.name.trim(),
                    targetAmount: formData.targetAmount,
                    currencyId: formData.currencyId,
                    targetDate: formData.targetDate || null,
                    category: formData.category.trim() || null,
                    notes: formData.notes.trim() || null,
                }
                : {
                    name: formData.name.trim(),
                    targetAmount: formData.targetAmount,
                    currentAmount: formData.currentAmount,
                    currencyId: formData.currencyId,
                    targetDate: formData.targetDate || null,
                    category: formData.category.trim() || null,
                    notes: formData.notes.trim() || null,
                    status: formData.status,
                }

        try {
            setSubmitting(true)

            const response = await fetch(
                drawerMode === 'create' ? '/api/goals' : `/api/goals/${editingGoal?.id}`,
                {
                    method: drawerMode === 'create' ? 'POST' : 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                }
            )

            if (!response.ok) {
                throw new Error(drawerMode === 'create' ? 'Hedef oluşturulamadı' : 'Hedef güncellenemedi')
            }

            toastSuccess(
                'Başarılı',
                drawerMode === 'create' ? 'Yeni hedef oluşturuldu' : 'Hedef bilgileri güncellendi'
            )

            closeDrawer()
            await fetchData({ silent: true })
        } catch (submitError) {
            console.error('Goal submit error:', submitError)
            toastError('Hata', drawerMode === 'create' ? 'Hedef oluşturulamadı' : 'Hedef güncellenemedi')
        } finally {
            setSubmitting(false)
        }
    }

    const handleDeleteGoal = async () => {
        if (!deleteCandidate) {
            return
        }

        try {
            setDeletingId(deleteCandidate.id)

            const response = await fetch(`/api/goals/${deleteCandidate.id}`, {
                method: 'DELETE',
                credentials: 'include',
            })

            if (!response.ok) {
                throw new Error('Hedef silinemedi')
            }

            setGoals(current => current.filter(goal => goal.id !== deleteCandidate.id))
            toastSuccess('Başarılı', 'Hedef silindi')
        } catch (deleteError) {
            console.error('Goal delete error:', deleteError)
            toastError('Hata', 'Hedef silinemedi')
            throw deleteError
        } finally {
            setDeletingId(null)
        }
    }

    if (loading) {
        return (
            <AppPageShell
                header={{
                    title: 'Finansal Hedefler',
                    description: 'Hedef portföyünüz hazırlanıyor.',
                    breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Hedefler' }],
                    onBack: () => router.back(),
                    leadingActions: [
                        {
                            href: '/dashboard',
                            ariaLabel: 'Dashboard',
                            icon: <Home className="h-4 w-4" />,
                        },
                    ],
                }}
            >
                <Card variant="premium" className="border-white/10 bg-white/5">
                    <CardContent className="p-8">
                        <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
                            <div className="h-10 w-10 animate-spin rounded-full border-2 border-indigo-400/20 border-t-indigo-400" />
                            <div>
                                <p className="text-lg font-semibold text-white">Hedef paneli yükleniyor</p>
                                <p className="mt-1 text-sm text-slate-400">Kartlar, filtreler ve ilerleme özetleri hazırlanıyor.</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </AppPageShell>
        )
    }

    if (error) {
        return (
            <AppPageShell
                header={{
                    title: 'Finansal Hedefler',
                    description: 'Tasarruf yol haritanızı tek merkezde yönetin.',
                    breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Hedefler' }],
                    onBack: () => router.back(),
                    leadingActions: [
                        {
                            href: '/dashboard',
                            ariaLabel: 'Dashboard',
                            icon: <Home className="h-4 w-4" />,
                        },
                    ],
                }}
            >
                <ErrorState
                    title="Hedefler yüklenemedi"
                    description={error}
                    onRetry={() => void fetchData()}
                    className="min-h-[320px]"
                />
            </AppPageShell>
        )
    }

    return (
        <>
            <AppPageShell
                header={{
                    title: 'Finansal Hedefler',
                    description: 'Hedeflerinizi ekleyin, ilerlemeyi izleyin ve kritik vadeleri kaçırmadan yönetin.',
                    breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Hedefler' }],
                    onBack: () => router.back(),
                    leadingActions: [
                        {
                            href: '/dashboard',
                            ariaLabel: 'Dashboard',
                            icon: <Home className="h-4 w-4" />,
                        },
                    ],
                    actions: (
                        <>
                            <Button variant="outline" onClick={() => void fetchData({ silent: true })} loading={refreshing}>
                                <RefreshCw className="mr-2 h-4 w-4" />
                                Yenile
                            </Button>
                            <Button variant="glow" onClick={openCreateDrawer}>
                                <Plus className="mr-2 h-4 w-4" />
                                Yeni Hedef
                            </Button>
                        </>
                    ),
                }}
                className="animate-fade-in"
            >
                <Card
                    variant="premium"
                    className="border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.16),_transparent_25%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.96))]"
                >
                    <CardContent className="p-6 sm:p-8">
                        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_300px]">
                            <div className="space-y-5">
                                <div className="inline-flex items-center gap-2 rounded-full border border-indigo-400/20 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-indigo-200">
                                    <Target className="h-3.5 w-3.5" />
                                    Mosaic hedef merkezi
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                                        Birikim yol haritanızı görünür kılın
                                    </h2>
                                    <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                                        Hedeflerinizi tek ekranda sıralayın, vadesi yaklaşan planları öne çıkarın ve
                                        ilerleme oranlarını aksiyona dönüştürün.
                                    </p>
                                </div>
                                <div className="grid gap-3 sm:grid-cols-3">
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Odak hedef</p>
                                        <p className="mt-2 text-lg font-semibold text-white">
                                            {highlightedGoals.closest?.name || 'Henüz vade planı yok'}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Ortalama ilerleme</p>
                                        <p className="mt-2 text-lg font-semibold text-cyan-300">
                                            %{summary.averageProgress.toFixed(1)}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Filtre sonucu</p>
                                        <p className="mt-2 text-lg font-semibold text-violet-300">
                                            {filteredGoals.length} hedef
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
                                <p className="text-sm font-semibold text-white">Bugünün görünümü</p>
                                <div className="mt-4 space-y-4">
                                    <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Tamamlanan</p>
                                        <p className="mt-2 text-2xl font-black text-emerald-300">{summary.completedGoals}</p>
                                        <p className="mt-1 text-xs text-slate-400">Başarıyla kapanan hedefler.</p>
                                    </div>
                                    <div className="rounded-2xl border border-amber-500/15 bg-amber-500/8 p-4">
                                        <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Yaklaşan vade</p>
                                        <p className="mt-2 text-2xl font-black text-amber-300">
                                            {highlightedGoals.closest
                                                ? `${Math.max(getDaysRemaining(highlightedGoals.closest.targetDate) || 0, 0)} gün`
                                                : 'Plan yok'}
                                        </p>
                                        <p className="mt-1 text-xs text-slate-400">
                                            {highlightedGoals.closest?.name || 'Tarih atanan bir hedef bulunmuyor.'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <StatsGrid>
                    <StatCard
                        title="Toplam hedef"
                        value={summary.totalGoals}
                        icon={Trophy}
                        color="blue"
                        subtitle="Portföyünüzdeki tüm planlar"
                        variant="premium"
                    />
                    <StatCard
                        title="Tamamlanan"
                        value={summary.completedGoals}
                        icon={CheckCircle2}
                        color="green"
                        subtitle="Başarıyla biten hedefler"
                        variant="premium"
                    />
                    <StatCard
                        title="Toplam hedef tutarı"
                        value={totalTargetLabel}
                        icon={CircleDollarSign}
                        color="purple"
                        subtitle={totalTargetSubtitle}
                        variant="premium"
                    />
                    <StatCard
                        title="En yakın vade"
                        value={
                            summary.closestGoal
                                ? `${Math.max(getDaysRemaining(summary.closestGoal.targetDate) || 0, 0)} gün`
                                : 'Plan yok'
                        }
                        icon={Calendar}
                        color="amber"
                        subtitle={summary.closestGoal?.name || 'Tarihli aktif hedef bekleniyor'}
                        variant="premium"
                    />
                </StatsGrid>

                <FilterBar className="border-white/10 bg-slate-950/70">
                    <SearchBox
                        value={searchTerm}
                        onSearch={setSearchTerm}
                        placeholder="Hedef, kategori veya not ara"
                        className="sm:w-full lg:w-[360px]"
                    />

                    <Select value={statusFilter} onValueChange={value => setStatusFilter(value as 'all' | GoalStatus)}>
                        <SelectTrigger className="w-full sm:w-[180px]">
                            <SelectValue placeholder="Durum seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm durumlar</SelectItem>
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="completed">Tamamlandı</SelectItem>
                            <SelectItem value="cancelled">İptal</SelectItem>
                        </SelectContent>
                    </Select>

                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-full sm:w-[200px]">
                            <SelectValue placeholder="Kategori seçin" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tüm kategoriler</SelectItem>
                            {categoryOptions.map(category => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={sortBy} onValueChange={value => setSortBy(value as SortOption)}>
                        <SelectTrigger className="w-full sm:w-[220px]">
                            <SelectValue placeholder="Sıralama" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="closest">En yakın vade</SelectItem>
                            <SelectItem value="furthest">En uzak vade</SelectItem>
                            <SelectItem value="progress-high">İlerleme yüksekten</SelectItem>
                            <SelectItem value="progress-low">İlerleme düşükten</SelectItem>
                            <SelectItem value="amount-high">Tutar yüksekten</SelectItem>
                            <SelectItem value="recent">Son oluşturulan</SelectItem>
                        </SelectContent>
                    </Select>
                </FilterBar>

                <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
                    <DashboardCard
                        title="Hedef portföyü"
                        description="Kart görünümünde düzenle, sil ve ilerlemeyi tek bakışta izle."
                        icon={Target}
                        iconColor="text-indigo-300"
                        className="bg-slate-950/70"
                    >
                        {filteredGoals.length > 0 ? (
                            <div className="space-y-4">
                                {filteredGoals.map(goal => {
                                    const progress = calculateProgress(goal.currentAmount, goal.targetAmount)
                                    const daysRemaining = getDaysRemaining(goal.targetDate)
                                    const remainingAmount = Math.max(goal.targetAmount - goal.currentAmount, 0)

                                    return (
                                        <Card
                                            key={goal.id}
                                            variant="premium"
                                            className="border-white/10 bg-white/5 hover:bg-white/[0.07]"
                                        >
                                            <CardContent className="p-5">
                                                <div className="flex flex-col gap-4">
                                                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                                                        <div className="min-w-0">
                                                            <div className="flex flex-wrap items-center gap-2">
                                                                <h3 className="truncate text-lg font-semibold text-white">{goal.name}</h3>
                                                                <Badge variant={getStatusBadgeVariant(goal.status)}>
                                                                    {STATUS_LABELS[goal.status]}
                                                                </Badge>
                                                                <Badge variant="outline">
                                                                    {goal.category || 'Genel'}
                                                                </Badge>
                                                            </div>
                                                            <p className="mt-2 text-sm text-slate-400">
                                                                {goal.notes?.trim() || 'Henüz açıklama eklenmedi.'}
                                                            </p>
                                                        </div>

                                                        <div className="flex items-center gap-2">
                                                            <Button variant="outline" size="sm" onClick={() => openEditDrawer(goal)}>
                                                                <Edit3 className="mr-2 h-4 w-4" />
                                                                Düzenle
                                                            </Button>
                                                            <Button
                                                                variant="destructive"
                                                                size="sm"
                                                                onClick={() => setDeleteCandidate(goal)}
                                                                loading={deletingId === goal.id}
                                                            >
                                                                <Trash2 className="mr-2 h-4 w-4" />
                                                                Sil
                                                            </Button>
                                                        </div>
                                                    </div>

                                                    <div className="grid gap-3 md:grid-cols-3">
                                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Mevcut</p>
                                                            <p className="mt-2 text-lg font-semibold text-white">
                                                                {formatCurrency(goal.currentAmount, goal.currency.code)}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Hedef</p>
                                                            <p className="mt-2 text-lg font-semibold text-indigo-300">
                                                                {formatCurrency(goal.targetAmount, goal.currency.code)}
                                                            </p>
                                                        </div>
                                                        <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                                                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Kalan</p>
                                                            <p className="mt-2 text-lg font-semibold text-cyan-300">
                                                                {formatCurrency(remainingAmount, goal.currency.code)}
                                                            </p>
                                                        </div>
                                                    </div>

                                                    <DistributionBar
                                                        label="İlerleme oranı"
                                                        value={formatCurrency(goal.currentAmount, goal.currency.code)}
                                                        percentage={progress}
                                                        tone={getProgressTone(progress, daysRemaining, goal.status)}
                                                        hint={`Hedef: ${formatCurrency(goal.targetAmount, goal.currency.code)}`}
                                                    />

                                                    <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                                                        <div className="flex items-center gap-2 text-slate-400">
                                                            <Calendar className="h-4 w-4" />
                                                            {goal.targetDate
                                                                ? new Date(goal.targetDate).toLocaleDateString('tr-TR')
                                                                : 'Tarih planlanmadı'}
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-2">
                                                            {daysRemaining !== null && daysRemaining >= 0 ? (
                                                                <Badge variant={daysRemaining <= 14 ? 'warning' : 'outline'}>
                                                                    {daysRemaining} gün kaldı
                                                                </Badge>
                                                            ) : null}
                                                            {daysRemaining !== null && daysRemaining < 0 ? (
                                                                <Badge variant="destructive">
                                                                    {Math.abs(daysRemaining)} gün gecikti
                                                                </Badge>
                                                            ) : null}
                                                            {progress >= 100 && (
                                                                <Badge variant="success">Hedefe ulaşıldı</Badge>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <EmptyState
                                title={goals.length === 0 ? 'Henüz hedefiniz yok' : 'Filtreye uyan hedef bulunamadı'}
                                description={
                                    goals.length === 0
                                        ? 'İlk hedefinizi oluşturarak birikim yolculuğunuza başlayın.'
                                        : 'Arama veya filtreleri değiştirerek daha fazla hedef gösterin.'
                                }
                                icon={<Target className="h-10 w-10 text-indigo-300" />}
                                action={
                                    <Button variant="glow" onClick={openCreateDrawer}>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Yeni Hedef
                                    </Button>
                                }
                                className="border-white/10 bg-white/5"
                            />
                        )}
                    </DashboardCard>

                    <div className="space-y-6">
                        <DashboardCard
                            title="Odak paneli"
                            description="Bugün en çok dikkat isteyen hedefleri öne çıkar."
                            icon={Flag}
                            iconColor="text-amber-300"
                            className="bg-slate-950/70"
                        >
                            <div className="space-y-4">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">En yakın vade</p>
                                    <p className="mt-2 text-lg font-semibold text-white">
                                        {highlightedGoals.closest?.name || 'Tarihli hedef yok'}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {highlightedGoals.closest
                                            ? `${Math.max(getDaysRemaining(highlightedGoals.closest.targetDate) || 0, 0)} gün içinde aksiyon bekliyor.`
                                            : 'Bir hedefe tarih atandığında burada görünecek.'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">En yüksek ilerleme</p>
                                    <p className="mt-2 text-lg font-semibold text-cyan-300">
                                        {highlightedGoals.topPerformer?.name || 'Aktif hedef yok'}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {highlightedGoals.topPerformer
                                            ? `%${calculateProgress(
                                                highlightedGoals.topPerformer.currentAmount,
                                                highlightedGoals.topPerformer.targetAmount
                                            ).toFixed(1)} seviyesinde.`
                                            : 'İlerleme kıyaslaması için hedef ekleyin.'}
                                    </p>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Riskli hedef</p>
                                    <p className="mt-2 text-lg font-semibold text-rose-300">
                                        {highlightedGoals.atRisk?.name || 'Kritik hedef yok'}
                                    </p>
                                    <p className="mt-1 text-sm text-slate-400">
                                        {highlightedGoals.atRisk
                                            ? `${Math.max(getDaysRemaining(highlightedGoals.atRisk.targetDate) || 0, 0)} gün kaldı ve ilerleme düşük.`
                                            : 'Vadesi yakın ama geriden gelen hedef görünmüyor.'}
                                    </p>
                                </div>
                            </div>
                        </DashboardCard>

                        <DashboardCard
                            title="Durum dağılımı"
                            description="Portföyünüzün hangi fazda olduğunu görün."
                            icon={TrendingUp}
                            iconColor="text-emerald-300"
                            className="bg-slate-950/70"
                        >
                            <div className="space-y-4">
                                <DistributionBar
                                    label="Aktif hedefler"
                                    value={`${goals.filter(goal => goal.status === 'active').length} adet`}
                                    percentage={goals.length ? (goals.filter(goal => goal.status === 'active').length / goals.length) * 100 : 0}
                                    tone="blue"
                                    hint="İzleme ve birikim akışı devam edenler"
                                />
                                <DistributionBar
                                    label="Tamamlanan"
                                    value={`${summary.completedGoals} adet`}
                                    percentage={goals.length ? (summary.completedGoals / goals.length) * 100 : 0}
                                    tone="emerald"
                                    hint="Hedefe ulaşılan planlar"
                                />
                                <DistributionBar
                                    label="İptal edilen"
                                    value={`${goals.filter(goal => goal.status === 'cancelled').length} adet`}
                                    percentage={goals.length ? (goals.filter(goal => goal.status === 'cancelled').length / goals.length) * 100 : 0}
                                    tone="slate"
                                    hint="Arşivlenen veya durdurulan planlar"
                                />
                            </div>
                        </DashboardCard>
                    </div>
                </div>
            </AppPageShell>

            <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                <DrawerContent className="border-white/10 bg-slate-950">
                    <form onSubmit={handleSubmit} className="flex h-full flex-col">
                        <DrawerHeader>
                            <DrawerTitle>
                                {drawerMode === 'create' ? 'Yeni hedef oluştur' : 'Hedefi düzenle'}
                            </DrawerTitle>
                            <DrawerDescription>
                                {drawerMode === 'create'
                                    ? 'Tasarruf planınızı, vadesini ve notlarını tek panelden oluşturun.'
                                    : 'Hedefin tutarını, güncel birikimini ve durumunu güncelleyin.'}
                            </DrawerDescription>
                        </DrawerHeader>

                        <DrawerBody className="space-y-5">
                            <FormField label="Hedef adı" htmlFor="goal-name" required>
                                <Input
                                    id="goal-name"
                                    placeholder="Örn: Acil durum fonu"
                                    value={formData.name}
                                    onChange={event => setFormData(current => ({ ...current, name: event.target.value }))}
                                    required
                                />
                            </FormField>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Hedef tutar" htmlFor="goal-target" required>
                                    <Input
                                        id="goal-target"
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.targetAmount}
                                        onChange={event => setFormData(current => ({ ...current, targetAmount: event.target.value }))}
                                        required
                                    />
                                </FormField>

                                <FormField label="Para birimi" required>
                                    <Select
                                        value={formData.currencyId}
                                        onValueChange={value => setFormData(current => ({ ...current, currencyId: value }))}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Para birimi seçin" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {currencies.map(currency => (
                                                <SelectItem key={currency.id} value={String(currency.id)}>
                                                    {currency.code} ({currency.symbol})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </FormField>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-2">
                                <FormField label="Hedef tarih" htmlFor="goal-date" hint="İsteğe bağlı">
                                    <Input
                                        id="goal-date"
                                        type="date"
                                        value={formData.targetDate}
                                        onChange={event => setFormData(current => ({ ...current, targetDate: event.target.value }))}
                                    />
                                </FormField>

                                <FormField label="Kategori" htmlFor="goal-category">
                                    <Input
                                        id="goal-category"
                                        placeholder="Örn: Eğitim, Seyahat"
                                        value={formData.category}
                                        onChange={event => setFormData(current => ({ ...current, category: event.target.value }))}
                                    />
                                </FormField>
                            </div>

                            {drawerMode === 'edit' && (
                                <div className="grid gap-4 sm:grid-cols-2">
                                    <FormField label="Güncel birikim" htmlFor="goal-current">
                                        <Input
                                            id="goal-current"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={formData.currentAmount}
                                            onChange={event => setFormData(current => ({ ...current, currentAmount: event.target.value }))}
                                        />
                                    </FormField>

                                    <FormField label="Durum">
                                        <Select
                                            value={formData.status}
                                            onValueChange={value => setFormData(current => ({ ...current, status: value as GoalStatus }))}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="active">Aktif</SelectItem>
                                                <SelectItem value="completed">Tamamlandı</SelectItem>
                                                <SelectItem value="cancelled">İptal</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormField>
                                </div>
                            )}

                            <FormField label="Notlar" htmlFor="goal-notes" hint="Bu hedefin amacı veya takip notları">
                                <Textarea
                                    id="goal-notes"
                                    placeholder="Örn: Her ay maaştan düzenli aktarım yap."
                                    value={formData.notes}
                                    onChange={event => setFormData(current => ({ ...current, notes: event.target.value }))}
                                    rows={5}
                                />
                            </FormField>
                        </DrawerBody>

                        <DrawerFooter className="gap-2">
                            <Button type="button" variant="outline" onClick={closeDrawer}>
                                İptal
                            </Button>
                            <Button
                                type="submit"
                                variant="glow"
                                loading={submitting}
                                disabled={!formData.name.trim() || !formData.targetAmount || !formData.currencyId}
                            >
                                {drawerMode === 'create' ? 'Hedefi oluştur' : 'Değişiklikleri kaydet'}
                            </Button>
                        </DrawerFooter>
                    </form>
                </DrawerContent>
            </Drawer>

            <ConfirmDialog
                isOpen={Boolean(deleteCandidate)}
                onClose={() => setDeleteCandidate(null)}
                onConfirm={handleDeleteGoal}
                title="Hedef silinsin mi?"
                message={
                    deleteCandidate
                        ? `"${deleteCandidate.name}" hedefi kalıcı olarak silinecek.`
                        : 'Seçilen hedef silinecek.'
                }
                warningMessage="Bu işlem geri alınamaz."
                confirmText="Hedefi sil"
                cancelText="Vazgeç"
                loading={deletingId !== null}
            />
        </>
    )
}
