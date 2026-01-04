'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/validators'
import { useUser } from '@/lib/user-context'
import { getDisplayName } from '@/lib/utils'
import { useToast } from '@/lib/use-toast'
import DashboardSkeleton from '@/components/dashboard/dashboard-skeleton'
import {
  TrendingUp,
  TrendingDown,
  CreditCard,
  Calendar,
  AlertCircle,
  BarChart3,
  Crown,
  Sparkles,
  Award,
  Star,
  User,
  Wallet,
  PiggyBank,
  Target,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Brain,
  Shield,
  Clock,
  DollarSign,
  Building2,
  Coins,
  Receipt,
  RefreshCw,
} from 'lucide-react'

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
    netWorth: string
  }
}

export default function DashboardPage() {
  const { user, loading, refreshUser } = useUser()
  const { error: toastError } = useToast()
  const [data, setData] = useState<DashboardData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(new Date())
  const fetchedRef = useRef(false)

  // Saat güncelleme
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Plan değişikliklerini dinle
  useEffect(() => {
    const handlePlanChange = () => {
      void refreshUser()
    }
    window.addEventListener('plan-changed', handlePlanChange)
    return () => window.removeEventListener('plan-changed', handlePlanChange)
  }, [refreshUser])

  useEffect(() => {
    if (fetchedRef.current || loading || !user) {
      return
    }
    fetchedRef.current = true
    void fetchDashboardData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading])

  async function fetchDashboardData() {
    try {
      setError(null)
      const response = await fetch('/api/dashboard', { credentials: 'include' })
      if (!response.ok) {
        if (response.status === 401) {
          return
        }
        throw new Error('Dashboard verileri alınamadı')
      }
      const dashboardData = (await response.json()) as DashboardData
      setData(dashboardData)
    } catch (err) {
      console.error('Dashboard data fetch error:', err)
      setError('Dashboard verileri yüklenirken bir hata oluştu')
      toastError('Hata', 'Dashboard verileri yüklenemedi')
    }
  }

  const handleRefresh = () => {
    fetchedRef.current = false
    void fetchDashboardData()
  }

  // Karşılama mesajı
  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 6) {
      return { text: 'İyi geceler', emoji: '🌙' }
    }
    if (hour < 12) {
      return { text: 'Günaydın', emoji: '☀️' }
    }
    if (hour < 18) {
      return { text: 'İyi günler', emoji: '🌤️' }
    }
    return { text: 'İyi akşamlar', emoji: '🌆' }
  }

  const greeting = getGreeting()

  // Finansal sağlık skoru hesaplama
  const calculateHealthScore = () => {
    if (!data) {
      return 0
    }
    const income = parseFloat(data.kpi.total_income) || 0
    const expense = parseFloat(data.kpi.total_expense) || 0
    const netWorth = parseFloat(data.assets.netWorth) || 0

    let score = 50

    // Gelir-gider dengesi
    if (income > expense) {
      const savingsRate = ((income - expense) / income) * 100
      if (savingsRate >= 20) {
        score += 25
      } else if (savingsRate >= 10) {
        score += 15
      } else {
        score += 5
      }
    } else if (income < expense) {
      score -= 20
    }

    // Net varlık
    if (netWorth > 0) {
      score += 15
    } else if (netWorth < 0) {
      score -= 10
    }

    // Kart borcu kontrolü
    const cardDebt = parseFloat(data.assets.totalCardDebt) || 0
    if (cardDebt === 0) {
      score += 10
    } else if (cardDebt > income * 0.5) {
      score -= 15
    }

    return Math.min(100, Math.max(0, score))
  }

  const healthScore = calculateHealthScore()

  const getHealthInfo = (score: number) => {
    if (score >= 80) {
      return { color: 'from-green-500 to-emerald-600', label: 'Mükemmel', textColor: 'text-green-600' }
    }
    if (score >= 60) {
      return { color: 'from-blue-500 to-cyan-600', label: 'İyi', textColor: 'text-blue-600' }
    }
    if (score >= 40) {
      return { color: 'from-yellow-500 to-orange-600', label: 'Orta', textColor: 'text-yellow-600' }
    }
    return { color: 'from-red-500 to-rose-600', label: 'Dikkat', textColor: 'text-red-600' }
  }

  const healthInfo = getHealthInfo(healthScore)

  // Hızlı işlemler
  const quickActions = [
    { icon: Plus, label: 'Gelir Ekle', href: '/transactions/new?type=income', color: 'from-green-500 to-emerald-600' },
    { icon: TrendingDown, label: 'Gider Ekle', href: '/transactions/new?type=expense', color: 'from-red-500 to-rose-600' },
    { icon: Wallet, label: 'Hesaplar', href: '/accounts', color: 'from-blue-500 to-indigo-600' },
    { icon: Brain, label: 'Analiz', href: '/analysis', color: 'from-purple-500 to-pink-600' },
  ]

  if (loading) {
    return <DashboardSkeleton />
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="inline-flex p-4 rounded-full bg-red-100 mb-4">
            <AlertCircle className="h-16 w-16 text-red-500" />
          </div>
          <p className="text-red-600 font-semibold text-lg">{error}</p>
          <button onClick={handleRefresh} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return <DashboardSkeleton />
  }

  const netAmount = parseFloat(data.kpi.net_amount) || 0
  const totalIncome = parseFloat(data.kpi.total_income) || 0
  const totalExpense = parseFloat(data.kpi.total_expense) || 0
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Hero Welcome Section */}
        <div className="relative overflow-hidden bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10" />
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl" />

          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-slate-400 text-sm">{greeting.emoji} {greeting.text}</p>
                  <h1 className="text-2xl sm:text-3xl font-bold text-white">
                    {user ? getDisplayName(user) : 'Kullanıcı'}
                  </h1>
                </div>
                {/* Premium Badge */}
                {user && user.plan !== 'free' && (
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${user.plan === 'enterprise_premium' ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30' :
                      user.plan === 'enterprise' ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30' :
                        'bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30'
                    }`}>
                    {user.plan === 'enterprise_premium' ? <Award className="h-4 w-4 text-amber-400" /> :
                      user.plan === 'enterprise' ? <Star className="h-4 w-4 text-emerald-400" /> :
                        <Crown className="h-4 w-4 text-purple-400" />}
                    <span className="text-xs font-semibold text-white">
                      {user.plan === 'enterprise_premium' ? 'Kurumsal Premium' :
                        user.plan === 'enterprise' ? 'Kurumsal' : 'Premium'}
                    </span>
                  </div>
                )}
              </div>

              {/* Net Varlık Hero */}
              <div className="mb-4">
                <p className="text-slate-400 text-sm mb-1">Toplam Net Varlık</p>
                <div className="flex items-baseline gap-3">
                  <span className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white">
                    {formatCurrency(parseFloat(data.assets.netWorth), 'TRY')}
                  </span>
                </div>
              </div>

              {/* Mini Stats */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                  <div className="w-2 h-2 rounded-full bg-green-400" />
                  <span className="text-sm text-slate-300">Gelir: {formatCurrency(totalIncome, 'TRY')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                  <div className="w-2 h-2 rounded-full bg-red-400" />
                  <span className="text-sm text-slate-300">Gider: {formatCurrency(totalExpense, 'TRY')}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5">
                  <Clock className="h-3 w-3 text-slate-400" />
                  <span className="text-sm text-slate-300">Son 30 gün</span>
                </div>
              </div>
            </div>

            {/* Finansal Sağlık Skoru */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10 min-w-[200px]">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Shield className="h-5 w-5 text-slate-400" />
                  <span className="text-sm text-slate-400">Finansal Sağlık</span>
                </div>
                <div className="relative w-24 h-24 mx-auto mb-3">
                  <svg className="w-24 h-24 transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="8" fill="none" className="text-slate-700" />
                    <circle
                      cx="48" cy="48" r="40"
                      stroke="url(#healthGradient)"
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="round"
                      strokeDasharray={`${healthScore * 2.51} 251`}
                      className="transition-all duration-1000"
                    />
                    <defs>
                      <linearGradient id="healthGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" className={healthInfo.textColor.replace('text', 'stop')} stopColor="currentColor" />
                        <stop offset="100%" className={healthInfo.textColor.replace('text', 'stop')} stopColor="currentColor" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{healthScore}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthInfo.textColor} bg-white/10`}>
                  {healthInfo.label}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Hızlı İşlemler */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <Link
                key={index}
                href={action.href}
                className={`group p-4 rounded-xl bg-gradient-to-br ${action.color} text-white text-center hover:shadow-xl hover:scale-105 transition-all duration-300`}
              >
                <Icon className="h-6 w-6 mx-auto mb-2 group-hover:scale-110 transition-transform" />
                <span className="text-sm font-medium">{action.label}</span>
              </Link>
            )
          })}
        </div>

        {/* Özet Kartlar - Compact Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Gelir */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md group-hover:scale-110 transition-transform">
                  <ArrowUpRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500">{data.kpi.income_count} işlem</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Toplam Gelir</p>
              <p className="text-xl font-bold text-green-600">{formatCurrency(totalIncome, 'TRY')}</p>
            </CardContent>
          </Card>

          {/* Gider */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-red-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-md group-hover:scale-110 transition-transform">
                  <ArrowDownRight className="h-4 w-4 text-white" />
                </div>
                <span className="text-xs text-slate-500">{data.kpi.expense_count} işlem</span>
              </div>
              <p className="text-xs text-slate-600 mb-1">Toplam Gider</p>
              <p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense, 'TRY')}</p>
            </CardContent>
          </Card>

          {/* Net Durum */}
          <Card className={`group hover:shadow-lg transition-all duration-300 border-0 overflow-hidden relative ${netAmount >= 0 ? 'bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100' : 'bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100'
            }`}>
            <div className="absolute top-0 right-0 w-20 h-20 bg-blue-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform ${netAmount >= 0 ? 'bg-gradient-to-br from-blue-500 to-indigo-600' : 'bg-gradient-to-br from-orange-500 to-red-600'
                  }`}>
                  <DollarSign className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-1">Net Durum</p>
              <p className={`text-xl font-bold ${netAmount >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                {netAmount >= 0 ? '+' : ''}{formatCurrency(netAmount, 'TRY')}
              </p>
            </CardContent>
          </Card>

          {/* Tasarruf Oranı */}
          <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200/30 rounded-full -mr-10 -mt-10" />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-md group-hover:scale-110 transition-transform">
                  <PiggyBank className="h-4 w-4 text-white" />
                </div>
              </div>
              <p className="text-xs text-slate-600 mb-1">Tasarruf Oranı</p>
              <p className={`text-xl font-bold ${savingsRate >= 0 ? 'text-purple-600' : 'text-red-600'}`}>
                %{savingsRate.toFixed(1)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Varlık Dağılımı */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50">
            <CardTitle className="flex items-center gap-3 text-slate-800">
              <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 shadow-md">
                <Wallet className="h-5 w-5 text-white" />
              </div>
              Varlık Dağılımı
            </CardTitle>
            <CardDescription>Finansal varlıklarınızın özeti</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 border border-cyan-100">
                <div className="flex items-center gap-2 mb-2">
                  <Building2 className="h-4 w-4 text-cyan-600" />
                  <span className="text-xs text-slate-600">Hesap Bakiyeleri</span>
                </div>
                <p className="text-lg font-bold text-cyan-600">{formatCurrency(parseFloat(data.assets.totalAccountBalance), 'TRY')}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-yellow-50 to-amber-50 border border-yellow-100">
                <div className="flex items-center gap-2 mb-2">
                  <Coins className="h-4 w-4 text-amber-600" />
                  <span className="text-xs text-slate-600">Altın Değeri</span>
                </div>
                <p className="text-lg font-bold text-amber-600">{formatCurrency(parseFloat(data.assets.totalGoldValue), 'TRY')}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-rose-50 to-pink-50 border border-rose-100">
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="h-4 w-4 text-rose-600" />
                  <span className="text-xs text-slate-600">Kart Borcu</span>
                </div>
                <p className="text-lg font-bold text-rose-600">{formatCurrency(parseFloat(data.assets.totalCardDebt), 'TRY')}</p>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs text-slate-600">Toplam Varlık</span>
                </div>
                <p className="text-lg font-bold text-emerald-600">{formatCurrency(parseFloat(data.assets.totalAssets), 'TRY')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İki Sütunlu Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Yaklaşan Ödemeler */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-red-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-600 shadow-md">
                    <Calendar className="h-5 w-5 text-white" />
                  </div>
                  Yaklaşan Ödemeler
                </div>
                <Link href="/cards" className="text-sm text-orange-600 hover:text-orange-700 flex items-center gap-1">
                  Tümü <ChevronRight className="h-4 w-4" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {data.upcomingPayments.length > 0 ? (
                <div className="space-y-3">
                  {data.upcomingPayments.slice(0, 4).map(payment => (
                    <div
                      key={payment.id}
                      className="group p-4 border border-slate-200 rounded-xl hover:shadow-md transition-all duration-200 bg-gradient-to-r from-slate-50 to-slate-100/50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-800">{payment.name}</p>
                          <p className="text-sm text-slate-600">{payment.bank_name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span className="text-xs text-slate-500">Vade: {payment.due_day}. gün</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-lg text-red-600">
                            {formatCurrency(parseFloat(payment.current_debt), 'TRY')}
                          </p>
                          <p className="text-xs text-slate-500">
                            Min: {formatCurrency(parseFloat(payment.min_payment), 'TRY')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    <Sparkles className="h-7 w-7 text-green-500" />
                  </div>
                  <p className="text-slate-600 font-medium">Harika! Yaklaşan ödeme yok</p>
                  <p className="text-sm text-slate-400 mt-1">Tüm ödemeleriniz güncel</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Kategori Dağılımı */}
          <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-t-lg">
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-800">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                    <BarChart3 className="h-5 w-5 text-white" />
                  </div>
                  Kategori Dağılımı
                </div>
                <Link href="/analysis/categories" className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                  Detay <ChevronRight className="h-4 w-4" />
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              {data.categoryBreakdown.length > 0 ? (
                <div className="space-y-3">
                  {data.categoryBreakdown.slice(0, 6).map((category, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${category.tx_type_name === 'Gelir'
                              ? 'bg-gradient-to-br from-green-400 to-emerald-500'
                              : 'bg-gradient-to-br from-red-400 to-rose-500'
                            }`}
                        />
                        <span className="text-sm font-medium text-slate-700">{category.category_name}</span>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${category.tx_type_name === 'Gelir' ? 'text-green-600' : 'text-red-600'
                          }`}>
                          {formatCurrency(parseFloat(category.total_amount), 'TRY')}
                        </p>
                        <p className="text-xs text-slate-500">{category.transaction_count} işlem</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    <Receipt className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium">Kategori verisi bulunmuyor</p>
                  <p className="text-sm text-slate-400 mt-1">Henüz işlem kaydı yok</p>
                  <Link href="/transactions/new" className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                    <Plus className="h-4 w-4" /> İlk İşlemi Ekle
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alt Kısım - Hızlı Erişim Kartları */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link href="/transactions" className="group">
            <Card className="border-0 bg-white/80 hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Receipt className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-slate-800">İşlemler</p>
                <p className="text-xs text-slate-500">Tüm işlemleri gör</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/investments" className="group">
            <Card className="border-0 bg-white/80 hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-slate-800">Yatırımlar</p>
                <p className="text-xs text-slate-500">Portföy yönetimi</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/cards" className="group">
            <Card className="border-0 bg-white/80 hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <CreditCard className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-slate-800">Kartlarım</p>
                <p className="text-xs text-slate-500">Kredi kartları</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/settings" className="group">
            <Card className="border-0 bg-white/80 hover:shadow-lg transition-all hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="mx-auto w-12 h-12 bg-gradient-to-br from-slate-500 to-slate-700 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Target className="h-6 w-6 text-white" />
                </div>
                <p className="font-medium text-slate-800">Ayarlar</p>
                <p className="text-xs text-slate-500">Hesap ayarları</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Canlı Veri İndikatörü */}
        <div className="flex items-center justify-center gap-3 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Canlı veri</span>
          </div>
          <span>•</span>
          <span>{currentTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</span>
          <button onClick={handleRefresh} className="flex items-center gap-1 hover:text-blue-600 transition-colors">
            <RefreshCw className="h-3 w-3" />
            <span>Yenile</span>
          </button>
        </div>
      </div>
    </div>
  )
}
