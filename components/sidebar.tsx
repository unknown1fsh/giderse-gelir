'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import PeriodSelector from '@/components/period-selector'
import { isPremiumPlan } from '@/lib/plan-config'
import BrandLogo from '@/components/brand-logo'
import {
  Wallet,
  Settings,
  BarChart3,
  Sparkles,
  PieChart,
  User,
  Crown,
  LogOut,
  Building2,
  CreditCard,
  X,
  Shield,
  Brain,
  HelpCircle,
  LayoutDashboard,
  Receipt,
  Target,
  CalendarClock,
  Coins,
  TrendingUp,
  Landmark,
  Banknote,
  BadgeDollarSign,
  Lock,
} from 'lucide-react'

interface NavSection {
  label: string
  items: NavItem[]
}

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  premium?: boolean
}

const navSections: NavSection[] = [
  {
    label: 'Ana Menü',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-indigo-400' },
      { name: 'İşlemler', href: '/transactions', icon: Receipt, color: 'text-green-400' },
      { name: 'Toplam Varlık', href: '/portfolio', icon: PieChart, color: 'text-emerald-400', premium: true },
    ],
  },
  {
    label: 'Finans',
    items: [
      { name: 'Hesaplar', href: '/accounts', icon: Wallet, color: 'text-blue-400' },
      { name: 'Kartlar', href: '/cards', icon: CreditCard, color: 'text-purple-400' },
      { name: 'Krediler', href: '/loans', icon: Landmark, color: 'text-cyan-400' },
      { name: 'Bütçeler', href: '/budgets', icon: Target, color: 'text-amber-400' },
      { name: 'Taksitler', href: '/installments', icon: CalendarClock, color: 'text-orange-400' },
      { name: 'Otomatik Ödemeler', href: '/auto-payments', icon: BadgeDollarSign, color: 'text-teal-400', premium: true },
    ],
  },
  {
    label: 'Yatırım',
    items: [
      { name: 'Yatırım Araçları', href: '/investments', icon: Building2, color: 'text-violet-400', premium: true },
      { name: 'Altın', href: '/gold', icon: Coins, color: 'text-yellow-400', premium: true },
      { name: 'E-Cüzdanlar', href: '/ewallets', icon: Banknote, color: 'text-lime-400' },
    ],
  },
  {
    label: 'Raporlar',
    items: [
      { name: 'Analiz ve Raporlar', href: '/analysis', icon: BarChart3, color: 'text-indigo-400', premium: true },
      {
        name: 'AI Analiz Raporu',
        href: '/ai-analysis',
        icon: Brain,
        color: 'text-pink-400',
        premium: true,
      },
      { name: 'Hedefler', href: '/goals', icon: TrendingUp, color: 'text-emerald-400' },
    ],
  },
  {
    label: 'Destek',
    items: [
      { name: 'Yardım', href: '/help', icon: HelpCircle, color: 'text-blue-400' },
    ],
  },
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
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-300"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          flex h-screen h-[100dvh] w-72 max-w-[85vw] flex-col 
          bg-background border-r border-border text-foreground
          transform transition-transform duration-300 ease-smooth
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="shrink-0 border-b border-border">
          <div className="relative">
            {/* Close Button - Sadece mobilde */}
            {onClose && (
              <button
                onClick={onClose}
                className="absolute right-3 top-5 lg:hidden z-10 min-h-[44px] min-w-[44px] p-2 rounded-lg bg-muted hover:bg-muted/80 transition-all duration-200 flex items-center justify-center"
                aria-label="Menüyü kapat"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            )}

            <Link
              href="/dashboard"
              onClick={handleLinkClick}
              className="flex h-16 items-center px-6 hover:bg-muted/50 transition-all duration-300 group cursor-pointer"
            >
              <BrandLogo
                size={36}
                priority
                variant="dark"
                textClassName="text-lg bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent group-hover:from-indigo-300 group-hover:to-violet-300 transition-all duration-300"
              />
            </Link>
          </div>

          {/* Plan Badge */}
          {user && (
            <div className="flex items-center px-6 pb-3">
              {user.plan === 'family' ? (
                <Link
                  href="/premium-features"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-cyan-500/15 to-blue-500/15 border border-cyan-500/25 hover:from-cyan-500/25 hover:to-blue-500/25 transition-all duration-300 group"
                >
                  <Crown className="h-3.5 w-3.5 text-cyan-400" />
                  <span className="text-xs font-semibold text-cyan-300">Family</span>
                  <Sparkles className="h-3 w-3 text-cyan-500/50" />
                </Link>
              ) : user.plan === 'premium' ||
                user.plan === 'enterprise' ||
                user.plan === 'enterprise_premium' ? (
                <Link
                  href="/premium-features"
                  onClick={handleLinkClick}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/15 to-orange-500/15 border border-amber-500/25 hover:from-amber-500/25 hover:to-orange-500/25 transition-all duration-300 group"
                >
                  <Crown className="h-3.5 w-3.5 text-amber-400" />
                  <span className="text-xs font-semibold text-amber-300">Pro</span>
                  <Sparkles className="h-3 w-3 text-amber-500/50" />
                </Link>
              ) : (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border">
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-muted-foreground">Ücretsiz</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Upgrade Banner */}
        {user && (user.plan === 'free' || !user.plan) && (
          <div className="mx-4 mt-4 shrink-0">
            <Link
              href="/premium"
              onClick={handleLinkClick}
              className="block p-3 bg-gradient-to-r from-indigo-600/20 to-violet-600/20 rounded-lg border border-indigo-500/20 hover:from-indigo-600/30 hover:to-violet-600/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-indigo-500/20 group-hover:bg-indigo-500/30 transition-colors">
                  <Crown className="h-4 w-4 text-indigo-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Pro&apos;ya Geç</p>
                  <p className="text-xs text-indigo-300/70 truncate">₺99/ay — Tüm özellikleri aç</p>
                </div>
              </div>
            </Link>
          </div>
        )}
        {user && (user.plan === 'premium' || user.plan === 'enterprise') && (
          <div className="mx-4 mt-4 shrink-0">
            <Link
              href="/premium"
              onClick={handleLinkClick}
              className="block p-3 bg-gradient-to-r from-cyan-600/20 to-blue-600/20 rounded-lg border border-cyan-500/20 hover:from-cyan-600/30 hover:to-blue-600/30 transition-all duration-300 group"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-lg bg-cyan-500/20 group-hover:bg-cyan-500/30 transition-colors">
                  <Crown className="h-4 w-4 text-cyan-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">Family&apos;e Yükselt</p>
                  <p className="text-xs text-cyan-300/70 truncate">₺199/ay — Gelişmiş analizler</p>
                </div>
              </div>
            </Link>
          </div>
        )}

        {/* Period Selector */}
        {user && (
          <div className="px-4 mt-4 mb-2 shrink-0">
            <PeriodSelector />
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto overflow-x-hidden min-h-0 px-3 py-3 scrollbar-thin">
          {navSections.map(section => (
            <div key={section.label} className="mb-4">
              <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {section.label}
              </p>
              <div className="space-y-0.5">
                {section.items.map(item => {
                  const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                  const isLocked = item.premium && user && !isPremiumPlan(user.plan)
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`group flex items-center gap-3 rounded-lg px-3 min-h-[40px] py-2 text-sm font-medium transition-all duration-200 ${
                        isLocked
                          ? 'opacity-40 hover:opacity-60'
                          : isActive
                            ? 'bg-primary/10 text-primary border-l-2 border-primary ml-0'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      <item.icon
                        className={`h-4 w-4 flex-shrink-0 ${isActive && !isLocked ? 'text-primary' : item.color + ' group-hover:text-foreground'}`}
                      />
                      <span className="truncate">{item.name}</span>
                      {isLocked && <Lock className="h-3 w-3 text-muted-foreground flex-shrink-0 ml-auto" />}
                      {item.premium && !isLocked && <Crown className="h-3 w-3 text-amber-400 flex-shrink-0 ml-auto" />}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Bottom Section */}
        <div className="border-t border-border p-3 shrink-0 space-y-0.5">
          {user && user.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={handleLinkClick}
              className={`flex items-center gap-3 rounded-lg px-3 min-h-[40px] py-2 text-sm font-medium transition-all duration-200 ${pathname === '/admin' || pathname.startsWith('/admin/')
                ? 'bg-destructive/15 text-destructive'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
            >
              <Shield className="h-4 w-4" />
              <span>Admin Paneli</span>
            </Link>
          )}

          <Link
            href="/settings"
            onClick={handleLinkClick}
            className={`flex items-center gap-3 rounded-lg px-3 min-h-[40px] py-2 text-sm font-medium transition-all duration-200 ${pathname === '/settings'
              ? 'bg-primary/15 text-primary'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
          >
            <Settings className="h-4 w-4" />
            <span>Ayarlar</span>
          </Link>

          <button
            onClick={() => void handleLogout()}
            className="w-full flex items-center gap-3 rounded-lg px-3 min-h-[40px] py-2 text-sm font-medium text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </>
  )
}
