'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  PieChart,
  FileText,
  ArrowLeft,
  Home,
  Calendar,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Wallet,
  Download,
  Brain,
  Lightbulb,
  Zap,
  Eye,
  RefreshCw,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'

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

export default function AnalysisPage() {
  const router = useRouter()
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedPeriod, setSelectedPeriod] = useState('30d')

  useEffect(() => {
    async function fetchAnalysisData() {
      try {
        const response = await fetch(`/api/analysis?period=${selectedPeriod}`, {
          credentials: 'include',
        })
        if (response.ok) {
          const data = await response.json()
          setAnalysisData(data)
        } else {
          setError('Analiz verileri yüklenemedi')
        }
      } catch (error) {
        console.error('Analiz verileri yüklenirken hata:', error)
        setError('Analiz verileri yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysisData()
  }, [selectedPeriod])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case 'suggestion':
        return <Lightbulb className="h-4 w-4 text-blue-500" />
      case 'achievement':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Brain className="h-4 w-4 text-purple-500" />
    }
  }

  const getInsightColor = (type: string) => {
    switch (type) {
      case 'warning':
        return 'border-orange-200 bg-orange-50'
      case 'suggestion':
        return 'border-blue-200 bg-blue-50'
      case 'achievement':
        return 'border-green-200 bg-green-50'
      default:
        return 'border-purple-200 bg-purple-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingDown className="h-3 w-3 text-red-500" />
      default:
        return <div className="h-3 w-3 rounded-full bg-gray-400" />
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-to-br from-slate-50 to-blue-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-white/80 rounded-lg transition-colors backdrop-blur-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <Link
            href="/dashboard"
            className="p-2 hover:bg-white/80 rounded-lg transition-colors backdrop-blur-sm"
          >
            <Home className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gradient">Finansal Analiz Merkezi</h1>
            <p className="text-slate-600">AI destekli finansal analiz ve akıllı öneriler</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedPeriod}
            onChange={e => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white/80 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Son 7 Gün</option>
            <option value="30d">Son 30 Gün</option>
            <option value="90d">Son 3 Ay</option>
            <option value="1y">Son 1 Yıl</option>
          </select>
          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm"
            className="bg-white/80 backdrop-blur-sm"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      </div>

      {/* Ana KPI'lar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card
          variant="premium"
          className="group border-0 bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl hover:shadow-glow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Toplam Gelir</CardTitle>
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <TrendingUp className="h-4 w-4 opacity-90" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysisData?.totalIncome || 0, 'TRY')}
            </div>
            <p className="text-xs opacity-80 flex items-center gap-1">
              {analysisData?.incomeGrowth && analysisData.incomeGrowth > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(analysisData?.incomeGrowth || 0).toFixed(1)}% geçen aya göre
            </p>
          </CardContent>
        </Card>

        <Card
          variant="premium"
          className="group border-0 bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-xl hover:shadow-glow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Toplam Gider</CardTitle>
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <TrendingDown className="h-4 w-4 opacity-90" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysisData?.totalExpense || 0, 'TRY')}
            </div>
            <p className="text-xs opacity-80 flex items-center gap-1">
              {analysisData?.expenseGrowth && analysisData.expenseGrowth > 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(analysisData?.expenseGrowth || 0).toFixed(1)}% geçen aya göre
            </p>
          </CardContent>
        </Card>

        <Card
          variant="premium"
          className="group border-0 bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl hover:shadow-glow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Net Değer</CardTitle>
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <Wallet className="h-4 w-4 opacity-90" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysisData?.netWorth || 0, 'TRY')}
            </div>
            <p className="text-xs opacity-80">
              {analysisData?.savingsRate?.toFixed(1 || 0)}% tasarruf oranı
            </p>
          </CardContent>
        </Card>

        <Card
          variant="premium"
          className="group border-0 bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-xl hover:shadow-glow-lg transition-all duration-300"
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium opacity-90">Toplam Varlık</CardTitle>
            <div className="p-2 rounded-lg bg-white/20 backdrop-blur-sm group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
              <span className="text-xl font-bold opacity-90">₺</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(analysisData?.totalAssets || 0, 'TRY')}
            </div>
            <p className="text-xs opacity-80">Portföy değeri</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Önerileri */}
      <Card
        variant="glass"
        className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 hover:shadow-glow transition-all duration-300"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient-premium">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 shadow-glow">
              <Brain className="h-5 w-5 text-white" />
            </div>
            AI Finansal Asistan Önerileri
          </CardTitle>
          <CardDescription>
            Yapay zeka destekli kişiselleştirilmiş finansal öneriler
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analysisData?.aiInsights?.map((insight, index) => (
              <div key={index} className={`p-4 rounded-lg border ${getInsightColor(insight.type)}`}>
                <div className="flex items-start gap-3">
                  {getInsightIcon(insight.type)}
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">{insight.title}</h4>
                    <p className="text-xs text-gray-600">{insight.description}</p>
                    <div className="mt-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          insight.priority === 'high'
                            ? 'bg-red-100 text-red-700'
                            : insight.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-green-100 text-green-700'
                        }`}
                      >
                        {insight.priority === 'high'
                          ? 'Yüksek Öncelik'
                          : insight.priority === 'medium'
                            ? 'Orta Öncelik'
                            : 'Düşük Öncelik'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Kategori Analizi */}
        <Card
          variant="glass"
          className="border-0 shadow-lg hover:shadow-glow-lg transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-glow">
                <PieChart className="h-5 w-5 text-white" />
              </div>
              Harcama Kategorileri
            </CardTitle>
            <CardDescription>En çok harcama yaptığınız kategoriler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisData?.topCategories?.slice(0, 5).map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />
                    <span className="text-sm font-medium">{category.name}</span>
                    {getTrendIcon(category.trend)}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {formatCurrency(category.amount, 'TRY')}
                    </div>
                    <div className="text-xs text-gray-500">%{category.percentage.toFixed(1)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Son İşlemler */}
        <Card
          variant="glass"
          className="border-0 shadow-lg hover:shadow-glow-lg transition-all duration-300"
        >
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-glow">
                <Calendar className="h-5 w-5 text-white" />
              </div>
              Son İşlemler
            </CardTitle>
            <CardDescription>En son gerçekleşen finansal işlemleriniz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {analysisData?.recentTransactions?.slice(0, 5).map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <p className="text-sm font-medium">{transaction.description}</p>
                      <p className="text-xs text-gray-500">{transaction.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-sm font-bold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount, 'TRY')}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.date).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Hızlı Aksiyonlar */}
      <Card
        variant="glass"
        className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 hover:shadow-glow transition-all duration-300"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-gradient">
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 shadow-glow">
              <Zap className="h-5 w-5 text-white" />
            </div>
            Hızlı Aksiyonlar
          </CardTitle>
          <CardDescription>Finansal durumunuzu iyileştirmek için hızlı adımlar</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/transactions/new">
              <Button
                variant="success"
                className="w-full hover:shadow-glow transition-all duration-300"
              >
                <span className="text-lg font-bold mr-2">₺</span>
                Gelir Ekle
              </Button>
            </Link>
            <Link href="/transactions/new">
              <Button className="w-full bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white border-0 hover:shadow-glow transition-all duration-300">
                <TrendingDown className="h-4 w-4 mr-2" />
                Gider Ekle
              </Button>
            </Link>
            <Link href="/analysis/export">
              <Button
                variant="outline"
                className="w-full glass hover:shadow-glow transition-all duration-300"
              >
                <Download className="h-4 w-4 mr-2" />
                Rapor İndir
              </Button>
            </Link>
            <Link href="/portfolio">
              <Button
                variant="outline"
                className="w-full glass hover:shadow-glow transition-all duration-300"
              >
                <Eye className="h-4 w-4 mr-2" />
                Portföy Görüntüle
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Detaylı Analiz Linkleri */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link href="/analysis/cashflow">
          <Card
            variant="glass"
            className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer group border-0 hover:scale-[1.02]"
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-gradient">Nakit Akışı</CardTitle>
              <CardDescription>Detaylı nakit akış analizi ve tahminleri</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/analysis/categories">
          <Card
            variant="glass"
            className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer group border-0 hover:scale-[1.02]"
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-gradient-finance">Kategori Analizi</CardTitle>
              <CardDescription>Harcama kategorileri detaylı analizi</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/analysis/trends">
          <Card
            variant="glass"
            className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer group border-0 hover:scale-[1.02]"
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-gradient-premium">Trend Analizi</CardTitle>
              <CardDescription>Gelir ve gider trend analizleri</CardDescription>
            </CardHeader>
          </Card>
        </Link>

        <Link href="/analysis/export">
          <Card
            variant="glass"
            className="hover:shadow-glow-lg transition-all duration-300 cursor-pointer group border-0 hover:scale-[1.02]"
          >
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-glow transition-all duration-300">
                <FileText className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-lg text-gradient-expense">Rapor Export</CardTitle>
              <CardDescription>PDF ve Excel raporları oluştur</CardDescription>
            </CardHeader>
          </Card>
        </Link>
      </div>
    </div>
  )
}
