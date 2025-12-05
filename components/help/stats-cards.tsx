'use client'

import { Card, CardContent } from '@/components/ui/card'
import { BookOpen, MessageSquare, CheckCircle, Clock } from 'lucide-react'

interface StatsCardsProps {
  totalFAQs?: number
  totalTickets?: number
  resolvedTickets?: number
  pendingTickets?: number
}

export default function StatsCards({
  totalFAQs = 0,
  totalTickets = 0,
  resolvedTickets = 0,
  pendingTickets = 0,
}: StatsCardsProps) {
  const stats = [
    {
      title: 'Toplam SSS',
      value: totalFAQs,
      icon: BookOpen,
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
    },
    {
      title: 'Toplam Talep',
      value: totalTickets,
      icon: MessageSquare,
      gradient: 'from-purple-500 to-pink-500',
      bgGradient: 'from-purple-50 to-pink-50',
    },
    {
      title: 'Çözülen',
      value: resolvedTickets,
      icon: CheckCircle,
      gradient: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
    },
    {
      title: 'Bekleyen',
      value: pendingTickets,
      icon: Clock,
      gradient: 'from-orange-500 to-red-500',
      bgGradient: 'from-orange-50 to-red-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={index}
            className="relative overflow-hidden border-2 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] hover:border-blue-300"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.bgGradient} opacity-50`} />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div
                  className={`p-3 rounded-full bg-gradient-to-br ${stat.gradient} shadow-lg group-hover:scale-110 transition-transform`}
                >
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
