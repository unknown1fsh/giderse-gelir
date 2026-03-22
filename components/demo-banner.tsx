'use client'

import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'
import { FlaskConical, UserPlus, LogOut } from 'lucide-react'

export default function DemoBanner() {
  const { user, logout } = useUser()
  const router = useRouter()

  if (!user || user.role !== 'DEMO') {
    return null
  }

  const handleLogout = async () => {
    await logout()
    router.replace('/landing')
  }

  return (
    <div className="sticky top-0 z-50 w-full bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white">
          <FlaskConical className="h-4 w-4 shrink-0" />
          <span className="text-sm font-medium">
            Demo Modu
          </span>
          <span className="hidden text-xs text-amber-100 sm:inline">
            — Değişiklikler kaydedilmez. Gerçek verilerinizi eklemek için üye olun.
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => router.push('/auth/register')}
            className="flex items-center gap-1.5 rounded-lg bg-white/20 hover:bg-white/30 px-3 py-1 text-xs font-semibold text-white transition"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Ücretsiz Üye Ol</span>
            <span className="sm:hidden">Üye Ol</span>
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-amber-100 hover:text-white transition"
            title="Demodan çık"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Çıkış</span>
          </button>
        </div>
      </div>
    </div>
  )
}
