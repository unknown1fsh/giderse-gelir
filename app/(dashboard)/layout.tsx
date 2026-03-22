'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import PeriodOnboarding from '@/components/period-onboarding'
import BrandLogo from '@/components/brand-logo'
import DemoBanner from '@/components/demo-banner'
import { useUser } from '@/lib/user-context'
import { getDisplayName } from '@/lib/utils'
import { GlobalOmnibox } from '@/components/dashboard/global-omnibox'
import { NotificationCenter } from '@/components/dashboard/notification-center'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { user } = useUser()

  return (
    <div className="flex flex-col h-screen h-[100dvh] bg-[var(--mosaic-bg)]">
      <DemoBanner />
      {/* Main layout */}
      <div className="flex flex-1 min-h-0">
      {/* Sidebar */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="mosaic-header flex items-center justify-between gap-4">
          {/* Left: Mobile menu + Brand */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Menü"
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="lg:hidden">
              <BrandLogo
                size={28}
                priority
                variant="dark"
                textClassName="text-base bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent"
              />
            </div>
          </div>

          {/* Center: Search */}
          <div className="hidden sm:flex flex-1 max-w-md">
            <GlobalOmnibox />
          </div>

          {/* Right: Notifications + User */}
          <div className="flex items-center gap-2">
            <NotificationCenter />
            <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-border">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-sm font-bold">
                {user ? getDisplayName(user).charAt(0).toUpperCase() : 'U'}
              </div>
              <span className="text-sm text-foreground font-medium">
                {user ? getDisplayName(user) : ''}
              </span>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          <div className="mosaic-page-content">
            {children}
          </div>
        </main>
      </div>

      <PeriodOnboarding />
      </div>
    </div>
  )
}
