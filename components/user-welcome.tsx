'use client'

import { useUser } from '@/lib/user-context'
import { User, Crown, Sparkles } from 'lucide-react'

export default function UserWelcomeSection() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
          <div className="animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isPremium = user.plan === 'premium'
  const isEnterprise = user.plan === 'enterprise'
  const isEnterprisePremium = user.plan === 'enterprise_premium'
  const isFree = user.plan === 'free'

  const getPlanInfo = () => {
    if (isEnterprisePremium) {
      return {
        name: 'Kurumsal Premium',
        icon: Crown,
        gradient: 'from-amber-500 to-orange-600',
        bgGradient: 'from-amber-100 to-orange-100',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-700',
        iconColor: 'text-amber-600',
        description: 'Kurumsal Premium üyelik ile tüm özellikler aktif',
      }
    } else if (isEnterprise) {
      return {
        name: 'Kurumsal',
        icon: Crown,
        gradient: 'from-emerald-500 to-teal-600',
        bgGradient: 'from-emerald-100 to-teal-100',
        borderColor: 'border-emerald-200',
        textColor: 'text-emerald-700',
        iconColor: 'text-emerald-600',
        description: 'Kurumsal üyelik ile tüm özellikler aktif',
      }
    } else if (isPremium) {
      return {
        name: 'Premium',
        icon: Crown,
        gradient: 'from-purple-500 to-pink-600',
        bgGradient: 'from-purple-100 to-pink-100',
        borderColor: 'border-purple-200',
        textColor: 'text-purple-700',
        iconColor: 'text-purple-600',
        description: 'Premium üyelik ile tüm özellikler aktif',
      }
    } else {
      return {
        name: 'Ücretsiz',
        icon: Sparkles,
        gradient: 'from-blue-500 to-indigo-600',
        bgGradient: 'from-blue-100 to-indigo-100',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-700',
        iconColor: 'text-blue-600',
        description: 'Ücretsiz plan ile temel özellikler',
      }
    }
  }

  const planInfo = getPlanInfo()

  return (
    <div className="p-8">
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/60">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full bg-gradient-to-br ${planInfo.gradient} shadow-lg`}>
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Hoş geldin, {user.name}! 👋</h2>
              <p className="text-slate-600">{planInfo.description}</p>
            </div>
          </div>

          <div
            className={`flex items-center space-x-2 px-4 py-2 rounded-full bg-gradient-to-r ${planInfo.bgGradient} border ${planInfo.borderColor}`}
          >
            <planInfo.icon className={`h-4 w-4 ${planInfo.iconColor}`} />
            <span className={`${planInfo.textColor} font-semibold`}>{planInfo.name}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
