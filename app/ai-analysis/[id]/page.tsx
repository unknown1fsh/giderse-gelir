'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Home,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  Download,
  Sparkles,
  BarChart3,
  PieChart,
  Target,
  AlertTriangle,
  Lightbulb,
  Zap,
  DollarSign,
  Percent,
  Award,
  Shield,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'

interface AIReportData {
  summary: {
    totalIncome: number
    totalExpense: number
    netAmount: number
    savingsRate: number
    period: string
  }
  categoryAnalysis: Array<{
    category: string
    amount: number
    percentage: number
    count: number
    trend: 'up' | 'down' | 'stable'
  }>
  topCategories: Array<{
    category: string
    amount: number
    trend: string
  }>
  cashFlow: Array<{
    month: string
    income: number
    expense: number
    balance: number
  }>
  insights: Array<{
    type: 'savings' | 'optimization' | 'investment' | 'risk' | 'trend'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    impact: string
  }>
  predictions?: {
    next3Months: Array<{
      month: string
      predictedIncome: number
      predictedExpense: number
      confidence: number
    }>
    recommendations: string[]
  }
  riskAnalysis?: {
    overallRisk: 'low' | 'medium' | 'high'
    riskFactors: Array<{
      factor: string
      level: 'low' | 'medium' | 'high'
      description: string
    }>
    mitigation: string[]
  }
  benchmarks?: Array<{
    category: string
    yourAverage: number
    industryAverage: number
    percentile: number
  }>
}

interface ReportInfo {
  id: number
  reportType: string
  reportDate: string
  monthYear: string
  reportData: AIReportData
  status: string
  createdAt: string
}

