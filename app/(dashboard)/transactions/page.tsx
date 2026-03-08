'use client'

import { Suspense, useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  AppPageShell,
  Badge,
  Button,
  Card,
  CardContent,
  FilterBar,
  Input,
  Pagination,
  PaginationContent,
  PaginationItem,
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
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import {
  ArrowDownRight,
  ArrowUpRight,
  CalendarRange,
  RefreshCw,
  Save,
  Search,
  SlidersHorizontal,
  Tag,
} from 'lucide-react'

interface TransactionItem {
  id: number
  amount: string
  transactionDate: string
  description: string | null
  tags: string[]
  txType: {
    id: number
    name: string
    code: string
  }
  category: {
    id: number
    name: string
  }
  paymentMethod: {
    id: number
    name: string
  }
  currency: {
    code: string
  }
}

interface TransactionResponse {
  items: TransactionItem[]
  page: number
  limit: number
  total: number
  totalPages: number
  categories: Array<{ id: number; name: string }>
  txTypes: Array<{ id: number; name: string; code: string }>
}

interface SavedView {
  id: number
  name: string
  description: string | null
  filters: {
    search?: string
    categoryId?: number | null
    txTypeId?: number | null
    minAmount?: number | null
    maxAmount?: number | null
    startDate?: string | null
    endDate?: string | null
  }
  sort?: {
    sortBy?: 'transactionDate' | 'amount' | 'createdAt'
    sortDirection?: 'asc' | 'desc'
  }
  isDefault: boolean
  isSystem: boolean
}

interface FilterState {
  search: string
  categoryId: string
  txTypeId: string
  startDate: string
  endDate: string
  minAmount: string
  maxAmount: string
  sortBy: 'transactionDate' | 'amount' | 'createdAt'
  sortDirection: 'asc' | 'desc'
}

const defaultFilters: FilterState = {
  search: '',
  categoryId: 'all',
  txTypeId: 'all',
  startDate: '',
  endDate: '',
  minAmount: '',
  maxAmount: '',
  sortBy: 'transactionDate',
  sortDirection: 'desc',
}

function TransactionsPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { success: toastSuccess, error: toastError } = useToast()
  const [filters, setFilters] = useState<FilterState>(defaultFilters)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<TransactionResponse | null>(null)
  const [savedViews, setSavedViews] = useState<SavedView[]>([])

  useEffect(() => {
    setFilters({
      search: searchParams.get('search') || '',
      categoryId: searchParams.get('categoryId') || 'all',
      txTypeId: searchParams.get('txTypeId') || 'all',
      startDate: searchParams.get('startDate') || '',
      endDate: searchParams.get('endDate') || '',
      minAmount: searchParams.get('minAmount') || '',
      maxAmount: searchParams.get('maxAmount') || '',
      sortBy:
        searchParams.get('sortBy') === 'amount' || searchParams.get('sortBy') === 'createdAt'
          ? (searchParams.get('sortBy') as FilterState['sortBy'])
          : 'transactionDate',
      sortDirection: searchParams.get('sortDirection') === 'asc' ? 'asc' : 'desc',
    })
    setPage(Number(searchParams.get('page') || '1'))
  }, [searchParams])

  const buildQueryString = (nextFilters: FilterState, nextPage: number) => {
    const params = new URLSearchParams()

    if (nextFilters.search) {
      params.set('search', nextFilters.search)
    }
    if (nextFilters.categoryId !== 'all') {
      params.set('categoryId', nextFilters.categoryId)
    }
    if (nextFilters.txTypeId !== 'all') {
      params.set('txTypeId', nextFilters.txTypeId)
    }
    if (nextFilters.startDate) {
      params.set('startDate', nextFilters.startDate)
    }
    if (nextFilters.endDate) {
      params.set('endDate', nextFilters.endDate)
    }
    if (nextFilters.minAmount) {
      params.set('minAmount', nextFilters.minAmount)
    }
    if (nextFilters.maxAmount) {
      params.set('maxAmount', nextFilters.maxAmount)
    }
    params.set('sortBy', nextFilters.sortBy)
    params.set('sortDirection', nextFilters.sortDirection)
    params.set('page', String(nextPage))
    params.set('limit', '20')

    return params.toString()
  }

  const fetchSavedViews = async () => {
    try {
      const response = await fetch('/api/saved-views?entityType=transactions', {
        credentials: 'include',
      })
      if (response.ok) {
        const views = (await response.json()) as SavedView[]
        setSavedViews(views)
      }
    } catch (error) {
      console.error('Saved views error:', error)
    }
  }

  const fetchTransactions = async (queryString: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/transactions?${queryString}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Islemler yuklenemedi')
      }

      const result = (await response.json()) as TransactionResponse
      setData(result)
    } catch (error) {
      console.error('Transactions fetch error:', error)
      toastError('Hata', 'Islemler yuklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const queryString = buildQueryString(filters, page)
    router.replace(`/transactions?${queryString}`)
    void fetchTransactions(queryString)
    void fetchSavedViews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, page])

  const handleApplySavedView = (view: SavedView) => {
    setFilters({
      search: view.filters.search || '',
      categoryId: view.filters.categoryId ? String(view.filters.categoryId) : 'all',
      txTypeId: view.filters.txTypeId ? String(view.filters.txTypeId) : 'all',
      startDate: view.filters.startDate || '',
      endDate: view.filters.endDate || '',
      minAmount: view.filters.minAmount ? String(view.filters.minAmount) : '',
      maxAmount: view.filters.maxAmount ? String(view.filters.maxAmount) : '',
      sortBy: view.sort?.sortBy || 'transactionDate',
      sortDirection: view.sort?.sortDirection || 'desc',
    })
    setPage(1)
  }

  const handleSaveView = async () => {
    const name = window.prompt('Kayitli filtre adi')
    if (!name) {
      return
    }

    try {
      const response = await fetch('/api/saved-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          entityType: 'transactions',
          name,
          filters: {
            search: filters.search,
            categoryId: filters.categoryId !== 'all' ? Number(filters.categoryId) : null,
            txTypeId: filters.txTypeId !== 'all' ? Number(filters.txTypeId) : null,
            startDate: filters.startDate || null,
            endDate: filters.endDate || null,
            minAmount: filters.minAmount ? Number(filters.minAmount) : null,
            maxAmount: filters.maxAmount ? Number(filters.maxAmount) : null,
          },
          sort: {
            sortBy: filters.sortBy,
            sortDirection: filters.sortDirection,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Kayitli filtre olusturulamadi')
      }

      toastSuccess('Basarili', 'Filtre gorunumu kaydedildi')
      void fetchSavedViews()
    } catch (error) {
      console.error('Save view error:', error)
      toastError('Hata', 'Filtre gorunumu kaydedilemedi')
    }
  }

  const stats = useMemo(() => {
    const items = data?.items || []
    const totalIncome = items
      .filter(item => item.txType.code === 'GELIR')
      .reduce((sum, item) => sum + Number(item.amount), 0)
    const totalExpense = items
      .filter(item => item.txType.code === 'GIDER')
      .reduce((sum, item) => sum + Number(item.amount), 0)

    return {
      totalIncome,
      totalExpense,
      totalNet: totalIncome - totalExpense,
      totalItems: data?.total || 0,
    }
  }, [data])

  const activeFilterCount = [
    filters.search,
    filters.categoryId !== 'all' ? filters.categoryId : '',
    filters.txTypeId !== 'all' ? filters.txTypeId : '',
    filters.startDate,
    filters.endDate,
    filters.minAmount,
    filters.maxAmount,
  ].filter(Boolean).length

  return (
    <AppPageShell
      header={{
        title: 'Islem Merkezi',
        description: 'Global arama, coklu filtreleme ve kayitli gorunumlerle tum hareketlerinizi yonetin.',
        breadcrumbs: [{ label: 'Islemler' }],
        actions: (
          <>
            <Button variant="outline" onClick={() => void fetchTransactions(buildQueryString(filters, page))}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
            <Button variant="glow" onClick={() => void handleSaveView()}>
              <Save className="mr-2 h-4 w-4" />
              Filtreyi Kaydet
            </Button>
          </>
        ),
      }}
    >
      <StatsGrid>
        <StatCard
          title="Gorunen Kayit"
          value={data?.total || 0}
          icon={Search}
          color="indigo"
          subtitle="Server-side filtre sonucu"
          variant="premium"
        />
        <StatCard
          title="Gelir"
          value={formatCurrency(stats.totalIncome, 'TRY')}
          icon={TrendingIcon(true)}
          color="green"
          subtitle="Secili gorunum"
          variant="premium"
        />
        <StatCard
          title="Gider"
          value={formatCurrency(stats.totalExpense, 'TRY')}
          icon={TrendingIcon(false)}
          color="red"
          subtitle="Secili gorunum"
          variant="premium"
        />
        <StatCard
          title="Aktif Filtre"
          value={activeFilterCount}
          icon={SlidersHorizontal}
          color={activeFilterCount > 0 ? 'amber' : 'cyan'}
          subtitle="Kombine filtre sayisi"
          variant="premium"
        />
      </StatsGrid>

      <Card variant="premium" className="border-white/10 bg-white/5">
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-2">
            {savedViews.map(view => (
              <Button
                key={view.id}
                variant={view.isSystem ? 'outline' : 'secondary'}
                size="sm"
                onClick={() => handleApplySavedView(view)}
              >
                {view.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <FilterBar>
        <SearchBox
          value={filters.search}
          onSearch={value => {
            setFilters(prev => ({ ...prev, search: value }))
            setPage(1)
          }}
          placeholder="Aciklama, kategori veya etiket ara..."
        />
        <Select
          value={filters.txTypeId}
          onValueChange={value => {
            setFilters(prev => ({ ...prev, txTypeId: value }))
            setPage(1)
          }}
        >
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Islem tipi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum tipler</SelectItem>
            {data?.txTypes.map(type => (
              <SelectItem key={type.id} value={String(type.id)}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select
          value={filters.categoryId}
          onValueChange={value => {
            setFilters(prev => ({ ...prev, categoryId: value }))
            setPage(1)
          }}
        >
          <SelectTrigger className="max-w-[220px]">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tum kategoriler</SelectItem>
            {data?.categories.map(category => (
              <SelectItem key={category.id} value={String(category.id)}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          type="date"
          value={filters.startDate}
          onChange={event => {
            setFilters(prev => ({ ...prev, startDate: event.target.value }))
            setPage(1)
          }}
          className="max-w-[180px]"
        />
        <Input
          type="date"
          value={filters.endDate}
          onChange={event => {
            setFilters(prev => ({ ...prev, endDate: event.target.value }))
            setPage(1)
          }}
          className="max-w-[180px]"
        />
        <Input
          type="number"
          value={filters.minAmount}
          onChange={event => {
            setFilters(prev => ({ ...prev, minAmount: event.target.value }))
            setPage(1)
          }}
          placeholder="Min tutar"
          className="max-w-[150px]"
        />
        <Input
          type="number"
          value={filters.maxAmount}
          onChange={event => {
            setFilters(prev => ({ ...prev, maxAmount: event.target.value }))
            setPage(1)
          }}
          placeholder="Max tutar"
          className="max-w-[150px]"
        />
        <Select
          value={`${filters.sortBy}:${filters.sortDirection}`}
          onValueChange={value => {
            const [sortBy, sortDirection] = value.split(':') as [
              FilterState['sortBy'],
              FilterState['sortDirection'],
            ]
            setFilters(prev => ({ ...prev, sortBy, sortDirection }))
            setPage(1)
          }}
        >
          <SelectTrigger className="max-w-[180px]">
            <SelectValue placeholder="Sirala" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="transactionDate:desc">Tarih (yeni-eski)</SelectItem>
            <SelectItem value="transactionDate:asc">Tarih (eski-yeni)</SelectItem>
            <SelectItem value="amount:desc">Tutar (buyuk-kucuk)</SelectItem>
            <SelectItem value="amount:asc">Tutar (kucuk-buyuk)</SelectItem>
          </SelectContent>
        </Select>
      </FilterBar>

      <Card variant="premium" className="border-white/10 bg-white/5">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Aciklama</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Tarih</TableHead>
                <TableHead>Etiketler</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Islemler yukleniyor...
                  </TableCell>
                </TableRow>
              ) : data?.items.length ? (
                data.items.map(item => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">
                          {item.description || item.category.name}
                        </p>
                        <p className="text-xs text-muted-foreground">{item.paymentMethod.name}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.category.name}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarRange className="h-4 w-4" />
                        {new Date(item.transactionDate).toLocaleDateString('tr-TR')}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.length > 0 ? (
                          item.tags.map(tag => (
                            <Badge key={tag} variant="secondary">
                              <Tag className="mr-1 h-3 w-3" />
                              {tag}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground">Etiket yok</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-right font-semibold ${
                        item.txType.code === 'GELIR' ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {item.txType.code === 'GELIR' ? '+' : '-'}
                      {formatCurrency(Number(item.amount), item.currency.code)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Secili filtrelerle eslesen hareket bulunamadi.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(prev => prev - 1)}>
              Onceki
            </Button>
          </PaginationItem>
          <PaginationItem>
            <span className="px-3 text-sm text-muted-foreground">
              Sayfa {data?.page || page} / {data?.totalPages || 1}
            </span>
          </PaginationItem>
          <PaginationItem>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= (data?.totalPages || 1)}
              onClick={() => setPage(prev => prev + 1)}
            >
              Sonraki
            </Button>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </AppPageShell>
  )
}

function TrendingIcon(isPositive: boolean) {
  return isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
}

export default function TransactionsPage() {
  return (
    <Suspense>
      <TransactionsPageContent />
    </Suspense>
  )
}
