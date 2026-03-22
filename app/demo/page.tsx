'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import BrandLogo from '@/components/brand-logo'

export default function DemoPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const startDemo = async () => {
      try {
        const res = await fetch('/api/auth/demo', {
          method: 'POST',
          credentials: 'include',
        })

        if (res.ok) {
          const data = await res.json()
          if (data.prefetchedData) {
            sessionStorage.setItem('demo-prefetch', JSON.stringify(data.prefetchedData))
          }
          router.replace('/dashboard')
        } else {
          const data = await res.json()
          setError(data.error || 'Demo başlatılamadı.')
        }
      } catch {
        setError('Bağlantı hatası. Lütfen tekrar deneyin.')
      }
    }

    startDemo()
  }, [router])

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <BrandLogo size={28} variant="dark" priority textClassName="text-white font-bold" />
          </div>
          <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-6 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
          <Link
            href="/landing"
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-5 py-2.5 text-sm text-slate-300 hover:border-white/20 hover:text-white transition"
          >
            Anasayfaya Dön
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <BrandLogo size={28} variant="dark" priority textClassName="text-white font-bold" />
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="h-5 w-5 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
          <span className="text-slate-300 text-sm font-medium">Demo hazırlanıyor...</span>
        </div>
        <p className="text-slate-600 text-xs">Gerçek verilerle doldurulmuş hesaba yönlendiriliyorsunuz</p>
      </div>
    </div>
  )
}