export default function AIReportDetailPage() {
  const router = useRouter()
  const params = useParams()
  const [report, setReport] = useState<ReportInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const reportId = params.id as string

    async function fetchReport() {
      try {
        const response = await fetch(`/api/ai-analysis/report/${reportId}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError('Rapor bulunamadı')
          } else {
            setError('Rapor yüklenirken hata oluştu')
          }
          return
        }

        const result = (await response.json()) as {
          success: boolean
          data: ReportInfo
        }

        if (result.success) {
          setReport(result.data)
        }
      } catch (err) {
        console.error('Fetch report error:', err)
        setError('Rapor yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    if (reportId) {
      void fetchReport()
    } else {
      setLoading(false)
    }
  }, [params.id])

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'savings':
        return <TrendingUp className="h-5 w-5 text-green-600" />
      case 'optimization':
        return <Zap className="h-5 w-5 text-blue-600" />
      case 'investment':
        return <Target className="h-5 w-5 text-purple-600" />
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-red-600" />
      case 'trend':
        return <TrendingDown className="h-5 w-5 text-orange-600" />
      default:
        return <Lightbulb className="h-5 w-5 text-yellow-600" />
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-xs">
            Yüksek Öncelik
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="default" className="text-xs">
            Orta Öncelik
          </Badge>
        )
      case 'low':
        return (
          <Badge variant="secondary" className="text-xs">
            Düşük Öncelik
          </Badge>
        )
      default:
        return null
    }
  }

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case 'high':
        return (
          <Badge variant="destructive" className="text-sm">
            Yüksek Risk
          </Badge>
        )
      case 'medium':
        return (
          <Badge variant="default" className="text-sm">
            Orta Risk
          </Badge>
        )
      case 'low':
        return (
          <Badge variant="secondary" className="text-sm">
            Düşük Risk
          </Badge>
        )
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Rapor Yüklenemedi</h2>
            <p className="text-slate-600 mb-6">{error || 'Rapor bulunamadı'}</p>
            <Button onClick={() => router.push('/ai-analysis')} variant="outline">
              Geri Dön
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const reportData = report.reportData

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-10">
        <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/ai-analysis')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <Link
                href="/dashboard"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Home className="h-5 w-5" />
              </Link>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    AI Analiz Raporu
                  </h1>
                  <p className="text-slate-600">
                    {new Date(report.reportDate).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={report.status === 'completed' ? 'default' : 'secondary'}>
                {report.status === 'completed' ? 'Tamamlandı' : report.status}
              </Badge>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                PDF İndir
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Finansal Özet */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <DollarSign className="h-5 w-5 text-purple-600" />
              Finansal Özet
            </CardTitle>
            <CardDescription>Dönem: {reportData.summary.period}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium text-green-900">Toplam Gelir</span>
                </div>
                <div className="text-2xl font-bold text-green-700">
                  {formatCurrency(reportData.summary.totalIncome, 'TRY')}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingDown className="h-5 w-5 text-red-600" />
                  <span className="text-sm font-medium text-red-900">Toplam Gider</span>
                </div>
                <div className="text-2xl font-bold text-red-700">
                  {formatCurrency(reportData.summary.totalExpense, 'TRY')}
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Net Tutar</span>
                </div>
                <div
                  className={`text-2xl font-bold ${reportData.summary.netAmount >= 0 ? 'text-blue-700' : 'text-red-700'}`}
                >
                  {formatCurrency(reportData.summary.netAmount, 'TRY')}
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center gap-2 mb-2">
                  <Percent className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">Tasarruf Oranı</span>
                </div>
                <div className="text-2xl font-bold text-purple-700">
                  {reportData.summary.savingsRate.toFixed(1)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kategori Analizi */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <PieChart className="h-5 w-5 text-purple-600" />
              Kategori Analizi
            </CardTitle>
            <CardDescription>En çok harcama yapılan kategoriler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.topCategories.slice(0, 5).map((category, index) => {
                const categoryData = reportData.categoryAnalysis.find(
                  c => c.category === category.category
                )
                return (
                  <div key={category.category} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold">
                          {index + 1}
                        </div>
                        <span className="font-semibold text-slate-900">{category.category}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-slate-900">
                          {formatCurrency(category.amount, 'TRY')}
                        </div>
                        {categoryData && (
                          <div className="text-sm text-slate-600">
                            %{categoryData.percentage.toFixed(1)} | {categoryData.count} işlem
                          </div>
                        )}
                      </div>
                    </div>
                    {categoryData && (
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                          style={{ width: `${categoryData.percentage}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* AI Önerileri */}
        <Card className="bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-purple-600" />
              AI Önerileri ({reportData.insights.length})
            </CardTitle>
            <CardDescription>Yapay zeka destekli finansal öneriler ve analizler</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {reportData.insights.map((insight, index) => (
                <div
                  key={index}
                  className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-white">{getInsightIcon(insight.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-slate-900">{insight.title}</h3>
                        {getPriorityBadge(insight.priority)}
                      </div>
                      <p className="text-sm text-slate-700 mb-2">{insight.description}</p>
                      <div className="flex items-center gap-2 text-xs text-purple-700 font-medium">
                        <Zap className="h-3 w-3" />
                        <span>{insight.impact}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Nakit Akış */}
        {reportData.cashFlow.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Nakit Akış Analizi
              </CardTitle>
              <CardDescription>Son ayların gelir/gider trendi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {reportData.cashFlow.map((flow, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-900">{flow.month}</span>
                      <Badge
                        variant={flow.balance >= 0 ? 'default' : 'destructive'}
                        className="text-sm"
                      >
                        {formatCurrency(flow.balance, 'TRY')}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-green-700 font-medium">Gelir:</span>{' '}
                        <span className="text-slate-700">{formatCurrency(flow.income, 'TRY')}</span>
                      </div>
                      <div>
                        <span className="text-red-700 font-medium">Gider:</span>{' '}
                        <span className="text-slate-700">
                          {formatCurrency(flow.expense, 'TRY')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gelecek Tahminleri */}
        {reportData.predictions && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-5 w-5 text-purple-600" />
                Gelecek Tahminleri
              </CardTitle>
              <CardDescription>AI destekli gelecek aylar tahmini</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.predictions.next3Months.map((prediction, index) => (
                  <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900">{prediction.month}</span>
                      <Badge variant="outline" className="text-xs">
                        {prediction.confidence.toFixed(0)}% Güven
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-2">
                      <div>
                        <span className="text-sm text-green-700">Tahmini Gelir:</span>
                        <div className="font-bold text-green-900">
                          {formatCurrency(prediction.predictedIncome, 'TRY')}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-red-700">Tahmini Gider:</span>
                        <div className="font-bold text-red-900">
                          {formatCurrency(prediction.predictedExpense, 'TRY')}
                        </div>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-blue-200">
                      <span className="text-sm text-blue-700">
                        Tahmini Net:{' '}
                        {formatCurrency(
                          prediction.predictedIncome - prediction.predictedExpense,
                          'TRY'
                        )}
                      </span>
                    </div>
                  </div>
                ))}
                {reportData.predictions.recommendations.length > 0 && (
                  <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <h4 className="font-semibold text-purple-900 mb-2">Öneriler:</h4>
                    <ul className="space-y-1">
                      {reportData.predictions.recommendations.map((rec, index) => (
                        <li key={index} className="text-sm text-purple-800 flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 mt-0.5 text-purple-600" />
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Risk Analizi */}
        {reportData.riskAnalysis && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-purple-600" />
                Risk Analizi
              </CardTitle>
              <CardDescription>Finansal risk faktörleri ve önlemler</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-slate-900">Genel Risk Seviyesi</span>
                  {getRiskBadge(reportData.riskAnalysis.overallRisk)}
                </div>
              </div>

              {reportData.riskAnalysis.riskFactors.length > 0 && (
                <div className="space-y-3 mb-4">
                  {reportData.riskAnalysis.riskFactors.map((factor, index) => (
                    <div key={index} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-slate-900">{factor.factor}</span>
                        {getRiskBadge(factor.level)}
                      </div>
                      <p className="text-sm text-slate-700">{factor.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {reportData.riskAnalysis.mitigation.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-semibold text-green-900 mb-2">Önlem Önerileri:</h4>
                  <ul className="space-y-1">
                    {reportData.riskAnalysis.mitigation.map((mit, index) => (
                      <li key={index} className="text-sm text-green-800 flex items-start gap-2">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-green-600" />
                        <span>{mit}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Benchmark Karşılaştırmaları */}
        {reportData.benchmarks && reportData.benchmarks.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Award className="h-5 w-5 text-purple-600" />
                Benchmark Karşılaştırmaları
              </CardTitle>
              <CardDescription>Endüstri ortalamaları ile karşılaştırma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reportData.benchmarks.map((benchmark, index) => (
                  <div key={index} className="p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-slate-900">{benchmark.category}</span>
                      <Badge
                        variant={benchmark.percentile >= 50 ? 'default' : 'secondary'}
                        className="text-sm"
                      >
                        %{benchmark.percentile.toFixed(0)} Percentil
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Sizin Ortalamanız:</span>
                        <div className="font-bold text-slate-900">
                          {formatCurrency(benchmark.yourAverage, 'TRY')}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-600">Endüstri Ortalaması:</span>
                        <div className="font-bold text-slate-900">
                          {formatCurrency(benchmark.industryAverage, 'TRY')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
