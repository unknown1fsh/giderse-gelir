'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from '@/components/sidebar'
import PeriodOnboarding from '@/components/period-onboarding'
import EmailVerificationBanner from '@/components/email-verification-banner'
import BrandLogo from '@/components/brand-logo'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="flex h-screen h-[100dvh] bg-slate-50">
      {/* Mobile Header - Sadece mobilde görünür */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm border-b border-slate-200">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
            aria-label="Open menu"
          >
            <Menu className="h-6 w-6 text-slate-700" />
          </button>
          <div className="flex items-center space-x-2">
            <BrandLogo
              size={32}
              priority
              variant="light"
              textClassName="text-lg bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
            />
          </div>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>
      </header>

      {/* Sidebar with mobile state */}
      <Sidebar isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pt-14 lg:pt-0">
        <div className="p-4 lg:p-6">
          <EmailVerificationBanner />
          {children}
        </div>
      </main>

      <PeriodOnboarding />
    </div>
  )
}
