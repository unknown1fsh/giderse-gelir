'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/lib/use-toast'
import { useUser } from '@/lib/user-context'
import { isPremiumPlan } from '@/lib/plan-config'
import PremiumUpgradeModal from '@/components/premium-upgrade-modal'
import {
  ArrowLeft,
  Home,
  Plus,
  TrendingUp,
  TrendingDown,
  Building2,
  Coins,
  Globe,
  PieChart,
  Shield,
  Layers,
  Star,
  Crown,
  ChevronRight,
  Edit2,
  Trash2,
} from 'lucide-react'
import { formatCurrency } from '@/lib/validators'

interface Investment {
  id: number
  investmentType: string
  name: string
  symbol?: string
  quantity: string
  purchasePrice: string
  currentPrice: string | null
  purchaseDate: string
  notes?: string
  category?: string
  riskLevel: string
  currency: { id: number; code: string; name: string }
  createdAt: string
}

type TabType = 'all' | 'stock' | 'fund' | 'bond' | 'crypto' | 'commodity' | 'forex' | 'real-estate'

const investmentCategories = [
  { id: 'stock', name: 'Hisse', icon: TrendingUp, color: 'green', gradient: 'from-green-500 to-emerald-600' },
  { id: 'fund', name: 'Fon', icon: PieChart, color: 'blue', gradient: 'from-blue-500 to-indigo-600' },
  { id: 'bond', name: 'Tahvil', icon: Shield, color: 'purple', gradient: 'from-purple-500 to-violet-600' },
  { id: 'crypto', name: 'Kripto', icon: Coins, color: 'yellow', gradient: 'from-yellow-500 to-orange-600' },
  { id: 'commodity', name: 'Emtia', icon: Layers, color: 'amber', gradient: 'from-amber-500 to-yellow-600' },
  { id: 'forex', name: 'Döviz', icon: Globe, color: 'cyan', gradient: 'from-cyan-500 to-blue-600' },
  { id: 'real-estate', name: 'Gayrimenkul', icon: Building2, color: 'red', gradient: 'from-red-500 to-rose-600' },
]

