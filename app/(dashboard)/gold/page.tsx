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
import { formatCurrency, parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'
import { isPremiumPlan } from '@/lib/plan-config'
import {
  Calendar,
  Coins,
  Gem,
  Home,
  Plus,
  RefreshCw,
  Scale,
  Tag,
  Trash2,
  Edit3,
  TrendingUp,
} from 'lucide-react'

type DrawerMode = 'create' | 'edit'
type SortOption = 'name-asc' | 'value-high' | 'profit-high' | 'newest'

interface GoldTypeOption {
  id: number
  code: string
  name: string
  description?: string | null
}

interface GoldPurityOption {
  id: number
  code: string
  name: string
  purity: string
}

interface GoldItemApi {
  id: number
  name: string
  weightGrams: string | number | null
  purchasePrice: string | number | null
  currentValueTry: string | number | null
  purchaseDate: string
  description: string | null
  createdAt: string
  goldType: {
    id: number
    name: string
  }
  goldPurity: {
    id: number
    name: string
  }
}

interface GoldItem {
  id: number
  name: string
  weightGrams: number
  purchasePrice: number
  currentValueTry: number | null
  purchaseDate: string
  description: string | null
  createdAt: string
  goldType: {
    id: number
    name: string
  }
  goldPurity: {
    id: number
    name: string
  }
}

interface GoldFormState {
  name: string
  goldTypeId: string
  goldPurityId: string
  weightGrams: string
  purchasePrice: string
  currentValueTry: string
  description: string
}

const EMPTY_FORM: GoldFormState = {
  name: '',
  goldTypeId: '',
  goldPurityId: '',
  weightGrams: '',
  purchasePrice: '',
  currentValueTry: '',
  description: '',
}

function parseAmount(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeGoldItem(item: GoldItemApi): GoldItem {
  return {
    id: item.id,
    name: item.name,
    weightGrams: parseAmount(item.weightGrams),
    purchasePrice: parseAmount(item.purchasePrice),
    currentValueTry: item.currentValueTry === null ? null : parseAmount(item.currentValueTry),
    purchaseDate: item.purchaseDate,
    description: item.description,
    createdAt: item.createdAt,
    goldType: item.goldType,
    goldPurity: item.goldPurity,
  }
}

function getCurrentValue(item: GoldItem) {
  return item.currentValueTry ?? item.purchasePrice
}

export default function GoldPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()

  useEffect(() => {
    if (userLoading) return
    if (!isPremiumPlan(user?.plan || 'free')) {
      void router.push('/premium')
    }
  }, [userLoading, user, router])

  const [goldItems, setGoldItems] = useState<GoldItem[]>([])
  const [goldTypes, setGoldTypes] = useState<GoldTypeOption[]>([])
  const [goldPurities, setGoldPurities] = useState<GoldPurityOption[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
  const [editingGold, setEditingGold] = useState<GoldItem | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<GoldItem | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<GoldFormState>(EMPTY_FORM)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [purityFilter, setPurityFilter] = useState('all')
  const [sortBy, setSortBy] = useState<SortOption>('name-asc')
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

      const [goldResponse, referenceResponse] = await Promise.all([
        fetch('/api/gold', { credentials: 'include' }),
        fetch('/api/reference-data', { credentials: 'include' }),
      ])

      if (!goldResponse.ok) {
        throw new Error('Altın kayıtları yüklenemedi')
      }

      if (!referenceResponse.ok) {
        throw new Error('Referans verileri yüklenemedi')
      }

      const goldData = (await goldResponse.json()) as GoldItemApi[]
      const referenceData = (await referenceResponse.json()) as {
        goldTypes?: GoldTypeOption[]
        goldPurities?: GoldPurityOption[]
      }

      setGoldItems(goldData.map(normalizeGoldItem))
      setGoldTypes(Array.isArray(referenceData.goldTypes) ? referenceData.goldTypes : [])
      setGoldPurities(Array.isArray(referenceData.goldPurities) ? referenceData.goldPurities : [])
    } catch (fetchError) {
      console.error('Altın verileri yüklenemedi:', fetchError)
      setError('Altın verileri yüklenirken bir hata oluştu.')
      toastError('Hata', 'Altın sayfası yüklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const summary = useMemo(() => {
    const totalWeight = goldItems.reduce((sum, item) => sum + item.weightGrams, 0)
    const totalPurchaseValue = goldItems.reduce((sum, item) => sum + item.purchasePrice, 0)
    const totalCurrentValue = goldItems.reduce((sum, item) => sum + getCurrentValue(item), 0)
    const totalProfitLoss = totalCurrentValue - totalPurchaseValue
    const highestValueItem = [...goldItems].sort((left, right) => getCurrentValue(right) - getCurrentValue(left))[0] ?? null
    const newestItem = [...goldItems].sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())[0] ?? null

    return {
      totalWeight,
      totalPurchaseValue,
      totalCurrentValue,
      totalProfitLoss,
      highestValueItem,
      newestItem,
    }
  }, [goldItems])

  const filteredItems = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('tr')

    return [...goldItems]
      .filter(item => {
        const searchable = [
          item.name,
          item.goldType.name,
          item.goldPurity.name,
          item.description || '',
        ]
          .join(' ')
          .toLocaleLowerCase('tr')

        const matchesSearch = !query || searchable.includes(query)
        const matchesType = typeFilter === 'all' || item.goldType.name === typeFilter
        const matchesPurity = purityFilter === 'all' || item.goldPurity.name === purityFilter

        return matchesSearch && matchesType && matchesPurity
      })
      .sort((left, right) => {
        const leftProfit = getCurrentValue(left) - left.purchasePrice
        const rightProfit = getCurrentValue(right) - right.purchasePrice

        switch (sortBy) {
          case 'value-high':
            return getCurrentValue(right) - getCurrentValue(left)
          case 'profit-high':
            return rightProfit - leftProfit
          case 'newest':
            return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          case 'name-asc':
          default:
            return left.name.localeCompare(right.name, 'tr')
        }
      })
  }, [goldItems, purityFilter, searchTerm, sortBy, typeFilter])

  const typeDistribution = useMemo(() => {
    const totals = goldItems.reduce<Record<string, { value: number; count: number }>>((acc, item) => {
      const key = item.goldType.name
      if (!acc[key]) {
        acc[key] = { value: 0, count: 0 }
      }

      acc[key].value += getCurrentValue(item)
      acc[key].count += 1
      return acc
    }, {})

    return Object.entries(totals)
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((left, right) => right.value - left.value)
      .slice(0, 4)
  }, [goldItems])

  const purityDistribution = useMemo(() => {
    const counts = goldItems.reduce<Record<string, number>>((acc, item) => {
      acc[item.goldPurity.name] = (acc[item.goldPurity.name] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4)
  }, [goldItems])

  const resetForm = () => {
    setFormData(EMPTY_FORM)
  }

  const openCreateDrawer = () => {
    setDrawerMode('create')
    setEditingGold(null)
    resetForm()
    setDrawerOpen(true)
  }

  const openEditDrawer = (item: GoldItem) => {
    setDrawerMode('edit')
    setEditingGold(item)
    setFormData({
      name: item.name,
      goldTypeId: String(item.goldType.id),
      goldPurityId: String(item.goldPurity.id),
      weightGrams: item.weightGrams.toLocaleString('tr-TR', {
        minimumFractionDigits: 3,
        maximumFractionDigits: 3,
      }),
      purchasePrice: item.purchasePrice.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      currentValueTry: getCurrentValue(item).toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      description: item.description || '',
    })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingGold(null)
    resetForm()
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toastError('Hata', 'Altın adı zorunludur')
      return false
    }

    if (!formData.goldTypeId || !formData.goldPurityId) {
      toastError('Hata', 'Altın türü ve ayar seçimi zorunludur')
      return false
    }

    if (!formData.weightGrams.trim() || parseCurrencyInput(formData.weightGrams) <= 0) {
      toastError('Hata', 'Geçerli bir gram değeri giriniz')
      return false
    }

    if (!formData.purchasePrice.trim() || parseCurrencyInput(formData.purchasePrice) <= 0) {
      toastError('Hata', 'Geçerli bir alış değeri giriniz')
      return false
    }

    if (formData.currentValueTry.trim() && parseCurrencyInput(formData.currentValueTry) < 0) {
      toastError('Hata', 'Güncel değer negatif olamaz')
      return false
    }

    return true
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const purchasePrice = parseCurrencyInput(formData.purchasePrice)
    const currentValueTry = formData.currentValueTry.trim()
      ? parseCurrencyInput(formData.currentValueTry)
      : purchasePrice

    const payload = {
      name: formData.name.trim(),
      goldTypeId: Number(formData.goldTypeId),
      goldPurityId: Number(formData.goldPurityId),
      weightGrams: parseCurrencyInput(formData.weightGrams),
      weight: parseCurrencyInput(formData.weightGrams),
      purchasePrice,
      currentValueTry,
      description: formData.description.trim() || null,
    }

    try {
      setSubmitting(true)

      const response = await fetch(
        drawerMode === 'create' ? '/api/gold' : `/api/gold/${editingGold?.id}`,
        {
          method: drawerMode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      )

      const result = (await response.json()) as { error?: string; requiresPremium?: boolean }

      if (!response.ok) {
        throw new Error(
          result.requiresPremium
            ? result.error || 'Bu özellik premium plana özeldir'
            : result.error || 'Altın kaydı kaydedilemedi'
        )
      }

      toastSuccess(
        'Başarılı',
        drawerMode === 'create' ? 'Altın kaydı oluşturuldu' : 'Altın kaydı güncellendi'
      )

      closeDrawer()
      await fetchData({ silent: true })
    } catch (submitError) {
      console.error('Altın kaydetme hatası:', submitError)
      toastError(
        'Hata',
        submitError instanceof Error ? submitError.message : 'Altın kaydı kaydedilemedi'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteCandidate) {
      return
    }

    try {
      setDeletingId(deleteCandidate.id)

      const response = await fetch(`/api/gold/${deleteCandidate.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'Altın kaydı silinemedi')
      }

      setGoldItems(current => current.filter(item => item.id !== deleteCandidate.id))
      toastSuccess('Başarılı', result.message || 'Altın silindi')
    } catch (deleteError) {
      console.error('Altın silme hatası:', deleteError)
      toastError(
        'Hata',
        deleteError instanceof Error ? deleteError.message : 'Altın kaydı silinemedi'
      )
      throw deleteError
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <AppPageShell
        header={{
          title: 'Altın ve Ziynet',
          description: 'Altın portföyünüz hazırlanıyor.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Altın ve Ziynet' }],
          onBack: () => router.back(),
          leadingActions: [{ href: '/dashboard', ariaLabel: 'Dashboard', icon: <Home className="h-4 w-4" /> }],
        }}
      >
        <Card variant="premium" className="border-white/10 bg-white/5">
          <CardContent className="p-8">
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-400/20 border-t-amber-400" />
              <div>
                <p className="text-lg font-semibold text-white">Altın paneli yükleniyor</p>
                <p className="mt-1 text-sm text-slate-400">Gram, değer ve ziynet dağılımları hazırlanıyor.</p>
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
          title: 'Altın ve Ziynet',
          description: 'Altın yatırımlarınızı ve ziynet eşyalarınızı tek merkezden yönetin.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Altın ve Ziynet' }],
          onBack: () => router.back(),
          leadingActions: [{ href: '/dashboard', ariaLabel: 'Dashboard', icon: <Home className="h-4 w-4" /> }],
        }}
      >
        <ErrorState
          title="Altın kayıtları yüklenemedi"
          description={error}
          onRetry={() => void fetchData()}
          className="min-h-[320px]"
        />
      </AppPageShell>
    )
  }

  if (!userLoading && !isPremiumPlan(user?.plan || 'free')) return null

  return (
    <>
      <AppPageShell
        header={{
          title: 'Altın ve Ziynet',
          description: 'Altın kayıtlarınızı ekleyin, filtreleyin ve güncel değer ile kar/zararı aynı ekranda yönetin.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Altın ve Ziynet' }],
          onBack: () => router.back(),
          leadingActions: [{ href: '/dashboard', ariaLabel: 'Dashboard', icon: <Home className="h-4 w-4" /> }],
          actions: (
            <>
              <Button variant="outline" onClick={() => void fetchData({ silent: true })} loading={refreshing}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Yenile
              </Button>
              <Button variant="glow" onClick={openCreateDrawer}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni Altın Eşyası
              </Button>
            </>
          ),
        }}
        className="animate-fade-in"
      >
        <Card
          variant="premium"
          className="border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(245,158,11,0.22),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(234,179,8,0.16),_transparent_25%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.96))]"
        >
          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_320px]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/20 bg-amber-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-amber-200">
                  <Coins className="h-3.5 w-3.5" />
                  Altın Takip Merkezi
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Fiziksel değerlerinizi tek panelde görün
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                    Tür, ayar ve gram bazında altın portföyünüzü yönetin; güncel değer ile toplam
                    kar/zararı aynı ekranda izleyin.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">En değerli kayıt</p>
                    <p className="mt-2 text-lg font-semibold text-white">
                      {summary.highestValueItem?.name || 'Henüz kayıt yok'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Yeni eklenen</p>
                    <p className="mt-2 text-lg font-semibold text-amber-300">
                      {summary.newestItem?.name || 'Henüz kayıt yok'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Filtre sonucu</p>
                    <p className="mt-2 text-lg font-semibold text-violet-300">
                      {filteredItems.length} kayıt
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Portföy özeti</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-amber-500/15 bg-amber-500/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-amber-200/80">Toplam gram</p>
                    <p className="mt-2 text-2xl font-black text-amber-300">
                      {summary.totalWeight.toFixed(3)} g
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Net fark</p>
                    <p className={`mt-2 text-2xl font-black ${summary.totalProfitLoss >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                      {summary.totalProfitLoss >= 0 ? '+' : '-'}
                      {formatCurrency(Math.abs(summary.totalProfitLoss), 'TRY')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatsGrid>
          <StatCard
            title="Toplam gram"
            value={`${summary.totalWeight.toFixed(3)} g`}
            icon={Scale}
            color="amber"
            subtitle="Kayıtlı tüm altın ağırlığı"
            variant="premium"
          />
          <StatCard
            title="Alış değeri"
            value={formatCurrency(summary.totalPurchaseValue, 'TRY')}
            icon={Tag}
            color="blue"
            subtitle="Portföyün toplam alış maliyeti"
            variant="premium"
          />
          <StatCard
            title="Güncel değer"
            value={formatCurrency(summary.totalCurrentValue, 'TRY')}
            icon={TrendingUp}
            color="green"
            subtitle="Mevcut kayıtlı piyasa değeri"
            variant="premium"
          />
          <StatCard
            title="Kar / zarar"
            value={`${summary.totalProfitLoss >= 0 ? '+' : '-'}${formatCurrency(Math.abs(summary.totalProfitLoss), 'TRY')}`}
            icon={Gem}
            color={summary.totalProfitLoss >= 0 ? 'emerald' : 'rose'}
            subtitle="Toplam güncel fark"
            variant="premium"
          />
        </StatsGrid>

        <FilterBar className="border-white/10 bg-slate-950/70">
          <SearchBox
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Ad, tür, ayar veya açıklama ara"
            className="sm:w-full lg:w-[360px]"
          />

          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Altın türü" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm türler</SelectItem>
              {goldTypes.map(type => (
                <SelectItem key={type.id} value={type.name}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={purityFilter} onValueChange={setPurityFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Ayar" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm ayarlar</SelectItem>
              {goldPurities.map(purity => (
                <SelectItem key={purity.id} value={purity.name}>
                  {purity.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={value => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Sıralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name-asc">Ada göre</SelectItem>
              <SelectItem value="value-high">Değeri yüksekten</SelectItem>
              <SelectItem value="profit-high">Karı yüksekten</SelectItem>
              <SelectItem value="newest">En yeni kayıt</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <DashboardCard
            title="Altın portföyü"
            description="Ziynet kayıtlarınızı detay, değer ve fark görünümüyle yönetin."
            icon={Coins}
            iconColor="text-amber-300"
            className="bg-slate-950/70"
          >
            {filteredItems.length > 0 ? (
              <div className="space-y-4">
                {filteredItems.map(item => {
                  const currentValue = getCurrentValue(item)
                  const profitLoss = currentValue - item.purchasePrice

                  return (
                    <Card
                      key={item.id}
                      variant="premium"
                      className="border-white/10 bg-white/5 hover:bg-white/[0.07]"
                    >
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4">
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <h3 className="truncate text-lg font-semibold text-white">{item.name}</h3>
                                <Badge variant="warning">{item.goldPurity.name}</Badge>
                                <Badge variant="outline">{item.goldType.name}</Badge>
                              </div>
                              <p className="mt-2 text-sm text-slate-400">
                                {item.description?.trim() || 'Açıklama eklenmedi.'}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button variant="outline" size="sm" onClick={() => openEditDrawer(item)}>
                                <Edit3 className="mr-2 h-4 w-4" />
                                Düzenle
                              </Button>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => setDeleteCandidate(item)}
                                loading={deletingId === item.id}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Sil
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-3 md:grid-cols-4">
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Gram</p>
                              <p className="mt-2 text-lg font-semibold text-white">{item.weightGrams.toFixed(3)} g</p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Alış</p>
                              <p className="mt-2 text-lg font-semibold text-cyan-300">
                                {formatCurrency(item.purchasePrice, 'TRY')}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Güncel</p>
                              <p className="mt-2 text-lg font-semibold text-amber-300">
                                {formatCurrency(currentValue, 'TRY')}
                              </p>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                              <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Fark</p>
                              <p className={`mt-2 text-lg font-semibold ${profitLoss >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                                {profitLoss >= 0 ? '+' : '-'}
                                {formatCurrency(Math.abs(profitLoss), 'TRY')}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-col gap-3 border-t border-white/10 pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2 text-slate-400">
                              <Calendar className="h-4 w-4" />
                              {new Date(item.purchaseDate).toLocaleDateString('tr-TR')}
                            </div>
                            <Badge variant={profitLoss >= 0 ? 'success' : 'destructive'}>
                              {profitLoss >= 0 ? 'Karda' : 'Zararda'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <EmptyState
                title={goldItems.length === 0 ? 'Henüz altın kaydı eklenmedi' : 'Filtreye uyan kayıt bulunamadı'}
                description={
                  goldItems.length === 0
                    ? 'İlk altın veya ziynet kaydınızı oluşturarak portföy görünümünü başlatın.'
                    : 'Arama veya filtreleri değiştirerek farklı kayıtları listeleyin.'
                }
                icon={<Coins className="h-10 w-10 text-amber-300" />}
                action={
                  <Button variant="glow" onClick={openCreateDrawer}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni Altın Eşyası
                  </Button>
                }
                className="border-white/10 bg-white/5"
              />
            )}
          </DashboardCard>

          <div className="space-y-6">
            <DashboardCard
              title="Tür dağılımı"
              description="Değerin hangi altın türlerinde yoğunlaştığını görün."
              icon={Tag}
              iconColor="text-cyan-300"
              className="bg-slate-950/70"
            >
              <div className="space-y-4">
                {typeDistribution.length > 0 ? (
                  typeDistribution.map(entry => (
                    <DistributionBar
                      key={entry.name}
                      label={entry.name}
                      value={formatCurrency(entry.value, 'TRY')}
                      percentage={summary.totalCurrentValue > 0 ? (entry.value / summary.totalCurrentValue) * 100 : 0}
                      tone="amber"
                      hint={`${entry.count} kayıt`}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Tür dağılımı için veri bulunmuyor.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard
              title="Ayar dağılımı"
              description="Portföyünüzün ayar bazlı kırılımını görün."
              icon={Gem}
              iconColor="text-violet-300"
              className="bg-slate-950/70"
            >
              <div className="space-y-4">
                {purityDistribution.length > 0 ? (
                  purityDistribution.map(entry => (
                    <DistributionBar
                      key={entry.name}
                      label={entry.name}
                      value={`${entry.count} kayıt`}
                      percentage={goldItems.length > 0 ? (entry.count / goldItems.length) * 100 : 0}
                      tone="purple"
                      hint="Toplam kayıt içindeki pay"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Ayar dağılımı için veri bulunmuyor.</p>
                )}
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
                {drawerMode === 'create' ? 'Yeni altın kaydı oluştur' : 'Altın kaydını düzenle'}
              </DrawerTitle>
              <DrawerDescription>
                {drawerMode === 'create'
                  ? 'Altın veya ziynet kaydını aynı sayfa üzerinden oluşturun.'
                  : 'Tür, ayar, gram, değer ve açıklamayı güncelleyin.'}
              </DrawerDescription>
            </DrawerHeader>

            <DrawerBody className="space-y-5">
              <FormField label="Kayıt adı" htmlFor="gold-name" required>
                <Input
                  id="gold-name"
                  placeholder="Örn: 22 Ayar Bilezik"
                  value={formData.name}
                  onChange={event => setFormData(current => ({ ...current, name: event.target.value }))}
                  required
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Altın türü" required>
                  <Select
                    value={formData.goldTypeId}
                    onValueChange={value => setFormData(current => ({ ...current, goldTypeId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {goldTypes.map(type => (
                        <SelectItem key={type.id} value={String(type.id)}>
                          {type.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>

                <FormField label="Ayar" required>
                  <Select
                    value={formData.goldPurityId}
                    onValueChange={value => setFormData(current => ({ ...current, goldPurityId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ayar seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {goldPurities.map(purity => (
                        <SelectItem key={purity.id} value={String(purity.id)}>
                          {purity.name} ({purity.purity})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                <FormField label="Gram" htmlFor="gold-weight" required>
                  <Input
                    id="gold-weight"
                    type="text"
                    placeholder="15,500"
                    value={formData.weightGrams}
                    onChange={event => setFormData(current => ({ ...current, weightGrams: event.target.value }))}
                  />
                </FormField>

                <FormField label="Alış değeri" htmlFor="gold-purchase" required>
                  <Input
                    id="gold-purchase"
                    type="text"
                    placeholder="25.000,00"
                    value={formData.purchasePrice}
                    onChange={event => setFormData(current => ({ ...current, purchasePrice: event.target.value }))}
                  />
                </FormField>

                <FormField label="Güncel değer" htmlFor="gold-current" hint="Boş bırakılırsa alış değeri alınır">
                  <Input
                    id="gold-current"
                    type="text"
                    placeholder="26.500,00"
                    value={formData.currentValueTry}
                    onChange={event => setFormData(current => ({ ...current, currentValueTry: event.target.value }))}
                  />
                </FormField>
              </div>

              <FormField label="Açıklama" htmlFor="gold-description">
                <Textarea
                  id="gold-description"
                  rows={4}
                  placeholder="Ziynet bilgisi, seri bilgisi veya notlar..."
                  value={formData.description}
                  onChange={event => setFormData(current => ({ ...current, description: event.target.value }))}
                />
              </FormField>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                Yeni kayıt oluşturma premium plan gerektirebilir. Ayrıca silme işlemi geri alınamaz.
              </div>
            </DrawerBody>

            <DrawerFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDrawer}>
                İptal
              </Button>
              <Button type="submit" variant="glow" loading={submitting}>
                {drawerMode === 'create' ? 'Kaydı oluştur' : 'Değişiklikleri kaydet'}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="Altın kaydı silinsin mi?"
        message={
          deleteCandidate
            ? `"${deleteCandidate.name}" kaydı kalıcı olarak silinecek.`
            : 'Seçilen altın kaydı silinecek.'
        }
        warningMessage="Bu işlem geri alınamaz."
        confirmText="Kaydı sil"
        cancelText="Vazgeç"
        loading={deletingId !== null}
      />
    </>
  )
}
