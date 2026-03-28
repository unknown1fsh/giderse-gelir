'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import { isPremiumPlan } from '@/lib/plan-config'
import {
  AppPageShell,
  Button,
  Card,
  CardContent,
  DashboardCard,
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
import { Coins, CreditCard, PieChart, RefreshCw, TrendingUp, Wallet } from 'lucide-react'
import {
  CartesianGrid,
  Line,
  LineChart,
  Pie,
  PieChart as RechartsPieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface NetWorthResponse {
  currency: string
  totalAssets: number
  totalLiabilities: number
  netWorth: number
  breakdown: {
    assets: {
      cash: number
      eWallets: number
      investments: number
      gold: number
      realEstate: number
      total: number
    }
    liabilities: {
      creditCards: number
      loans: number
      total: number
    }
    counts: {
      accounts: number
      eWallets: number
      investments: number
      goldItems: number
      creditCards: number
      loans: number
    }
  }
  snapshots: Array<{
    date: string
    totalAssets: number
    totalLiabilities: number
    netWorth: number
  }>
}

export default function PortfolioPage() {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const { error: toastError } = useToast()
  const [data, setData] = useState<NetWorthResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (userLoading) { return }
    if (!isPremiumPlan(user?.plan || 'free')) {
      void router.push('/premium')
    }
  }, [userLoading, user, router])

  const fetchSummary = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/net-worth', {
        credentials: 'include',
      })

      if (!response.ok) {
        throw new Error('Net varlık yüklenemedi')
      }

      const summary = (await response.json()) as NetWorthResponse
      setData(summary)
    } catch (error) {
      console.error('Net worth fetch error:', error)
      toastError('Hata', 'Net varlık yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchSummary()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const distributionData = useMemo(
    () =>
      data
        ? [
            {
              name: 'Nakit',
              value: data.breakdown.assets.cash + data.breakdown.assets.eWallets,
              fill: '#38bdf8',
            },
            { name: 'Yatırım', value: data.breakdown.assets.investments, fill: '#10b981' },
            { name: 'Altın', value: data.breakdown.assets.gold, fill: '#f59e0b' },
            { name: 'Gayrimenkul', value: data.breakdown.assets.realEstate, fill: '#8b5cf6' },
          ].filter(item => item.value > 0)
        : [],
    [data]
  )

  const detailRows = useMemo(
    () =>
      data
        ? [
            ['Nakit ve banka', data.breakdown.assets.cash, data.breakdown.counts.accounts],
            ['E-cüzdan', data.breakdown.assets.eWallets, data.breakdown.counts.eWallets],
            ['Yatırım', data.breakdown.assets.investments, data.breakdown.counts.investments],
            ['Altın', data.breakdown.assets.gold, data.breakdown.counts.goldItems],
            ['Gayrimenkul', data.breakdown.assets.realEstate, 0],
            ['Kredi kartı borcu', -data.breakdown.liabilities.creditCards, data.breakdown.counts.creditCards],
            ['Kredi bakiyesi', -data.breakdown.liabilities.loans, data.breakdown.counts.loans],
          ]
        : [],
    [data]
  )

  if (!userLoading && !isPremiumPlan(user?.plan || 'free')) { return null }

  return (
    <AppPageShell
      header={{
        title: 'Net Varlık',
        description:
          'Varlıklarınız, borçlarınız ve zaman içindeki net varlık trendi tek hesaplama motoruyla sunulur.',
        breadcrumbs: [{ label: 'Portfoy' }],
        actions: (
          <Button variant="outline" onClick={() => void fetchSummary()} disabled={loading}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Yenile
          </Button>
        ),
      }}
    >
      <StatsGrid>
        <StatCard
          title="Toplam Varlık"
          value={formatCurrency(data?.totalAssets || 0, data?.currency || 'TRY')}
          icon={Wallet}
          color="cyan"
          subtitle="Tum aktif finansal kalemler"
          variant="premium"
        />
        <StatCard
          title="Toplam Borc"
          value={formatCurrency(data?.totalLiabilities || 0, data?.currency || 'TRY')}
          icon={CreditCard}
          color="red"
          subtitle="Kart ve kredi yukumlulukleri"
          variant="premium"
        />
        <StatCard
          title="Net Varlık"
          value={formatCurrency(data?.netWorth || 0, data?.currency || 'TRY')}
          icon={TrendingUp}
          color={(data?.netWorth || 0) >= 0 ? 'green' : 'red'}
          subtitle="Varlıklar eksi toplam borçlar"
          variant="premium"
        />
        <StatCard
          title="Altın + Yatırım"
          value={formatCurrency(
            (data?.breakdown.assets.gold || 0) +
              (data?.breakdown.assets.investments || 0) +
              (data?.breakdown.assets.realEstate || 0),
            data?.currency || 'TRY'
          )}
          icon={Coins}
          color="amber"
          subtitle="Uzun vadeli birikim toplami"
          variant="premium"
        />
      </StatsGrid>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(340px,0.9fr)]">
        <DashboardCard
          title="Net Varlık Trendi"
          description="Snapshot verileriyle zaman içinde toplam net varlık değişimi."
          icon={TrendingUp}
          iconColor="text-emerald-300"
        >
          {!data || data.snapshots.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Snapshot verisi oluştukça burada net varlık çizgisi görünecek.
            </div>
          ) : (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.snapshots}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148, 163, 184, 0.2)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={value =>
                      new Date(value).toLocaleDateString('tr-TR', {
                        month: 'short',
                        day: 'numeric',
                      })
                    }
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(Number(value), data.currency)}
                    labelFormatter={value => new Date(value).toLocaleDateString('tr-TR')}
                  />
                  <Line
                    type="monotone"
                    dataKey="netWorth"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </DashboardCard>

        <DashboardCard
          title="Varlık Dağılımı"
          description="Nakit, yatırım, altın ve gayrimenkul paylarını inceleyin."
          icon={PieChart}
          iconColor="text-cyan-300"
        >
          {!data || distributionData.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              Dağılım verisi bulunamadı.
            </div>
          ) : (
            <div className="space-y-4">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={distributionData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={100}
                      paddingAngle={3}
                    />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(Number(value), data.currency)}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {distributionData.map(item => (
                  <div
                    key={item.name}
                    className="flex items-center justify-between rounded-xl border border-border/70 bg-muted/20 px-3 py-2"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: item.fill }}
                      />
                      <span className="text-sm text-foreground">{item.name}</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">
                      {formatCurrency(item.value, data.currency)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </DashboardCard>
      </div>

      <Card variant="premium" className="border-white/10 bg-white/5">
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kalem</TableHead>
                <TableHead>Adet</TableHead>
                <TableHead className="text-right">Tutar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {detailRows.map(([label, value, count]) => (
                <TableRow key={String(label)}>
                  <TableCell className="font-medium">{label}</TableCell>
                  <TableCell>{Number(count)}</TableCell>
                  <TableCell
                    className={`text-right font-semibold ${
                      Number(value) >= 0 ? 'text-foreground' : 'text-red-400'
                    }`}
                  >
                    {formatCurrency(Number(value), data?.currency || 'TRY')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AppPageShell>
  )
}
