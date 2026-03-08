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
} from '@/components/mosaic'
import { formatCurrency, parseCurrencyInput } from '@/lib/validators'
import { useToast } from '@/lib/use-toast'
import {
  CreditCard,
  Edit3,
  Home,
  Mail,
  Phone,
  Plus,
  RefreshCw,
  Smartphone,
  Trash2,
  Wallet,
} from 'lucide-react'

type DrawerMode = 'create' | 'edit'
type SortOption = 'name-asc' | 'balance-high' | 'balance-low' | 'newest'

interface CurrencyOption {
  id: number
  code: string
  name: string
  symbol: string
}

interface EWalletApi {
  id: number
  name: string
  provider: string
  balance: string | number | null
  accountEmail: string | null
  accountPhone: string | null
  createdAt: string
  currency: {
    id: number
    code: string
    name: string
    symbol?: string | null
  }
}

interface EWallet {
  id: number
  name: string
  provider: string
  balance: number
  accountEmail: string | null
  accountPhone: string | null
  createdAt: string
  currency: {
    id: number
    code: string
    name: string
    symbol: string
  }
}

interface WalletFormState {
  name: string
  provider: string
  accountEmail: string
  accountPhone: string
  balance: string
  currencyId: string
}

const PROVIDER_OPTIONS = [
  'PayPal',
  'Papara',
  'Ininal',
  'Paycell',
  'BKM Express',
  'Google Pay',
  'Apple Pay',
  'Diğer',
] as const

const EMPTY_FORM: WalletFormState = {
  name: '',
  provider: '',
  accountEmail: '',
  accountPhone: '',
  balance: '',
  currencyId: '',
}

