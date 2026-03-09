'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  AppPageShell,
  Button,
  Card,
  CardContent,
  DashboardCard,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  StatCard,
  StatsGrid,
  Switch,
} from '@/components/mosaic'
import { useToast } from '@/lib/use-toast'
import { formatCurrency } from '@/lib/validators'
import { AlertTriangle, PiggyBank, RefreshCw, Save, Target, TrendingDown } from 'lucide-react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface BudgetItem {
  categoryId: number
  categoryName: string
  categoryCode: string
  budgeted: number
  spent: number
  remaining: number
  progress: number
  isOverBudget: boolean
  alertThreshold: number
  transactionCount: number
}

interface BudgetSummaryResponse {
  planId: number | null
  planName: string
  periodType: 'weekly' | 'monthly'
  currency: string
  zeroBased: boolean
  startDate: string
  endDate: string
  totalIncome: number
  totalBudgeted: number
  totalSpent: number
  remainingBudget: number
  remainingToAssign: number
  overBudgetCount: number
  items: BudgetItem[]
}

export default function BudgetsPage() {
  const { success: toastSuccess, error: toastError } = useToast()
  const [summary, setSummary] = useState<BudgetSummaryResponse | null>(null)
  const [periodType, setPeriodType] = useState<'weekly' | 'monthly'>('monthly')
  const [zeroBased, setZeroBased] = useState(true)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [draftBudgets, setDraftBudgets] = useState<Record<number, string>>({})

  const fetchSummary = async (nextPeriodType = periodType) => {
    try {
      setLoading(true)
      const response = await fetch(`/api/budgets?periodType=${nextPeriodType}`, {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Bütçe verileri yüklenemedi')
      }

      const data = (await response.json()) as BudgetSummaryResponse
      setSummary(data)
      setZeroBased(data.zeroBased)
      setDraftBudgets(
        Object.fromEntries(data.items.map(item => [item.categoryId, item.budgeted.toFixed(2)]))
      )
    } catch (error) {
      console.error('Budget summary error:', error)
      toastError('Hata', 'Bütçe verileri yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSummary(periodType)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [periodType])

  const chartData = useMemo(
    () =>
      summary?.items.slice(0, 8).map(item => ({
        name: item.categoryName,
        budgeted: item.budgeted,
        spent: item.spent,
        fill: item.isOverBudget ? '#ef4444' : '#6366f1',
      })) ?? [],
    [summary]
  )

  const handleSave = async () => {
    if (!summary) {
      return
    }

    setSaving(true)
    try {
      const response = await fetch('/api/budgets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          periodType,
          zeroBased,
          name: summary.planName,
          allocations: summary.items.map(item => ({
            categoryId: item.categoryId,
            amount: Number(draftBudgets[item.categoryId] || 0),
            alertThreshold: item.alertThreshold,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error('Bütçe kaydedilemedi')
      }

      const data = (await response.json()) as BudgetSummaryResponse
      setSummary(data)
      setDraftBudgets(
        Object.fromEntries(data.items.map(item => [item.categoryId, item.budgeted.toFixed(2)]))
      )
      toastSuccess('Başarılı', 'Bütçe planınız kaydedildi')
    } catch (error) {
      console.error('Budget save error:', error)
      toastError('Hata', 'Bütçe kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  return (
    <AppPageShell
      header={{
        title: 'Bütçeler',
        description: 'Kategori bazlı limitleri, sıfır bazlı tahsisi ve gerçekleşen harcamaları yönetin.',
        breadcrumbs: [{ label: 'Bütçeler' }],
        actions: (
          <>
            <Button variant="outline" onClick={() => void fetchSummary()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Yenile
            </Button>
            <Button variant="glow" onClick={() => void handleSave()} disabled={saving || loading}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? 'Kaydediliyor...' : 'Bütçeyi Kaydet'}
            </Button>
          </>
        ),
      }}
    >
      <Card variant="premium" className="border-white/10 bg-white/5">
        <CardContent className="grid gap-4 p-6 lg:grid-cols-[200px_minmax(0,1fr)_auto] lg:items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Periyot</p>
            <Select
              value={periodType}
              onValueChange={value => setPeriodType(value === 'weekly' ? 'weekly' : 'monthly')}
            >
              <SelectTrigger className="mt-2 bg-black/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Aylık Bütçe</SelectItem>
                <SelectItem value="weekly">Haftalık Bütçe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-white">Sıfır bazlı bütçeleme</p>
                <p className="text-xs text-slate-400">
                  Gelirinizin her birimini bir kategoriye veya amaca atayın.
                </p>
              </div>
              <Switch checked={zeroBased} onCheckedChange={setZeroBased} />
            </div>
          </div>
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-200">
            {summary ? (
              <>
                <p className="font-semibold">Atanacak bakiye</p>
                <p className="mt-1 text-xl font-black">
                  {formatCurrency(summary.remainingToAssign, summary.currency)}
                </p>
              </>
            ) : (
              <p>Bütçe yükleniyor...</p>
            )}
          </div>
        </CardContent>
      </Card>

      <StatsGrid>
        <StatCard
          title="Toplam Bütçe"
          value={formatCurrency(summary?.totalBudgeted || 0, summary?.currency || 'TRY')}
          icon={Target}
          color="indigo"
          subtitle="Kategori tahsislerinin toplamı"
          variant="premium"
        />
        <StatCard
          title="Toplam Harcama"
          value={formatCurrency(summary?.totalSpent || 0, summary?.currency || 'TRY')}
          icon={TrendingDown}
          color="red"
          subtitle="Seçili periyottaki giderler"
          variant="premium"
        />
        <StatCard
          title="Kalan Bütçe"
          value={formatCurrency(summary?.remainingBudget || 0, summary?.currency || 'TRY')}
          icon={PiggyBank}
          color={(summary?.remainingBudget || 0) >= 0 ? 'green' : 'red'}
          subtitle="Bütçe eksi gerçekleşen"
          variant="premium"
        />
        <StatCard
          title="Riskli Kategori"
          value={`${summary?.overBudgetCount || 0}`}
          icon={AlertTriangle}
          color={(summary?.overBudgetCount || 0) > 0 ? 'amber' : 'green'}
          subtitle="Eşik veya aşım tespit edilenler"
          variant="premium"
        />
      </StatsGrid>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(340px,0.9fr)]">
        <DashboardCard
          title="Kategori Bütçeleri"
          description="Hedef, gerçekleşen ve kalan durumunu aynı tabloda yönetin."
          icon={Target}
          iconColor="text-indigo-300"
        >
          {loading || !summary ? (
            <div className="py-12 text-center text-sm text-muted-foreground">Bütçe özetiniz yükleniyor...</div>
          ) : (
            <div className="space-y-4">
              {summary.items.map(item => {
                const liveBudget = Number(draftBudgets[item.categoryId] || 0)
                const liveProgress = liveBudget > 0 ? Math.min((item.spent / liveBudget) * 100, 999) : 0
                const liveRemaining = liveBudget - item.spent
                const isOver = liveBudget > 0 ? item.spent > liveBudget : item.spent > 0

                return (
                  <div key={item.categoryId} className="rounded-2xl border border-border/70 bg-background/60 p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-foreground">{item.categoryName}</p>
                          {isOver ? <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-[11px] font-medium text-red-400">Aşım</span> : null}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {item.transactionCount} işlem · eşik %{item.alertThreshold.toFixed(0)}
                        </p>
                      </div>
                      <div className="grid gap-3 sm:grid-cols-[150px_160px_160px]">
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={draftBudgets[item.categoryId] || ''}
                          onChange={event =>
                            setDraftBudgets(prev => ({
                              ...prev,
                              [item.categoryId]: event.target.value,
                            }))
                          }
                        />
                        <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Gerçekleşen</p>
                          <p className="mt-1 text-sm font-semibold text-foreground">
                            {formatCurrency(item.spent, summary.currency)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-border/70 bg-muted/20 px-3 py-2">
                          <p className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Kalan</p>
                          <p className={`mt-1 text-sm font-semibold ${liveRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {formatCurrency(liveRemaining, summary.currency)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all ${
                            isOver
                              ? 'bg-gradient-to-r from-red-500 to-rose-500'
                              : liveProgress >= item.alertThreshold
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                                : 'bg-gradient-to-r from-indigo-500 to-violet-500'
                          }`}
                          style={{ width: `${Math.min(liveProgress, 100)}%` }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                        <span>%{liveProgress.toFixed(0)} kullanıldı</span>
                        <span>
                          Hedef {formatCurrency(liveBudget, summary.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DashboardCard>

        <div className="space-y-6">
          <DashboardCard
            title="Bütçe vs Gerçekleşen"
            description="En yoğun kategorilerde planlanan ve harcanan tutarı karşılaştırın."
            icon={TrendingDown}
            iconColor="text-amber-300"
          >
            {loading || chartData.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">Grafik hazırlanıyor...</div>
            ) : (
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                    <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                    <Tooltip
                      formatter={(value: number) =>
                        formatCurrency(Number(value), summary?.currency || 'TRY')
                      }
                    />
                    <Bar dataKey="budgeted" radius={[8, 8, 0, 0]} fill="#334155" />
                    <Bar dataKey="spent" radius={[8, 8, 0, 0]}>
                      {chartData.map(entry => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </DashboardCard>

          <Card variant="premium" className="border-white/10 bg-white/5">
            <CardContent className="space-y-3 p-5">
              <p className="text-sm font-semibold text-white">Sıfır bazlı görünüm</p>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Toplam gelir</p>
                <p className="mt-2 text-2xl font-black text-white">
                  {formatCurrency(summary?.totalIncome || 0, summary?.currency || 'TRY')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Atanan bütçe</p>
                <p className="mt-2 text-2xl font-black text-indigo-300">
                  {formatCurrency(summary?.totalBudgeted || 0, summary?.currency || 'TRY')}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Görev bekleyen tutar</p>
                <p className={`mt-2 text-2xl font-black ${(summary?.remainingToAssign || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                  {formatCurrency(summary?.remainingToAssign || 0, summary?.currency || 'TRY')}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppPageShell>
  )
}
