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
} from 'lucide-react'
import { cn } from '@/lib/utils'

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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
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
    { href: '/admin/support-tickets', label: 'Destek Talepleri', icon: MessageSquare },
    { href: '/admin/faq', label: 'SSS Yönetimi', icon: FileText },
    { href: '/admin/system', label: 'Sistem', icon: Activity },
    { href: '/admin/reports', label: 'Raporlar', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200/60 sticky top-0 z-20">
        <div className="p-4 sm:p-6 lg:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
              <Link
                href="/dashboard"
                className="hidden sm:flex items-center space-x-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors text-slate-700"
                title="Dashboard'a Dön"
              >
                <ArrowLeft className="h-5 w-5" />
                <span className="font-medium">Dashboard</span>
              </Link>
              <div className="p-3 rounded-full bg-gradient-to-br from-red-500 to-pink-600 shadow-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Admin Paneli</h1>
                <p className="text-sm sm:text-base text-slate-600">
                  Sistem yönetimi ve istatistikler
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  window.location.reload()
                }}
                className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                title="Yenile"
              >
                <RefreshCw className="h-5 w-5 text-slate-700" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            'fixed lg:sticky top-[88px] left-0 h-[calc(100vh-88px)] w-64 bg-white/80 backdrop-blur-sm border-r border-slate-200/60 z-10 transition-transform duration-300',
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
                    'flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors',
                    isActive
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                      : 'text-slate-700 hover:bg-slate-100'
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
