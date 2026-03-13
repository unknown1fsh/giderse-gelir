'use client'

import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Crown,
  TrendingUp,
  PieChart,
  BarChart3,
  Calendar,
  Bell,
  Shield,
  Users,
  Zap,
  Target,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Building2,
} from 'lucide-react'
import { useEffect } from 'react'

const premiumFeatures = [
  {
    title: 'Gelişmiş Portföy Analizi',
    description: 'Tüm varlıklarınızı tek bir yerde görün ve detaylı analizler yapın',
    icon: PieChart,
    href: '/portfolio',
    color: 'from-emerald-500 to-green-600',
    iconBg: 'bg-emerald-500/20',
    iconColor: 'text-emerald-400',
  },
  {
    title: 'Detaylı Raporlama',
    description: 'Gelir-gider analizleri, trend grafikleri ve özel raporlar',
    icon: BarChart3,
    href: '/analysis',
    color: 'from-blue-500 to-indigo-600',
    iconBg: 'bg-blue-500/20',
    iconColor: 'text-blue-400',
  },
  {
    title: 'Yatırım Takibi',
    description: 'Hisse senetleri, fonlar ve diğer yatırım araçlarını takip edin',
    icon: TrendingUp,
    href: '/investments',
    color: 'from-purple-500 to-pink-600',
    iconBg: 'bg-purple-500/20',
    iconColor: 'text-purple-400',
  },
  {
    title: 'Altın ve Değerli Madenler',
    description: 'Altın, gümüş ve değerli taş takibinizi yapın',
    icon: Sparkles,
    href: '/gold',
    color: 'from-yellow-500 to-amber-600',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    title: 'Otomatik Ödemeler',
    description: 'Düzenli ödemelerinizi otomatik olarak kaydedin',
    icon: Calendar,
    href: '/auto-payments',
    color: 'from-orange-500 to-red-600',
    iconBg: 'bg-orange-500/20',
    iconColor: 'text-orange-400',
  },
  {
    title: 'Akıllı Bildirimler',
    description: 'Önemli finansal olaylar için anlık bildirimler alın',
    icon: Bell,
    href: '/settings',
    color: 'from-cyan-500 to-blue-600',
    iconBg: 'bg-cyan-500/20',
    iconColor: 'text-cyan-400',
  },
  {
    title: 'Gelişmiş Güvenlik',
    description: 'İki faktörlü kimlik doğrulama ve şifreleme',
    icon: Shield,
    href: '/settings',
    color: 'from-red-500 to-rose-600',
    iconBg: 'bg-red-500/20',
    iconColor: 'text-red-400',
  },
  {
    title: 'Çoklu Hesap Yönetimi',
    description: 'Sınırsız banka hesabı ve kredi kartı ekleyin',
    icon: Users,
    href: '/accounts',
    color: 'from-violet-500 to-purple-600',
    iconBg: 'bg-violet-500/20',
    iconColor: 'text-violet-400',
  },
]

const enterpriseFeatures = [
  {
    title: 'Kurumsal Dashboard',
    description: 'Şirket finansal verileriniz için özel dashboard',
    icon: Building2,
    href: '/enterprise-dashboard',
    color: 'from-slate-500 to-gray-600',
    iconBg: 'bg-slate-500/20',
    iconColor: 'text-slate-400',
  },
  {
    title: 'API Erişimi',
    description: 'Verilerinize programatik erişim ve entegrasyonlar',
    icon: Zap,
    href: '/enterprise',
    color: 'from-yellow-500 to-orange-600',
    iconBg: 'bg-yellow-500/20',
    iconColor: 'text-yellow-400',
  },
  {
    title: 'Özel Hedef Belirleme',
    description: 'Kurumsal finansal hedefler ve takip sistemi',
    icon: Target,
    href: '/enterprise',
    color: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-500/20',
    iconColor: 'text-pink-400',
  },
]

export default function PremiumFeaturesPage() {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="text-white text-lg">Yükleniyor...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isPremium = user.plan === 'premium' || user.plan === 'enterprise'
  const isEnterprise = user.plan === 'enterprise'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="mx-auto max-w-7xl">
        {/* Başlık */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex items-center justify-center space-x-3">
            <div className="rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 p-3 border border-yellow-500/30">
              <Crown className="h-8 w-8 text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent">
              {isEnterprise ? 'Enterprise' : 'Premium'} Özellikler
            </h1>
            <Sparkles className="h-8 w-8 text-yellow-400" />
          </div>
          <p className="text-slate-300 text-lg">
            {isPremium
              ? 'Tüm premium özelliklerinize hızlı erişim'
              : 'Premium planla kazanacağınız tüm özellikler'}
          </p>
        </div>

        {/* Premium Özellikler */}
        <div className="mb-12">
          <h2 className="mb-6 text-2xl font-bold text-white flex items-center space-x-2">
            <CheckCircle2 className="h-6 w-6 text-green-400" />
            <span>Premium Özellikler</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {premiumFeatures.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group relative overflow-hidden rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-slate-700/50 p-6 transition-all duration-300 hover:bg-slate-800/80 hover:border-slate-600 hover:shadow-2xl hover:scale-105"
              >
                <div className="relative z-10">
                  <div className={`mb-4 inline-flex rounded-xl ${feature.iconBg} p-3`}>
                    <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-yellow-300 group-hover:to-amber-300 group-hover:bg-clip-text transition-all">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4">{feature.description}</p>
                  <div className="flex items-center text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-medium">Şimdi Kullan</span>
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </div>
                </div>
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                ></div>
              </Link>
            ))}
          </div>
        </div>

        {/* Enterprise Özellikler */}
        {isEnterprise && (
          <div className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-white flex items-center space-x-2">
              <Building2 className="h-6 w-6 text-purple-400" />
              <span>Enterprise Özellikler</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enterpriseFeatures.map((feature, index) => (
                <Link
                  key={index}
                  href={feature.href}
                  className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800/80 to-purple-900/20 backdrop-blur-xl border border-purple-500/30 p-6 transition-all duration-300 hover:border-purple-400 hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105"
                >
                  <div className="relative z-10">
                    <div className={`mb-4 inline-flex rounded-xl ${feature.iconBg} p-3`}>
                      <feature.icon className={`h-6 w-6 ${feature.iconColor}`} />
                    </div>
                    <h3 className="mb-2 text-lg font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-300 group-hover:to-pink-300 group-hover:bg-clip-text transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400 mb-4">{feature.description}</p>
                    <div className="flex items-center text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium">Şimdi Kullan</span>
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </div>
                  </div>
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-10 transition-opacity`}
                  ></div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Free Kullanıcı için Yükseltme Çağrısı */}
        {!isPremium && (
          <div className="mt-12 text-center">
            <div className="rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-purple-500/30 p-8">
              <Crown className="mx-auto mb-4 h-16 w-16 text-yellow-400 animate-bounce" />
              <h3 className="mb-4 text-3xl font-bold text-white">
                Premium'a Geçin, Tüm Özelliklerin Kilidini Açın!
              </h3>
              <p className="mb-6 text-slate-300 text-lg">
                Finansal yönetiminizi bir üst seviyeye taşıyın
              </p>
              <a
                href="https://www.shopier.com/cinarinovasyon/45196765"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-lg font-bold text-white shadow-mosaic hover:from-purple-700 hover:to-pink-700 transition-all hover:scale-105"
              >
                <span>Premium Satın Al</span>
                <ArrowRight className="h-5 w-5" />
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
