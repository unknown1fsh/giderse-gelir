'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
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
  DrawerHeader,
  DrawerTitle,
  EmptyState,
  ErrorState,
  FilterBar,
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
} from '@/components/mosaic'
import {
  AutoPaymentForm,
  createAutoPaymentFormState,
  type AutoPaymentFormState,
  type AutoPaymentReferenceData,
} from './components/auto-payment-form'
import {
  buildAutoPaymentPayload,
  buildAutoPaymentReferenceData,
  getDefaultAutoPaymentSelections,
  type AutoPaymentReferenceApiResponse,
} from './components/auto-payment-client'
import {
  getFrequencyLabel,
  normalizeAutoPayment,
  type NormalizedAutoPayment,
  type AutoPaymentSourceType,
} from '@/lib/finance/auto-payments'
import { isPremiumPlan } from '@/lib/plan-config'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'
import { formatCurrency } from '@/lib/validators'
import {
  AlertCircle,
  BellRing,
  Calendar,
  CreditCard,
  Edit3,
  Home,
  Landmark,
  Plus,
  RefreshCw,
  Smartphone,
  Trash2,
  UserRound,
  Wallet,
} from 'lucide-react'

type DrawerMode = 'create' | 'edit'
type StatusFilter = 'all' | 'active' | 'inactive' | 'upcoming'
type SortOption = 'next-up' | 'next-down' | 'amount-high' | 'amount-low' | 'newest'

const SOURCE_LABELS: Record<AutoPaymentSourceType, string> = {
  none: 'Kaynak seçilmedi',
  account: 'Banka hesabı',
  creditCard: 'Kredi kartı',
  eWallet: 'E-cüzdan',
  beneficiary: 'Lehtar',
}

const SOURCE_ICONS = {
  account: Landmark,
  creditCard: CreditCard,
  eWallet: Smartphone,
  beneficiary: UserRound,
  none: Wallet,
} satisfies Record<AutoPaymentSourceType, typeof Wallet>

function getDaysUntil(date: string | null) {
  if (!date) {
    return null
  }

  const target = new Date(date)
  if (Number.isNaN(target.getTime())) {
    return null
  }

  const now = new Date()
  const diff = target.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function isUpcoming(date: string | null) {
  const days = getDaysUntil(date)
  return days !== null && days >= 0 && days <= 7
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Takvimlenmedi'
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return 'Takvimlenmedi'
  }

  return date.toLocaleDateString('tr-TR')
}

function getStatusBadge(payment: NormalizedAutoPayment) {
  if (!payment.active) {
    return { label: 'Pasif', variant: 'outline' as const }
  }
  if (isUpcoming(payment.nextPaymentDate)) {
    return { label: 'Yaklaşan', variant: 'warning' as const }
  }

  return { label: 'Aktif', variant: 'success' as const }
}

function sourceFilterLabel(sourceType: AutoPaymentSourceType) {
  return sourceType === 'none' ? 'Kaynak yok' : SOURCE_LABELS[sourceType]
}

