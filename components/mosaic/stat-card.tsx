'use client'

import { createElement, isValidElement } from 'react'
import type { ElementType } from 'react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from './card'

interface StatCardProps {
    title: string
    value: string | number
    icon?: React.ReactNode | LucideIcon
    description?: string
    trend?: 'up' | 'down' | 'neutral' | {
        value: number
        label: string
        isPositive?: boolean
    }
    trendValue?: string
    color?: 'indigo' | 'green' | 'red' | 'amber' | 'cyan' | 'purple' | 'blue' | 'emerald' | 'rose' | 'pink'
    subtitle?: string
    variant?: 'default' | 'glass' | 'premium' | 'glow' | 'flat'
    className?: string
}

const colorMap = {
    indigo: {
        iconBg: 'bg-indigo-500/20',
        iconText: 'text-indigo-400',
        valueBg: 'text-indigo-300',
    },
    green: {
        iconBg: 'bg-green-500/20',
        iconText: 'text-green-400',
        valueBg: 'text-green-300',
    },
    red: {
        iconBg: 'bg-red-500/20',
        iconText: 'text-red-400',
        valueBg: 'text-red-300',
    },
    amber: {
        iconBg: 'bg-amber-500/20',
        iconText: 'text-amber-400',
        valueBg: 'text-amber-300',
    },
    cyan: {
        iconBg: 'bg-cyan-500/20',
        iconText: 'text-cyan-400',
        valueBg: 'text-cyan-300',
    },
    purple: {
        iconBg: 'bg-purple-500/20',
        iconText: 'text-purple-400',
        valueBg: 'text-purple-300',
    },
    blue: {
        iconBg: 'bg-blue-500/20',
        iconText: 'text-blue-400',
        valueBg: 'text-blue-300',
    },
    emerald: {
        iconBg: 'bg-emerald-500/20',
        iconText: 'text-emerald-400',
        valueBg: 'text-emerald-300',
    },
    rose: {
        iconBg: 'bg-rose-500/20',
        iconText: 'text-rose-400',
        valueBg: 'text-rose-300',
    },
    pink: {
        iconBg: 'bg-pink-500/20',
        iconText: 'text-pink-400',
        valueBg: 'text-pink-300',
    },
}

function isRenderableComponent(icon: unknown): icon is ElementType {
    return typeof icon === 'function' || (typeof icon === 'object' && icon !== null && 'render' in icon)
}

export default function StatCard({
    title,
    value,
    icon,
    description,
    trend,
    trendValue,
    color = 'indigo',
    subtitle,
    variant = 'default',
    className = '',
}: StatCardProps) {
    const colors = colorMap[color]
    let renderedIcon: React.ReactNode = null

    if (isValidElement(icon)) {
        renderedIcon = icon
    } else if (isRenderableComponent(icon)) {
        renderedIcon = createElement(icon as ElementType, { className: cn('h-5 w-5', colors.iconText) })
    } else if (icon !== undefined && icon !== null) {
        renderedIcon = icon as React.ReactNode
    }

    const trendBadge = typeof trend === 'string'
        ? (trendValue ? {
            tone: trend === 'up' ? 'up' : trend === 'down' ? 'down' : 'neutral',
            label: trendValue,
        } : null)
        : trend ? {
            tone: trend.isPositive ? 'up' : 'down',
            label: `${trend.isPositive ? '+' : ''}${trend.value}% ${trend.label}`.trim(),
        } : null
    const helperText = description ?? subtitle

    return (
        <Card
            variant={variant}
            className={cn('group relative overflow-hidden border-border/80 bg-card/95 shadow-sm transition-all duration-300 hover:shadow-md', className)}
        >
            <div className={cn('absolute right-0 top-0 -mr-8 -mt-8 h-24 w-24 rounded-full blur-2xl opacity-40 transition-opacity group-hover:opacity-60', colors.iconBg)} />
            <CardHeader className="relative flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
                </div>
                {trendBadge && (
                    <div
                        className={cn(
                            'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                            trendBadge.tone === 'up'
                                ? 'bg-green-500/10 text-green-600 dark:text-green-400'
                                : trendBadge.tone === 'down'
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                    : 'bg-muted text-muted-foreground'
                        )}
                    >
                        {trendBadge.tone === 'up' ? '↑' : trendBadge.tone === 'down' ? '↓' : '→'}
                        {trendBadge.label}
                    </div>
                )}
            </CardHeader>
            <CardContent className="relative pt-0">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div className={cn('rounded-lg p-2.5', colors.iconBg)}>
                        <div className={cn('flex h-5 w-5 items-center justify-center', colors.iconText)}>
                            {renderedIcon}
                        </div>
                    </div>
                </div>
                <p className={cn('text-lg font-bold truncate sm:text-xl lg:text-2xl', colors.valueBg)}>{value}</p>
                {helperText && <p className="mt-1 text-xs text-muted-foreground">{helperText}</p>}
            </CardContent>
        </Card>
    )
}
