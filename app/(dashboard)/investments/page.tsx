'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  ArrowUpRight,
  BarChart3,
  Building2,
  Coins,
  Crown,
  Edit2,
  PieChart,
  Plus,
  RefreshCcw,
  Save,
  Search,
  Shield,
  Sparkles,
  Trash2,
  TrendingDown,
  TrendingUp,
} from 'lucide-react'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
import {
  AppPageShell,
  Badge,
  Button,
  ChartCard,
  ConfirmDialog,
  DashboardCard,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Textarea,
} from '@/components/mosaic'
import {
  INVESTMENT_TYPE_DEFINITIONS,
  INVESTMENT_TYPE_OPTIONS,
  normalizeInvestment,
  RISK_LEVEL_OPTIONS,
  type InvestmentTypeId,
  type NormalizedInvestment,
} from '@/lib/finance/investments'
import { isPremiumPlan } from '@/lib/plan-config'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'
import { formatCurrency } from '@/lib/validators'

type CurrencyOption = {
  id: number
  code: string
  name: string
}

type FilterPerformance = 'all' | 'gainers' | 'losers'
type SortMode = 'value-desc' | 'invested-desc' | 'profit-desc' | 'profit-asc' | 'newest' | 'oldest' | 'name-asc'

type EditorState = {
  open: boolean
  mode: 'create' | 'edit'
  investment: NormalizedInvestment | null
}

const TYPE_ICONS = {
  stock: TrendingUp,
  fund: PieChart,
  bond: Shield,
  crypto: Coins,
  commodity: Sparkles,
  forex: ArrowUpRight,
  'real-estate': Building2,
  other: BarChart3,
} satisfies Record<InvestmentTypeId, typeof TrendingUp>