function parseAmount(value: unknown) {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeWallet(wallet: EWalletApi): EWallet {
  return {
    id: wallet.id,
    name: wallet.name,
    provider: wallet.provider,
    balance: parseAmount(wallet.balance),
    accountEmail: wallet.accountEmail,
    accountPhone: wallet.accountPhone,
    createdAt: wallet.createdAt,
    currency: {
      id: wallet.currency.id,
      code: wallet.currency.code,
      name: wallet.currency.name,
      symbol: wallet.currency.symbol || wallet.currency.code,
    },
  }
}

export default function EWalletsPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError } = useToast()

  const [wallets, setWallets] = useState<EWallet[]>([])
  const [currencies, setCurrencies] = useState<CurrencyOption[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
  const [editingWallet, setEditingWallet] = useState<EWallet | null>(null)
  const [deleteCandidate, setDeleteCandidate] = useState<EWallet | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState<WalletFormState>(EMPTY_FORM)
  const [searchTerm, setSearchTerm] = useState('')
  const [providerFilter, setProviderFilter] = useState('all')
  const [currencyFilter, setCurrencyFilter] = useState('all')
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

      const [walletsResponse, referenceResponse] = await Promise.all([
        fetch('/api/ewallets', { credentials: 'include' }),
        fetch('/api/reference-data?type=currency', { credentials: 'include' }),
      ])

      if (!walletsResponse.ok) {
        throw new Error('E-cüzdanlar yüklenemedi')
      }

      if (!referenceResponse.ok) {
        throw new Error('Para birimleri yüklenemedi')
      }

      const walletsData = (await walletsResponse.json()) as EWalletApi[]
      const referenceData = (await referenceResponse.json()) as { currencies?: CurrencyOption[] }
      const nextCurrencies = Array.isArray(referenceData.currencies) ? referenceData.currencies : []

      setWallets(walletsData.map(normalizeWallet))
      setCurrencies(nextCurrencies)
      setFormData(current => {
        if (current.currencyId || nextCurrencies.length === 0) {
          return current
        }

        const tryCurrency = nextCurrencies.find(currency => currency.code === 'TRY')

        return {
          ...current,
          currencyId: String((tryCurrency || nextCurrencies[0]).id),
        }
      })
    } catch (fetchError) {
      console.error('E-cüzdan verileri yüklenemedi:', fetchError)
      setError('E-cüzdan verileri yüklenirken bir hata oluştu.')
      toastError('Hata', 'E-cüzdan sayfası yüklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const providerOptions = useMemo(() => {
    return Array.from(new Set(wallets.map(wallet => wallet.provider))).sort((left, right) =>
      left.localeCompare(right, 'tr')
    )
  }, [wallets])

  const currencySummaries = useMemo(() => {
    const grouped = wallets.reduce<Record<string, { code: string; total: number; count: number }>>((acc, wallet) => {
      const code = wallet.currency.code
      if (!acc[code]) {
        acc[code] = { code, total: 0, count: 0 }
      }

      acc[code].total += wallet.balance
      acc[code].count += 1
      return acc
    }, {})

    return Object.values(grouped).sort((left, right) => right.total - left.total)
  }, [wallets])

  const summary = useMemo(() => {
    const highestBalanceWallet = [...wallets].sort((left, right) => right.balance - left.balance)[0] ?? null
    const newestWallet =
      [...wallets].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      )[0] ?? null

    return {
      totalWallets: wallets.length,
      providerCount: providerOptions.length,
      currencyCount: currencySummaries.length,
      highestBalanceWallet,
      newestWallet,
    }
  }, [currencySummaries.length, providerOptions.length, wallets])

  const filteredWallets = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('tr')

    return [...wallets]
      .filter(wallet => {
        const searchable = [
          wallet.name,
          wallet.provider,
          wallet.accountEmail || '',
          wallet.accountPhone || '',
          wallet.currency.code,
        ]
          .join(' ')
          .toLocaleLowerCase('tr')

        const matchesSearch = !query || searchable.includes(query)
        const matchesProvider = providerFilter === 'all' || wallet.provider === providerFilter
        const matchesCurrency = currencyFilter === 'all' || wallet.currency.code === currencyFilter

        return matchesSearch && matchesProvider && matchesCurrency
      })
      .sort((left, right) => {
        switch (sortBy) {
          case 'balance-high':
            return right.balance - left.balance
          case 'balance-low':
            return left.balance - right.balance
          case 'newest':
            return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
          case 'name-asc':
          default:
            return left.name.localeCompare(right.name, 'tr')
        }
      })
  }, [currencyFilter, providerFilter, searchTerm, sortBy, wallets])

  const providerDistribution = useMemo(() => {
    const counts = wallets.reduce<Record<string, number>>((acc, wallet) => {
      acc[wallet.provider] = (acc[wallet.provider] || 0) + 1
      return acc
    }, {})

    return Object.entries(counts)
      .map(([provider, count]) => ({ provider, count }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 4)
  }, [wallets])

  const totalBalanceHeadline =
    currencySummaries.length === 1
      ? formatCurrency(currencySummaries[0].total, currencySummaries[0].code)
      : `${currencySummaries.length} para biriminde bakiye`

  const totalBalanceSubtitle =
    currencySummaries.length === 1
      ? 'Tek para biriminde toplam bakiye'
      : 'Kur çevrimi yapmadan dağılım bazlı özetlenir'

  const resetForm = (nextCurrencyId?: string) => {
    const tryCurrency = currencies.find(currency => currency.code === 'TRY')
    setFormData({
      ...EMPTY_FORM,
      currencyId: nextCurrencyId ?? String((tryCurrency || currencies[0])?.id ?? ''),
    })
  }

  const openCreateDrawer = () => {
    setDrawerMode('create')
    setEditingWallet(null)
    resetForm()
    setDrawerOpen(true)
  }

  const openEditDrawer = (wallet: EWallet) => {
    setDrawerMode('edit')
    setEditingWallet(wallet)
    setFormData({
      name: wallet.name,
      provider: wallet.provider,
      accountEmail: wallet.accountEmail || '',
      accountPhone: wallet.accountPhone || '',
      balance: wallet.balance ? wallet.balance.toLocaleString('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }) : '',
      currencyId: String(wallet.currency.id),
      })
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingWallet(null)
    resetForm()
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      toastError('Hata', 'E-cüzdan adı zorunludur')
      return false
    }

    if (!formData.provider) {
      toastError('Hata', 'Sağlayıcı seçimi zorunludur')
      return false
    }

    if (!formData.currencyId) {
      toastError('Hata', 'Para birimi seçimi zorunludur')
      return false
    }

    if (!formData.accountEmail.trim() && !formData.accountPhone.trim()) {
      toastError('Hata', 'En az bir iletişim bilgisi girilmelidir')
      return false
    }

    return true
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    const payload = {
      name: formData.name.trim(),
      provider: formData.provider,
      accountEmail: formData.accountEmail.trim() || null,
      accountPhone: formData.accountPhone.trim() || null,
      balance: formData.balance.trim() ? parseCurrencyInput(formData.balance) : 0,
      currencyId: Number(formData.currencyId),
    }

    try {
      setSubmitting(true)

      const response = await fetch(
        drawerMode === 'create' ? '/api/ewallets' : `/api/ewallets/${editingWallet?.id}`,
        {
          method: drawerMode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(payload),
        }
      )

      if (!response.ok) {
        const responseError = (await response.json()) as { error?: string }
        throw new Error(responseError.error || 'İşlem başarısız')
      }

      toastSuccess(
        'Başarılı',
        drawerMode === 'create' ? 'E-cüzdan oluşturuldu' : 'E-cüzdan güncellendi'
      )

      closeDrawer()
      await fetchData({ silent: true })
    } catch (submitError) {
      console.error('E-cüzdan kaydetme hatası:', submitError)
      toastError(
        'Hata',
        submitError instanceof Error ? submitError.message : 'E-cüzdan kaydedilemedi'
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

      const response = await fetch(`/api/ewallets/${deleteCandidate.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const result = (await response.json()) as { message?: string; error?: string }

      if (!response.ok) {
        throw new Error(result.error || 'E-cüzdan silinemedi')
      }

      setWallets(current => current.filter(wallet => wallet.id !== deleteCandidate.id))
      toastSuccess('Başarılı', result.message || 'E-cüzdan silindi')
    } catch (deleteError) {
      console.error('E-cüzdan silme hatası:', deleteError)
      toastError(
        'Hata',
        deleteError instanceof Error ? deleteError.message : 'E-cüzdan silinemedi'
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
          title: 'E-Cüzdanlar',
          description: 'Dijital cüzdan merkeziniz hazırlanıyor.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'E-Cüzdanlar' }],
          onBack: () => router.back(),
          leadingActions: [{ href: '/dashboard', ariaLabel: 'Dashboard', icon: <Home className="h-4 w-4" /> }],
        }}
      >
        <Card variant="premium" className="border-white/10 bg-white/5">
          <CardContent className="p-8">
            <div className="flex min-h-[260px] flex-col items-center justify-center gap-4 text-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
              <div>
                <p className="text-lg font-semibold text-white">E-cüzdan paneli yükleniyor</p>
                <p className="mt-1 text-sm text-slate-400">Bakiyeler, sağlayıcı dağılımı ve aksiyonlar hazırlanıyor.</p>
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
          title: 'E-Cüzdanlar',
          description: 'PayPal, Papara ve diğer dijital cüzdanlarınızı tek merkezden yönetin.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'E-Cüzdanlar' }],
          onBack: () => router.back(),
          leadingActions: [{ href: '/dashboard', ariaLabel: 'Dashboard', icon: <Home className="h-4 w-4" /> }],
        }}
      >
        <ErrorState
          title="E-cüzdanlar yüklenemedi"
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
          title: 'E-Cüzdanlar',
          description: 'Dijital cüzdanlarınızı ekleyin, filtreleyin ve tüm bakiyeleri currency-aware biçimde yönetin.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'E-Cüzdanlar' }],
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
                Yeni E-Cüzdan
              </Button>
            </>
          ),
        }}
        className="animate-fade-in"
      >
        <Card
          variant="premium"
          className="border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(34,211,238,0.20),_transparent_25%),radial-gradient(circle_at_bottom_right,_rgba(99,102,241,0.18),_transparent_25%),linear-gradient(135deg,rgba(15,23,42,0.98),rgba(17,24,39,0.96))]"
        >
          <CardContent className="p-6 sm:p-8">
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_320px]">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200">
                  <Wallet className="h-3.5 w-3.5" />
                  Mosaic cüzdan merkezi
                </div>
                <div>
                  <h2 className="text-3xl font-black tracking-tight text-white sm:text-4xl">
                    Dijital bakiyeleri tek panelde hizalayın
                  </h2>
                  <p className="mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
                    Sağlayıcı bazlı görünüm alın, çoklu para birimlerini karıştırmadan izleyin ve
                    yeni e-cüzdanları aynı ekran içinden yönetin.
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Bakiye özeti</p>
                    <p className="mt-2 text-lg font-semibold text-white">{totalBalanceHeadline}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">En yüksek bakiye</p>
                    <p className="mt-2 text-lg font-semibold text-cyan-300">
                      {summary.highestBalanceWallet?.name || 'Henüz cüzdan yok'}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Filtre sonucu</p>
                    <p className="mt-2 text-lg font-semibold text-violet-300">
                      {filteredWallets.length} cüzdan
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-black/20 p-5 backdrop-blur-sm">
                <p className="text-sm font-semibold text-white">Canlı özet</p>
                <div className="mt-4 space-y-4">
                  <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-cyan-200/80">Para birimi görünümü</p>
                    <p className="mt-2 text-2xl font-black text-cyan-300">{summary.currencyCount}</p>
                    <p className="mt-1 text-xs text-slate-400">{totalBalanceSubtitle}</p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/8 p-4">
                    <p className="text-xs uppercase tracking-[0.18em] text-emerald-200/80">Yeni eklenen</p>
                    <p className="mt-2 text-xl font-black text-emerald-300">
                      {summary.newestWallet?.name || 'Henüz kayıt yok'}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {summary.newestWallet
                        ? new Date(summary.newestWallet.createdAt).toLocaleDateString('tr-TR')
                        : 'İlk cüzdan eklendiğinde burada görünür.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <StatsGrid>
          <StatCard
            title="Aktif e-cüzdan"
            value={summary.totalWallets}
            icon={Wallet}
            color="blue"
            subtitle="Portföyünüzde aktif kalan cüzdanlar"
            variant="premium"
          />
          <StatCard
            title="Sağlayıcı sayısı"
            value={summary.providerCount}
            icon={Smartphone}
            color="purple"
            subtitle="Tekrarsız servis sağlayıcı adedi"
            variant="premium"
          />
          <StatCard
            title="Para birimi dağılımı"
            value={summary.currencyCount}
            icon={CreditCard}
            color="amber"
            subtitle="Takip edilen ayrı currency havuzları"
            variant="premium"
          />
          <StatCard
            title="Bakiye özeti"
            value={totalBalanceHeadline}
            icon={Wallet}
            color="cyan"
            subtitle={totalBalanceSubtitle}
            variant="premium"
          />
        </StatsGrid>

        <FilterBar className="border-white/10 bg-slate-950/70">
          <SearchBox
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Ad, sağlayıcı, e-posta veya telefon ara"
            className="sm:w-full lg:w-[360px]"
          />

          <Select value={providerFilter} onValueChange={setProviderFilter}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue placeholder="Sağlayıcı" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm sağlayıcılar</SelectItem>
              {providerOptions.map(provider => (
                <SelectItem key={provider} value={provider}>
                  {provider}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Para birimi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm para birimleri</SelectItem>
              {currencySummaries.map(item => (
                <SelectItem key={item.code} value={item.code}>
                  {item.code}
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
              <SelectItem value="balance-high">Bakiye yüksekten</SelectItem>
              <SelectItem value="balance-low">Bakiye düşükten</SelectItem>
              <SelectItem value="newest">En yeni kayıt</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_360px]">
          <DashboardCard
            title="E-cüzdan portföyü"
            description="Bakiyeleri, sağlayıcıları ve iletişim bilgilerini tek görünümde yönetin."
            icon={Wallet}
            iconColor="text-cyan-300"
            className="bg-slate-950/70"
          >
            {filteredWallets.length > 0 ? (
              <div className="space-y-4">
                {filteredWallets.map(wallet => (
                  <Card
                    key={wallet.id}
                    variant="premium"
                    className="border-white/10 bg-white/5 hover:bg-white/[0.07]"
                  >
                    <CardContent className="p-5">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate text-lg font-semibold text-white">{wallet.name}</h3>
                              <Badge variant="info">{wallet.provider}</Badge>
                              <Badge variant="outline">{wallet.currency.code}</Badge>
                            </div>
                            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-400">
                              {wallet.accountEmail ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                  <Mail className="h-3.5 w-3.5" />
                                  {wallet.accountEmail}
                                </span>
                              ) : null}
                              {wallet.accountPhone ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1">
                                  <Phone className="h-3.5 w-3.5" />
                                  {wallet.accountPhone}
                                </span>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm" onClick={() => openEditDrawer(wallet)}>
                              <Edit3 className="mr-2 h-4 w-4" />
                              Düzenle
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => setDeleteCandidate(wallet)}
                              loading={deletingId === wallet.id}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Sil
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bakiye</p>
                            <p className="mt-2 text-xl font-semibold text-cyan-300">
                              {formatCurrency(wallet.balance, wallet.currency.code)}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Sağlayıcı: {wallet.provider}
                            </p>
                          </div>
                          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                            <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Kayıt tarihi</p>
                            <p className="mt-2 text-base font-semibold text-white">
                              {new Date(wallet.createdAt).toLocaleDateString('tr-TR')}
                            </p>
                            <p className="mt-1 text-xs text-slate-400">
                              Sonraki işlemler için referans hesap
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <EmptyState
                title={wallets.length === 0 ? 'Henüz e-cüzdan eklenmedi' : 'Filtreye uyan e-cüzdan bulunamadı'}
                description={
                  wallets.length === 0
                    ? 'İlk dijital cüzdanınızı oluşturarak bakiye görünümünü başlatın.'
                    : 'Arama veya filtreleri değiştirerek farklı cüzdanları listeleyin.'
                }
                icon={<Wallet className="h-10 w-10 text-cyan-300" />}
                action={
                  <Button variant="glow" onClick={openCreateDrawer}>
                    <Plus className="mr-2 h-4 w-4" />
                    Yeni E-Cüzdan
                  </Button>
                }
                className="border-white/10 bg-white/5"
              />
            )}
          </DashboardCard>

          <div className="space-y-6">
            <DashboardCard
              title="Currency özeti"
              description="Bakiyeleri para birimine göre ayrı ayrı izleyin."
              icon={CreditCard}
              iconColor="text-amber-300"
              className="bg-slate-950/70"
            >
              <div className="space-y-4">
                {currencySummaries.length > 0 ? (
                  currencySummaries.map(item => (
                    <div key={item.code} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.code}</p>
                          <p className="mt-1 text-xs text-slate-400">{item.count} cüzdan bu para biriminde</p>
                        </div>
                        <p className="text-sm font-semibold text-cyan-300">
                          {formatCurrency(item.total, item.code)}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Henüz currency özeti oluşmadı.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard
              title="Sağlayıcı dağılımı"
              description="Portföyünüzün hangi sağlayıcılarda yoğunlaştığını görün."
              icon={Smartphone}
              iconColor="text-violet-300"
              className="bg-slate-950/70"
            >
              <div className="space-y-4">
                {providerDistribution.length > 0 ? (
                  providerDistribution.map(item => (
                    <DistributionBar
                      key={item.provider}
                      label={item.provider}
                      value={`${item.count} cüzdan`}
                      percentage={wallets.length ? (item.count / wallets.length) * 100 : 0}
                      tone="purple"
                      hint="Toplam e-cüzdan sayısına göre pay"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Sağlayıcı dağılımı için veri bulunmuyor.</p>
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
                {drawerMode === 'create' ? 'Yeni e-cüzdan oluştur' : 'E-cüzdanı düzenle'}
              </DrawerTitle>
              <DrawerDescription>
                {drawerMode === 'create'
                  ? 'Dijital cüzdanınızı aynı sayfa üzerinden ekleyin ve ilk bakiyeyi tanımlayın.'
                  : 'Ad, sağlayıcı, iletişim bilgileri, bakiye ve para birimini güncelleyin.'}
              </DrawerDescription>
            </DrawerHeader>

            <DrawerBody className="space-y-5">
              <FormField label="E-cüzdan adı" htmlFor="wallet-name" required>
                <Input
                  id="wallet-name"
                  placeholder="Örn: Papara Ana Hesap"
                  value={formData.name}
                  onChange={event => setFormData(current => ({ ...current, name: event.target.value }))}
                  required
                />
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Sağlayıcı" required>
                  <Select
                    value={formData.provider}
                    onValueChange={value => setFormData(current => ({ ...current, provider: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sağlayıcı seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVIDER_OPTIONS.map(provider => (
                        <SelectItem key={provider} value={provider}>
                          {provider}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                          {currency.code} - {currency.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </FormField>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  label="E-posta"
                  htmlFor="wallet-email"
                  hint="En az bir iletişim alanı doldurulmalı"
                >
                  <Input
                    id="wallet-email"
                    type="email"
                    placeholder="ornek@email.com"
                    value={formData.accountEmail}
                    onChange={event => setFormData(current => ({ ...current, accountEmail: event.target.value }))}
                  />
                </FormField>

                <FormField
                  label="Telefon"
                  htmlFor="wallet-phone"
                  hint="E-posta yerine telefon da kullanılabilir"
                >
                  <Input
                    id="wallet-phone"
                    type="tel"
                    placeholder="05XX XXX XX XX"
                    value={formData.accountPhone}
                    onChange={event => setFormData(current => ({ ...current, accountPhone: event.target.value }))}
                  />
                </FormField>
              </div>

              <FormField
                label="Mevcut bakiye"
                htmlFor="wallet-balance"
                hint="Türkçe sayı formatı kullanılabilir: 1.250,50"
              >
                <Input
                  id="wallet-balance"
                  type="text"
                  placeholder="0,00"
                  value={formData.balance}
                  onChange={event => setFormData(current => ({ ...current, balance: event.target.value }))}
                />
              </FormField>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
                Cüzdan silindiğinde bu e-cüzdanla ilişkili işlem kayıtları da silinir. Düzenleme güvenli,
                silme ise geri alınamaz bir işlemdir.
              </div>
            </DrawerBody>

            <DrawerFooter className="gap-2">
              <Button type="button" variant="outline" onClick={closeDrawer}>
                İptal
              </Button>
              <Button type="submit" variant="glow" loading={submitting}>
                {drawerMode === 'create' ? 'E-cüzdan oluştur' : 'Değişiklikleri kaydet'}
              </Button>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="E-cüzdan silinsin mi?"
        message={
          deleteCandidate
            ? `"${deleteCandidate.name}" kaydı ve ona bağlı işlemler silinecek.`
            : 'Seçilen kayıt silinecek.'
        }
        warningMessage="Bu işlem ilgili işlem kayıtlarını da kaldırabilir ve geri alınamaz."
        confirmText="E-cüzdanı sil"
        cancelText="Vazgeç"
        loading={deletingId !== null}
      />
    </>
  )
}
