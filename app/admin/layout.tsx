'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/lib/user-context'
import Link from 'next/link'
import {
  Shield,
  RefreshCw,
  LayoutDashboard,
  Users,
  CreditCard,
  Wallet,
  TrendingUp,
  CreditCard as SubscriptionIcon,
  Activity,
  FileText,
  Menu,
  X,
  ArrowLeft,
  Receipt,
  MessageSquare,
  HelpCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import BrandLogo from '@/components/brand-logo'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading: userLoading } = useUser()
  const router = useRouter()
  const pathname = usePathname()
  const hasRedirectedRef = useRef(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Admin kontrolü
  useEffect(() => {
    if (hasRedirectedRef.current) {
      return
    }

    if (!userLoading) {
      if (!user) {
        hasRedirectedRef.current = true
        router.push('/landing')
        return
      }
      if (user.role !== 'ADMIN') {
        hasRedirectedRef.current = true
        router.push('/dashboard')
        return
      }
    }
  }, [user, userLoading, router])

  if (userLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary"></div>
      </div>
    )
  }

  if (!user || user.role !== 'ADMIN') {
    return null
  }

  const menuItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/users', label: 'Kullanıcılar', icon: Users },
    { href: '/admin/transactions', label: 'İşlemler', icon: CreditCard },
    { href: '/admin/accounts', label: 'Hesaplar', icon: Wallet },
    { href: '/admin/investments', label: 'Yatırımlar', icon: TrendingUp },
    { href: '/admin/subscriptions', label: 'Abonelikler', icon: SubscriptionIcon },
    { href: '/admin/payments', label: 'Ödemeler', icon: Receipt },
    { href: '/admin/help', label: 'Help Dashboard', icon: HelpCircle },
    { href: '/admin/support-tickets', label: 'Destek Talepleri', icon: MessageSquare },
    { href: '/admin/feedback', label: 'Görüşler', icon: MessageSquare },
    { href: '/admin/faq', label: 'SSS Yönetimi', icon: FileText },
    { href: '/admin/system', label: 'Sistem', icon: Activity },
    { href: '/admin/reports', label: 'Raporlar', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-background/80 backdrop-blur-md border-b border-border sticky top-0 z-20 pt-[env(safe-area-inset-top)]">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden min-h-[44px] min-w-[44px] p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center flex-shrink-0"
              >
                {sidebarOpen ? <X className="h-5 w-5 text-muted-foreground" /> : <Menu className="h-5 w-5 text-muted-foreground" />}
              </button>
              <div className="hidden md:flex">
                <BrandLogo size={28} withText={false} variant="dark" priority />
              </div>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-muted-foreground hover:text-foreground"
                title="Dashboard'a Dön"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-3xl font-bold text-foreground truncate">Admin Paneli</h1>
                <p className="text-xs sm:text-base text-muted-foreground hidden sm:block">
                  Sistem yönetimi ve istatistikler
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => {
                  window.location.reload()
                }}
                className="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors flex items-center justify-center"
                title="Yenile"
              >
                <RefreshCw className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-[88px] left-0 h-[calc(100vh-88px)] h-[calc(100dvh-88px)] w-64 bg-background border-r border-border z-10 transition-transform duration-300',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <nav className="p-4 space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                (item.href !== '/admin' && pathname?.startsWith(item.href))

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    'flex items-center space-x-3 px-4 min-h-[44px] py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary shadow-sm border border-primary/20'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-[5] lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
