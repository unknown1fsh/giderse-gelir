'use client'

import { useState, useEffect } from 'react'
import StatsCard from './StatsCard'
import ChartCard from './ChartCard'
import {
  Users,
  TrendingUp,
  Activity,
  BarChart3,
  Clock,
  CreditCard,
  Wallet,
  DollarSign,
  AlertCircle,
} from 'lucide-react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface DashboardData {
  users: {
    total: number
    active: number
    newToday: number
    newLast7Days: number
    newLast30Days: number
    activeLast24Hours: number
  }
  transactions: {
    total: number
    last7Days: number
    last30Days: number
    totalAmount: number
    last7DaysAmount: number
    last30DaysAmount: number
  }
  accounts: {
    total: number
    totalBalance: number
  }
  investments: {
    total: number
    totalValue: number
  }
  subscriptions: {
    active: number
    totalRevenue: number
    byPlan: Array<{ plan: string; count: number }>
  }
  planDistribution: Array<{
    plan: string
    count: number
  }>
  roleDistribution: Array<{
    role: string
    count: number
  }>
  userGrowth: Array<{
    date: string
    count: number
  }>
  transactionVolume: Array<{
    date: string
    amount: number
  }>
  categoryBreakdown: Array<{
    category: string
    amount: number
    count: number
  }>
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true)
        setError(null)

        const response = await fetch('/api/admin/dashboard', {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Dashboard verileri alınamadı')
        }

        const result = (await response.json()) as { success: boolean; data: DashboardData }
        if (result.success) {
          setData(result.data)
        }
      } catch (err) {
        console.error('Dashboard fetch error:', err)
        setError('Dashboard verileri yüklenirken bir hata oluştu')
      } finally {
        setLoading(false)
      }
    }

    void fetchDashboardData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="flex mt-8 flex-col items-center animate-pulse">
          <div className="h-10 w-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-muted-foreground font-medium">Dashboard verileri yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center py-12 min-h-[400px]">
        <div className="text-center max-w-sm mx-auto p-6 rounded-2xl bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <p className="text-destructive font-semibold text-lg">{error || 'Veri yüklenemedi'}</p>
          <p className="text-destructive/80 text-sm mt-2">Lütfen daha sonra tekrar deneyin veya sayfayı yenileyin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Toplam Kullanıcı"
          value={data.users.total}
          subtitle={`${data.users.active} aktif`}
          icon={<Users />}
          gradient="from-blue-500 to-cyan-600"
        />
        <StatsCard
          title="Bugün Kayıt"
          value={data.users.newToday}
          subtitle={`Son 7 gün: ${data.users.newLast7Days}`}
          icon={<TrendingUp />}
          gradient="from-green-500 to-emerald-600"
        />
        <StatsCard
          title="Toplam İşlem"
          value={data.transactions.total}
          subtitle={`Son 30 gün: ${data.transactions.last30Days}`}
          icon={<BarChart3 />}
          gradient="from-purple-500 to-pink-600"
        />
        <StatsCard
          title="Son 24 Saat Aktif"
          value={data.users.activeLast24Hours}
          subtitle="Kullanıcı giriş yaptı"
          icon={<Clock />}
          gradient="from-orange-500 to-red-600"
        />
      </div>

      {/* İkinci Satır İstatistikler */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          title="Toplam İşlem Hacmi"
          value={`₺${(data.transactions.totalAmount / 1000).toFixed(0)}K`}
          subtitle={`Son 30 gün: ₺${(data.transactions.last30DaysAmount / 1000).toFixed(0)}K`}
          icon={<DollarSign />}
          gradient="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Toplam Hesap"
          value={data.accounts.total}
          subtitle={`Bakiye: ₺${(data.accounts.totalBalance / 1000).toFixed(0)}K`}
          icon={<Wallet />}
          gradient="from-cyan-500 to-blue-600"
        />
        <StatsCard
          title="Toplam Yatırım"
          value={data.investments.total}
          subtitle={`Değer: ₺${(data.investments.totalValue / 1000).toFixed(0)}K`}
          icon={<TrendingUp />}
          gradient="from-yellow-500 to-amber-600"
        />
        <StatsCard
          title="Aktif Abonelik"
          value={data.subscriptions.active}
          subtitle={`Gelir: ₺${(data.subscriptions.totalRevenue / 1000).toFixed(0)}K`}
          icon={<CreditCard />}
          gradient="from-violet-500 to-purple-600"
        />
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard
          title="Kullanıcı Büyüme Trendi"
          description="Son 30 günde kayıt olan kullanıcılar"
          icon={<TrendingUp />}
          gradient="from-blue-500 to-cyan-600"
        >
          {data.userGrowth && data.userGrowth.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Veri bulunamadı
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Plan Dağılımı"
          description="Aktif aboneliklerin plan bazlı dağılımı"
          icon={<BarChart3 />}
          gradient="from-purple-500 to-pink-600"
        >
          {data.planDistribution && data.planDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={data.planDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ plan, count }) => `${plan}: ${count}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {data.planDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Veri bulunamadı
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="Rol Dağılımı"
          description="Kullanıcıların rol bazlı dağılımı"
          icon={<Users />}
          gradient="from-green-500 to-emerald-600"
        >
          {data.roleDistribution && data.roleDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.roleDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="role" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Veri bulunamadı
            </div>
          )}
        </ChartCard>

        <ChartCard
          title="İşlem Hacmi Trendi"
          description="Son 30 günde işlem hacmi"
          icon={<Activity />}
          gradient="from-orange-500 to-red-600"
        >
          {data.transactionVolume && data.transactionVolume.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.transactionVolume}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="amount" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-muted-foreground">
              Veri bulunamadı
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  )
}
