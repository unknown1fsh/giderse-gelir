'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, PageHeader } from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import {
  ArrowLeft,
  Home,
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  AlertCircle,
  Lightbulb,
  CheckCircle2,
  Trophy,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Sparkles,
  Brain,
  RefreshCw,
  BarChart3,
  PieChart,
  FileText,
  Download,
  Zap,
  Shield,
  Clock,
  DollarSign,
} from 'lucide-react'

interface AnalysisData {
  // KPI'lar
  totalIncome: number
  totalExpense: number
  netWorth: number
  totalAssets: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyNet: number

  // Trend verileri
  incomeGrowth: number
  expenseGrowth: number
  savingsRate: number

  // Kategori analizi
  topCategories: Array<{
    name: string
    amount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>

  // Son işlemler
  recentTransactions: Array<{
    id: number
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
  }>

  // AI önerileri
  aiInsights: Array<{
    type: 'warning' | 'suggestion' | 'achievement'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }>

  // Nakit akışı
  cashFlowData: Array<{
    month: string
    income: number
    expense: number
    net: number
  }>
}

type TabType = 'overview' | 'insights' | 'categories' | 'trends'

export default function AnalysisPage() {
  const { error: toastError } = useToast()
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (fetchedRef.current) {
      return
    }
    fetchedRef.current = true
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    fetchedRef.current = false
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod])

  async function fetchData() {
    try {
      setLoading(true)
      const response = await fetch(`/api/analysis?period=${selectedPeriod}`, {
        credentials: 'include',
      })
      if (response.ok) {
        const data = await response.json()
        setAnalysisData(data)
      } else {
        toastError('Hata', 'Analiz verileri yüklenemedi')
      }
    } catch (error) {
      console.error('Analiz verileri yüklenirken hata:', error)
      toastError('Hata', 'Analiz verileri yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchedRef.current = false
    void fetchData()
  }

  // Finansal sağlık skoru hesaplama
  const calculateHealthScore = () => {
    if (!analysisData) {
      return 0
    }
    let score = 50 // Başlangıç

    // Tasarruf oranına göre puan
    if (analysisData.savingsRate >= 20) {
      score += 25
    } else if (analysisData.savingsRate >= 10) {
      score += 15
    } else if (analysisData.savingsRate >= 5) {
      score += 10
    } else if (analysisData.savingsRate < 0) {
      score -= 15
    }

    // Gelir büyümesine göre puan
    if (analysisData.incomeGrowth > 0) {
      score += 10
    } else if (analysisData.incomeGrowth < -10) {
      score -= 10
    }

    // Gider büyümesine göre puan
    if (analysisData.expenseGrowth < 0) {
      score += 10
    } else if (analysisData.expenseGrowth > 20) {
      score -= 15
    }

    // Net değere göre puan
    if (analysisData.netWorth > 0) {
      score += 5
    }

    return Math.min(100, Math.max(0, score))
  }

  const healthScore = calculateHealthScore()

  const getHealthColor = (score: number) => {
    if (score >= 80) {
      return { bg: 'from-green-500 to-emerald-600', text: 'text-green-400', label: 'Mükemmel' }
    }
    if (score >= 60) {
      return { bg: 'from-blue-500 to-cyan-600', text: 'text-blue-400', label: 'İyi' }
    }
    if (score >= 40) {
      return { bg: 'from-yellow-500 to-orange-600', text: 'text-yellow-600', label: 'Orta' }
    }
    return { bg: 'from-red-500 to-rose-600', text: 'text-red-400', label: 'Dikkat' }
  }

  const healthInfo = getHealthColor(healthScore)

  // Akıllı öneriler oluşturma
  const generateSmartInsights = () => {
    if (!analysisData) {
      return []
    }

    const insights: Array<{
      type: 'success' | 'warning' | 'tip' | 'goal'
      icon: React.ReactNode
      title: string
      description: string
      action?: string
      actionLink?: string
    }> = []

    // Tasarruf analizi
    if (analysisData.savingsRate >= 20) {
      insights.push({
        type: 'success',
        icon: <Trophy className="h-5 w-5 text-yellow-500" />,
        title: 'Harika Tasarruf Oranı!',
        description: `%${analysisData.savingsRate.toFixed(1)} tasarruf oranı ile finansal hedeflerinize hızla ilerliyorsunuz.`,
      })
    } else if (analysisData.savingsRate < 10 && analysisData.savingsRate >= 0) {
      insights.push({
        type: 'tip',
        icon: <PiggyBank className="h-5 w-5 text-blue-500" />,
        title: 'Tasarruf Oranını Artırın',
        description: `Mevcut %${analysisData.savingsRate.toFixed(1)} tasarruf oranınızı artırmak için gereksiz harcamaları azaltmayı düşünün.`,
        action: 'Harcamaları İncele',
        actionLink: '/transactions',
      })
    } else if (analysisData.savingsRate < 0) {
      insights.push({
        type: 'warning',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        title: 'Bütçe Aşımı Uyarısı',
        description: 'Bu dönem harcamalarınız gelirinizi aştı. Acil önlem almanız önerilir.',
        action: 'Bütçe Oluştur',
        actionLink: '/budgets',
      })
    }

    // Gelir trend analizi
    if (analysisData.incomeGrowth > 10) {
      insights.push({
        type: 'success',
        icon: <TrendingUp className="h-5 w-5 text-green-500" />,
        title: 'Gelir Artışı Trendi',
        description: `Geliriniz geçen döneme göre %${analysisData.incomeGrowth.toFixed(1)} arttı. Bu trendi korumaya devam edin!`,
      })
    } else if (analysisData.incomeGrowth < -10) {
      insights.push({
        type: 'warning',
        icon: <TrendingDown className="h-5 w-5 text-orange-500" />,
        title: 'Gelir Düşüşü Tespit Edildi',
        description: `Gelirinizde %${Math.abs(analysisData.incomeGrowth).toFixed(1)} düşüş var. Ek gelir kaynakları değerlendirilebilir.`,
      })
    }

    // Gider trend analizi
    if (analysisData.expenseGrowth > 20) {
      insights.push({
        type: 'warning',
        icon: <AlertCircle className="h-5 w-5 text-red-500" />,
        title: 'Harcama Artışı',
        description: `Harcamalarınız %${analysisData.expenseGrowth.toFixed(1)} arttı. Harcama kategorilerinizi gözden geçirin.`,
        action: 'Kategorileri İncele',
        actionLink: '/analysis/categories',
      })
    } else if (analysisData.expenseGrowth < 0) {
      insights.push({
        type: 'success',
        icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        title: 'Harcama Kontrolü Başarılı',
        description: `Harcamalarınızı %${Math.abs(analysisData.expenseGrowth).toFixed(1)} azalttınız. Harika bir ilerleme!`,
      })
    }

    // En yüksek harcama kategorisi analizi
    if (analysisData.topCategories && analysisData.topCategories.length > 0) {
      const topCategory = analysisData.topCategories[0]
      if (topCategory.percentage > 40) {
        insights.push({
          type: 'tip',
          icon: <Lightbulb className="h-5 w-5 text-yellow-500" />,
          title: 'Harcama Yoğunlaşması',
          description: `"${topCategory.name}" kategorisi toplam harcamalarınızın %${topCategory.percentage.toFixed(1)}'ini oluşturuyor. Çeşitlendirme düşünebilirsiniz.`,
        })
      }
    }

    // Hedef önerisi
    insights.push({
      type: 'goal',
      icon: <Target className="h-5 w-5 text-purple-500" />,
      title: 'Finansal Hedef Belirleyin',
      description: 'Belirli bir tasarruf hedefi belirleyerek motivasyonunuzu artırın.',
      action: 'Hedef Oluştur',
      actionLink: '/goals',
    })

    return insights
  }

  const smartInsights = generateSmartInsights()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-800 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-300">Finansal analiz hazırlanıyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Finansal Analiz Merkezi"
        description="AI destekli akıllı finansal öneriler ve dönemsel içgörüler."
        breadcrumbs={[{ label: 'Analiz' }]}
        leadingActions={[
          {
            href: '/dashboard',
            ariaLabel: 'Dashboard',
            icon: <Home className="h-5 w-5" />,
          },
        ]}
        onBack={() => window.history.back()}
        backIcon={<ArrowLeft className="h-5 w-5" />}
        actions={(
          <div className="flex items-center gap-3">
            <select
              value={selectedPeriod}
              onChange={e => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-slate-700 rounded-lg bg-slate-800/80 backdrop-blur-xl text-sm focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent"
            >
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 3 Ay</option>
              <option value="1y">Son 1 Yıl</option>
            </select>
            <button
              onClick={handleRefresh}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <RefreshCw className="h-5 w-5 text-slate-300" />
            </button>
          </div>
        )}
      />

      <div>
        {/* Finansal Sağlık Skoru */}
        <div className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 rounded-2xl p-6 sm:p-8 shadow-mosaic-lg mb-6 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-transparent to-blue-600/10" />
          <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl bg-gradient-to-br ${healthInfo.bg}`}>
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Finansal Sağlık Skoru</h2>
                  <p className="text-slate-400 text-sm">Genel finansal durumunuzun değerlendirmesi</p>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-bold text-white">{healthScore}</span>
                  <span className="text-2xl text-slate-400 mb-1">/100</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthInfo.text} bg-white/10`}>
                    {healthInfo.label}
                  </span>
                </div>
                <div className="mt-3 w-full bg-slate-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full bg-gradient-to-r ${healthInfo.bg} transition-all duration-1000`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Özet İstatistikler */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center">
                <DollarSign className="h-5 w-5 text-green-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Gelir</p>
                <p className="text-lg font-bold text-white">{formatCurrency(analysisData?.totalIncome || 0, 'TRY')}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center">
                <TrendingDown className="h-5 w-5 text-red-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Gider</p>
                <p className="text-lg font-bold text-white">{formatCurrency(analysisData?.totalExpense || 0, 'TRY')}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center">
                <PiggyBank className="h-5 w-5 text-blue-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Tasarruf</p>
                <p className="text-lg font-bold text-white">%{(analysisData?.savingsRate || 0).toFixed(1)}</p>
              </div>
              <div className="bg-white/5 backdrop-blur-xl rounded-xl p-4 text-center">
                <Wallet className="h-5 w-5 text-purple-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Net Varlık</p>
                <p className="text-lg font-bold text-white">{formatCurrency(analysisData?.netWorth || 0, 'TRY')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-6 bg-slate-800/60 backdrop-blur-xl p-2 rounded-xl shadow-sm">
          {[
            { id: 'overview', label: 'Genel Bakış', icon: BarChart3 },
            { id: 'insights', label: 'Akıllı Öneriler', icon: Sparkles },
            { id: 'categories', label: 'Kategoriler', icon: PieChart },
            { id: 'trends', label: 'Trendler', icon: TrendingUp },
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === tab.id
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-300 hover:bg-slate-800 hover:shadow-sm'
                  }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="group hover:shadow-mosaic transition-all duration-300 border-0 bg-gradient-to-br from-green-500/10 to-emerald-500/10 hover:from-green-500/20 hover:to-emerald-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md group-hover:scale-110 transition-transform">
                      <ArrowUpRight className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs flex items-center gap-1 ${(analysisData?.incomeGrowth || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analysisData?.incomeGrowth || 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {(analysisData?.incomeGrowth || 0).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">Toplam Gelir</p>
                  <p className="text-xl font-bold text-green-400">{formatCurrency(analysisData?.totalIncome || 0, 'TRY')}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-mosaic transition-all duration-300 border-0 bg-gradient-to-br from-red-500/10 to-rose-500/10 hover:from-red-500/20 hover:to-rose-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-red-500 to-rose-600 shadow-md group-hover:scale-110 transition-transform">
                      <ArrowDownRight className="h-4 w-4 text-white" />
                    </div>
                    <span className={`text-xs flex items-center gap-1 ${(analysisData?.expenseGrowth || 0) <= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {(analysisData?.expenseGrowth || 0) >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {(analysisData?.expenseGrowth || 0).toFixed(1)}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">Toplam Gider</p>
                  <p className="text-xl font-bold text-red-400">{formatCurrency(analysisData?.totalExpense || 0, 'TRY')}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-mosaic transition-all duration-300 border-0 bg-gradient-to-br from-blue-500/10 to-cyan-50 hover:from-blue-500/20 hover:to-cyan-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-600 shadow-md group-hover:scale-110 transition-transform">
                      <PiggyBank className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">Tasarruf Oranı</p>
                  <p className="text-xl font-bold text-blue-400">%{(analysisData?.savingsRate || 0).toFixed(1)}</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-mosaic transition-all duration-300 border-0 bg-gradient-to-br from-purple-500/10 to-indigo-500/10 hover:from-purple-500/20 hover:to-indigo-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 shadow-md group-hover:scale-110 transition-transform">
                      <Wallet className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 mb-1">Toplam Varlık</p>
                  <p className="text-xl font-bold text-purple-400">{formatCurrency(analysisData?.totalAssets || 0, 'TRY')}</p>
                </CardContent>
              </Card>
            </div>

            {/* Son İşlemler ve Hızlı Öneriler */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Son İşlemler */}
              <Card className="border-0 shadow-mosaic bg-slate-800/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Calendar className="h-5 w-5 text-blue-400" />
                    Son İşlemler
                  </CardTitle>
                  <CardDescription>En güncel finansal hareketleriniz</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analysisData?.recentTransactions?.slice(0, 5).map(transaction => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg hover:bg-slate-700/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-3 h-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                              }`}
                          />
                          <div>
                            <p className="text-sm font-medium text-slate-100">{transaction.description}</p>
                            <p className="text-xs text-slate-500">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-sm font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                              }`}
                          >
                            {transaction.type === 'income' ? '+' : '-'}
                            {formatCurrency(transaction.amount, 'TRY')}
                          </p>
                          <p className="text-xs text-slate-500">
                            {new Date(transaction.date).toLocaleDateString('tr-TR')}
                          </p>
                        </div>
                      </div>
                    ))}
                    {(!analysisData?.recentTransactions || analysisData.recentTransactions.length === 0) && (
                      <div className="text-center py-8 text-slate-500">
                        <Clock className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p>Henüz işlem bulunmuyor</p>
                      </div>
                    )}
                  </div>
                  <Link
                    href="/transactions"
                    className="flex items-center justify-center gap-2 mt-4 w-full py-2 text-blue-400 hover:bg-blue-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Tüm İşlemleri Gör
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>

              {/* Hızlı Öneriler */}
              <Card className="border-0 shadow-mosaic bg-slate-800/80 backdrop-blur-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                    Akıllı Öneriler
                  </CardTitle>
                  <CardDescription>Size özel AI destekli öneriler</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {smartInsights.slice(0, 3).map((insight, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-lg border ${insight.type === 'success' ? 'bg-green-50 border-green-200' :
                          insight.type === 'warning' ? 'bg-red-50 border-red-200' :
                            insight.type === 'tip' ? 'bg-blue-50 border-blue-200' :
                              'bg-purple-50 border-purple-200'
                          }`}
                      >
                        <div className="flex items-start gap-3">
                          {insight.icon}
                          <div className="flex-1">
                            <h4 className="font-semibold text-sm text-slate-100">{insight.title}</h4>
                            <p className="text-xs text-slate-300 mt-1">{insight.description}</p>
                            {insight.action && insight.actionLink && (
                              <Link
                                href={insight.actionLink}
                                className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-blue-400 hover:text-blue-400"
                              >
                                {insight.action}
                                <ChevronRight className="h-3 w-3" />
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setActiveTab('insights')}
                    className="flex items-center justify-center gap-2 mt-4 w-full py-2 text-purple-400 hover:bg-purple-50 rounded-lg text-sm font-medium transition-colors"
                  >
                    Tüm Önerileri Gör
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </CardContent>
              </Card>
            </div>

            {/* Hızlı Erişim */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                href="/transactions/new"
                className="p-4 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 text-white text-center hover:shadow-mosaic hover:scale-105 transition-all"
              >
                <Zap className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Gelir Ekle</span>
              </Link>
              <Link
                href="/transactions/new"
                className="p-4 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-center hover:shadow-mosaic hover:scale-105 transition-all"
              >
                <TrendingDown className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Gider Ekle</span>
              </Link>
              <Link
                href="/analysis/export"
                className="p-4 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-center hover:shadow-mosaic hover:scale-105 transition-all"
              >
                <Download className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Rapor İndir</span>
              </Link>
              <Link
                href="/accounts"
                className="p-4 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 text-white text-center hover:shadow-mosaic hover:scale-105 transition-all"
              >
                <Wallet className="h-6 w-6 mx-auto mb-2" />
                <span className="text-sm font-medium">Hesaplarım</span>
              </Link>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <div className="space-y-4">
            <Card className="border-0 shadow-mosaic bg-gradient-to-r from-purple-500/10 to-blue-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-purple-400" />
                  AI Finansal Asistan
                </CardTitle>
                <CardDescription>Finansal verileriniz analiz edilerek size özel öneriler oluşturuldu</CardDescription>
              </CardHeader>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {smartInsights.map((insight, index) => (
                <Card
                  key={index}
                  className={`border-0 shadow-md hover:shadow-mosaic transition-all ${insight.type === 'success' ? 'bg-gradient-to-br from-green-500/10 to-emerald-500/10' :
                    insight.type === 'warning' ? 'bg-gradient-to-br from-red-500/10 to-rose-500/10' :
                      insight.type === 'tip' ? 'bg-gradient-to-br from-blue-500/10 to-cyan-50' :
                        'bg-gradient-to-br from-purple-500/10 to-pink-500/10'
                    }`}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${insight.type === 'success' ? 'bg-green-500/15' :
                        insight.type === 'warning' ? 'bg-red-500/15' :
                          insight.type === 'tip' ? 'bg-blue-500/15' :
                            'bg-purple-500/15'
                        }`}>
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-slate-100 mb-1">{insight.title}</h3>
                        <p className="text-sm text-slate-300">{insight.description}</p>
                        {insight.action && insight.actionLink && (
                          <Link
                            href={insight.actionLink}
                            className={`inline-flex items-center gap-1 mt-3 px-3 py-1.5 rounded-lg text-sm font-medium ${insight.type === 'success' ? 'bg-green-600 text-white' :
                              insight.type === 'warning' ? 'bg-red-600 text-white' :
                                insight.type === 'tip' ? 'bg-blue-600 text-white' :
                                  'bg-purple-600 text-white'
                              }`}
                          >
                            {insight.action}
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="space-y-6">
            <Card className="border-0 shadow-mosaic bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-6 w-6 text-green-400" />
                  Harcama Kategorileri
                </CardTitle>
                <CardDescription>En çok harcama yaptığınız kategorilerin analizi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analysisData?.topCategories?.map((category, index) => {
                    const colors = [
                      'from-blue-500 to-indigo-600',
                      'from-green-500 to-emerald-600',
                      'from-purple-500 to-pink-600',
                      'from-orange-500 to-red-600',
                      'from-cyan-500 to-blue-600',
                    ]
                    return (
                      <div key={index} className="p-4 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${colors[index % colors.length]}`} />
                            <span className="font-medium text-slate-100">{category.name}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-slate-100">{formatCurrency(category.amount, 'TRY')}</span>
                            <span className="text-slate-500 text-sm ml-2">(%{category.percentage.toFixed(1)})</span>
                          </div>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full bg-gradient-to-r ${colors[index % colors.length]} transition-all duration-500`}
                            style={{ width: `${category.percentage}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                  {(!analysisData?.topCategories || analysisData.topCategories.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      <PieChart className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p>Henüz kategori verisi bulunmuyor</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'trends' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-0 shadow-mosaic bg-gradient-to-br from-green-500/10 to-emerald-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-400">
                    <TrendingUp className="h-5 w-5" />
                    Gelir Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-green-400">
                      {(analysisData?.incomeGrowth || 0) >= 0 ? '+' : ''}
                      {(analysisData?.incomeGrowth || 0).toFixed(1)}%
                    </p>
                    <p className="text-slate-300 mt-2">Geçen döneme göre değişim</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-mosaic bg-gradient-to-br from-red-500/10 to-rose-500/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-400">
                    <TrendingDown className="h-5 w-5" />
                    Gider Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-4">
                    <p className="text-4xl font-bold text-red-400">
                      {(analysisData?.expenseGrowth || 0) >= 0 ? '+' : ''}
                      {(analysisData?.expenseGrowth || 0).toFixed(1)}%
                    </p>
                    <p className="text-slate-300 mt-2">Geçen döneme göre değişim</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="border-0 shadow-mosaic bg-slate-800/80 backdrop-blur-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                  Aylık Nakit Akışı
                </CardTitle>
                <CardDescription>Son dönem gelir-gider dengesi</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analysisData?.cashFlowData?.slice(0, 6).map((data, index) => (
                    <div key={index} className="p-4 bg-slate-800/50 rounded-xl">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-200">{data.month}</span>
                        <span className={`font-bold ${data.net >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {data.net >= 0 ? '+' : ''}{formatCurrency(data.net, 'TRY')}
                        </span>
                      </div>
                      <div className="flex gap-2 text-xs text-slate-500">
                        <span className="text-green-400">Gelir: {formatCurrency(data.income, 'TRY')}</span>
                        <span>•</span>
                        <span className="text-red-400">Gider: {formatCurrency(data.expense, 'TRY')}</span>
                      </div>
                    </div>
                  ))}
                  {(!analysisData?.cashFlowData || analysisData.cashFlowData.length === 0) && (
                    <div className="text-center py-8 text-slate-500">
                      <BarChart3 className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p>Henüz nakit akışı verisi bulunmuyor</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Detaylı Analiz Linkleri */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold text-slate-100 mb-4">Detaylı Analizler</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link href="/analysis/cashflow" className="group">
              <Card className="border-0 bg-slate-800/80 hover:shadow-mosaic transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-slate-100">Nakit Akışı</p>
                  <p className="text-xs text-slate-500">Detaylı analiz</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/analysis/categories" className="group">
              <Card className="border-0 bg-slate-800/80 hover:shadow-mosaic transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <PieChart className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-slate-100">Kategoriler</p>
                  <p className="text-xs text-slate-500">Harcama dağılımı</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/analysis/trends" className="group">
              <Card className="border-0 bg-slate-800/80 hover:shadow-mosaic transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-slate-100">Trendler</p>
                  <p className="text-xs text-slate-500">Gelir/Gider trendleri</p>
                </CardContent>
              </Card>
            </Link>
            <Link href="/analysis/export" className="group">
              <Card className="border-0 bg-slate-800/80 hover:shadow-mosaic transition-all hover:scale-105">
                <CardContent className="p-4 text-center">
                  <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <p className="font-medium text-slate-100">Raporlar</p>
                  <p className="text-xs text-slate-500">PDF/Excel export</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
