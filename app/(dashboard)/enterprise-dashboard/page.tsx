'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'
import { useUser } from '@/lib/user-context'
import { getDisplayName } from '@/lib/utils'
import { formatCurrency } from '@/lib/validators'
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  AlertCircle,
  BarChart3,
  Crown,
  Award,
  Diamond,
} from 'lucide-react'

interface EnterpriseDashboardData {
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
}

export default function EnterpriseDashboardPage() {
  const { user, loading } = useUser()
  const [data, setData] = useState<EnterpriseDashboardData | null>(null)
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      if (loading) {
        return
      }

      if (!user) {
        setData(null)
        setError(null)
        setDataLoading(false)
        return
      }

      try {
        setDataLoading(true)
        setError(null)

        const response = await fetch('/api/dashboard', {
          credentials: 'include',
        })

        if (!response.ok) {
          // 401 hatası normaldir (kullanıcı giriş yapmamış)
          if (response.status === 401) {
            setDataLoading(false)
            return
          }
          throw new Error('Dashboard verileri alınamadı')
        }

        const dashboardData = (await response.json()) as EnterpriseDashboardData
        setData(dashboardData)
      } catch (err) {
        console.error('Dashboard data fetch error:', err)
        setError('Dashboard verileri yüklenirken bir hata oluştu')
      } finally {
        setDataLoading(false)
      }
    }

    void fetchDashboardData()
  }, [user, loading])

  if (loading || dataLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-24 w-24 border-t-4 border-b-4 border-amber-500 mx-auto mb-8"></div>
          <p className="text-2xl font-bold text-amber-400">Ultra Premium Dashboard Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-24 w-24 text-red-500 mx-auto mb-8" />
          <p className="text-2xl font-bold text-red-400">
            {error || 'Dashboard verileri yüklenemedi'}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Ultra Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-500/20 to-orange-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-purple-500/20 to-pink-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 sm:w-96 sm:h-96 bg-gradient-to-br from-emerald-500/10 to-teal-600/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Floating Tech Elements */}
      <div className="absolute inset-0">
        {Array.from({ length: 50 }, (_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-amber-400/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <div className="relative z-10">
        {/* Ultra Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-amber-500/30 sticky top-0 z-20">
          <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center space-x-2 sm:space-x-4 mb-2">
                  <Diamond className="h-6 sm:h-8 w-6 sm:w-8 text-amber-400 animate-pulse" />
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
                    ULTRA PREMIUM DASHBOARD
                  </h1>
                  <Crown className="h-6 sm:h-8 w-6 sm:w-8 text-amber-400 animate-pulse" />
                </div>
                <p className="text-amber-200 text-sm sm:text-base lg:text-lg">
                  Enterprise-grade financial intelligence platform
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 sm:gap-6">
                {/* Ultra Premium Badge */}
                <div className="flex items-center space-x-3 bg-gradient-to-r from-amber-500/30 to-orange-500/30 backdrop-blur-xl rounded-full px-6 py-3 border-2 border-amber-500/50">
                  <Award className="h-6 w-6 text-amber-400" />
                  <span className="text-amber-400 font-black text-lg">ULTRA PREMIUM</span>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-amber-200 font-semibold">Quantum Live Data</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Welcome Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="max-w-7xl mx-auto">
            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-xl rounded-3xl p-4 sm:p-6 lg:p-8 border-2 border-amber-500/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black text-white mb-2">
                    Hoş geldin,{' '}
                    <span className="text-amber-400">
                      {user ? getDisplayName(user) : 'Kullanıcı'}
                    </span>
                    ! 👑
                  </h2>
                  <p className="text-amber-200 text-sm sm:text-lg">
                    Ultra Premium Enterprise üyeliğiniz aktif. Tüm gelişmiş özellikler
                    kullanımınızda.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <div className="text-lg sm:text-2xl font-black text-amber-400 mb-1">ULTRA PREMIUM</div>
                  <div className="text-amber-200 text-sm">Enterprise Member</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6 lg:pb-8 space-y-6 sm:space-y-8">
          {/* Ultra KPI Cards */}
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 backdrop-blur-xl border-2 border-emerald-500/30 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold text-emerald-200">Toplam Gelir</CardTitle>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-mosaic-lg group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                    {formatCurrency(parseFloat(data.kpi.total_income), 'TRY')}
                  </div>
                  <p className="text-emerald-200 text-sm mt-2">
                    Son 30 günde {data.kpi.income_count} işlem
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-red-500/20 to-rose-500/20 backdrop-blur-xl border-2 border-red-500/30 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold text-red-200">Toplam Gider</CardTitle>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-mosaic-lg group-hover:scale-110 transition-transform">
                    <TrendingDown className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-transparent">
                    {formatCurrency(parseFloat(data.kpi.total_expense), 'TRY')}
                  </div>
                  <p className="text-red-200 text-sm mt-2">
                    Son 30 günde {data.kpi.expense_count} işlem
                  </p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-blue-500/20 to-indigo-500/20 backdrop-blur-xl border-2 border-blue-500/30 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold text-blue-200">Net Durum</CardTitle>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-mosaic-lg group-hover:scale-110 transition-transform flex items-center justify-center">
                    <span className="text-3xl font-bold text-white">₺</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-4xl font-black bg-clip-text text-transparent ${
                      parseFloat(data.kpi.net_amount) >= 0
                        ? 'bg-gradient-to-r from-emerald-400 to-teal-400'
                        : 'bg-gradient-to-r from-red-400 to-rose-400'
                    }`}
                  >
                    {formatCurrency(parseFloat(data.kpi.net_amount), 'TRY')}
                  </div>
                  <p className="text-blue-200 text-sm mt-2">Son 30 gün net sonuç</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-2xl transition-all duration-300 border-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-xl border-2 border-purple-500/30 hover:scale-105">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-lg font-bold text-purple-200">Toplam İşlem</CardTitle>
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-mosaic-lg group-hover:scale-110 transition-transform">
                    <CreditCard className="h-6 w-6 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                    {parseInt(data.kpi.income_count) + parseInt(data.kpi.expense_count)}
                  </div>
                  <p className="text-purple-200 text-sm mt-2">Son 30 günde toplam işlem</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Ultra Content Grid */}
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
            {/* Ultra Upcoming Payments */}
            <Card className="border-0 shadow-2xl bg-black/20 backdrop-blur-xl border-2 border-amber-500/30">
              <CardHeader className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-t-3xl">
                <CardTitle className="flex items-center gap-4 text-2xl font-black text-amber-200">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-mosaic-lg">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  Yaklaşan Ödemeler
                </CardTitle>
                <CardDescription className="text-amber-300 text-lg">
                  Ultra Premium kredi kartı ödeme tarihleri
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {data.upcomingPayments.length > 0 ? (
                  <div className="space-y-6">
                    {data.upcomingPayments.map(payment => (
                      <div
                        key={payment.id}
                        className="group p-6 border-2 border-amber-500/30 rounded-2xl hover:bg-amber-500/10 transition-all duration-200 bg-gradient-to-r from-amber-500/5 to-orange-500/5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-base sm:text-xl text-amber-200 break-words">{payment.name}</p>
                            <p className="text-amber-300 text-sm sm:text-lg">{payment.bank_name}</p>
                            <p className="text-amber-400 text-sm mt-1 sm:mt-2">
                              Vade: {payment.due_day}. gün
                            </p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <p className="font-black text-xl sm:text-2xl text-red-400">
                              {formatCurrency(parseFloat(payment.current_debt), 'TRY')}
                            </p>
                            <p className="text-amber-400 text-sm">
                              Min: {formatCurrency(parseFloat(payment.min_payment), 'TRY')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                      <AlertCircle className="h-12 w-12 text-amber-400" />
                    </div>
                    <p className="text-amber-300 font-bold text-xl">Yaklaşan ödeme bulunmuyor</p>
                    <p className="text-amber-400 text-lg mt-2">Tüm ödemeleriniz güncel</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ultra Category Breakdown */}
            <Card className="border-0 shadow-2xl bg-black/20 backdrop-blur-xl border-2 border-purple-500/30">
              <CardHeader className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-t-3xl">
                <CardTitle className="flex items-center gap-4 text-2xl font-black text-purple-200">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-mosaic-lg">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  Kategori Dağılımı
                </CardTitle>
                <CardDescription className="text-purple-300 text-lg">
                  Son 30 gün kategori bazlı harcamalar
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                {data.categoryBreakdown.length > 0 ? (
                  <div className="space-y-6">
                    {data.categoryBreakdown.slice(0, 8).map((category, index) => (
                      <div
                        key={index}
                        className="group flex items-center justify-between p-4 rounded-2xl hover:bg-purple-500/10 transition-colors border border-purple-500/20"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-6 h-6 rounded-full shadow-mosaic ${
                              category.tx_type_name === 'Gelir'
                                ? 'bg-gradient-to-br from-emerald-400 to-teal-500'
                                : 'bg-gradient-to-br from-red-400 to-rose-500'
                            }`}
                          />
                          <span className="text-lg font-bold text-purple-200">
                            {category.category_name}
                          </span>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-lg font-black ${
                              category.tx_type_name === 'Gelir'
                                ? 'text-emerald-400'
                                : 'text-red-400'
                            }`}
                          >
                            {formatCurrency(parseFloat(category.total_amount), 'TRY')}
                          </p>
                          <p className="text-purple-400 text-sm">
                            {category.transaction_count} işlem
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <AlertCircle className="h-12 w-12 text-purple-400" />
                    </div>
                    <p className="text-purple-300 font-bold text-xl">Kategori verisi bulunmuyor</p>
                    <p className="text-purple-400 text-lg mt-2">Henüz işlem kaydı yok</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
