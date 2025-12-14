'use client'

import { useUser } from '@/lib/user-context'
import { useRouter } from 'next/navigation'

export function usePremium() {
  const { user, loading } = useUser()
  const router = useRouter()

  const isPremium = user?.plan === 'premium'
  const isEnterprise = user?.plan === 'enterprise'
  const isEnterprisePremium = user?.plan === 'enterprise_premium'
  const isFree = user?.plan === 'free'

  const requirePremium = (callback?: () => void) => {
    if (loading) {
      return false
    }

    if (!isPremium && !isEnterprise && !isEnterprisePremium) {
      // Free kullanıcıyı premium sayfasına yönlendir
      router.push('/premium')
      return false
    }

    // Premium veya Enterprise kullanıcı için callback'i çalıştır
    if (callback) {
      callback()
    }

    return true
  }

  const handlePremiumFeature = (featureName: string, callback?: () => void) => {
    if (loading) {
      return false
    }

    if (!isPremium && !isEnterprise && !isEnterprisePremium) {
      // Free kullanıcıyı premium sayfasına yönlendir
      router.push(`/premium?feature=${encodeURIComponent(featureName)}`)
      return false
    }

    // Premium veya Enterprise kullanıcı için callback'i çalıştır
    if (callback) {
      callback()
    }

    return true
  }

  return {
    isPremium,
    isEnterprise,
    isFree,
    isEnterprisePremium,
    loading,
    requirePremium,
    handlePremiumFeature,
  }
}
