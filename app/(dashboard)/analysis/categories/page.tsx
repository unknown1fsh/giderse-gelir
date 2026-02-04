'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePremium } from '@/lib/use-premium'
import { useUser } from '@/lib/user-context'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Crown,
  Download,
  Eye,
  FileText,
  Gift,
  Home,
  Lightbulb,
  PieChart,
  Play,
  Settings,
  Share2,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
/*
import {
  PieChart,
  TrendingUp,
  TrendingDown,
  Target,
  Brain,
  FileText,
  Settings,
  Lightbulb,
  Sparkles,
  Zap,
  Award,
  Star,
  ArrowRight,
  Plus,
  Minus,
  Activity,
  BarChart3,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  Info,
  Download,
  Share2,
  Eye,
  Edit3,
  Trash2,
  RefreshCw,
  Play,
  Pause,
  Volume2,
  Bell,
  Gift,
  Crown,
  Diamond,
  Rocket,
  Shield,
  Lock,
  Unlock,
  Maximize2,
  Minimize2,
  Home,
  X,
  ChevronRight,
  ChevronDown,
  ExternalLink,
  MessageSquare,
  Mail,
  Phone,
  MapPin,
  Globe,
  Wifi,
  Battery,
  Signal,
  WifiOff,
  BatteryLow,
  SignalZero,
  AlertTriangle,
  Check,
  XCircle,
  HelpCircle,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  Grid,
  List,
  Menu,
  MoreHorizontal,
  MoreVertical,
  PlusCircle,
  MinusCircle,
  XCircle as XCircleIcon,
  CheckCircle as CheckCircleIcon,
  AlertCircle as AlertCircleIcon,
  Info as InfoIcon,
  Star as StarIcon,
  Heart,
  ThumbsUp,
  ThumbsDown,
  Flag,
  Bookmark,
  Tag,
  Folder,
  FolderOpen,
  File,
  Image,
  Video,
  Music,
  Archive,
  Trash,
  Recycle,
  Save,
  Copy,
  Paste,
  Cut,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List as ListIcon,
  Indent,
  Outdent,
  Quote,
  Code,
  Link,
  Unlink,
  Table,
  Columns,
  Rows,
  Cell,
  Merge,
  Split,
  Border,
  Fill,
  Color,
  Palette,
  Brush,
  Eraser,
  Crop,
  Rotate,
  Flip,
  Mirror,
  ZoomIn,
  ZoomOut,
  Fit,
  Fullscreen,
  Minimize,
  Close,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight as ArrowRightIcon,
  CornerUpLeft,
  CornerUpRight,
  CornerDownLeft,
  CornerDownRight,
  Move,
  MoveUp,
  MoveDown,
  MoveLeft,
  MoveRight,
  RotateCw,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Maximize,
  Minimize as MinimizeIcon,
  Maximize2 as Maximize2Icon,
  Minimize2 as Minimize2Icon,
  Square,
  Circle,
  Triangle,
  Hexagon,
  Octagon,
  Pentagon,
  Star as StarShape,
  Heart as HeartShape,
  Diamond as DiamondShape,
  Spade,
  Club,
  Flower,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Wind,
  Droplets,
  Thermometer,
  Gauge,
  Timer,
  Stopwatch,
  Clock as ClockIcon,
  Calendar as CalendarIcon,
  CalendarDays,
  CalendarRange,
  CalendarCheck,
  CalendarX,
  CalendarPlus,
  CalendarMinus,
  CalendarSearch,
  CalendarClock,
  CalendarHeart,
  CalendarStar,
  CalendarDollar,
  CalendarEuro,
  CalendarPound,
  CalendarYen,
  CalendarRuble,
  CalendarRupee,
  CalendarWon,
  CalendarYuan,
  CalendarReal,
  CalendarPeso,
  CalendarFranc,
  CalendarLira,
  CalendarKrona,
  CalendarKoruna,
  CalendarForint,
  CalendarZloty,
  CalendarLeu,
  CalendarLev,
  CalendarKuna,
  CalendarDinar,
  CalendarDirham,
  CalendarShekel,
  CalendarRiyal,
  CalendarDinar as CalendarDinarIcon,
  CalendarDirham as CalendarDirhamIcon,
  CalendarShekel as CalendarShekelIcon,
  CalendarRiyal as CalendarRiyalIcon,
  CalendarDinar as CalendarDinarIcon2,
  CalendarDirham as CalendarDirhamIcon2,
  CalendarShekel as CalendarShekelIcon2,
  CalendarRiyal as CalendarRiyalIcon2,
} from 'lucide-react'
*/

