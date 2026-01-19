'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { usePremium } from '@/lib/use-premium'
import { useUser } from '@/lib/user-context'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Calendar,
  Crown,
  Download,
  Eye,
  FileText,
  Home,
  Minus,
  Share2,
  Shield,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  X,
} from 'lucide-react'
/*
import {
  TrendingUp,
  TrendingDown,
  Minus,
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
  Activity,
  BarChart3,
  PieChart,
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
  Home,
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

export default function TrendsAnalysis() {
  const router = useRouter()
  const [selectedFeature, setSelectedFeature] = useState<string | null>(null)
  const { handlePremiumFeature } = usePremium()
  const { user } = useUser()

  // Kullanıcı tipi tespiti
  const isEnterpriseUser =
    user?.email?.includes('enterprise') || user?.plan === 'enterprise_premium'

  const handleBack = () => {
    router.back()
  }

  const handleHome = () => {
    router.push('/dashboard')
  }

  // Premium özellikler
  // Şahıs Premium özellikler
  const individualPremiumFeatures: PremiumFeature[] = [
    {
      id: 'predictive-analysis',
      title: 'Tahmin Analizi',
      description: 'AI destekli gelecek trend tahminleri',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-600',
      performance: 'AI',
      action: 'Tahmin Yap',
      onClick: () =>
        handlePremiumFeature('Tahmin Analizi', () => setSelectedFeature('predictive-analysis')),
    },
    {
      id: 'seasonal-trends',
      title: 'Mevsimsel Trendler',
      description: 'Mevsimsel harcama kalıpları analizi',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-600',
      performance: 'Season',
      action: 'Analiz Et',
      onClick: () =>
        handlePremiumFeature('Mevsimsel Trendler', () => setSelectedFeature('seasonal-trends')),
    },
    {
      id: 'market-insights',
      title: 'Pazar İçgörüleri',
      description: 'Pazar trendleri ve fırsat analizi',
      icon: BarChart3,
      gradient: 'from-green-500 to-emerald-600',
      performance: 'Market',
      action: 'İçgörüleri Gör',
      onClick: () =>
        handlePremiumFeature('Pazar İçgörüleri', () => setSelectedFeature('market-insights')),
    },
    {
      id: 'investment-trends',
      title: 'Yatırım Trendleri',
      description: 'Yatırım fırsatları ve trend analizi',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-600',
      performance: 'Invest',
      action: 'Fırsatları Gör',
      onClick: () =>
        handlePremiumFeature('Yatırım Trendleri', () => setSelectedFeature('investment-trends')),
    },
    {
      id: 'spending-forecast',
      title: 'Harcama Tahmini',
      description: 'Gelecek harcama tahminleri ve planlama',
      icon: Target,
      gradient: 'from-indigo-500 to-purple-600',
      performance: 'Forecast',
      action: 'Tahmin Oluştur',
      onClick: () =>
        handlePremiumFeature('Harcama Tahmini', () => setSelectedFeature('spending-forecast')),
    },
    {
      id: 'risk-analysis',
      title: 'Risk Analizi',
      description: 'Finansal risk değerlendirmesi ve uyarılar',
      icon: Shield,
      gradient: 'from-red-500 to-rose-600',
      performance: 'Risk',
      action: 'Risk Analiz Et',
      onClick: () =>
        handlePremiumFeature('Risk Analizi', () => setSelectedFeature('risk-analysis')),
    },
    {
      id: 'trend-reports',
      title: 'Trend Raporları',
      description: 'Kapsamlı trend analiz raporları',
      icon: FileText,
      gradient: 'from-teal-500 to-cyan-600',
      performance: 'PDF',
      action: 'Rapor Oluştur',
      onClick: () => setSelectedFeature('trend-reports'),
    },
  ]

  // Kurumsal Premium özellikler
  const enterprisePremiumFeatures: PremiumFeature[] = [
    {
      id: 'enterprise-predictive',
      title: 'Kurumsal Tahmin',
      description: 'AI destekli kurumsal gelecek trend tahminleri',
      icon: Brain,
      gradient: 'from-purple-500 to-pink-600',
      performance: 'AI',
      action: 'Tahmin Yap',
      onClick: () =>
        handlePremiumFeature('Kurumsal Tahmin', () => setSelectedFeature('enterprise-predictive')),
    },
    {
      id: 'enterprise-seasonal',
      title: 'Kurumsal Mevsimsel',
      description: 'Kurumsal mevsimsel harcama kalıpları analizi',
      icon: Calendar,
      gradient: 'from-blue-500 to-cyan-600',
      performance: 'Season',
      action: 'Analiz Et',
      onClick: () =>
        handlePremiumFeature('Kurumsal Mevsimsel', () => setSelectedFeature('enterprise-seasonal')),
    },
    {
      id: 'enterprise-market',
      title: 'Kurumsal Pazar',
      description: 'Kurumsal pazar trendleri ve fırsat analizi',
      icon: BarChart3,
      gradient: 'from-green-500 to-emerald-600',
      performance: 'Market',
      action: 'İçgörüleri Gör',
      onClick: () =>
        handlePremiumFeature('Kurumsal Pazar', () => setSelectedFeature('enterprise-market')),
    },
    {
      id: 'enterprise-investment',
      title: 'Kurumsal Yatırım',
      description: 'Kurumsal yatırım fırsatları ve trend analizi',
      icon: TrendingUp,
      gradient: 'from-orange-500 to-red-600',
      performance: 'Invest',
      action: 'Fırsatları Gör',
      onClick: () =>
        handlePremiumFeature('Kurumsal Yatırım', () => setSelectedFeature('enterprise-investment')),
    },
    {
      id: 'enterprise-forecast',
      title: 'Kurumsal Tahmin',
      description: 'Kurumsal gelecek harcama tahminleri ve planlama',
      icon: Target,
      gradient: 'from-indigo-500 to-purple-600',
      performance: 'Forecast',
      action: 'Tahmin Oluştur',
      onClick: () =>
        handlePremiumFeature('Kurumsal Tahmin', () => setSelectedFeature('enterprise-forecast')),
    },
    {
      id: 'enterprise-risk',
      title: 'Kurumsal Risk',
      description: 'Kurumsal finansal risk değerlendirmesi ve uyarılar',
      icon: Shield,
      gradient: 'from-red-500 to-rose-600',
      performance: 'Risk',
      action: 'Risk Analiz Et',
      onClick: () =>
        handlePremiumFeature('Kurumsal Risk', () => setSelectedFeature('enterprise-risk')),
    },
    {
      id: 'enterprise-reports',
      title: 'Kurumsal Raporlar',
      description: 'Kapsamlı kurumsal trend analiz raporları',
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

            {selectedFeature === 'predictive-analysis' && <PredictiveAnalysisModal />}

            {selectedFeature === 'seasonal-trends' && <SeasonalTrendsModal />}

            {selectedFeature === 'market-insights' && <MarketInsightsModal />}

            {selectedFeature === 'investment-trends' && <InvestmentTrendsModal />}

            {selectedFeature === 'spending-forecast' && <SpendingForecastModal />}

            {selectedFeature === 'risk-analysis' && <RiskAnalysisModal />}

            {selectedFeature === 'trend-reports' && <TrendReportsModal />}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                <BarChart3 className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {isEnterpriseUser ? 'Kurumsal Trend Analizi' : 'Trend Analizi'}
                </h1>
                <p className="text-gray-600">
                  {isEnterpriseUser
                    ? 'Enterprise AI destekli kurumsal finansal trend analizi ve tahminleme'
                    : 'Premium AI destekli finansal trend analizi ve tahminleme'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Geri
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleHome}
                className="flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Anasayfa
              </Button>
            </div>
          </div>
        </div>

        {/* Premium Aksiyonlar */}
        <Card className="mb-8 border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <Crown className="w-6 h-6 text-yellow-500" />
              {isEnterpriseUser
                ? 'Kurumsal Premium Trend Aksiyonları'
                : 'Premium Trend Aksiyonları'}
              <Badge
                variant="secondary"
                className="bg-gradient-to-r from-purple-400 to-pink-500 text-white"
              >
                {isEnterpriseUser ? 'Enterprise AI' : 'AI Destekli'}
              </Badge>
            </CardTitle>
            <p className="text-gray-600">
              {isEnterpriseUser
                ? 'Kurumsal trend analizine dayalı aksiyon önerileri'
                : 'Trend analizine dayalı aksiyon önerileri'}
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

        {/* Ana Trend Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Aylık Trend</p>
                  <p className="text-2xl font-bold text-green-700">Pozitif</p>
                  <p className="text-xs text-green-600 flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    +18.7%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-green-500 text-white">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">3 Aylık Ortalama</p>
                  <p className="text-2xl font-bold text-blue-700">₺12,450</p>
                  <p className="text-xs text-blue-600 flex items-center mt-1">
                    <Minus className="w-3 h-3 mr-1" />
                    +2.3%
                  </p>
                </div>
                <div className="p-3 rounded-full bg-blue-500 text-white">
                  <BarChart3 className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-violet-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Tahmin Doğruluğu</p>
                  <p className="text-2xl font-bold text-purple-700">%94.2</p>
                  <p className="text-xs text-purple-600 flex items-center mt-1">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Destekli
                  </p>
                </div>
                <div className="p-3 rounded-full bg-purple-500 text-white">
                  <Brain className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Risk Seviyesi</p>
                  <p className="text-2xl font-bold text-orange-700">Düşük</p>
                  <p className="text-xs text-orange-600 flex items-center mt-1">
                    <Shield className="w-3 h-3 mr-1" />
                    Güvenli
                  </p>
                </div>
                <div className="p-3 rounded-full bg-orange-500 text-white">
                  <Shield className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Trend Geçmişi */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-purple-500" />6 Aylık Trend Geçmişi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  period: 'Aralık 2024',
                  income: 45230,
                  expenses: 32180,
                  netFlow: 13050,
                  trend: 'up',
                },
                {
                  period: 'Kasım 2024',
                  income: 43800,
                  expenses: 33500,
                  netFlow: 10300,
                  trend: 'up',
                },
                {
                  period: 'Ekim 2024',
                  income: 42100,
                  expenses: 31200,
                  netFlow: 10900,
                  trend: 'up',
                },
                {
                  period: 'Eylül 2024',
                  income: 39500,
                  expenses: 32800,
                  netFlow: 6700,
                  trend: 'down',
                },
                {
                  period: 'Ağustos 2024',
                  income: 38200,
                  expenses: 31500,
                  netFlow: 6700,
                  trend: 'up',
                },
                {
                  period: 'Temmuz 2024',
                  income: 36800,
                  expenses: 32200,
                  netFlow: 4600,
                  trend: 'up',
                },
              ].map((month, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <p className="font-medium text-gray-900">{month.period}</p>
                      <p className="text-sm text-gray-600">₺{month.netFlow.toLocaleString()}</p>
                    </div>
                    <div
                      className={`p-2 rounded-lg ${
                        month.trend === 'up'
                          ? 'bg-green-100 text-green-600'
                          : month.trend === 'down'
                            ? 'bg-red-100 text-red-600'
                            : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {month.trend === 'up' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : month.trend === 'down' ? (
                        <TrendingDown className="w-4 h-4" />
                      ) : (
                        <Minus className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Gelir</p>
                      <p className="font-medium text-green-600">₺{month.income.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Gider</p>
                      <p className="font-medium text-red-600">₺{month.expenses.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Net</p>
                      <p
                        className={`font-medium ${month.netFlow > 0 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        ₺{month.netFlow.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gelecek Tahminleri */}
        <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-500" />
              AI Destekli Gelecek Tahminleri
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                <h3 className="font-bold text-green-800 mb-3">📈 1 Ay Sonra</h3>
                <div className="space-y-2">
                  <p className="text-sm text-green-700">
                    Tahmini Gelir: <span className="font-medium">₺47,500</span>
                  </p>
                  <p className="text-sm text-green-700">
                    Tahmini Gider: <span className="font-medium">₺33,200</span>
                  </p>
                  <p className="text-sm text-green-700">
                    Tahmini Net: <span className="font-bold">₺14,300</span>
                  </p>
                  <Badge className="bg-green-100 text-green-700">+9.6% Artış</Badge>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
                <h3 className="font-bold text-blue-800 mb-3">📊 3 Ay Sonra</h3>
                <div className="space-y-2">
                  <p className="text-sm text-blue-700">
                    Tahmini Gelir: <span className="font-medium">₺49,200</span>
                  </p>
                  <p className="text-sm text-blue-700">
                    Tahmini Gider: <span className="font-medium">₺34,800</span>
                  </p>
                  <p className="text-sm text-blue-700">
                    Tahmini Net: <span className="font-bold">₺14,400</span>
                  </p>
                  <Badge className="bg-blue-100 text-blue-700">+10.3% Artış</Badge>
                </div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
                <h3 className="font-bold text-purple-800 mb-3">🎯 6 Ay Sonra</h3>
                <div className="space-y-2">
                  <p className="text-sm text-purple-700">
                    Tahmini Gelir: <span className="font-medium">₺52,100</span>
                  </p>
                  <p className="text-sm text-purple-700">
                    Tahmini Gider: <span className="font-medium">₺36,500</span>
                  </p>
                  <p className="text-sm text-purple-700">
                    Tahmini Net: <span className="font-bold">₺15,600</span>
                  </p>
                  <Badge className="bg-purple-100 text-purple-700">+19.5% Artış</Badge>
                </div>
              </div>
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
function PredictiveAnalysisModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border border-purple-200">
        <h3 className="text-lg font-bold text-purple-800 mb-3">🔮 AI Tahmin Analizi</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700">Makine öğrenmesi destekli tahminler</span>
          </div>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700">Çoklu faktör analizi</span>
          </div>
          <div className="flex items-center gap-3">
            <Brain className="w-5 h-5 text-purple-600" />
            <span className="text-purple-700">%94.2 doğruluk oranı</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <Brain className="w-4 h-4 mr-2" />
          Tahmin Yap
        </Button>
        <Button variant="outline">
          <BarChart3 className="w-4 h-4 mr-2" />
          Detaylı Analiz
        </Button>
      </div>
    </div>
  )
}

function SeasonalTrendsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-xl border border-blue-200">
        <h3 className="text-lg font-bold text-blue-800 mb-3">📅 Mevsimsel Trend Analizi</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700">Mevsimsel harcama kalıpları</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700">Yıllık döngü analizi</span>
          </div>
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700">Planlama önerileri</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
          <Calendar className="w-4 h-4 mr-2" />
          Analiz Et
        </Button>
        <Button variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          Görselleştir
        </Button>
      </div>
    </div>
  )
}

function MarketInsightsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
        <h3 className="text-lg font-bold text-green-800 mb-3">📊 Pazar İçgörüleri</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Pazar trendleri analizi</span>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Fırsat tespiti</span>
          </div>
          <div className="flex items-center gap-3">
            <BarChart3 className="w-5 h-5 text-green-600" />
            <span className="text-green-700">Rekabet analizi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
          <Eye className="w-4 h-4 mr-2" />
          İçgörüleri Gör
        </Button>
        <Button variant="outline">
          <Share2 className="w-4 h-4 mr-2" />
          Paylaş
        </Button>
      </div>
    </div>
  )
}

function InvestmentTrendsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 rounded-xl border border-orange-200">
        <h3 className="text-lg font-bold text-orange-800 mb-3">💰 Yatırım Trendleri</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700">Yatırım fırsatları</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700">Risk-getiri analizi</span>
          </div>
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-orange-600" />
            <span className="text-orange-700">Portföy önerileri</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-orange-500 to-red-600 text-white">
          <TrendingUp className="w-4 h-4 mr-2" />
          Fırsatları Gör
        </Button>
        <Button variant="outline">
          <Target className="w-4 h-4 mr-2" />
          Portföy Analizi
        </Button>
      </div>
    </div>
  )
}

function SpendingForecastModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
        <h3 className="text-lg font-bold text-indigo-800 mb-3">🎯 Harcama Tahmini</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700">Gelecek harcama tahminleri</span>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700">Bütçe planlama</span>
          </div>
          <div className="flex items-center gap-3">
            <Target className="w-5 h-5 text-indigo-600" />
            <span className="text-indigo-700">Senaryo analizi</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <Target className="w-4 h-4 mr-2" />
          Tahmin Oluştur
        </Button>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Planlama Görünümü
        </Button>
      </div>
    </div>
  )
}

function RiskAnalysisModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 rounded-xl border border-red-200">
        <h3 className="text-lg font-bold text-red-800 mb-3">🛡️ Risk Analizi</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Finansal risk değerlendirmesi</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Erken uyarı sistemi</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-red-600" />
            <span className="text-red-700">Risk azaltma önerileri</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Button className="bg-gradient-to-r from-red-500 to-rose-600 text-white">
          <Shield className="w-4 h-4 mr-2" />
          Risk Analiz Et
        </Button>
        <Button variant="outline">
          <Bell className="w-4 h-4 mr-2" />
          Uyarı Ayarları
        </Button>
      </div>
    </div>
  )
}

function TrendReportsModal() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border border-teal-200">
        <h3 className="text-lg font-bold text-teal-800 mb-3">📋 Trend Analiz Raporları</h3>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-teal-600" />
            <span className="text-teal-700">Kapsamlı trend analizi</span>
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
