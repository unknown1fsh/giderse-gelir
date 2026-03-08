'use client'

import { ReactNode } from 'react'
import { StatCard } from '@/components/mosaic'

interface StatsCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: ReactNode
  gradient?: string
  trend?: {
    value: number
    label: string
    isPositive?: boolean
  }
  className?: string
}

export default function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className,
}: StatsCardProps) {
  return (
    <StatCard
      title={title}
      value={value}
      description={subtitle}
      icon={icon}
      trend={trend}
      variant="glass"
      className={className}
    />
  )
}