export default function AutoPaymentsPage() {
  const router = useRouter()
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast()
  const { user, loading: userLoading } = useUser()
  const isPremium = isPremiumPlan(user?.plan || 'free')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (userLoading) { return }
    if (!isPremium) {
      void router.push('/premium')
    }
  }, [userLoading, isPremium, router])

  const [autoPayments, setAutoPayments] = useState<NormalizedAutoPayment[]>([])
  const [referenceData, setReferenceData] = useState<AutoPaymentReferenceData>({
    categories: [],
    paymentMethods: [],
    currencies: [],
    accounts: [],
    creditCards: [],
    eWallets: [],
    beneficiaries: [],
  })
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerMode, setDrawerMode] = useState<DrawerMode>('create')
  const [editingPayment, setEditingPayment] = useState<NormalizedAutoPayment | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [deleteCandidate, setDeleteCandidate] = useState<NormalizedAutoPayment | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const [formData, setFormData] = useState<AutoPaymentFormState>(
    createAutoPaymentFormState({ record: null })
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [sourceFilter, setSourceFilter] = useState<'all' | AutoPaymentSourceType>('all')
  const [currencyFilter, setCurrencyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('next-up')

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

      const [paymentsResponse, referenceResponse] = await Promise.all([
        fetch('/api/auto-payments?includeInactive=true', { credentials: 'include' }),
        fetch('/api/reference-data', { credentials: 'include' }),
      ])

      const paymentsPayload = (await paymentsResponse.json()) as
        | Array<Record<string, unknown>>
        | { error?: string }
      const referencePayload = (await referenceResponse.json()) as AutoPaymentReferenceApiResponse & {
        error?: string
      }

      if (!paymentsResponse.ok) {
        throw new Error(
          !Array.isArray(paymentsPayload) && paymentsPayload.error
            ? paymentsPayload.error
            : 'Otomatik ödemeler alınamadı'
        )
      }

      if (!referenceResponse.ok) {
        throw new Error(referencePayload.error || 'Referans verileri alınamadı')
      }

      const nextReferenceData = buildAutoPaymentReferenceData(referencePayload)
      setReferenceData(nextReferenceData)
      setAutoPayments(
        (Array.isArray(paymentsPayload) ? paymentsPayload : []).map(record =>
          normalizeAutoPayment(record as never)
        )
      )

      setFormData(current => {
        if (current.currencyId && current.paymentMethodId && current.categoryId) {
          return current
        }

        const defaults = getDefaultAutoPaymentSelections(nextReferenceData)
        return createAutoPaymentFormState({
          record: null,
          fallbackCurrencyId: defaults.currencyId,
          fallbackPaymentMethodId: defaults.paymentMethodId,
          fallbackCategoryId: defaults.categoryId,
        })
      })
    } catch (fetchError) {
      console.error('Auto payments fetch error:', fetchError)
      setError(
        fetchError instanceof Error
          ? fetchError.message
          : 'Otomatik ödemeler yüklenirken bir hata oluştu.'
      )
      toastError('Hata', 'Otomatik ödeme merkezi yüklenemedi')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const sourceOptions = useMemo(() => {
    return Array.from(new Set(autoPayments.map(payment => payment.sourceType))).sort()
  }, [autoPayments])

  const currencySummaries = useMemo(() => {
    const grouped = autoPayments.reduce<Record<string, { code: string; total: number; count: number }>>(
      (acc, payment) => {
        if (!payment.active) {
          return acc
        }

        const code = payment.currency.code
        if (!acc[code]) {
          acc[code] = { code, total: 0, count: 0 }
        }

        acc[code].total += payment.amount
        acc[code].count += 1
        return acc
      },
      {}
    )

    return Object.values(grouped).sort((left, right) => right.total - left.total)
  }, [autoPayments])

  const sourceDistribution = useMemo(() => {
    const grouped = autoPayments.reduce<Record<AutoPaymentSourceType, number>>((acc, payment) => {
      acc[payment.sourceType] = (acc[payment.sourceType] || 0) + 1
      return acc
    }, {} as Record<AutoPaymentSourceType, number>)

    return Object.entries(grouped)
      .map(([sourceType, count]) => ({
        sourceType: sourceType as AutoPaymentSourceType,
        count,
      }))
      .sort((left, right) => right.count - left.count)
  }, [autoPayments])

  const summary = useMemo(() => {
    const activePayments = autoPayments.filter(payment => payment.active)
    const upcomingPayments = activePayments.filter(payment => isUpcoming(payment.nextPaymentDate))
    const thisMonthPayments = activePayments.filter(payment => {
      if (!payment.nextPaymentDate) {
        return false
      }

      const date = new Date(payment.nextPaymentDate)
      const now = new Date()
      return (
        !Number.isNaN(date.getTime()) &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      )
    })
    const nearestPayment =
      [...activePayments]
        .filter(payment => payment.nextPaymentDate)
        .sort(
          (left, right) =>
            new Date(left.nextPaymentDate || '').getTime() -
            new Date(right.nextPaymentDate || '').getTime()
        )[0] ?? null
    const newestPayment =
      [...autoPayments].sort(
        (left, right) =>
          new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
      )[0] ?? null

    return {
      total: autoPayments.length,
      active: activePayments.length,
      inactive: autoPayments.filter(payment => !payment.active).length,
      upcoming: upcomingPayments.length,
      thisMonth: thisMonthPayments.length,
      nearestPayment,
      newestPayment,
      sourceTypeCount: sourceDistribution.length,
    }
  }, [autoPayments, sourceDistribution.length])

  const totalAmountHeadline =
    currencySummaries.length === 1
      ? formatCurrency(currencySummaries[0].total, currencySummaries[0].code)
      : `${currencySummaries.length} para biriminde dağılım`

  const totalAmountSubtitle =
    currencySummaries.length === 1
      ? `Aktif ${currencySummaries[0].count} talimatın toplamı`
      : 'Kur çevrimi yapmadan para birimi bazlı özetlenir'

  const filteredPayments = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('tr')

    return [...autoPayments]
      .filter(payment => {
        const searchable = [
          payment.name,
          payment.description || '',
          payment.category?.name || '',
          payment.paymentMethod?.name || '',
          payment.sourceName || '',
          payment.sourceSubtitle || '',
          payment.currency.code,
        ]
          .join(' ')
          .toLocaleLowerCase('tr')

        const matchesSearch = !query || searchable.includes(query)
        const matchesSource = sourceFilter === 'all' || payment.sourceType === sourceFilter
        const matchesCurrency = currencyFilter === 'all' || payment.currency.code === currencyFilter
        const matchesStatus =
          statusFilter === 'all'
            ? true
            : statusFilter === 'active'
              ? payment.active
              : statusFilter === 'inactive'
                ? !payment.active
                : isUpcoming(payment.nextPaymentDate)

        return matchesSearch && matchesSource && matchesCurrency && matchesStatus
      })
      .sort((left, right) => {
        const leftDate = new Date(left.nextPaymentDate || '').getTime()
        const rightDate = new Date(right.nextPaymentDate || '').getTime()

        switch (sortBy) {
          case 'next-down':
            return rightDate - leftDate
          case 'amount-high':
            return right.amount - left.amount
          case 'amount-low':
            return left.amount - right.amount
          case 'newest':
            return new Date(right.createdAt || 0).getTime() - new Date(left.createdAt || 0).getTime()
          case 'next-up':
          default:
            return leftDate - rightDate
        }
      })
  }, [autoPayments, currencyFilter, searchTerm, sortBy, sourceFilter, statusFilter])

  const resetForm = (record?: NormalizedAutoPayment | null) => {
    const defaults = getDefaultAutoPaymentSelections(referenceData)
    setFormData(
      createAutoPaymentFormState({
        record: record
          ? {
              name: record.name,
              description: record.description,
              amount: record.amount,
              currencyId: record.currencyId,
              paymentMethodId: record.paymentMethodId,
              categoryId: record.categoryId,
              frequency: record.frequency,
              nextPaymentDate: record.nextPaymentDate,
              active: record.active,
              sourceType: record.sourceType,
              sourceId: record.sourceId,
            }
          : null,
        fallbackCurrencyId: defaults.currencyId,
        fallbackPaymentMethodId: defaults.paymentMethodId,
        fallbackCategoryId: defaults.categoryId,
      })
    )
  }

  const openCreateDrawer = () => {
    if (!isPremium) {
      setShowPremiumModal(true)
      return
    }

    setDrawerMode('create')
    setEditingPayment(null)
    resetForm(null)
    setDrawerOpen(true)
  }

  const openEditDrawer = (payment: NormalizedAutoPayment) => {
    if (!isPremium) {
      setShowPremiumModal(true)
      return
    }

    setDrawerMode('edit')
    setEditingPayment(payment)
    resetForm(payment)
    setDrawerOpen(true)
  }

  const closeDrawer = () => {
    setDrawerOpen(false)
    setEditingPayment(null)
    resetForm(null)
  }

  const submitForm = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    try {
      setSubmitting(true)

      const response = await fetch(
        drawerMode === 'create'
          ? '/api/auto-payments'
          : `/api/auto-payments/${editingPayment?.id ?? 0}`,
        {
          method: drawerMode === 'create' ? 'POST' : 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify(buildAutoPaymentPayload(formData)),
        }
      )

      const payload = (await response.json()) as { error?: string; requiresPremium?: boolean }
      if (!response.ok) {
        if (payload.requiresPremium) {
          setShowPremiumModal(true)
          return
        }

        throw new Error(payload.error || 'Talimat kaydedilemedi')
      }

      toastSuccess(
        'Başarılı',
        drawerMode === 'create' ? 'Yeni talimat oluşturuldu' : 'Talimat güncellendi'
      )
      closeDrawer()
      await fetchData({ silent: true })
    } catch (submitError) {
      console.error('Auto payment submit error:', submitError)
      toastError(
        'Hata',
        submitError instanceof Error ? submitError.message : 'Talimat kaydedilemedi'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const toggleActive = async (payment: NormalizedAutoPayment) => {
    try {
      if (!isPremium) {
        setShowPremiumModal(true)
        return
      }

      const response = await fetch(`/api/auto-payments/${payment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          ...buildAutoPaymentPayload(
            createAutoPaymentFormState({
              record: {
                name: payment.name,
                description: payment.description,
                amount: payment.amount,
                currencyId: payment.currencyId,
                paymentMethodId: payment.paymentMethodId,
                categoryId: payment.categoryId,
                frequency: payment.frequency,
                nextPaymentDate: payment.nextPaymentDate,
                active: !payment.active,
                sourceType: payment.sourceType,
                sourceId: payment.sourceId,
              },
            })
          ),
        }),
      })

      const payload = (await response.json()) as { error?: string; requiresPremium?: boolean }
      if (!response.ok) {
        if (payload.requiresPremium) {
          setShowPremiumModal(true)
          return
        }
        throw new Error(payload.error || 'Durum güncellenemedi')
      }

      setAutoPayments(current =>
        current.map(item =>
          item.id === payment.id ? normalizeAutoPayment(payload as never) : item
        )
      )
      toastSuccess(
        'Başarılı',
        payment.active ? 'Talimat pasife alındı' : 'Talimat yeniden etkinleşti'
      )
    } catch (toggleError) {
      console.error('Auto payment toggle error:', toggleError)
      toastError(
        'Hata',
        toggleError instanceof Error ? toggleError.message : 'Durum güncellenemedi'
      )
    }
  }

  const handleDelete = async () => {
    if (!deleteCandidate) {
      return
    }

    try {
      setDeletingId(deleteCandidate.id)

      const response = await fetch(`/api/auto-payments/${deleteCandidate.id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      const payload = (await response.json()) as { error?: string; requiresPremium?: boolean }
      if (!response.ok) {
        if (payload.requiresPremium) {
          setShowPremiumModal(true)
          return
        }

        throw new Error(payload.error || 'Talimat silinemedi')
      }

      setAutoPayments(current => current.filter(item => item.id !== deleteCandidate.id))
      toastWarning('Silindi', 'Talimat kaldırıldı ve hatırlatma akışından çıkarıldı')
    } catch (deleteError) {
      console.error('Auto payment delete error:', deleteError)
      toastError(
        'Hata',
        deleteError instanceof Error ? deleteError.message : 'Talimat silinemedi'
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
          title: 'Otomatik Ödemeler',
          description: 'Talimat merkezi hazırlanıyor.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Otomatik Ödemeler' }],
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
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-400/20 border-t-cyan-400" />
              <div>
                <p className="text-lg font-semibold text-white">Otomatik ödeme merkezi yükleniyor</p>
                <p className="mt-1 text-sm text-slate-400">
                  Talimat listesi, filtreler ve odak panelleri hazırlanıyor.
                </p>
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
          title: 'Otomatik Ödemeler',
          description: 'Düzenli talimatlarınızı tek merkezde yönetin.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Otomatik Ödemeler' }],
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
          title="Otomatik ödemeler yüklenemedi"
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
          title: 'Otomatik Ödemeler',
          description:
            'Düzenli fatura, abonelik ve planlı transferlerinizi filtreleyin, güncelleyin ve aynı ekrandan yönetin.',
          breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }, { label: 'Otomatik Ödemeler' }],
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
              <Button
                variant="outline"
                onClick={() => void fetchData({ silent: true })}
                loading={refreshing}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Yenile
              </Button>
              <Button asChild variant="outline">
                <Link href="/auto-payments/new">Tam sayfa form</Link>
              </Button>
              <Button variant="glow" onClick={openCreateDrawer}>
                <Plus className="mr-2 h-4 w-4" />
                Yeni otomatik ödeme
              </Button>
            </>
          ),
        }}
        className="animate-fade-in"
      >
        {!isPremium ? (
          <Card variant="premium" className="border-amber-500/20 bg-amber-500/10">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-200">Premium gerekli</p>
                <p className="mt-1 text-sm text-slate-300">
                  Yeni talimat ekleme, düzenleme ve silme aksiyonları premium planla açılır.
                </p>
              </div>
              <Button variant="premium" onClick={() => setShowPremiumModal(true)}>
                Premium'u gor
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <StatsGrid>
          <StatCard
            title="Aktif talimat"
            value={summary.active}
            icon={BellRing}
            color="blue"
            subtitle="Hatırlatma akışında kalan kayıtlar"
            variant="premium"
          />
          <StatCard
            title="Yaklaşan ödeme"
            value={summary.upcoming}
            icon={AlertCircle}
            color="amber"
            subtitle="Önümüzdeki 7 gün içindeki aktif kayıtlar"
            variant="premium"
          />
          <StatCard
            title="Kaynak dağılımı"
            value={summary.sourceTypeCount}
            icon={Wallet}
            color="purple"
            subtitle="Bağlı kaynak tipi çeşitliliği"
            variant="premium"
          />
          <StatCard
            title="Toplam tutar özeti"
            value={totalAmountHeadline}
            icon={Calendar}
            color="green"
            subtitle={totalAmountSubtitle}
            variant="premium"
          />
        </StatsGrid>

        <FilterBar className="border-white/10 bg-slate-950/70">
          <SearchBox
            value={searchTerm}
            onSearch={setSearchTerm}
            placeholder="Talimat, kategori, ödeme yöntemi veya kaynak ara"
            className="sm:w-full lg:w-[360px]"
          />

          <Select
            value={sourceFilter}
            onValueChange={value => setSourceFilter(value as 'all' | AutoPaymentSourceType)}
          >
            <SelectTrigger className="w-full sm:w-[190px]">
              <SelectValue placeholder="Kaynak tipi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm kaynaklar</SelectItem>
              {sourceOptions.map(sourceType => (
                <SelectItem key={sourceType} value={sourceType}>
                  {sourceFilterLabel(sourceType)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={currencyFilter} onValueChange={setCurrencyFilter}>
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder="Para birimi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm para birimleri</SelectItem>
              {referenceData.currencies.map(currency => (
                <SelectItem key={currency.id} value={currency.code || String(currency.id)}>
                  {currency.code || currency.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={value => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[170px]">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tüm durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
              <SelectItem value="upcoming">Yaklaşan</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={value => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Siralama" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next-up">Ödeme tarihi yakından</SelectItem>
              <SelectItem value="next-down">Ödeme tarihi uzaktan</SelectItem>
              <SelectItem value="amount-high">Tutar yüksekten</SelectItem>
              <SelectItem value="amount-low">Tutar düşükten</SelectItem>
              <SelectItem value="newest">Son eklenen</SelectItem>
            </SelectContent>
          </Select>
        </FilterBar>

        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_340px]">
          <DashboardCard
            title="Talimat listesi"
            description="Düzenle, aktifliği değiştir veya kaldır. Her satır talimatın canlı durumunu özetler."
            icon={Calendar}
            iconColor="text-cyan-300"
            className="bg-slate-950/70"
          >
            {filteredPayments.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Talimat</TableHead>
                    <TableHead>Kategori / yöntem</TableHead>
                    <TableHead>Kaynak</TableHead>
                    <TableHead>Tekrarlama</TableHead>
                    <TableHead>Sonraki tarih</TableHead>
                    <TableHead>Tutar</TableHead>
                    <TableHead>Durum</TableHead>
                    <TableHead className="text-right">Aksiyon</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map(payment => {
                    const status = getStatusBadge(payment)
                    const SourceIcon = SOURCE_ICONS[payment.sourceType]
                    const daysUntil = getDaysUntil(payment.nextPaymentDate)

                    return (
                      <TableRow key={payment.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-white">{payment.name}</span>
                              <Badge variant="outline">{payment.category?.name || 'Kategori yok'}</Badge>
                            </div>
                            <p className="max-w-[320px] text-xs text-slate-400">
                              {payment.description?.trim() || 'Açıklama eklenmedi.'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-slate-100">
                              {payment.paymentMethod?.name || 'Ödeme yöntemi yok'}
                            </div>
                            <div className="text-xs text-slate-400">{payment.currency.code}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-start gap-2">
                            <div className="rounded-xl bg-primary/10 p-2 text-primary">
                              <SourceIcon className="h-4 w-4" />
                            </div>
                            <div className="space-y-1 text-sm">
                              <div className="font-medium text-slate-100">
                                {payment.sourceName || SOURCE_LABELS[payment.sourceType]}
                              </div>
                              <div className="text-xs text-slate-400">
                                {payment.sourceSubtitle || sourceFilterLabel(payment.sourceType)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-slate-100">
                              {getFrequencyLabel(payment.frequency)}
                            </div>
                            <div className="text-xs text-slate-400">{payment.cronSchedule}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1 text-sm">
                            <div className="font-medium text-slate-100">
                              {formatDate(payment.nextPaymentDate)}
                            </div>
                            <div className="text-xs text-slate-400">
                              {daysUntil === null
                                ? 'Tarih yok'
                                : daysUntil < 0
                                  ? `${Math.abs(daysUntil)} gün gecikti`
                                  : `${daysUntil} gün sonra`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium">
                          {formatCurrency(payment.amount, payment.currency.code)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDrawer(payment)}
                              aria-label="Düzenle"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => void toggleActive(payment)}
                              aria-label={payment.active ? 'Pasife al' : 'Aktif et'}
                            >
                              <BellRing className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => setDeleteCandidate(payment)}
                              aria-label="Sil"
                            >
                              <Trash2 className="h-4 w-4 text-rose-300" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title={
                  autoPayments.length === 0
                    ? 'Henüz talimat eklenmedi'
                    : 'Filtreye uyan talimat bulunamadı'
                }
                description={
                  autoPayments.length === 0
                    ? 'İlk kaydı ekleyerek fatura ve düzenli transferlerinizi tek merkezde toplayın.'
                    : 'Arama veya filtreleri değiştirerek daha fazla kayıt gösterin.'
                }
                icon={<Calendar className="h-10 w-10 text-cyan-300" />}
                action={
                  <div className="flex gap-3">
                    <Button variant="glow" onClick={openCreateDrawer}>
                      <Plus className="mr-2 h-4 w-4" />
                      Yeni talimat
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/auto-payments/new">Tam sayfa form</Link>
                    </Button>
                  </div>
                }
                className="border-white/10 bg-white/5"
              />
            )}
          </DashboardCard>

          <div className="space-y-6">
            <DashboardCard
              title="Odak paneli"
              description="Bugün en yakın hatırlatma ve son eklenen kayıtlar."
              icon={AlertCircle}
              iconColor="text-amber-300"
              className="bg-slate-950/70"
            >
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">En yakın ödeme</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {summary.nearestPayment?.name || 'Takvimlenmiş kayıt yok'}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {summary.nearestPayment
                      ? `${formatDate(summary.nearestPayment.nextPaymentDate)} • ${formatCurrency(
                          summary.nearestPayment.amount,
                          summary.nearestPayment.currency.code
                        )}`
                      : 'Tarihi olan aktif talimat eklendiğinde burada görünür.'}
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Bu ay yaklaşanlar</p>
                  <p className="mt-2 text-2xl font-black text-cyan-300">{summary.thisMonth}</p>
                  <p className="mt-1 text-sm text-slate-400">
                    Aynı ay içinde tekrar edecek aktif kayıtların sayısı.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Son eklenen</p>
                  <p className="mt-2 text-lg font-semibold text-white">
                    {summary.newestPayment?.name || 'Kayit yok'}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    {summary.newestPayment?.createdAt
                      ? new Date(summary.newestPayment.createdAt).toLocaleDateString('tr-TR')
                      : 'Yeni kayıt geldiğinde burada görünür.'}
                  </p>
                </div>
              </div>
            </DashboardCard>

            <DashboardCard
              title="Kaynak dağılımı"
              description="Talimatlar hangi ödeme kaynağında yoğunlaşıyor?"
              icon={Wallet}
              iconColor="text-emerald-300"
              className="bg-slate-950/70"
            >
              <div className="space-y-4">
                {sourceDistribution.length > 0 ? (
                  sourceDistribution.map(item => (
                    <DistributionBar
                      key={item.sourceType}
                      label={sourceFilterLabel(item.sourceType)}
                      value={`${item.count} kayıt`}
                      percentage={summary.total ? (item.count / summary.total) * 100 : 0}
                      tone={item.sourceType === 'beneficiary' ? 'amber' : 'blue'}
                      hint="Tek kaynak kuralına göre dağıtım"
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Dağılım göstermek için kayıt ekleyin.</p>
                )}
              </div>
            </DashboardCard>

            <DashboardCard
              title="Para birimi görünümü"
              description="Kur çevrimi yapmadan aktif portföyü izleyin."
              icon={Landmark}
              iconColor="text-violet-300"
              className="bg-slate-950/70"
            >
              <div className="space-y-4">
                {currencySummaries.length > 0 ? (
                  currencySummaries.slice(0, 4).map(item => (
                    <DistributionBar
                      key={item.code}
                      label={item.code}
                      value={formatCurrency(item.total, item.code)}
                      percentage={
                        currencySummaries.reduce((sum, entry) => sum + entry.total, 0) > 0
                          ? (item.total /
                              currencySummaries.reduce((sum, entry) => sum + entry.total, 0)) *
                            100
                          : 0
                      }
                      tone="purple"
                      hint={`${item.count} aktif talimat`}
                    />
                  ))
                ) : (
                  <p className="text-sm text-slate-400">Aktif talimat olmadığında burada özet göremezsiniz.</p>
                )}
              </div>
            </DashboardCard>
          </div>
        </div>
      </AppPageShell>

      <Drawer
        open={drawerOpen}
        onOpenChange={open => {
          if (!open) {
            closeDrawer()
            return
          }

          setDrawerOpen(true)
        }}
      >
        <DrawerContent className="border-white/10 bg-slate-950">
          <DrawerHeader>
            <DrawerTitle>
              {drawerMode === 'create' ? 'Yeni otomatik ödeme' : 'Talimatı düzenle'}
            </DrawerTitle>
            <DrawerDescription>
              {drawerMode === 'create'
                ? 'Aynı panelde kaynak, takvim ve ödeme yöntemini bağlayarak yeni kayıt oluşturun.'
                : 'Talimatın kaynak, tarih ve aktiflik bilgisini güncelleyin.'}
            </DrawerDescription>
          </DrawerHeader>
          <DrawerBody>
            <AutoPaymentForm
              mode={drawerMode}
              formData={formData}
              referenceData={referenceData}
              onChange={setFormData}
              onSubmit={submitForm}
              onCancel={closeDrawer}
              submitLabel={drawerMode === 'create' ? 'Talimatı oluştur' : 'Değişiklikleri kaydet'}
              submitting={submitting}
            />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <ConfirmDialog
        isOpen={Boolean(deleteCandidate)}
        onClose={() => setDeleteCandidate(null)}
        onConfirm={handleDelete}
        title="Talimat silinsin mi?"
        message={
          deleteCandidate
            ? `"${deleteCandidate.name}" kaydı kaldırılacak ve gelecekteki hatırlatmalar duracak.`
            : 'Seçilen talimat kaldırılacak.'
        }
        warningMessage="Bu işlem geri alınamaz. Geçmiş işlem kayıtları etkilenmez."
        confirmText="Talimati sil"
        cancelText="Vazgec"
        loading={deletingId !== null}
      />

      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Otomatik ödemeler"
      />
    </>
  )
}
