'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  TrendingUp,
  Wallet,
  CreditCard,
  Coins,
  ArrowLeft,
  Home,
  PieChart,
  BarChart3,
  Target,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'

interface AllAccount {
  id: number
  uniqueId: string
  name: string
  accountType: string
  balance?: string
  accountNumber?: string | null
  iban?: string | null
  limitAmount?: string
  availableLimit?: string
  dueDay?: number
  weightGrams?: string
  purchasePrice?: string
  currentValueTry?: string | null
  goldType?: {
    id: number
    name: string
  }
  goldPurity?: {
    id: number
    name: string
  }
  bank?: {
    id: number
    name: string
  }
  currency?: {
    id: number
    code: string
    name: string
  }
  createdAt: string
}

export default function PortfolioPage() {
  const router = useRouter()
  const [allAccounts, setAllAccounts] = useState<AllAccount[]>([])
  const [investments, setInvestments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchPortfolio() {
      try {
        const [accountsRes, investmentsRes] = await Promise.all([
          fetch('/api/accounts'),
          fetch('/api/investments').catch(() => ({ ok: false }) as Response),
        ])

        if (accountsRes.ok) {
          const data = await accountsRes.json()
          setAllAccounts(data)
        } else {
          setError('Portföy verileri yüklenemedi')
        }

        if (investmentsRes.ok && investmentsRes instanceof Response) {
          const invData = await investmentsRes.json()
          setInvestments(invData)
        }
      } catch (error) {
        console.error('Portföy verileri yüklenirken hata:', error)
        setError('Portföy verileri yüklenirken hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchPortfolio()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600">Portföy verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 font-semibold">{error}</p>
        </div>
      </div>
    )
  }

  // Hesaplamalar
  const bankAccounts = allAccounts.filter(acc => acc.accountType === 'bank')
  const creditCards = allAccounts.filter(acc => acc.accountType === 'credit_card')
  const goldItems = allAccounts.filter(acc => acc.accountType === 'gold')

  // Toplam varlık hesaplamaları
  const totalBankBalance = bankAccounts.reduce((sum, acc) => {
    if (acc.balance && acc.currency) {
      const rate = acc.currency.code === 'USD' ? 30 : acc.currency.code === 'EUR' ? 32 : 1
      return sum + parseFloat(acc.balance) * rate
    }
    return sum
  }, 0)

  const totalGoldValue = goldItems.reduce((sum, acc) => {
    return sum + parseFloat(acc.currentValueTry || acc.purchasePrice || '0')
  }, 0)

  // Yatırım varlıkları değeri
  const totalInvestmentValue = investments.reduce((sum, inv) => {
    const quantity = parseFloat(inv.quantity || '0')
    const currentPrice = parseFloat(inv.currentPrice || inv.purchasePrice || '0')
    return sum + quantity * currentPrice
  }, 0)

  const totalAssets = totalBankBalance + totalGoldValue + totalInvestmentValue

  // Kredi kartı borçları
  const totalCreditCardDebt = creditCards.reduce((sum, acc) => {
    if (acc.limitAmount && acc.availableLimit) {
      const used = parseFloat(acc.limitAmount) - parseFloat(acc.availableLimit)
      return sum + used
    }
    return sum
  }, 0)

  const netWorth = totalAssets - totalCreditCardDebt

  // Varlık dağılımı yüzdeleri
  const bankPercentage = totalAssets > 0 ? (totalBankBalance / totalAssets) * 100 : 0
  const goldPercentage = totalAssets > 0 ? (totalGoldValue / totalAssets) * 100 : 0
  // const investmentPercentage = totalAssets > 0 ? (totalInvestmentValue / totalAssets) * 100 : 0 // TODO: Kullanılacak

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Link href="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Home className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-indigo-900 bg-clip-text text-transparent">
                Toplam Varlık
              </h1>
              <p className="text-sm sm:text-base text-slate-600">
                Portföy değerinizi ve varlık dağılımınızı görüntüleyin
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Banka Hesapları</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:scale-110 transition-transform">
                <Wallet className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                {formatCurrency(totalBankBalance, 'TRY')}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {bankAccounts.length} hesap · {bankPercentage.toFixed(1)}% portföy
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-yellow-50 to-amber-50 hover:from-yellow-100 hover:to-amber-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Altın & Ziynet</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 shadow-lg group-hover:scale-110 transition-transform">
                <Coins className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                {formatCurrency(totalGoldValue, 'TRY')}
              </div>
              <p className="text-xs text-slate-600 mt-2">
                {goldItems.length} eşya · {goldPercentage.toFixed(1)}% portföy
              </p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">
                Kredi Kartı Borcu
              </CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-lg group-hover:scale-110 transition-transform">
                <CreditCard className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
                {formatCurrency(totalCreditCardDebt, 'TRY')}
              </div>
              <p className="text-xs text-slate-600 mt-2">{creditCards.length} kart aktif</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-700">Net Varlık</CardTitle>
              <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:scale-110 transition-transform">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                {formatCurrency(netWorth, 'TRY')}
              </div>
              <p className="text-xs text-slate-600 mt-2">Varlık - Borçlar</p>
            </CardContent>
          </Card>
        </div>

        {/* Varlık Dağılımı Grafiği (Basit CSS Bar Chart) */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              Varlık Dağılımı
            </CardTitle>
            <CardDescription>Portföyünüzün varlık sınıflarına göre dağılımı</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Banka Hesapları */}
            {totalBankBalance > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium">Banka Hesapları</span>
                  </div>
                  <div className="text-sm font-semibold text-blue-600">
                    {formatCurrency(totalBankBalance, 'TRY')} ({bankPercentage.toFixed(1)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${bankPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Altın */}
            {totalGoldValue > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium">Altın & Ziynet</span>
                  </div>
                  <div className="text-sm font-semibold text-yellow-600">
                    {formatCurrency(totalGoldValue, 'TRY')} ({goldPercentage.toFixed(1)}%)
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-yellow-500 to-amber-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${goldPercentage}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Toplam */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="text-base font-bold">Toplam Varlık</span>
                <span className="text-xl font-bold text-emerald-600">
                  {formatCurrency(totalAssets, 'TRY')}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Borç Durumu */}
        {totalCreditCardDebt > 0 && (
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-slate-800">
                <div className="p-2 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-md">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                Borç Durumu
              </CardTitle>
              <CardDescription>Kredi kartı borçlarınızın özeti</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-rose-50 rounded-lg">
                <div>
                  <div className="text-sm text-slate-600">Toplam Kredi Kartı Borcu</div>
                  <div className="text-2xl font-bold text-rose-600 mt-1">
                    {formatCurrency(totalCreditCardDebt, 'TRY')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-600">Toplam Limit</div>
                  <div className="text-lg font-semibold text-slate-700 mt-1">
                    {formatCurrency(
                      creditCards.reduce(
                        (sum, card) => sum + parseFloat(card.limitAmount || '0'),
                        0
                      ),
                      'TRY'
                    )}
                  </div>
                </div>
              </div>

              {creditCards.map(card => {
                const debt =
                  parseFloat(card.limitAmount || '0') - parseFloat(card.availableLimit || '0')
                const usagePercent = (debt / parseFloat(card.limitAmount || '1')) * 100

                return (
                  <div key={card.uniqueId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">{card.name}</span>
                      </div>
                      <div className="text-sm font-semibold text-rose-600">
                        {formatCurrency(debt, card.currency?.code || 'TRY')} (
                        {usagePercent.toFixed(0)}%)
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${usagePercent > 80
                            ? 'bg-gradient-to-r from-red-500 to-rose-500'
                            : usagePercent > 50
                              ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                              : 'bg-gradient-to-r from-green-500 to-emerald-500'
                          }`}
                        style={{ width: `${usagePercent}%` }}
                      ></div>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}

        {/* Net Varlık Özeti */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-white">
              <div className="p-2 rounded-lg bg-white/20 shadow-md">
                <Target className="h-5 w-5" />
              </div>
              Net Varlık Değeri
            </CardTitle>
            <CardDescription className="text-white/80">
              Toplam varlıklarınızdan borçlarınız düşüldükten sonraki net değeriniz
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-xs text-white/70">Toplam Varlık</div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(totalAssets, 'TRY')}</div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-xs text-white/70">Toplam Borç</div>
                <div className="text-2xl font-bold mt-1 text-rose-200">
                  -{formatCurrency(totalCreditCardDebt, 'TRY')}
                </div>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <div className="text-xs text-white/70">Net Değer</div>
                <div className="text-2xl font-bold mt-1">{formatCurrency(netWorth, 'TRY')}</div>
              </div>
            </div>

            <div className="bg-white/10 rounded-lg p-4 mt-4">
              <div className="text-sm text-white/80 mb-2">Net Varlık Formülü:</div>
              <div className="font-mono text-xs text-white">
                {formatCurrency(totalAssets, 'TRY')} (Varlık) -{' '}
                {formatCurrency(totalCreditCardDebt, 'TRY')} (Borç) ={' '}
                <span className="font-bold">{formatCurrency(netWorth, 'TRY')}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detaylı Hesap Listesi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Banka Hesapları Detay */}
          {bankAccounts.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md">
                    <Wallet className="h-5 w-5 text-white" />
                  </div>
                  Banka Hesapları ({bankAccounts.length})
                </CardTitle>
                <CardDescription>Tüm banka hesaplarınızın detayları</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {bankAccounts.map(account => {
                  const balance = parseFloat(account.balance || '0')
                  const percentage = totalBankBalance > 0 ? (balance / totalBankBalance) * 100 : 0

                  return (
                    <Link key={account.uniqueId} href={`/accounts/${account.id}`}>
                      <div className="p-4 border rounded-lg hover:bg-blue-50 transition-colors cursor-pointer">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-slate-800">{account.name}</div>
                            <div className="text-xs text-slate-500">{account.bank?.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-blue-600">
                              {formatCurrency(balance, account.currency?.code || 'TRY')}
                            </div>
                            <div className="text-xs text-slate-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Kredi Kartları Detay */}
          {creditCards.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md">
                    <CreditCard className="h-5 w-5 text-white" />
                  </div>
                  Kredi Kartları ({creditCards.length})
                </CardTitle>
                <CardDescription>Tüm kredi kartlarınızın kullanım durumu</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {creditCards.map(card => {
                  const limit = parseFloat(card.limitAmount || '0')
                  const available = parseFloat(card.availableLimit || '0')
                  const used = limit - available
                  const usagePercent = (used / limit) * 100

                  return (
                    <div key={card.uniqueId} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="font-medium text-slate-800">{card.name}</div>
                          <div className="text-xs text-slate-500">{card.bank?.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-purple-600">
                            {formatCurrency(used, card.currency?.code || 'TRY')}
                          </div>
                          <div className="text-xs text-slate-500">
                            / {formatCurrency(limit, card.currency?.code || 'TRY')}
                          </div>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${usagePercent > 80
                              ? 'bg-gradient-to-r from-red-500 to-rose-500'
                              : usagePercent > 50
                                ? 'bg-gradient-to-r from-orange-500 to-amber-500'
                                : 'bg-gradient-to-r from-green-500 to-emerald-500'
                            }`}
                          style={{ width: `${usagePercent}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-500">
                          Müsait: {formatCurrency(available, 'TRY')}
                        </span>
                        <span
                          className={`text-xs font-medium ${usagePercent > 80
                              ? 'text-red-600'
                              : usagePercent > 50
                                ? 'text-orange-600'
                                : 'text-green-600'
                            }`}
                        >
                          %{usagePercent.toFixed(0)} kullanılmış
                        </span>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
          )}

          {/* Altın Eşyaları Detay */}
          {goldItems.length > 0 && (
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-yellow-500 to-amber-600 shadow-md">
                    <Coins className="h-5 w-5 text-white" />
                  </div>
                  Altın & Ziynet Eşyaları ({goldItems.length})
                </CardTitle>
                <CardDescription>Altın portföyünüzün detayları</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {goldItems.map(gold => {
                    const value = parseFloat(gold.currentValueTry || gold.purchasePrice || '0')
                    const percentage = totalGoldValue > 0 ? (value / totalGoldValue) * 100 : 0

                    return (
                      <div key={gold.uniqueId} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <div className="font-medium text-slate-800">{gold.name}</div>
                            <div className="text-xs text-slate-500">
                              {gold.weightGrams}g · {gold.goldPurity?.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-yellow-600">
                              {formatCurrency(value, 'TRY')}
                            </div>
                            <div className="text-xs text-slate-500">{percentage.toFixed(1)}%</div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Varlık Özet Tablosu */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              Varlık Özeti
            </CardTitle>
            <CardDescription>Portföyünüzün genel durum özeti</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-600">
                      Kategori
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                      Adet
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                      Değer
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-slate-600">
                      Oran
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-blue-50">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm">Banka Hesapları</span>
                    </td>
                    <td className="text-right py-3 px-4 text-sm">{bankAccounts.length}</td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-blue-600">
                      {formatCurrency(totalBankBalance, 'TRY')}
                    </td>
                    <td className="text-right py-3 px-4 text-sm">{bankPercentage.toFixed(1)}%</td>
                  </tr>
                  <tr className="border-b hover:bg-yellow-50">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                      <span className="text-sm">Altın & Ziynet</span>
                    </td>
                    <td className="text-right py-3 px-4 text-sm">{goldItems.length}</td>
                    <td className="text-right py-3 px-4 text-sm font-semibold text-yellow-600">
                      {formatCurrency(totalGoldValue, 'TRY')}
                    </td>
                    <td className="text-right py-3 px-4 text-sm">{goldPercentage.toFixed(1)}%</td>
                  </tr>
                  <tr className="border-b bg-emerald-50/50">
                    <td className="py-3 px-4 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-sm font-bold">TOPLAM VARLIK</span>
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-bold">
                      {bankAccounts.length + goldItems.length}
                    </td>
                    <td className="text-right py-3 px-4 text-lg font-bold text-emerald-600">
                      {formatCurrency(totalAssets, 'TRY')}
                    </td>
                    <td className="text-right py-3 px-4 text-sm font-bold">100%</td>
                  </tr>
                  {totalCreditCardDebt > 0 && (
                    <tr className="border-b bg-rose-50/50">
                      <td className="py-3 px-4 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <span className="text-sm font-bold">Toplam Borç</span>
                      </td>
                      <td className="text-right py-3 px-4 text-sm font-bold">
                        {creditCards.length}
                      </td>
                      <td className="text-right py-3 px-4 text-lg font-bold text-rose-600">
                        -{formatCurrency(totalCreditCardDebt, 'TRY')}
                      </td>
                      <td className="text-right py-3 px-4 text-sm"></td>
                    </tr>
                  )}
                  <tr className="bg-gradient-to-r from-teal-50 to-emerald-50">
                    <td className="py-4 px-4 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-teal-500"></div>
                      <span className="text-base font-bold text-teal-900">NET DEĞER</span>
                    </td>
                    <td className="text-right py-4 px-4"></td>
                    <td className="text-right py-4 px-4 text-2xl font-bold text-teal-600">
                      {formatCurrency(netWorth, 'TRY')}
                    </td>
                    <td className="text-right py-4 px-4 text-sm font-bold text-teal-600">
                      {((netWorth / totalAssets) * 100).toFixed(0)}%
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200/50">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-500/10">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-800 mb-1">Gelir/Gider Senkronizasyonu</h4>
                  <p className="text-sm text-slate-600">
                    Tüm gelir ve gider işlemleriniz hesap bakiyelerinize otomatik yansıtılmaktadır.
                    Yukarıdaki hesap bakiyeleri <span className="font-semibold">canlı</span> ve{' '}
                    <span className="font-semibold">güncel</span> verilerdir.
                  </p>
                  <div className="mt-2 text-xs text-slate-500">
                    ✅ Gelir → Hesap bakiyesi artar → Toplam varlık artar
                    <br />
                    ✅ Gider → Hesap bakiyesi azalır → Toplam varlık azalır
                    <br />
                    ✅ Kart harcama → Müsait limit azalır → Borç artar
                    <br />✅ Kart ödeme → Müsait limit artar → Borç azalır
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hızlı Aksiyonlar */}
        <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-gray-50">
          <CardHeader>
            <CardTitle>Hızlı İşlemler</CardTitle>
            <CardDescription>Portföyünüzü yönetmek için hızlı erişim</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Link
                href="/transactions/new-income"
                className="p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors text-center"
              >
                <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Gelir Ekle</div>
              </Link>

              <Link
                href="/transactions/new-expense"
                className="p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors text-center"
              >
                <TrendingDown className="h-8 w-8 text-red-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Gider Ekle</div>
              </Link>

              <Link
                href="/accounts/new"
                className="p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors text-center"
              >
                <Wallet className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Hesap Ekle</div>
              </Link>

              <Link
                href="/gold/new"
                className="p-4 border-2 border-yellow-200 rounded-lg hover:bg-yellow-50 transition-colors text-center"
              >
                <Coins className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <div className="text-sm font-medium">Altın Ekle</div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
