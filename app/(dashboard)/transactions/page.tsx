'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import {
  Plus,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
  Wallet,
  CreditCard,
  ArrowLeft,
  Home,
  Search,
  ChevronRight,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Sparkles,
  RefreshCw,
  Trash2,
  Edit3,
  X,
  DollarSign,
  PiggyBank,
} from 'lucide-react'

interface Transaction {
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
  account: {
    id: number
    name: string
    bank: {
      name: string
    }
    currency: {
      code: string
    }
  } | null
  creditCard: {
    id: number
    name: string
    bank: {
      name: string
    }
    currency: {
      code: string
    }
  } | null
  currency: {
    id: number
    code: string
    name: string
  }
}

type FilterType = 'all' | 'income' | 'expense'

export default function TransactionsPage() {
  const router = useRouter()
  const { error: toastError } = useToast()
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) {
      return
    }
    fetchedRef.current = true
    void fetchTransactions()
  }, [])

  async function fetchTransactions() {
    try {
      setLoading(true)
      const response = await fetch('/api/transactions', {
        credentials: 'include',
      })
      if (response.ok) {
        const data = (await response.json()) as Transaction[]
        setTransactions(data)
      } else {
        toastError('Hata', 'İşlemler yüklenemedi')
      }
    } catch (error) {
      console.error('İşlemler yüklenirken hata:', error)
      toastError('Hata', 'İşlemler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchedRef.current = false
    void fetchTransactions()
  }

  // Özet istatistikler
  const stats = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.txType.code === 'GELIR')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const totalExpense = transactions
      .filter(t => t.txType.code === 'GIDER')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0)

    const netAmount = totalIncome - totalExpense
    const incomeCount = transactions.filter(t => t.txType.code === 'GELIR').length
    const expenseCount = transactions.filter(t => t.txType.code === 'GIDER').length

    return { totalIncome, totalExpense, netAmount, incomeCount, expenseCount, total: transactions.length }
  }, [transactions])

  // Kategoriler
  const categories = useMemo(() => {
    const cats = new Set<string>()
    transactions.forEach(t => cats.add(t.category.name))
    return Array.from(cats).sort()
  }, [transactions])

  // Filtrelenmiş işlemler
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      // Tip filtresi
      if (filterType === 'income' && t.txType.code !== 'GELIR') {
        return false
      }
      if (filterType === 'expense' && t.txType.code !== 'GIDER') {
        return false
      }

      // Kategori filtresi
      if (selectedCategory !== 'all' && t.category.name !== selectedCategory) {
        return false
      }

      // Arama filtresi
      if (searchTerm) {
        const search = searchTerm.toLowerCase()
        return (
          t.category.name.toLowerCase().includes(search) ||
          (t.description && t.description.toLowerCase().includes(search)) ||
          t.tags.some(tag => tag.toLowerCase().includes(search))
        )
      }

      return true
    })
  }, [transactions, filterType, selectedCategory, searchTerm])

  // Tarihe göre grupla
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {}

    filteredTransactions.forEach(t => {
      const date = new Date(t.transactionDate).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(t)
    })

    return groups
  }, [filteredTransactions])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.back()}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-slate-600" />
                </button>
                <Link
                  href="/dashboard"
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <Home className="h-5 w-5 text-slate-600" />
                </Link>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                  <Receipt className="h-6 w-6 text-blue-600" />
                  İşlemler
                </h1>
                <p className="text-sm text-slate-600">Gelir ve giderlerinizi yönetin</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <RefreshCw className="h-5 w-5 text-slate-600" />
              </button>
              <Link
                href="/transactions/new"
                className="inline-flex items-center justify-center gap-2 min-h-[44px] px-4 py-3 sm:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium text-sm hover:shadow-lg hover:scale-105 transition-all"
              >
                <Plus className="h-4 w-4" />
                Yeni İşlem
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* Özet Kartları */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500">{stats.incomeCount} işlem</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Toplam Gelir</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(stats.totalIncome, 'TRY')}</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-md group-hover:scale-110 transition-transform">
                  <ArrowDownRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500">{stats.expenseCount} işlem</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Toplam Gider</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(stats.totalExpense, 'TRY')}</p>
            </CardContent>
          </Card>

          <Card className={`group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden relative ${stats.netAmount >= 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100' : 'bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100'
            }`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform ${stats.netAmount >= 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-orange-500 to-red-600'
                  }`}>
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-1">Net Durum</p>
              <p className={`text-xl font-bold ${stats.netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {stats.netAmount >= 0 ? '+' : ''}{formatCurrency(stats.netAmount, 'TRY')}
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md group-hover:scale-110 transition-transform">
                  <PiggyBank className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-1">Tasarruf Oranı</p>
              <p className={`text-xl font-bold ${stats.totalIncome > 0 ? (stats.netAmount >= 0 ? 'text-purple-600' : 'text-red-600') : 'text-slate-400'}`}>
                {stats.totalIncome > 0 ? `%${((stats.netAmount / stats.totalIncome) * 100).toFixed(1)}` : '—'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Hızlı İşlem Butonları */}
        <div className="grid grid-cols-2 gap-4">
          <Link href="/transactions/new-income" className="group">
            <Card className="border-0 bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-xl hover:scale-105 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-lg">Gelir Ekle</h3>
                  <p className="text-sm text-white/80">Maaş, freelance, yatırım</p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/60 ml-auto" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/transactions/new-expense" className="group">
            <Card className="border-0 bg-gradient-to-r from-red-500 to-rose-600 hover:shadow-xl hover:scale-105 transition-all">
              <CardContent className="p-5 flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-xl group-hover:scale-110 transition-transform">
                  <TrendingDown className="h-6 w-6 text-white" />
                </div>
                <div className="text-white">
                  <h3 className="font-bold text-lg">Gider Ekle</h3>
                  <p className="text-sm text-white/80">Market, fatura, kira</p>
                </div>
                <ChevronRight className="h-5 w-5 text-white/60 ml-auto" />
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Filtreler */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Arama */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="İşlem ara (kategori, açıklama, etiket)..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full min-h-[48px] pl-10 pr-12 py-3 sm:py-2.5 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base sm:text-sm"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-100 rounded-full"
                    aria-label="Aramayı temizle"
                  >
                    <X className="h-3 w-3 text-slate-400" />
                  </button>
                )}
              </div>

              {/* Tip Filtresi */}
              <div className="flex flex-wrap gap-2">
                {[
                  { value: 'all', label: 'Tümü', count: stats.total },
                  { value: 'income', label: 'Gelir', count: stats.incomeCount },
                  { value: 'expense', label: 'Gider', count: stats.expenseCount },
                ].map(filter => (
                  <button
                    key={filter.value}
                    onClick={() => setFilterType(filter.value as FilterType)}
                    className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium transition-all ${filterType === filter.value
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    {filter.label}
                    <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${filterType === filter.value ? 'bg-white/20' : 'bg-slate-200'
                      }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              {/* Kategori Filtresi */}
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="w-full min-h-[48px] sm:w-auto px-4 py-3 sm:py-2.5 border border-slate-200 rounded-xl bg-white text-base sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tüm Kategoriler</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* İşlem Listesi */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader className="border-b border-slate-100">
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt className="h-5 w-5 text-blue-600" />
                İşlem Listesi
              </div>
              <span className="text-sm font-normal text-slate-500">
                {filteredTransactions.length} işlem gösteriliyor
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-slate-600">İşlemler yükleniyor...</p>
              </div>
            ) : filteredTransactions.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-600 font-medium">
                  {searchTerm || filterType !== 'all' || selectedCategory !== 'all'
                    ? 'Filtreye uygun işlem bulunamadı'
                    : 'Henüz işlem bulunmuyor'}
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  {searchTerm || filterType !== 'all' || selectedCategory !== 'all'
                    ? 'Filtreleri temizleyerek tüm işlemleri görün'
                    : 'İlk işleminizi eklemek için yukarıdaki butonları kullanın'}
                </p>
                    {(searchTerm || filterType !== 'all' || selectedCategory !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      setFilterType('all')
                      setSelectedCategory('all')
                    }}
                    className="mt-4 min-h-[48px] px-4 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                  >
                    Filtreleri Temizle
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {Object.entries(groupedTransactions).map(([date, txList]) => (
                  <div key={date}>
                    {/* Tarih Başlığı */}
                    <div className="px-4 sm:px-6 py-3 bg-slate-50 sticky top-0">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600">{date}</span>
                        <span className="text-xs text-slate-400">({txList.length} işlem)</span>
                      </div>
                    </div>

                    {/* İşlemler */}
                    {txList.map(transaction => (
                      <div
                        key={transaction.id}
                        className="group px-4 sm:px-6 py-4 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                          {/* İkon */}
                          <div className={`p-3 rounded-xl ${transaction.txType.code === 'GELIR'
                            ? 'bg-gradient-to-br from-green-100 to-emerald-100'
                            : 'bg-gradient-to-br from-red-100 to-rose-100'
                            }`}>
                            {transaction.txType.code === 'GELIR' ? (
                              <ArrowUpRight className="h-5 w-5 text-green-600" />
                            ) : (
                              <ArrowDownRight className="h-5 w-5 text-red-600" />
                            )}
                          </div>

                          {/* İçerik */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-800 truncate">
                                {transaction.category.name}
                              </h3>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${transaction.txType.code === 'GELIR'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                                }`}>
                                {transaction.txType.name}
                              </span>
                            </div>

                            {transaction.description && (
                              <p className="text-sm text-slate-600 truncate mb-1">
                                {transaction.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                              <div className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {transaction.paymentMethod.name}
                              </div>
                              {transaction.account && (
                                <div className="flex items-center gap-1">
                                  <Wallet className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">{transaction.account.name}</span>
                                </div>
                              )}
                              {transaction.creditCard && (
                                <div className="flex items-center gap-1">
                                  <CreditCard className="h-3 w-3" />
                                  <span className="truncate max-w-[100px]">{transaction.creditCard.name}</span>
                                </div>
                              )}
                            </div>

                            {transaction.tags && transaction.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {transaction.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={index}
                                    className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                                  >
                                    #{tag}
                                  </span>
                                ))}
                                {transaction.tags.length > 3 && (
                                  <span className="text-xs text-slate-400">
                                    +{transaction.tags.length - 3}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Tutar */}
                          <div className="text-right">
                            <p className={`text-lg font-bold ${transaction.txType.code === 'GELIR' ? 'text-green-600' : 'text-red-600'
                              }`}>
                              {transaction.txType.code === 'GELIR' ? '+' : '-'}
                              {formatCurrency(parseFloat(transaction.amount), transaction.currency.code)}
                            </p>
                            <p className="text-xs text-slate-500">
                              {new Date(transaction.transactionDate).toLocaleTimeString('tr-TR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          </div>

                          {/* Actions - mobilde her zaman görünür, desktop'ta hover'da */}
                          <div className="flex opacity-100 sm:opacity-0 sm:group-hover:opacity-100 items-center gap-1 flex-shrink-0 transition-opacity">
                            <button className="min-h-[44px] min-w-[44px] p-2 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center" aria-label="Düzenle">
                              <Edit3 className="h-4 w-4 text-slate-500" />
                            </button>
                            <button className="min-h-[44px] min-w-[44px] p-2 hover:bg-red-100 rounded-lg transition-colors flex items-center justify-center" aria-label="Sil">
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pagination veya Load More */}
        {filteredTransactions.length > 0 && (
          <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
            <span>{filteredTransactions.length} işlem gösteriliyor</span>
          </div>
        )}
      </div>
    </div>
  )
}
