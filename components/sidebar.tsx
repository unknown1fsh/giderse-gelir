'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import PeriodSelector from '@/components/period-selector'
import { isPremiumPlan } from '@/lib/plan-config'
import {
  Wallet,
  Settings,
  Plus,
  BarChart3,
  Sparkles,
  PieChart,
  User,
  Crown,
  LogOut,
  Building2,
  X,
  Shield,
  Brain,
  HelpCircle,
} from 'lucide-react'

const navigation = [
  { name: 'Toplam Varlık', href: '/portfolio', icon: PieChart, color: 'text-emerald-500' },
  { name: 'İşlemler', href: '/transactions', icon: Plus, color: 'text-green-500' },
  { name: 'Hesaplar', href: '/accounts', icon: Wallet, color: 'text-purple-500' },
  { name: 'Diğer Yatırım Araçları', href: '/investments', icon: Building2, color: 'text-cyan-500' },
  { name: 'Analiz ve Raporlar', href: '/analysis', icon: BarChart3, color: 'text-indigo-500' },
  {
    name: 'AI Analiz Raporu',
    href: '/ai-analysis',
    icon: Brain,
    color: 'text-pink-500',
    premium: true,
  },
  { name: 'Yardım', href: '/help', icon: HelpCircle, color: 'text-blue-500' },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const pathname = usePathname()
  const { user, logout, refreshUser } = useUser()

  // Plan değişikliklerini dinle
  useEffect(() => {
    const handlePlanChange = () => {
      void refreshUser()
    }

    window.addEventListener('plan-changed', handlePlanChange)
    return () => {
      window.removeEventListener('plan-changed', handlePlanChange)
    }
  }, [refreshUser])

  const handleLogout = async () => {
    await logout()
  }

  const handleLinkClick = () => {
    // Mobilde link'e tıklayınca sidebar'ı kapat
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop Overlay - Sadece mobilde ve sidebar açıkken */}
      {isOpen && onClose && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex h-screen w-72 flex-col 
          bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white shadow-2xl
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo ve Başlık - Dashboard'a Yönlendirme */}
        <div className="shrink-0 border-b border-slate-700/50">
          <div className="relative">
            {/* Close Button - Sadece mobilde */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-4 top-6 lg:hidden z-10 p-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            )}

            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className="flex h-20 items-center justify-center bg-gradient-to-r from-blue-600/20 to-purple-600/20 hover:from-blue-600/30 hover:to-purple-600/30 transition-all duration-200 group cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg group-hover:scale-110 transition-transform">
                  <span className="text-3xl font-bold text-white">₺</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent group-hover:from-blue-300 group-hover:to-purple-300 transition-all">
                    GiderSE-Gelir
                  </h1>
                  <p className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    Finans Yönetimi
                  </p>
                </div>
              </div>
            </Link>
          </div>

          {/* Kullanıcı Plan Bilgisi */}
          {user && (
            <div className="flex items-center justify-center py-3 px-6">
              {user.plan === 'premium' ||
              user.plan === 'enterprise' ||
              user.plan === 'enterprise_premium' ? (
                <Link
                  href="/premium-features"
                  onClick={handleLinkClick}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 shadow-lg hover:from-yellow-500/30 hover:to-amber-500/30 hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer group"
                >
                  <Crown className="h-4 w-4 text-yellow-400 animate-pulse group-hover:animate-bounce" />
                  <span className="text-sm font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-300 bg-clip-text text-transparent group-hover:from-yellow-200 group-hover:via-yellow-300 group-hover:to-amber-200">
                    {user.plan === 'enterprise_premium'
                      ? 'Kurumsal Premium'
                      : user.plan === 'enterprise'
                        ? 'Enterprise'
                        : 'Premium'}
                  </span>
                  <Sparkles className="h-3 w-3 text-yellow-400 group-hover:text-yellow-300" />
                </Link>
              ) : (
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-700/30 border border-slate-600/50">
                  <User className="h-4 w-4 text-slate-400" />
                  <span className="text-sm font-medium text-slate-300">Free</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Free kullanıcı için Premium Satın Al butonu */}
        {user && (user.plan === 'free' || !user.plan) && (
          <div className="mx-6 my-4 shrink-0">
            <Link
              href="/premium"
              onClick={handleLinkClick}
              className="block p-4 bg-gradient-to-r from-purple-600/20 to-pink-600/20 backdrop-blur-sm rounded-xl border border-purple-500/30 hover:from-purple-600/30 hover:to-pink-600/30 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 group-hover:scale-110 transition-transform">
                  <Crown className="h-4 w-4 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-white font-semibold text-sm">Premium Satın Al</p>
                  <p className="text-xs text-purple-200">Gelişmiş özellikler</p>
                </div>
                <div className="text-purple-300 group-hover:text-white transition-colors">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Dönem Seçici */}
        {user && (
          <div className="px-6 mb-4 shrink-0">
            <PeriodSelector />
          </div>
        )}

        {/* Navigasyon - Scrollable */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 space-y-2 p-6 scrollbar-thin">
          {navigation.map(item => {
            // Premium özellik kontrolü
            if (item.premium && user && !isPremiumPlan(user.plan)) {
              return null
            }

            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleLinkClick}
                className={`group flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-lg border border-blue-500/30'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white hover:shadow-md'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                    isActive
                      ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-md'
                      : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                  }`}
                >
                  <item.icon className={`h-4 w-4 ${isActive ? 'text-white' : item.color}`} />
                </div>
                <span className="flex-1">{item.name}</span>
                {item.premium && <Crown className="h-3 w-3 text-yellow-400" />}
                {isActive && (
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-blue-400 to-purple-400"></div>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Alt Kısım - Sabit */}
        <div className="border-t border-slate-700/50 p-6 shrink-0">
          <div className="space-y-2">
            {user && user.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                  pathname === '/admin'
                    ? 'bg-gradient-to-r from-red-600/20 to-pink-600/20 text-white shadow-lg border border-red-500/30'
                    : 'text-slate-300 hover:bg-red-600/20 hover:text-red-400'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                    pathname === '/admin'
                      ? 'bg-gradient-to-br from-red-500 to-pink-600 text-white shadow-md'
                      : 'bg-slate-700/50'
                  }`}
                >
                  <Shield className="h-4 w-4" />
                </div>
                <span>Admin Paneli</span>
                {pathname === '/admin' && (
                  <div className="h-2 w-2 rounded-full bg-gradient-to-r from-red-400 to-pink-400"></div>
                )}
              </Link>
            )}

            <Link
              href="/settings"
              onClick={handleLinkClick}
              className="flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-slate-700/50 hover:text-white"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
                <Settings className="h-4 w-4" />
              </div>
              <span>Ayarlar</span>
            </Link>

            <button
              onClick={() => void handleLogout()}
              className="w-full flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-300 transition-all duration-200 hover:bg-red-600/20 hover:text-red-400"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-700/50">
                <LogOut className="h-4 w-4" />
              </div>
              <span>Çıkış Yap</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
