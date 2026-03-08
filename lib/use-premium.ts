'use client'

import { useUser } from '@/lib/user-context'
import { usePremiumModal } from '@/lib/premium-context'

export function usePremium() {
  const { user, loading } = useUser()
  const { showModal } = usePremiumModal()

  const isPremium = user?.plan === 'premium'
  const isEnterprise = user?.plan === 'enterprise'
  const isEnterprisePremium = user?.plan === 'enterprise_premium'
  const isFree = user?.plan === 'free'

  const requirePremium = (callback?: () => void) => {
    if (loading) {
      return false
    }

    if (!isPremium && !isEnterprise && !isEnterprisePremium) {
      // Free kullanıcıya premium modalı göster
      showModal('Premium Özellik', { current: 0, limit: 0, type: 'analysis' })
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
      // Free kullanıcıya premium modalı göster
      showModal(featureName)
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
