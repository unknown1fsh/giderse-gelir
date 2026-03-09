'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  AppPageShell,
  Button,
  Card,
  CardContent,
  DashboardCard,
  QuickActionTile,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatsGrid,
} from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import {
  AlertCircle,
  BarChart3,
  Brain,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  Lightbulb,
  PieChart,
  PiggyBank,
  RefreshCw,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  Wallet,
} from 'lucide-react'

interface AnalysisData {
  totalIncome: number
  totalExpense: number
  netWorth: number
  totalAssets: number
  monthlyIncome: number
  monthlyExpense: number
  monthlyNet: number
  incomeGrowth: number
  expenseGrowth: number
  savingsRate: number
  topCategories: Array<{
    name: string
    amount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>
  recentTransactions: Array<{
    id: number
    description: string
    amount: number
    type: 'income' | 'expense'
    category: string
    date: string
  }>
  aiInsights: Array<{
    type: 'warning' | 'suggestion' | 'achievement'
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
  }>
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
    if (fetchedRef.current) { return }
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

  const calculateHealthScore = () => {
    if (!analysisData) { return 0 }
    let score = 50
    if (analysisData.savingsRate >= 20) { score += 25 }
    else if (analysisData.savingsRate >= 10) { score += 15 }
    else if (analysisData.savingsRate >= 5) { score += 10 }
    else if (analysisData.savingsRate < 0) { score -= 15 }
    if (analysisData.incomeGrowth > 0) { score += 10 }
    else if (analysisData.incomeGrowth < -10) { score -= 10 }
    if (analysisData.expenseGrowth < 0) { score += 10 }
    else if (analysisData.expenseGrowth > 20) { score -= 15 }
    if (analysisData.netWorth > 0) { score += 5 }
    return Math.min(100, Math.max(0, score))
  }

  const healthScore = calculateHealthScore()

  const getHealthStyle = (score: number) => {
    if (score >= 80) { return { bar: 'from-emerald-500 to-green-600', badge: 'bg-emerald-500/15 text-emerald-300', label: 'Mükemmel' } }
    if (score >= 60) { return { bar: 'from-cyan-500 to-blue-600', badge: 'bg-cyan-500/15 text-cyan-300', label: 'İyi' } }
    if (score >= 40) { return { bar: 'from-amber-500 to-orange-500', badge: 'bg-amber-500/15 text-amber-300', label: 'Orta' } }
    return { bar: 'from-rose-500 to-red-600', badge: 'bg-rose-500/15 text-rose-300', label: 'Dikkat' }
  }

  const healthStyle = getHealthStyle(healthScore)

  const generateSmartInsights = () => {
    if (!analysisData) { return [] }

    const insights: Array<{
      type: 'success' | 'warning' | 'tip' | 'goal'
      icon: React.ReactNode
      title: string
      description: string
      action?: string
      actionLink?: string
      borderColor: string
      iconBg: string
    }> = []

    if (analysisData.savingsRate >= 20) {
      insights.push({
        type: 'success',
        icon: <Trophy className="h-5 w-5 text-amber-400" />,
        title: 'Harika Tasarruf Oranı!',
        description: `%${analysisData.savingsRate.toFixed(1)} tasarruf oranı ile finansal hedeflerinize hızla ilerliyorsunuz.`,
        borderColor: 'border-emerald-500/20',
        iconBg: 'bg-emerald-500/10',
      })
    } else if (analysisData.savingsRate < 10 && analysisData.savingsRate >= 0) {
      insights.push({
        type: 'tip',
        icon: <PiggyBank className="h-5 w-5 text-cyan-400" />,
        title: 'Tasarruf Oranını Artırın',
        description: `Mevcut %${analysisData.savingsRate.toFixed(1)} tasarruf oranınızı artırmak için gereksiz harcamaları azaltmayı düşünün.`,
        action: 'Harcamaları İncele',
        actionLink: '/transactions',
        borderColor: 'border-cyan-500/20',
        iconBg: 'bg-cyan-500/10',
      })
    } else if (analysisData.savingsRate < 0) {
      insights.push({
        type: 'warning',
        icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
        title: 'Bütçe Aşımı Uyarısı',
        description: 'Bu dönem harcamalarınız gelirinizi aştı. Acil önlem almanız önerilir.',
        action: 'Bütçe Oluştur',
        actionLink: '/budgets',
        borderColor: 'border-rose-500/20',
        iconBg: 'bg-rose-500/10',
      })
    }

    if (analysisData.incomeGrowth > 10) {
      insights.push({
        type: 'success',
        icon: <TrendingUp className="h-5 w-5 text-emerald-400" />,
        title: 'Gelir Artışı Trendi',
        description: `Geliriniz geçen döneme göre %${analysisData.incomeGrowth.toFixed(1)} arttı. Bu trendi korumaya devam edin!`,
        borderColor: 'border-emerald-500/20',
        iconBg: 'bg-emerald-500/10',
      })
    } else if (analysisData.incomeGrowth < -10) {
      insights.push({
        type: 'warning',
        icon: <TrendingDown className="h-5 w-5 text-amber-400" />,
        title: 'Gelir Düşüşü Tespit Edildi',
        description: `Gelirinizde %${Math.abs(analysisData.incomeGrowth).toFixed(1)} düşüş var. Ek gelir kaynakları değerlendirilebilir.`,
        borderColor: 'border-amber-500/20',
        iconBg: 'bg-amber-500/10',
      })
    }

    if (analysisData.expenseGrowth > 20) {
      insights.push({
        type: 'warning',
        icon: <AlertCircle className="h-5 w-5 text-rose-400" />,
        title: 'Harcama Artışı',
        description: `Harcamalarınız %${analysisData.expenseGrowth.toFixed(1)} arttı. Harcama kategorilerinizi gözden geçirin.`,
        action: 'Kategorileri İncele',
        actionLink: '/analysis/categories',
        borderColor: 'border-rose-500/20',
        iconBg: 'bg-rose-500/10',
      })
    } else if (analysisData.expenseGrowth < 0) {
      insights.push({
        type: 'success',
        icon: <CheckCircle2 className="h-5 w-5 text-emerald-400" />,
        title: 'Harcama Kontrolü Başarılı',
        description: `Harcamalarınızı %${Math.abs(analysisData.expenseGrowth).toFixed(1)} azalttınız. Harika bir ilerleme!`,
        borderColor: 'border-emerald-500/20',
        iconBg: 'bg-emerald-500/10',
      })
    }

    if (analysisData.topCategories?.length > 0) {
      const topCategory = analysisData.topCategories[0]
      if (topCategory.percentage > 40) {
        insights.push({
          type: 'tip',
          icon: <Lightbulb className="h-5 w-5 text-amber-400" />,
          title: 'Harcama Yoğunlaşması',
          description: `"${topCategory.name}" kategorisi toplam harcamalarınızın %${topCategory.percentage.toFixed(1)}'ini oluşturuyor.`,
          borderColor: 'border-amber-500/20',
          iconBg: 'bg-amber-500/10',
        })
      }
    }

    insights.push({
      type: 'goal',
      icon: <Target className="h-5 w-5 text-purple-400" />,
      title: 'Finansal Hedef Belirleyin',
      description: 'Belirli bir tasarruf hedefi belirleyerek motivasyonunuzu artırın.',
      action: 'Hedef Oluştur',
      actionLink: '/goals',
      borderColor: 'border-purple-500/20',
      iconBg: 'bg-purple-500/10',
    })

    return insights
  }

  const smartInsights = generateSmartInsights()

  const categoryColors = [
    'from-indigo-500 to-violet-600',
    'from-emerald-500 to-green-600',
    'from-purple-500 to-fuchsia-600',
    'from-amber-500 to-orange-500',
    'from-cyan-500 to-sky-600',
  ]

  return (
    <AppPageShell
      header={{
        title: 'Finansal Analiz Merkezi',
        description: 'AI destekli akıllı finansal öneriler ve dönemsel içgörüler.',
        breadcrumbs: [{ label: 'Analiz' }],
        actions: (
          <>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-36 bg-black/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Son 7 Gün</SelectItem>
                <SelectItem value="30d">Son 30 Gün</SelectItem>
                <SelectItem value="90d">Son 3 Ay</SelectItem>
                <SelectItem value="1y">Son 1 Yıl</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRefresh} disabled={loading}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
          </>
        ),
      }}
    >
      {/* Finansal Sağlık Skoru */}
      <Card variant="premium" className="overflow-hidden border-white/10 bg-white/5">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-white/10 p-2.5">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Finansal Sağlık Skoru</p>
                  <p className="text-sm text-slate-300">Genel finansal durumunuzun değerlendirmesi</p>
                </div>
              </div>
              <div className="mt-5">
                <div className="flex items-end gap-3">
                  <span className="text-5xl font-black text-white">{healthScore}</span>
                  <span className="mb-1 text-2xl text-slate-500">/100</span>
                  <span className={`mb-1 rounded-full px-3 py-1 text-sm font-medium ${healthStyle.badge}`}>
                    {healthStyle.label}
                  </span>
                </div>
                <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r transition-all duration-1000 ${healthStyle.bar}`}
                    style={{ width: `${healthScore}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
              {[
                { label: 'Toplam Gelir', value: formatCurrency(analysisData?.totalIncome || 0, 'TRY'), color: 'text-emerald-300' },
                { label: 'Toplam Gider', value: formatCurrency(analysisData?.totalExpense || 0, 'TRY'), color: 'text-rose-300' },
                { label: 'Tasarruf', value: `%${(analysisData?.savingsRate || 0).toFixed(1)}`, color: 'text-cyan-300' },
                { label: 'Net Varlık', value: formatCurrency(analysisData?.netWorth || 0, 'TRY'), color: 'text-purple-300' },
              ].map(item => (
                <div key={item.label} className="rounded-xl border border-white/10 bg-black/20 p-3 text-center">
                  <p className="text-[11px] uppercase tracking-[0.14em] text-slate-500">{item.label}</p>
                  <p className={`mt-1 text-base font-bold ${item.color}`}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Stats */}
      <StatsGrid>
        <StatCard
          title="Toplam Gelir"
          value={formatCurrency(analysisData?.totalIncome || 0, 'TRY')}
          icon={TrendingUp}
          color="green"
          subtitle="Seçili dönem toplam gelir"
          trend={analysisData?.incomeGrowth !== undefined ? {
            value: Math.abs(analysisData.incomeGrowth),
            label: 'değişim',
            isPositive: analysisData.incomeGrowth >= 0,
          } : undefined}
          variant="premium"
        />
        <StatCard
          title="Toplam Gider"
          value={formatCurrency(analysisData?.totalExpense || 0, 'TRY')}
          icon={TrendingDown}
          color="red"
          subtitle="Seçili dönem toplam gider"
          trend={analysisData?.expenseGrowth !== undefined ? {
            value: Math.abs(analysisData.expenseGrowth),
            label: 'değişim',
            isPositive: analysisData.expenseGrowth <= 0,
          } : undefined}
          variant="premium"
        />
        <StatCard
          title="Tasarruf Oranı"
          value={`%${(analysisData?.savingsRate || 0).toFixed(1)}`}
          icon={PiggyBank}
          color={(analysisData?.savingsRate || 0) >= 10 ? 'cyan' : (analysisData?.savingsRate || 0) >= 0 ? 'amber' : 'red'}
          subtitle="Gelirin tasarrufa giden payı"
          variant="premium"
        />
        <StatCard
          title="Toplam Varlık"
          value={formatCurrency(analysisData?.totalAssets || 0, 'TRY')}
          icon={Wallet}
          color="purple"
          subtitle="Tüm hesap bakiyeleri toplamı"
          variant="premium"
        />
      </StatsGrid>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/5 p-2">
        {[
          { id: 'overview' as TabType, label: 'Genel Bakış', icon: BarChart3 },
          { id: 'insights' as TabType, label: 'Akıllı Öneriler', icon: Sparkles },
          { id: 'categories' as TabType, label: 'Kategoriler', icon: PieChart },
          { id: 'trends' as TabType, label: 'Trendler', icon: TrendingUp },
        ].map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-white/10 hover:text-slate-200'
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
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Son İşlemler */}
            <DashboardCard
              title="Son İşlemler"
              description="En güncel finansal hareketleriniz"
              icon={Clock}
              iconColor="text-cyan-300"
            >
              <div className="space-y-2">
                {loading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">Yükleniyor...</div>
                ) : analysisData?.recentTransactions?.length ? (
                  analysisData.recentTransactions.slice(0, 5).map(tx => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/20 px-4 py-3"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`h-2.5 w-2.5 rounded-full ${tx.type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        <div>
                          <p className="text-sm font-medium text-foreground">{tx.description}</p>
                          <p className="text-xs text-muted-foreground">{tx.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount, 'TRY')}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.date).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    <Clock className="mx-auto mb-2 h-8 w-8 opacity-40" />
                    Henüz işlem bulunmuyor
                  </div>
                )}
              </div>
              <Link
                href="/transactions"
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-border/60 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-indigo-500/40 hover:text-indigo-300"
              >
                Tüm İşlemleri Gör <ChevronRight className="h-4 w-4" />
              </Link>
            </DashboardCard>

            {/* Akıllı Öneriler Özet */}
            <DashboardCard
              title="Akıllı Öneriler"
              description="Size özel AI destekli öneriler"
              icon={Sparkles}
              iconColor="text-purple-300"
            >
              <div className="space-y-3">
                {smartInsights.slice(0, 3).map((insight, index) => (
                  <div
                    key={index}
                    className={`rounded-xl border bg-muted/20 p-4 ${insight.borderColor}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`rounded-lg p-2 ${insight.iconBg}`}>
                        {insight.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-foreground">{insight.title}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{insight.description}</p>
                        {insight.action && insight.actionLink && (
                          <Link
                            href={insight.actionLink}
                            className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-indigo-300 hover:text-indigo-200"
                          >
                            {insight.action} <ChevronRight className="h-3 w-3" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setActiveTab('insights')}
                className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-border/60 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-purple-500/40 hover:text-purple-300"
              >
                Tüm Önerileri Gör <ChevronRight className="h-4 w-4" />
              </button>
            </DashboardCard>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div className="space-y-4">
          <Card variant="premium" className="border-purple-500/20 bg-purple-500/5">
            <CardContent className="flex items-center gap-3 p-5">
              <div className="rounded-xl bg-purple-500/15 p-3">
                <Brain className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <p className="font-semibold text-white">AI Finansal Asistan</p>
                <p className="text-sm text-slate-400">Finansal verileriniz analiz edilerek size özel öneriler oluşturuldu</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            {smartInsights.map((insight, index) => (
              <div
                key={index}
                className={`rounded-2xl border bg-muted/20 p-5 transition-all hover:bg-muted/30 ${insight.borderColor}`}
              >
                <div className="flex items-start gap-4">
                  <div className={`rounded-xl p-3 ${insight.iconBg}`}>
                    {insight.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-foreground">{insight.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                    {insight.action && insight.actionLink && (
                      <Link
                        href={insight.actionLink}
                        className="mt-3 inline-flex items-center gap-1 rounded-lg bg-white/10 px-3 py-1.5 text-sm font-medium text-slate-200 transition-colors hover:bg-white/15"
                      >
                        {insight.action} <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'categories' && (
        <DashboardCard
          title="Harcama Kategorileri"
          description="En çok harcama yaptığınız kategorilerin analizi"
          icon={PieChart}
          iconColor="text-emerald-300"
        >
          <div className="space-y-4">
            {loading ? (
              <div className="py-8 text-center text-sm text-muted-foreground">Yükleniyor...</div>
            ) : analysisData?.topCategories?.length ? (
              analysisData.topCategories.map((category, index) => (
                <div key={index} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full bg-gradient-to-r ${categoryColors[index % categoryColors.length]}`} />
                      <span className="font-medium text-foreground">{category.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-foreground">{formatCurrency(category.amount, 'TRY')}</span>
                      <span className="ml-2 text-sm text-muted-foreground">%{category.percentage.toFixed(1)}</span>
                    </div>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r transition-all duration-500 ${categoryColors[index % categoryColors.length]}`}
                      style={{ width: `${category.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <PieChart className="mx-auto mb-2 h-8 w-8 opacity-40" />
                Henüz kategori verisi bulunmuyor
              </div>
            )}
          </div>
        </DashboardCard>
      )}

      {activeTab === 'trends' && (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card variant="premium" className="border-emerald-500/20 bg-emerald-500/5">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-400" />
                  <p className="font-semibold text-emerald-300">Gelir Trendi</p>
                </div>
                <p className="text-4xl font-black text-white">
                  {(analysisData?.incomeGrowth || 0) >= 0 ? '+' : ''}
                  {(analysisData?.incomeGrowth || 0).toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-slate-400">Geçen döneme göre değişim</p>
              </CardContent>
            </Card>

            <Card variant="premium" className="border-rose-500/20 bg-rose-500/5">
              <CardContent className="p-6 text-center">
                <div className="mb-2 flex items-center justify-center gap-2">
                  <TrendingDown className="h-5 w-5 text-rose-400" />
                  <p className="font-semibold text-rose-300">Gider Trendi</p>
                </div>
                <p className="text-4xl font-black text-white">
                  {(analysisData?.expenseGrowth || 0) >= 0 ? '+' : ''}
                  {(analysisData?.expenseGrowth || 0).toFixed(1)}%
                </p>
                <p className="mt-2 text-sm text-slate-400">Geçen döneme göre değişim</p>
              </CardContent>
            </Card>
          </div>

          <DashboardCard
            title="Aylık Nakit Akışı"
            description="Son dönem gelir-gider dengesi"
            icon={BarChart3}
            iconColor="text-indigo-300"
          >
            <div className="space-y-3">
              {loading ? (
                <div className="py-8 text-center text-sm text-muted-foreground">Yükleniyor...</div>
              ) : analysisData?.cashFlowData?.length ? (
                analysisData.cashFlowData.slice(0, 6).map((data, index) => (
                  <div key={index} className="rounded-xl border border-border/60 bg-muted/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="font-medium text-foreground">{data.month}</span>
                      <span className={`font-bold ${data.net >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {data.net >= 0 ? '+' : ''}{formatCurrency(data.net, 'TRY')}
                      </span>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span className="text-emerald-400">Gelir: {formatCurrency(data.income, 'TRY')}</span>
                      <span>·</span>
                      <span className="text-rose-400">Gider: {formatCurrency(data.expense, 'TRY')}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  <BarChart3 className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  Henüz nakit akışı verisi bulunmuyor
                </div>
              )}
            </div>
          </DashboardCard>
        </div>
      )}

      {/* Detaylı Analizler */}
      <div>
        <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Detaylı Analizler</p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <QuickActionTile
            href="/analysis/cashflow"
            title="Nakit Akışı"
            description="Aylık gelir-gider dengesi ve nakit akış analizi"
            icon={BarChart3}
            tone="indigo"
          />
          <QuickActionTile
            href="/analysis/categories"
            title="Kategoriler"
            description="Harcama dağılımı ve kategori bazlı analiz"
            icon={PieChart}
            tone="green"
          />
          <QuickActionTile
            href="/analysis/trends"
            title="Trendler"
            description="Gelir ve gider trendleri, dönemsel karşılaştırma"
            icon={TrendingUp}
            tone="purple"
          />
          <QuickActionTile
            href="/analysis/export"
            title="Raporlar"
            description="PDF ve Excel formatında finansal raporlar"
            icon={FileText}
            tone="amber"
            meta="PDF · Excel · CSV"
          />
        </div>
      </div>
    </AppPageShell>
  )
}