export default function InvestmentsPage() {
  const router = useRouter()
  const { user, loading: userLoading, refreshUser } = useUser()
  const { success: toastSuccess, error: toastError } = useToast()

  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [showPremiumModal, setShowPremiumModal] = useState(false)
  const fetchedRef = useRef(false)

  const isPremium = isPremiumPlan(user?.plan || 'free')

  // Plan değişikliklerini dinle
  useEffect(() => {
    const handlePlanChange = () => {
      void refreshUser()
    }
    window.addEventListener('plan-changed', handlePlanChange)
    return () => window.removeEventListener('plan-changed', handlePlanChange)
  }, [refreshUser])

  useEffect(() => {
    if (fetchedRef.current || userLoading) return
    fetchedRef.current = true
    void fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userLoading])

  async function fetchData() {
    if (!isPremium) {
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/investments', { credentials: 'include' })
      if (response.ok) {
        const data = (await response.json()) as Investment[]
        setInvestments(data)
      } else if (response.status === 403) {
        // Premium required - handled by UI
      }
    } catch (error) {
      console.error('Yatırımlar yüklenirken hata:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCategoryInfo = (type: string) => {
    return investmentCategories.find(c => c.id === type) || investmentCategories[0]
  }

  const filteredInvestments = activeTab === 'all'
    ? investments
    : investments.filter(inv => inv.investmentType === activeTab)

  // Hesaplamalar
  const calculateValue = (inv: Investment) => {
    const quantity = parseFloat(inv.quantity)
    const price = parseFloat(inv.currentPrice || inv.purchasePrice)
    return quantity * price
  }

  const calculateProfitLoss = (inv: Investment) => {
    const quantity = parseFloat(inv.quantity)
    const purchasePrice = parseFloat(inv.purchasePrice)
    const currentPrice = parseFloat(inv.currentPrice || inv.purchasePrice)
    return (currentPrice - purchasePrice) * quantity
  }

  const totalValue = investments.reduce((sum, inv) => sum + calculateValue(inv), 0)
  const totalProfitLoss = investments.reduce((sum, inv) => sum + calculateProfitLoss(inv), 0)
  const totalInvested = investments.reduce((sum, inv) => {
    return sum + parseFloat(inv.quantity) * parseFloat(inv.purchasePrice)
  }, 0)
  const profitLossPercent = totalInvested > 0 ? (totalProfitLoss / totalInvested) * 100 : 0

  const handleAddInvestment = (type?: string) => {
    if (!isPremium) {
      setShowPremiumModal(true)
      return
    }
    router.push(type ? `/investments/${type}/new` : '/investments/new')
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Bu yatırımı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/investments/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      })

      if (response.ok) {
        toastSuccess('Başarılı', 'Yatırım silindi')
        setInvestments(prev => prev.filter(inv => inv.id !== id))
      } else {
        toastError('Hata', 'Yatırım silinemedi')
      }
    } catch (error) {
      console.error('Silme hatası:', error)
      toastError('Hata', 'Yatırım silinemedi')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Yatırımlar yükleniyor...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/80 rounded-lg transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-slate-600" />
            </button>
            <Link href="/dashboard" className="p-2 hover:bg-white/80 rounded-lg transition-colors">
              <Home className="h-5 w-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Yatırım Araçları</h1>
              <p className="text-sm text-slate-600">Portföyünüzü yönetin ve takip edin</p>
            </div>
          </div>
          <button
            onClick={() => handleAddInvestment()}
            className="inline-flex items-center px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            <Plus className="h-5 w-5 mr-2" />
            Yeni Yatırım
          </button>
        </div>

        {/* Premium Banner for Free Users */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-2xl p-6 sm:p-8 shadow-xl mb-6">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                  <Crown className="h-8 w-8 text-yellow-300" />
                  <h2 className="text-2xl sm:text-3xl font-bold text-white">Premium Özellik</h2>
                </div>
                <p className="text-purple-100 text-lg max-w-xl">
                  Yatırım portföyü yönetimi, hisse senetleri, kripto paralar, fonlar ve daha fazlası için Premium&apos;a geçin.
                </p>
              </div>
              <button
                onClick={() => setShowPremiumModal(true)}
                className="px-8 py-4 bg-white text-purple-600 font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Premium&apos;a Geç
              </button>
            </div>
          </div>
        )}

        {/* Portfolio Summary - Only for Premium */}
        {isPremium && (
          <>
            {/* Portfolio Value Card */}
            <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 rounded-2xl p-6 sm:p-8 shadow-xl mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Toplam Portföy Değeri</p>
                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                    {formatCurrency(totalValue, 'TRY')}
                  </h2>
                  <div className="flex items-center gap-4 mt-3">
                    <div className={`flex items-center gap-1 ${totalProfitLoss >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                      {totalProfitLoss >= 0 ? (
                        <TrendingUp className="h-5 w-5" />
                      ) : (
                        <TrendingDown className="h-5 w-5" />
                      )}
                      <span className="font-semibold">{formatCurrency(Math.abs(totalProfitLoss), 'TRY')}</span>
                      <span className="text-sm">({profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-white/20 backdrop-blur-sm">
                    <TrendingUp className="h-8 w-8 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md group-hover:scale-110 transition-transform">
                      <TrendingUp className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-xs text-slate-500">{investments.length}</span>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Toplam Yatırım</p>
                  <p className="text-lg font-bold text-blue-600">{investments.length} adet</p>
                </CardContent>
              </Card>

              <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 shadow-md group-hover:scale-110 transition-transform">
                      <Coins className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Yatırılan</p>
                  <p className="text-lg font-bold text-green-600">{formatCurrency(totalInvested, 'TRY')}</p>
                </CardContent>
              </Card>

              <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${totalProfitLoss >= 0 ? 'bg-gradient-to-br from-emerald-50 to-teal-50 hover:from-emerald-100 hover:to-teal-100' : 'bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform ${totalProfitLoss >= 0 ? 'bg-gradient-to-br from-emerald-500 to-teal-600' : 'bg-gradient-to-br from-red-500 to-rose-600'}`}>
                      {totalProfitLoss >= 0 ? <TrendingUp className="h-4 w-4 text-white" /> : <TrendingDown className="h-4 w-4 text-white" />}
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Kar/Zarar</p>
                  <p className={`text-lg font-bold ${totalProfitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                    {totalProfitLoss >= 0 ? '+' : ''}{formatCurrency(totalProfitLoss, 'TRY')}
                  </p>
                </CardContent>
              </Card>

              <Card className={`group hover:shadow-lg transition-all duration-300 border-0 ${profitLossPercent >= 0 ? 'bg-gradient-to-br from-cyan-50 to-blue-50 hover:from-cyan-100 hover:to-blue-100' : 'bg-gradient-to-br from-orange-50 to-red-50 hover:from-orange-100 hover:to-red-100'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg shadow-md group-hover:scale-110 transition-transform ${profitLossPercent >= 0 ? 'bg-gradient-to-br from-cyan-500 to-blue-600' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}>
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <p className="text-xs text-slate-600 mb-1">Getiri</p>
                  <p className={`text-lg font-bold ${profitLossPercent >= 0 ? 'text-cyan-600' : 'text-orange-600'}`}>
                    {profitLossPercent >= 0 ? '+' : ''}{profitLossPercent.toFixed(1)}%
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 bg-white/60 backdrop-blur-sm p-2 rounded-xl shadow-sm">
              <button
                onClick={() => setActiveTab('all')}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${activeTab === 'all'
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                    : 'text-slate-600 hover:bg-white hover:shadow-sm'
                  }`}
              >
                Tümü
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === 'all' ? 'bg-white/20' : 'bg-slate-200'}`}>
                  {investments.length}
                </span>
              </button>
              {investmentCategories.map(category => {
                const Icon = category.icon
                const count = investments.filter(inv => inv.investmentType === category.id).length
                const isActive = activeTab === category.id

                return (
                  <button
                    key={category.id}
                    onClick={() => setActiveTab(category.id as TabType)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md'
                        : 'text-slate-600 hover:bg-white hover:shadow-sm'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-white/20' : 'bg-slate-200'}`}>
                      {count}
                    </span>
                  </button>
                )
              })}
            </div>

            {/* Investments List */}
            <div className="space-y-4">
              {filteredInvestments.length === 0 ? (
                <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
                  <CardContent className="py-12 text-center">
                    <TrendingUp className="mx-auto h-12 w-12 text-slate-300 mb-4" />
                    <p className="text-slate-500 mb-4">
                      {activeTab === 'all' ? 'Henüz yatırım eklenmemiş' : `Bu kategoride yatırım bulunmuyor`}
                    </p>
                    <button
                      onClick={() => handleAddInvestment(activeTab === 'all' ? undefined : activeTab)}
                      className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      İlk Yatırımı Ekle
                    </button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredInvestments.map(investment => {
                    const category = getCategoryInfo(investment.investmentType)
                    const Icon = category.icon
                    const value = calculateValue(investment)
                    const profitLoss = calculateProfitLoss(investment)
                    const profitPercent = parseFloat(investment.purchasePrice) > 0
                      ? (profitLoss / (parseFloat(investment.quantity) * parseFloat(investment.purchasePrice))) * 100
                      : 0

                    return (
                      <Card key={investment.id} className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-r ${category.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-lg bg-gradient-to-br ${category.gradient} shadow-md`}>
                                <Icon className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <CardTitle className="text-base">{investment.name}</CardTitle>
                                <CardDescription>
                                  {investment.symbol && `${investment.symbol} • `}{category.name}
                                </CardDescription>
                              </div>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => router.push(`/investments/${investment.id}/edit`)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg"
                              >
                                <Edit2 className="h-4 w-4 text-slate-500" />
                              </button>
                              <button
                                onClick={() => void handleDelete(investment.id)}
                                className="p-1.5 hover:bg-slate-100 rounded-lg"
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </button>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex justify-between items-end mb-3">
                            <div>
                              <p className="text-xs text-slate-500">Değer</p>
                              <p className="text-xl font-bold text-slate-800">
                                {formatCurrency(value, investment.currency.code)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500">Kar/Zarar</p>
                              <div className={`flex items-center gap-1 ${profitLoss >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {profitLoss >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                                <span className="font-semibold">
                                  {profitLoss >= 0 ? '+' : ''}{formatCurrency(profitLoss, investment.currency.code)}
                                </span>
                              </div>
                              <p className={`text-xs ${profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                ({profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(1)}%)
                              </p>
                            </div>
                          </div>
                          <div className="flex justify-between text-xs text-slate-500 mb-3">
                            <span>{parseFloat(investment.quantity)} adet</span>
                            <span>Alış: {formatCurrency(parseFloat(investment.purchasePrice), investment.currency.code)}</span>
                          </div>
                          <Link
                            href={`/investments/${investment.id}`}
                            className={`flex items-center justify-between w-full px-3 py-2 bg-${category.color}-50 text-${category.color}-600 rounded-lg hover:bg-${category.color}-100 text-sm font-medium transition-colors`}
                          >
                            <span>Detaylar</span>
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* Investment Categories for Premium Users - Quick Add */}
        {isPremium && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Hızlı Yatırım Ekle</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-4">
              {investmentCategories.map(category => {
                const Icon = category.icon
                return (
                  <button
                    key={category.id}
                    onClick={() => handleAddInvestment(category.id)}
                    className="group p-4 rounded-xl bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300 border border-slate-200 hover:border-blue-300"
                  >
                    <div className={`p-3 rounded-lg bg-gradient-to-br ${category.gradient} shadow-md mx-auto mb-3 w-fit group-hover:scale-110 transition-transform`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <p className="text-sm font-medium text-slate-700 text-center">{category.name}</p>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Premium Modal */}
      <PremiumUpgradeModal
        isOpen={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        featureName="Yatırım Araçları"
        limitInfo={{
          current: 0,
          limit: 0,
          type: 'investments',
        }}
      />
    </div>
  )
}