export default function InvestmentsPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [investments, setInvestments] = useState<NormalizedInvestment[]>([])
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [query, setQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | InvestmentTypeId>('all')
  const [currencyFilter, setCurrencyFilter] = useState('all')
  const [riskFilter, setRiskFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all')
  const [performanceFilter, setPerformanceFilter] = useState<FilterPerformance>('all')
  const [sortMode, setSortMode] = useState<SortMode>('value-desc')
  const [page, setPage] = useState(1)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [editorState, setEditorState] = useState<EditorState>({
    open: false,
    mode: 'create',
    investment: null,
  })
  const [deleteTarget, setDeleteTarget] = useState<NormalizedInvestment | null>(null)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    investmentType: 'stock' as InvestmentTypeId,
    name: '',
    symbol: '',
    quantity: '',
    purchasePrice: '',
    currentPrice: '',
    purchaseDate: new Date().toISOString().split('T')[0],
    currencyId: '',
    category: INVESTMENT_TYPE_DEFINITIONS.stock.defaultCategory,
    riskLevel: INVESTMENT_TYPE_DEFINITIONS.stock.defaultRiskLevel,
    notes: '',
  })

  const isPremium = isPremiumPlan(user?.plan || 'free')
  const pageSize = 8

  useEffect(() => {
    if (userLoading) { return }
    if (!isPremium) {
      void router.push('/premium')
    }
  }, [userLoading, isPremium, router])

  useEffect(() => {
    if (userLoading) {
      return
    }

    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading, isPremium])

  async function fetchData() {
    try {
      setLoading(true)
      setError('')

      const referenceResponse = await fetch('/api/reference-data', { credentials: 'include' })
      if (referenceResponse.ok) {
        const referenceData = (await referenceResponse.json()) as { currencies?: CurrencyOption[] }
        const currencyItems = referenceData.currencies ?? []
        setCurrencies(currencyItems)
        const tryCurrency = currencyItems.find(currency => currency.code === 'TRY') ?? currencyItems[0]
        setFormData(prev => ({
          ...prev,
          currencyId: prev.currencyId || (tryCurrency ? String(tryCurrency.id) : ''),
        }))
      }

      if (!isPremium) {
        setInvestments([])
        return
      }

      const response = await fetch('/api/investments', { credentials: 'include' })
      const payload = (await response.json()) as Array<Record<string, unknown>> & {
        error?: string
        requiresPremium?: boolean
      }

      if (!response.ok) {
        if ((payload as { requiresPremium?: boolean }).requiresPremium) {
          return
        }

        throw new Error((payload as { error?: string }).error || 'Yatırımlar yüklenemedi')
      }

      setInvestments((payload as Array<Record<string, unknown>>).map(item => normalizeInvestment(item as never)))
    } catch (fetchError) {
      console.error('Investments fetch error:', fetchError)
      setError(fetchError instanceof Error ? fetchError.message : 'Yatırımlar yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const dominantCurrency = useMemo(() => {
    const counts = investments.reduce<Record<string, number>>((acc, investment) => {
      acc[investment.currency.code] = (acc[investment.currency.code] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts).sort((left, right) => right[1] - left[1])[0]?.[0] || 'TRY'
  }, [investments])

  const summary = useMemo(() => {
    const totalCurrentValue = investments.reduce((sum, investment) => sum + investment.currentValue, 0)
    const totalInvested = investments.reduce((sum, investment) => sum + investment.investedValue, 0)
    const totalProfitLoss = investments.reduce((sum, investment) => sum + investment.profitLoss, 0)
    const profitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0
    const activeCount = investments.length
    const winners = investments.filter(investment => investment.profitLoss >= 0).length
    const winRate = activeCount > 0 ? (winners / activeCount) * 100 : 0

    return {
      totalCurrentValue,
      totalInvested,
      totalProfitLoss,
      profitLossPercent,
      activeCount,
      winRate,
    }
  }, [investments])

  const typeBreakdown = useMemo(() => {
    return INVESTMENT_TYPE_OPTIONS.map(option => {
      const items = investments.filter(investment => investment.investmentType === option.id)
      const value = items.reduce((sum, investment) => sum + investment.currentValue, 0)
      return {
        ...option,
        count: items.length,
        value,
        share: summary.totalCurrentValue > 0 ? (value / summary.totalCurrentValue) * 100 : 0,
      }
    })
      .filter(item => item.count > 0)
      .sort((left, right) => right.value - left.value)
  }, [investments, summary.totalCurrentValue])

  const currencyBreakdown = useMemo(() => {
    const byCurrency = investments.reduce<Record<string, { code: string; count: number; value: number }>>(
      (acc, investment) => {
        const key = investment.currency.code
        if (!acc[key]) {
          acc[key] = { code: key, count: 0, value: 0 }
        }

        acc[key].count += 1
        acc[key].value += investment.currentValue
        return acc
      },
      {}
    )

    return Object.values(byCurrency).sort((left, right) => right.value - left.value)
  }, [investments])

  const filteredInvestments = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    const filtered = investments.filter(investment => {
      const matchesQuery =
        !normalizedQuery ||
        [investment.name, investment.symbol, investment.category, investment.currency.code]
          .join(' ')
          .toLowerCase()
          .includes(normalizedQuery)

      const matchesType = typeFilter === 'all' || investment.investmentType === typeFilter
      const matchesCurrency =
        currencyFilter === 'all' || investment.currency.code === currencyFilter
      const matchesRisk = riskFilter === 'all' || investment.riskLevel === riskFilter
      const matchesPerformance =
        performanceFilter === 'all' ||
        (performanceFilter === 'gainers' && investment.profitLoss >= 0) ||
        (performanceFilter === 'losers' && investment.profitLoss < 0)

      return matchesQuery && matchesType && matchesCurrency && matchesRisk && matchesPerformance
    })

    return filtered.sort((left, right) => {
      switch (sortMode) {
        case 'invested-desc':
          return right.investedValue - left.investedValue
        case 'profit-desc':
          return right.profitLoss - left.profitLoss
        case 'profit-asc':
          return left.profitLoss - right.profitLoss
        case 'newest':
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
        case 'oldest':
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        case 'name-asc':
          return left.name.localeCompare(right.name, 'tr')
        case 'value-desc':
        default:
          return right.currentValue - left.currentValue
      }
    })
  }, [currencyFilter, investments, performanceFilter, query, riskFilter, sortMode, typeFilter])

  const pageCount = Math.max(1, Math.ceil(filteredInvestments.length / pageSize))
  const pageItems = filteredInvestments.slice((page - 1) * pageSize, page * pageSize)
  const bestPerformer = [...investments].sort((left, right) => right.profitLossPercent - left.profitLossPercent)[0]
  const weakestPerformer = [...investments].sort((left, right) => left.profitLossPercent - right.profitLossPercent)[0]
  const recentInvestments = [...investments]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5)

  useEffect(() => {
    setPage(1)
  }, [query, typeFilter, currencyFilter, riskFilter, performanceFilter, sortMode])

  function resetForm(target?: NormalizedInvestment | null) {
    const defaultCurrency =
      currencies.find(currency => currency.code === 'TRY') ?? currencies[0] ?? null

    setFormData({
      investmentType: (target?.investmentType as InvestmentTypeId) || 'stock',
      name: target?.name || '',
      symbol: target?.symbol || '',
      quantity: target ? String(target.quantity) : '',
      purchasePrice: target ? String(target.purchasePrice) : '',
      currentPrice: target ? String(target.currentPrice) : '',
      purchaseDate: target
        ? target.purchaseDate.slice(0, 10)
        : new Date().toISOString().split('T')[0],
      currencyId: target ? String(target.currency.id) : defaultCurrency ? String(defaultCurrency.id) : '',
      category: target?.category || INVESTMENT_TYPE_DEFINITIONS.stock.defaultCategory,
      riskLevel: target?.riskLevel || INVESTMENT_TYPE_DEFINITIONS.stock.defaultRiskLevel,
      notes: target?.notes || '',
    })
  }

  function openCreateDrawer() {
    if (!isPremium) {
      setShowPremiumModal(true)
      return
    }

    resetForm(null)
    setEditorState({ open: true, mode: 'create', investment: null })
  }

  function openEditDrawer(investment: NormalizedInvestment) {
    resetForm(investment)
    setEditorState({ open: true, mode: 'edit', investment })
  }

  async function submitEditor() {
    const definition = INVESTMENT_TYPE_DEFINITIONS[formData.investmentType]

    if (!formData.name.trim() || !formData.quantity.trim() || !formData.purchasePrice.trim()) {
      toastError('Hata', 'Ad, miktar ve alış fiyatı zorunludur')
      return
    }

    if (!formData.currencyId) {
      toastError('Hata', 'Para birimi seçiniz')
      return
    }

    setSaving(true)

    try {
      const url =
        editorState.mode === 'edit' && editorState.investment
          ? `/api/investments/${editorState.investment.id}`
          : '/api/investments'

      const response = await fetch(url, {
        method: editorState.mode === 'edit' ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          investmentType: formData.investmentType,
          name: formData.name.trim(),
          symbol: formData.symbol.trim() || formData.name.trim(),
          quantity: formData.quantity.trim(),
          purchasePrice: formData.purchasePrice.trim(),
          currentPrice: (formData.currentPrice || formData.purchasePrice).trim(),
          purchaseDate: formData.purchaseDate,
          currencyId: Number(formData.currencyId),
          category: formData.category.trim() || definition.defaultCategory,
          riskLevel: formData.riskLevel,
          notes: formData.notes.trim(),
        }),
      })

      const payload = (await response.json()) as Record<string, unknown>

      if (!response.ok) {
        if (payload.requiresPremium) {
          setShowPremiumModal(true)
          return
        }

        toastError('Hata', String(payload.error || 'Kayıt güncellenemedi'))
        return
      }

      const normalized = normalizeInvestment(payload as never)
      setInvestments(prev =>
        editorState.mode === 'edit'
          ? prev.map(item => (item.id === normalized.id ? normalized : item))
          : [normalized, ...prev]
      )
      setEditorState({ open: false, mode: 'create', investment: null })
      toastSuccess(
        'Başarılı',
        editorState.mode === 'edit' ? 'Yatırım güncellendi' : 'Yatırım eklendi'
      )
    } catch (submitError) {
      console.error('Investment editor submit error:', submitError)
      toastError('Hata', 'Kayıt işlemi tamamlanamadı')
    } finally {
      setSaving(false)
    }
  }

  async function confirmDelete() {
    if (!deleteTarget) {
      return
    }

    try {
      const response = await fetch(`/api/investments/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string }
        toastError('Hata', payload.error || 'Yatırım silinemedi')
        return
      }

      setInvestments(prev => prev.filter(item => item.id !== deleteTarget.id))
      toastSuccess('Başarılı', 'Yatırım silindi')
    } catch (deleteError) {
      console.error('Investment delete error:', deleteError)
      toastError('Hata', 'Yatırım silinemedi')
    } finally {
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="space-y-3 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground">Yatırım merkezi hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <AppPageShell
        header={{
          title: 'Yatırım Merkezi',
          description:
            'Tablo odaklı portföy görünümü, filtrelenebilir pozisyon listesi ve hızlı yönetim aksiyonları.',
          actions: (
            <>
              <Button variant="outline" onClick={() => void fetchData()}>
                <RefreshCcw className="mr-2 h-4 w-4" />
                Yenile
              </Button>
              <Button variant="outline" asChild>
                <Link href="/investments/new">
                  <Search className="mr-2 h-4 w-4" />
                  Tür bazlı akış
                </Link>
              </Button>
              <Button onClick={openCreateDrawer}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni yatirim
              </Button>
            </>
          ),
        }}
      >
        {!isPremium ? (
          <DashboardCard
            title="Premium Yatırım Merkezi"
            description="Hisse, fon, kripto ve diğer varlıklar için tam portföy kontrolü Premium plana dahildir."
            icon={Crown}
            headerAction={<Badge variant="premium">Premium</Badge>}
          >
            <div className="grid gap-6 lg:grid-cols-[1.5fr_minmax(0,1fr)]">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Filtrelenebilir tablo, hızlı düzenleme paneli,
                  performans panelleri ve tür bazlı oluşturma akışlarını tek merkezde toplar.
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-foreground">Tablo görünümü</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Tür, para birimi, risk ve performans bazlı filtreleme.
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-foreground">CRUD aksiyonları</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Oluştur, düzenle ve sil akışlarına aynı merkezden eriş.
                    </div>
                  </div>
                  <div className="rounded-xl border border-border bg-muted/20 p-4">
                    <div className="text-sm font-medium text-foreground">Analitik sağ panel</div>
                    <div className="mt-1 text-xs text-muted-foreground">
                      Dağılım, kazananlar ve son eklenenler tek bakışta.
                    </div>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-xl bg-primary/15 p-3 text-primary">
                    <Crown className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-foreground">Premium&apos;a Geçin</div>
                    <div className="text-sm text-muted-foreground">
                      Tüm yatırım araçlarını tek panelden yönetin.
                    </div>
                  </div>
                </div>
                <Button className="mt-6 w-full" onClick={() => setShowPremiumModal(true)}>
                  Premium ozellikleri ac
                </Button>
              </div>
            </div>
          </DashboardCard>
        ) : error ? (
          <ErrorState
            title="Yatırımlar yüklenemedi"
            description={error}
            onRetry={() => void fetchData()}
          />
        ) : (
          <>
            <DashboardCard
              title="Portföy Özeti"
              description="Ana KPI seti ve performans özetleri"
              icon={BarChart3}
              headerAction={
                <Badge variant={currencyBreakdown.length > 1 ? 'warning' : 'success'}>
                  {currencyBreakdown.length > 1
                    ? `${currencyBreakdown.length} para birimi`
                    : dominantCurrency}
                </Badge>
              }
            >
              <div className="space-y-5">
                <div className="rounded-2xl border border-border bg-muted/20 p-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                      <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        Toplam portföy değeri
                      </div>
                      <div className="mt-3 text-4xl font-bold tracking-tight text-foreground">
                        {formatCurrency(summary.totalCurrentValue, dominantCurrency)}
                      </div>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <Badge variant={summary.totalProfitLoss >= 0 ? 'success' : 'destructive'}>
                          {summary.totalProfitLoss >= 0 ? '+' : ''}
                          {formatCurrency(summary.totalProfitLoss, dominantCurrency)}
                        </Badge>
                        <Badge variant="outline">
                          {summary.profitLossPercent >= 0 ? '+' : ''}
                          {summary.profitLossPercent.toFixed(2)}%
                        </Badge>
                      </div>
                    </div>
                    <div className="max-w-sm text-sm text-muted-foreground">
                      Ağırlıklı gösterim para birimi: <span className="font-medium text-foreground">{dominantCurrency}</span>.
                      Karışık para birimlerinde panel dağılımları kayıt bazlı normalize edilir.
                    </div>
                  </div>
                </div>

                <StatsGrid>
                  <StatCard
                    title="Aktif kayıt"
                    value={summary.activeCount}
                    icon={BarChart3}
                    color="blue"
                    description="Takip edilen toplam pozisyon"
                  />
                  <StatCard
                    title="Yatırılan"
                    value={formatCurrency(summary.totalInvested, dominantCurrency)}
                    icon={Coins}
                    color="amber"
                    description="Toplam maliyet bazınız"
                  />
                  <StatCard
                    title="Kar / zarar"
                    value={`${summary.totalProfitLoss >= 0 ? '+' : ''}${formatCurrency(summary.totalProfitLoss, dominantCurrency)}`}
                    icon={summary.totalProfitLoss >= 0 ? TrendingUp : TrendingDown}
                    color={summary.totalProfitLoss >= 0 ? 'emerald' : 'rose'}
                    description="Açılış maliyetine göre"
                  />
                  <StatCard
                    title="Kazanç oranı"
                    value={`${summary.winRate.toFixed(0)}%`}
                    icon={Sparkles}
                    color="purple"
                    description="Karda olan kayıt oranı"
                  />
                </StatsGrid>
              </div>
            </DashboardCard>

            <FilterBar>
              <SearchBox
                value={query}
                onSearch={value => setQuery(value)}
                placeholder="Varlık, sembol, kategori ara..."
              />

              <Select value={typeFilter} onValueChange={value => setTypeFilter(value as typeof typeFilter)}>
                <SelectTrigger className="sm:w-[180px]">
                  <SelectValue placeholder="Tür" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm türler</SelectItem>
                  {INVESTMENT_TYPE_OPTIONS.map(option => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={currencyFilter} onValueChange={value => setCurrencyFilter(value)}>
                <SelectTrigger className="sm:w-[160px]">
                  <SelectValue placeholder="Para birimi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm para birimleri</SelectItem>
                  {currencyBreakdown.map(item => (
                    <SelectItem key={item.code} value={item.code}>
                      {item.code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={riskFilter} onValueChange={value => setRiskFilter(value as typeof riskFilter)}>
                <SelectTrigger className="sm:w-[150px]">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm riskler</SelectItem>
                  {RISK_LEVEL_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={performanceFilter}
                onValueChange={value => setPerformanceFilter(value as FilterPerformance)}
              >
                <SelectTrigger className="sm:w-[160px]">
                  <SelectValue placeholder="Performans" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm durumlar</SelectItem>
                  <SelectItem value="gainers">Karda</SelectItem>
                  <SelectItem value="losers">Zararda</SelectItem>
                </SelectContent>
              </Select>

              <Select value={sortMode} onValueChange={value => setSortMode(value as SortMode)}>
                <SelectTrigger className="sm:w-[170px]">
                  <SelectValue placeholder="Sıralama" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="value-desc">Değer: yüksekten</SelectItem>
                  <SelectItem value="invested-desc">Maliyet: yüksekten</SelectItem>
                  <SelectItem value="profit-desc">Kâr: yüksekten</SelectItem>
                  <SelectItem value="profit-asc">Kâr: düşükten</SelectItem>
                  <SelectItem value="newest">En yeni</SelectItem>
                  <SelectItem value="oldest">En eski</SelectItem>
                  <SelectItem value="name-asc">Ada göre</SelectItem>
                </SelectContent>
              </Select>
            </FilterBar>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
              <DashboardCard
                title="Pozisyon Tablosu"
                description={`${filteredInvestments.length} kayıt listeleniyor`}
                icon={BarChart3}
                headerAction={
                  <Badge variant="outline">
                    Sayfa {page} / {pageCount}
                  </Badge>
                }
                className="min-w-0"
                noPadding
              >
                {filteredInvestments.length === 0 ? (
                  <div className="p-6">
                    <EmptyState
                      title="Filtrelerle eşleşen yatırım yok"
                      description="Arama ve filtreleri temizleyin ya da yeni bir yatırım ekleyin."
                      action={
                        <div className="flex flex-wrap justify-center gap-2">
                          <Button variant="outline" onClick={() => {
                            setQuery('')
                            setTypeFilter('all')
                            setCurrencyFilter('all')
                            setRiskFilter('all')
                            setPerformanceFilter('all')
                            setSortMode('value-desc')
                          }}>
                            Filtreleri temizle
                          </Button>
                          <Button onClick={openCreateDrawer}>
                            <Plus className="mr-2 h-4 w-4" />
                            Yeni yatırım
                          </Button>
                        </div>
                      }
                    />
                  </div>
                ) : (
                  <>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Varlık</TableHead>
                          <TableHead>Miktar / Alış</TableHead>
                          <TableHead>Yatırılan</TableHead>
                          <TableHead>Güncel</TableHead>
                          <TableHead>Kâr / zarar</TableHead>
                          <TableHead>Risk</TableHead>
                          <TableHead>Tarih</TableHead>
                          <TableHead className="text-right">Aksiyon</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pageItems.map(investment => {
                          const option =
                            INVESTMENT_TYPE_DEFINITIONS[investment.investmentType as InvestmentTypeId] ??
                            INVESTMENT_TYPE_DEFINITIONS.other
                          const Icon =
                            TYPE_ICONS[investment.investmentType as InvestmentTypeId] ?? TYPE_ICONS.other

                          return (
                            <TableRow key={investment.id}>
                              <TableCell>
                                <div className="flex items-start gap-3">
                                  <div className="rounded-xl bg-primary/10 p-2 text-primary">
                                    <Icon className="h-4 w-4" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-foreground">{investment.name}</div>
                                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                      {investment.symbol ? <span>{investment.symbol}</span> : null}
                                      <Badge variant="outline">{option.shortLabel}</Badge>
                                      <span>{investment.currency.code}</span>
                                    </div>
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  <div className="font-medium text-foreground">{investment.quantity}</div>
                                  <div className="text-xs text-muted-foreground">
                                    {formatCurrency(investment.purchasePrice, investment.currency.code)}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>{formatCurrency(investment.investedValue, investment.currency.code)}</TableCell>
                              <TableCell>{formatCurrency(investment.currentValue, investment.currency.code)}</TableCell>
                              <TableCell>
                                <div className={`${investment.profitLoss >= 0 ? 'text-green-400' : 'text-rose-400'}`}>
                                  <div className="font-medium">
                                    {investment.profitLoss >= 0 ? '+' : ''}
                                    {formatCurrency(investment.profitLoss, investment.currency.code)}
                                  </div>
                                  <div className="text-xs">
                                    {investment.profitLossPercent >= 0 ? '+' : ''}
                                    {investment.profitLossPercent.toFixed(2)}%
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    investment.riskLevel === 'low'
                                      ? 'success'
                                      : investment.riskLevel === 'medium'
                                        ? 'warning'
                                        : 'destructive'
                                  }
                                >
                                  {investment.riskLevel === 'low'
                                    ? 'Düşük'
                                    : investment.riskLevel === 'medium'
                                      ? 'Orta'
                                      : 'Yüksek'}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {new Date(investment.purchaseDate).toLocaleDateString('tr-TR')}
                              </TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-1">
                                  <Button variant="ghost" size="icon" onClick={() => openEditDrawer(investment)}>
                                    <Edit2 className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                    onClick={() => setDeleteTarget(investment)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                    <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-muted-foreground">
                        {filteredInvestments.length} kaydin {(page - 1) * pageSize + 1}-
                        {Math.min(page * pageSize, filteredInvestments.length)} arasi gosteriliyor.
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                          disabled={page === 1}
                        >
                          Onceki
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setPage(prev => Math.min(prev + 1, pageCount))}
                          disabled={page === pageCount}
                        >
                          Sonraki
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </DashboardCard>

              <div className="space-y-6">
                <ChartCard title="Varlık dağılımı" description="Portföy içindeki tür payları" icon={PieChart}>
                  {typeBreakdown.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Dağılım için yatırım bulunmuyor.</div>
                  ) : (
                    <div className="space-y-3">
                      {typeBreakdown.slice(0, 6).map(item => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <div className="font-medium text-foreground">{item.label}</div>
                            <div className="text-muted-foreground">
                              {item.share.toFixed(1)}% • {item.count} kayıt
                            </div>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full rounded-full bg-primary"
                              style={{ width: `${Math.min(item.share, 100)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ChartCard>

                <ChartCard title="Öne çıkanlar" description="Performansa göre hızlı okuma" icon={TrendingUp}>
                  <div className="space-y-4">
                    {bestPerformer ? (
                      <div className="rounded-xl border border-green-500/20 bg-green-500/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-green-300">En güçlü pozisyon</div>
                        <div className="mt-2 font-semibold text-foreground">{bestPerformer.name}</div>
                        <div className="mt-1 text-sm text-green-300">
                          +{bestPerformer.profitLossPercent.toFixed(2)}% •{' '}
                          {formatCurrency(bestPerformer.profitLoss, bestPerformer.currency.code)}
                        </div>
                      </div>
                    ) : null}
                    {weakestPerformer ? (
                      <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4">
                        <div className="text-xs uppercase tracking-wide text-rose-300">En zayıf pozisyon</div>
                        <div className="mt-2 font-semibold text-foreground">{weakestPerformer.name}</div>
                        <div className="mt-1 text-sm text-rose-300">
                          {weakestPerformer.profitLossPercent.toFixed(2)}% •{' '}
                          {formatCurrency(weakestPerformer.profitLoss, weakestPerformer.currency.code)}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </ChartCard>

                <ChartCard title="Para birimi maruziyeti" description="Kayıt sayısı ve hacim" icon={Coins}>
                  {currencyBreakdown.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Para birimi maruziyeti oluşmadı.</div>
                  ) : (
                    <div className="space-y-3">
                      {currencyBreakdown.map(item => (
                        <div key={item.code} className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
                          <div>
                            <div className="font-medium text-foreground">{item.code}</div>
                            <div className="text-xs text-muted-foreground">{item.count} kayıt</div>
                          </div>
                          <div className="text-sm font-medium text-foreground">
                            {formatCurrency(item.value, item.code)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ChartCard>

                <ChartCard title="Son hareketler" description="En son eklenen kayıtlar" icon={RefreshCcw}>
                  {recentInvestments.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Henüz kayıt eklenmedi.</div>
                  ) : (
                    <div className="space-y-3">
                      {recentInvestments.map(item => (
                        <button
                          key={item.id}
                          type="button"
                          className="flex w-full items-center justify-between rounded-xl border border-border bg-muted/20 p-3 text-left transition hover:border-primary/30 hover:bg-muted/40"
                          onClick={() => openEditDrawer(item)}
                        >
                          <div>
                            <div className="font-medium text-foreground">{item.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(item.createdAt).toLocaleDateString('tr-TR')} • {item.currency.code}
                            </div>
                          </div>
                          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                        </button>
                      ))}
                    </div>
                  )}
                </ChartCard>
              </div>
            </div>
          </>
        )}
      </AppPageShell>

      <Drawer
        open={editorState.open}
        onOpenChange={open => setEditorState(prev => ({ ...prev, open }))}
      >
        <DrawerContent className="sm:max-w-xl">
          <DrawerHeader>
            <DrawerTitle>
              {editorState.mode === 'edit' ? 'Yatırımı düzenle' : 'Hızlı yatırım ekle'}
            </DrawerTitle>
            <DrawerDescription>
              Ortak veri kontratı kullanılır. Gerekirse detaylı tür akışlarına geçiş yapabilirsiniz.
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <div className="space-y-4">
              <FormField label="Yatırım türü">
                <Select
                  value={formData.investmentType}
                  onValueChange={value =>
                    setFormData(prev => ({
                      ...prev,
                      investmentType: value as InvestmentTypeId,
                      category:
                        INVESTMENT_TYPE_DEFINITIONS[value as InvestmentTypeId]?.defaultCategory ||
                        prev.category,
                      riskLevel:
                        INVESTMENT_TYPE_DEFINITIONS[value as InvestmentTypeId]?.defaultRiskLevel ||
                        prev.riskLevel,
                    }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Tür seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVESTMENT_TYPE_OPTIONS.map(option => (
                      <SelectItem key={option.id} value={option.id}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Yatırım adı" required>
                  <Input
                    value={formData.name}
                    onChange={event => setFormData(prev => ({ ...prev, name: event.target.value }))}
                    placeholder="Varlık adı"
                  />
                </FormField>
                <FormField label="Sembol">
                  <Input
                    value={formData.symbol}
                    onChange={event =>
                      setFormData(prev => ({ ...prev, symbol: event.target.value.toUpperCase() }))
                    }
                    placeholder="Sembol"
                  />
                </FormField>
                <FormField label="Miktar" required>
                  <Input
                    value={formData.quantity}
                    onChange={event => setFormData(prev => ({ ...prev, quantity: event.target.value }))}
                    placeholder="0"
                  />
                </FormField>
                <FormField label="Para birimi" required>
                  <Select
                    value={formData.currencyId}
                    onValueChange={value => setFormData(prev => ({ ...prev, currencyId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Para birimi seçiniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {currencies.map(currency => (
                        <SelectItem key={currency.id} value={String(currency.id)}>
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
                <FormField label="Alis fiyati" required>
                  <Input
                    value={formData.purchasePrice}
                    onChange={event =>
                      setFormData(prev => ({ ...prev, purchasePrice: event.target.value }))
                    }
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Guncel fiyat">
                  <Input
                    value={formData.currentPrice}
                    onChange={event =>
                      setFormData(prev => ({ ...prev, currentPrice: event.target.value }))
                    }
                    placeholder="0.00"
                  />
                </FormField>
                <FormField label="Kategori">
                  <Input
                    value={formData.category}
                    onChange={event => setFormData(prev => ({ ...prev, category: event.target.value }))}
                    placeholder="Kategori"
                  />
                </FormField>
                <FormField label="Risk seviyesi">
                  <Select
                    value={formData.riskLevel}
                    onValueChange={value =>
                      setFormData(prev => ({
                        ...prev,
                        riskLevel: value as typeof prev.riskLevel,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Risk seciniz" />
                    </SelectTrigger>
                    <SelectContent>
                      {RISK_LEVEL_OPTIONS.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <FormField label="Alis tarihi" required>
                <Input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={event =>
                    setFormData(prev => ({ ...prev, purchaseDate: event.target.value }))
                  }
                />
              </FormField>

              <FormField label="Notlar">
                <Textarea
                  value={formData.notes}
                  onChange={event => setFormData(prev => ({ ...prev, notes: event.target.value }))}
                  rows={4}
                  placeholder="Strateji, notlar, hedefler..."
                />
              </FormField>
            </div>
          </DrawerBody>
          <DrawerFooter>
            <Button variant="outline" onClick={() => setEditorState(prev => ({ ...prev, open: false }))}>
              Kapat
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/investments/${formData.investmentType}/new`}>
                Tür bazlı akışa git
              </Link>
            </Button>
            <Button onClick={() => void submitEditor()} loading={saving}>
              <Save className="mr-2 h-4 w-4" />
              {editorState.mode === 'edit' ? 'Değişiklikleri kaydet' : 'Yatırımı oluştur'}
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Yatırımı sil"
        message={`${deleteTarget?.name || 'Seçili kaydı'} silmek istediğinize emin misiniz?`}
        warningMessage="Kayıt pasife alınacak ve portföy özetleri anında güncellenecek."
        confirmText="Evet, sil"
        cancelText="İptal"
      />

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Yatırım Yönetimi"
      />
    </>
  )
}