interface CategoryData {
  name: string
  amount: number
  percentage: number
  trend: number
  budget: number
  color: string
}

type CategoryStatus = 'over' | 'under' | 'on'
type CategoryDataItem = CategoryData & { status: CategoryStatus }

interface PremiumFeature {
  id: string
  title: string
  description: string
  icon: any
  gradient: string
  performance: string
  action: string
  onClick: () => void
}

export default function CategoriesAnalysis() {
  const router = useRouter()
  const { user } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const [categoryData, setCategoryData] = useState<CategoryDataItem[]>([])
  const { handlePremiumFeature } = usePremium()

  // Kullanıcı tipi tespiti
  const isEnterpriseUser =
    user?.email?.includes('enterprise') || user?.plan === 'enterprise_premium'

  const handleBack = () => {
    router.back()
  }

  const handleHome = () => {
    router.push('/dashboard')
  }

  const colorPalette = [
    'from-red-400 to-red-600',
    'from-blue-400 to-blue-600',
    'from-purple-400 to-purple-600',
    'from-green-400 to-green-600',
    'from-orange-400 to-orange-600',
    'from-gray-400 to-gray-600',
  ]

  useEffect(() => {
    async function loadCategoryData() {
      const res = await fetch('/api/analysis/categories', { credentials: 'include' })
      if (!res.ok) {
        if (res.status === 403) {
          setCategoryData([])
        } else {
          setCategoryData([])
        }
        setIsLoading(false)
        return
      }
      const json = (await res.json()) as { categories: Array<{ name: string; amount: number; percentage: number; monthlyGrowth?: number; trend?: string }> }
      const cats = json.categories || []
      const data: CategoryDataItem[] = cats.map((c, i) => ({
        name: c.name,
        amount: c.amount,
        percentage: c.percentage,
        trend: c.monthlyGrowth ?? (c.trend === 'up' ? 5 : c.trend === 'down' ? -5 : 0),
        budget: 0,
        color: colorPalette[i % colorPalette.length],
        status: 'on' as const,
      }))
      setCategoryData(data)
      setIsLoading(false)
    }
    void loadCategoryData()
  }, [user])

  // Şahıs Premium özellikler
  const individualPremiumFeatures: PremiumFeature[] = [
    {
      id: 'smart-budget',
      title: 'Akıllı Bütçe',
      description: 'AI destekli bütçe optimizasyonu',
      icon: Target,
      gradient: 'from-blue-500 to-cyan-600',
      performance: 'Smart',
      action: 'Bütçe Oluştur',
      onClick: () => handlePremiumFeature('Akıllı Bütçe', () => setSelectedFeature('smart-budget')),
    },
    {
      id: 'expense-tracking',
      title: 'Harcama Takibi',
      description: 'Otomatik kategori bazlı harcama analizi',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-600',
      performance: 'Auto',
      action: 'Takip Başlat',
      onClick: () =>
        handlePremiumFeature('Harcama Takibi', () => setSelectedFeature('expense-tracking')),
    },
    {
      id: 'saving-opportunities',
      title: 'Tasarruf Fırsatları',
      description: 'Kategori bazlı tasarruf önerileri',
      icon: Lightbulb,
      gradient: 'from-yellow-500 to-orange-600',
      performance: 'Save',
      action: 'Fırsatları Gör',
      onClick: () =>
        handlePremiumFeature('Tasarruf Fırsatları', () =>
          setSelectedFeature('saving-opportunities')
        ),
    },
    {
      id: 'category-insights',
      title: 'Kategori Analizi',
      description: 'Derinlemesine kategori performans analizi',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-600',
      performance: 'Insight',
      action: 'Analiz Et',
      onClick: () =>
        handlePremiumFeature('Kategori Analizi', () => setSelectedFeature('category-insights')),
    },
    {
      id: 'budget-alerts',
      title: 'Bütçe Uyarıları',
      description: 'Akıllı bütçe aşım uyarıları',
      icon: Bell,
      gradient: 'from-red-500 to-pink-600',
      performance: 'Alert',
      action: 'Uyarı Kur',
      onClick: () =>
        handlePremiumFeature('Bütçe Uyarıları', () => setSelectedFeature('budget-alerts')),
    },
    {
      id: 'ai-spending-patterns',
      title: 'AI Harcama Kalıpları',
      description: 'AI destekli harcama kalıbı analizi',
      icon: Brain,
      gradient: 'from-indigo-500 to-purple-600',
      performance: 'AI',
      action: 'Kalıpları Analiz Et',
      onClick: () =>
        handlePremiumFeature('AI Harcama Kalıpları', () =>
          setSelectedFeature('ai-spending-patterns')
        ),
    },
    {
      id: 'category-reports',
      title: 'Kategori Raporları',
      description: 'Detaylı kategori performans raporları',
      icon: FileText,
      gradient: 'from-orange-500 to-red-600',
      performance: 'PDF',
      action: 'Rapor Oluştur',
      onClick: () =>
        handlePremiumFeature('Kategori Raporları', () => setSelectedFeature('category-reports')),
    },
  ]

  // Kurumsal Premium özellikler
  const enterprisePremiumFeatures: PremiumFeature[] = [
    {
      id: 'enterprise-budget',
      title: 'Kurumsal Bütçe',
      description: 'AI destekli kurumsal bütçe optimizasyonu',
      icon: Target,
      gradient: 'from-blue-500 to-cyan-600',
      performance: 'Smart',
      action: 'Bütçe Oluştur',
      onClick: () =>
        handlePremiumFeature('Kurumsal Bütçe', () => setSelectedFeature('enterprise-budget')),
    },
    {
      id: 'enterprise-tracking',
      title: 'Kurumsal Takip',
      description: 'Otomatik kurumsal kategori bazlı harcama analizi',
      icon: Activity,
      gradient: 'from-green-500 to-emerald-600',
      performance: 'Auto',
      action: 'Takip Başlat',
      onClick: () =>
        handlePremiumFeature('Kurumsal Takip', () => setSelectedFeature('enterprise-tracking')),
    },
    {
      id: 'enterprise-optimization',
      title: 'Kurumsal Optimizasyon',
      description: 'Kurumsal kategori bazlı maliyet optimizasyonu',
      icon: Lightbulb,
      gradient: 'from-yellow-500 to-orange-600',
      performance: 'Save',
      action: 'Optimize Et',
      onClick: () =>
        handlePremiumFeature('Kurumsal Optimizasyon', () =>
          setSelectedFeature('enterprise-optimization')
        ),
    },
    {
      id: 'enterprise-analytics',
      title: 'Kurumsal Analitik',
      description: 'Derinlemesine kurumsal kategori performans analizi',
      icon: BarChart3,
      gradient: 'from-purple-500 to-pink-600',
      performance: 'Insight',
      action: 'Analiz Et',
      onClick: () =>
        handlePremiumFeature('Kurumsal Analitik', () => setSelectedFeature('enterprise-analytics')),
    },
    {
      id: 'enterprise-alerts',
      title: 'Kurumsal Uyarılar',
      description: 'Akıllı kurumsal bütçe aşım uyarıları',
      icon: Bell,
      gradient: 'from-red-500 to-rose-600',
      performance: 'Alert',
      action: 'Uyarı Kur',
      onClick: () =>
        handlePremiumFeature('Bütçe Uyarıları', () => setSelectedFeature('budget-alerts')),
    },
    {
      id: 'enterprise-patterns',
      title: 'Kurumsal Kalıplar',
      description: 'AI destekli kurumsal harcama kalıbı analizi',
      icon: Brain,
      gradient: 'from-indigo-500 to-purple-600',
      performance: 'AI',
      action: 'Kalıpları Analiz Et',
      onClick: () =>
        handlePremiumFeature('Kurumsal Kalıplar', () => setSelectedFeature('enterprise-patterns')),
    },
    {
      id: 'enterprise-reports',
      title: 'Kurumsal Raporlar',
      description: 'Detaylı kurumsal kategori performans raporları',
      icon: FileText,
      gradient: 'from-teal-500 to-cyan-600',
      performance: 'PDF',
      action: 'Rapor Oluştur',
      onClick: () => setSelectedFeature('enterprise-reports'),
    },
  ]

  // Kullanıcı tipine göre premium özellikleri seç
  const premiumFeatures = isEnterpriseUser ? enterprisePremiumFeatures : individualPremiumFeatures

  // Modal render fonksiyonu
  const renderModal = () => {
    if (!selectedFeature) {
      return null
    }

    const feature = premiumFeatures.find(f => f.id === selectedFeature)
    if (!feature) {
      return null
    }

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className={`h-2 bg-gradient-to-r ${feature.gradient} rounded-t-2xl`} />

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white`}>
                  <feature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{feature.title}</h2>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedFeature(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {selectedFeature === 'smart-budget' && <SmartBudgetModal />}

            {selectedFeature === 'expense-tracking' && <ExpenseTrackingModal />}

            {selectedFeature === 'saving-opportunities' && <SavingOpportunitiesModal />}

            {selectedFeature === 'category-insights' && <CategoryInsightsModal />}

            {selectedFeature === 'budget-alerts' && <BudgetAlertsModal />}

            {selectedFeature === 'spending-patterns' && <SpendingPatternsModal />}

            {selectedFeature === 'category-reports' && <CategoryReportsModal />}
          </div>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-green-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          {/* Navigation Buttons */}
          <div className="flex items-center gap-3 mb-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleBack}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4" />
              Geri
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleHome}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <Home className="w-4 h-4" />
              Anasayfa
            </Button>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <PieChart className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isEnterpriseUser ? 'Kurumsal Kategori Analizi' : 'Kategori Analizi'}
              </h1>
              <p className="text-gray-600">
                {isEnterpriseUser
                  ? 'Enterprise AI destekli kurumsal kategori bazlı harcama analizi'
                  : 'Premium AI destekli kategori bazlı harcama analizi'}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Aksiyonlar */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              {isEnterpriseUser
                ? 'Kurumsal Premium Kategori Aksiyonları'
                : 'Premium Kategori Aksiyonları'}
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-green-400 to-emerald-500 text-white"
              >
                {isEnterpriseUser ? 'Enterprise AI' : 'AI Destekli'}
              </Badge>
            </CardTitle>
            <p className="text-gray-600">
              {isEnterpriseUser
                ? 'Kurumsal kategori bazlı tasarruf ve optimizasyon aksiyonları'
                : 'Kategori bazlı tasarruf ve optimizasyon aksiyonları'}
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {premiumFeatures.map(feature => (
                <div
                  key={feature.id}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${feature.gradient} p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl`}
                  onClick={feature.onClick}
                >
                  {/* Performance Badge */}
                  <div className="absolute top-4 right-4">
                    <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
                      {feature.performance}
                    </Badge>
                  </div>

                  {/* Icon */}
                  <div className="mb-4">
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>

                  {/* Content */}
                  <div className="text-white">
                    <h3 className="text-lg font-bold mb-2">{feature.title}</h3>
                    <p className="text-sm text-white/90 mb-4">{feature.description}</p>

                    {/* Action Button */}
                    <Button
                      size="sm"
                      className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm"
                    >
                      {feature.action}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>

                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ana Kategori Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {categoryData.map((category, index) => (
            <Card
              key={index}
              className="border-0 shadow-lg bg-gradient-to-br from-slate-50 to-slate-100 hover:shadow-xl transition-all duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{category.name}</p>
                    <p className="text-2xl font-bold text-slate-700">
                      ₺{category.amount.toLocaleString()}
                    </p>
                    <p
                      className={`text-xs flex items-center mt-1 ${category.trend > 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {category.trend > 0 ? (
                        <TrendingUp className="w-3 h-3 mr-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 mr-1" />
                      )}
                      {category.trend > 0 ? '+' : ''}
                      {category.trend}%
                    </p>
                  </div>
                  <div className={`p-3 rounded-full bg-gradient-to-r ${category.color} text-white`}>
                    <PieChart className="w-6 h-6" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Bütçe</span>
                    <span className="text-gray-900">₺{category.budget.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full bg-gradient-to-r ${category.color}`}
                      style={{ width: `${Math.min(category.percentage, 100)}%` }}
                    ></div>
                  </div>
                  <p
                    className={`text-xs ${category.status === 'over' ? 'text-red-600' : 'text-green-600'}`}
                  >
                    {category.status === 'over'
                      ? `%${Math.round(category.percentage - 100)} aşım`
                      : 'Bütçe içinde'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Detaylı Kategori Analizi */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-500" />
              Detaylı Kategori Performansı
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {categoryData.map((category, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-4 h-4 rounded-full bg-gradient-to-r ${category.color}`} />
                    <div>
                      <p className="font-medium text-gray-900">{category.name}</p>
                      <p className="text-sm text-gray-600">₺{category.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="font-medium text-gray-900">%{category.percentage}</p>
                      <p
                        className={`text-sm flex items-center ${category.trend > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {category.trend > 0 ? (
                          <TrendingUp className="w-3 h-3 mr-1" />
                        ) : (
                          <TrendingDown className="w-3 h-3 mr-1" />
                        )}
                        %{Math.abs(category.trend)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">
                        Bütçe: ₺{category.budget.toLocaleString()}
                      </p>
                      <Badge
                        variant={category.status === 'over' ? 'destructive' : 'secondary'}
                        className={
                          category.status === 'over'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-green-100 text-green-700'
                        }
                      >
                        {category.status === 'over' ? 'Aşım' : 'İyi'}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal Render */}
      {renderModal()}
    </div>
  )
}

// Modal Components
function SmartBudgetModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3">🎯 Akıllı Bütçe Optimizasyonu</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700">AI destekli bütçe önerileri</span>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700">Otomatik bütçe ayarlamaları</span>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700">Kişiselleştirilmiş hedefler</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <Sparkles className="w-4 h-4 mr-2" />
          Bütçe Oluştur
        </Button>
        <Button variant="outline">
          <Settings className="w-4 h-4 mr-2" />
          Ayarları Düzenle
        </Button>
      </div>
    </div>
  )
}

function ExpenseTrackingModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-bold text-green-800 mb-3">📊 Otomatik Harcama Takibi</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Gerçek zamanlı kategori tanıma</span>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Akıllı harcama sınıflandırması</span>
          </div>
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Otomatik bildirimler</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <Play className="w-4 h-4 mr-2" />
          Takip Başlat
        </Button>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Canlı Görünüm
        </Button>
      </div>
    </div>
  )
}

function SavingOpportunitiesModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-yellow-50 to-orange-50 p-6 rounded-xl border border-yellow-200">
        <h3 className="text-lg font-bold text-yellow-800 mb-3">💡 Tasarruf Fırsatları</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700">Kategori bazlı tasarruf önerileri</span>
          </div>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700">Alternatif hizmet önerileri</span>
          </div>
          <div className="flex items-center gap-3">
            <Lightbulb className="w-5 h-5 text-yellow-600" />
            <span className="text-yellow-700">İndirim fırsatları takibi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white">
          <Gift className="w-4 h-4 mr-2" />
          Fırsatları Gör
        </Button>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Bildirimleri Aç
        </Button>
      </div>
    </div>
  )
}

function CategoryInsightsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-bold text-purple-800 mb-3">📈 Kategori Performans Analizi</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700">Detaylı performans metrikleri</span>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700">Trend analizi ve tahminler</span>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700">Karşılaştırmalı analiz</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <BarChart3 className="w-4 h-4 mr-2" />
          Analiz Et
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Paylaş
        </Button>
      </div>
    </div>
  )
}

function BudgetAlertsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border border-red-200">
        <h3 className="text-lg font-bold text-red-800 mb-3">🚨 Akıllı Bütçe Uyarıları</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Bütçe aşım uyarıları</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Anormal harcama tespiti</span>
          </div>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Kişiselleştirilmiş bildirimler</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
          <Settings className="w-4 h-4 mr-2" />
          Uyarı Kur
        </Button>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Bildirim Ayarları
        </Button>
      </div>
    </div>
  )
}

function SpendingPatternsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-800 mb-3">🧠 AI Harcama Kalıbı Analizi</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700">Harcama kalıbı tespiti</span>
          </div>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700">Tahminleme ve öneriler</span>
          </div>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700">Anomali tespiti</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <Brain className="w-4 h-4 mr-2" />
          Kalıpları Analiz Et
        </Button>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Görselleştir
        </Button>
      </div>
    </div>
  )
}

function CategoryReportsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
        <h3 className="text-lg font-bold text-teal-800 mb-3">📋 Detaylı Kategori Raporları</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-600" />
            <span className="text-teal-700">Kapsamlı performans raporları</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-600" />
            <span className="text-teal-700">Excel ve PDF formatları</span>
          </div>
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-600" />
            <span className="text-teal-700">Grafik ve görselleştirmeler</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          <Download className="w-4 h-4 mr-2" />
          Rapor Oluştur
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Paylaş
        </Button>
      </div>
    </div>
  )
}
