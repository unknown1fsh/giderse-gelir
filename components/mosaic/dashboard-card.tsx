'use client'

import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface DashboardCardProps {
    title: string
    description?: string
    icon?: LucideIcon
    iconColor?: string
    headerAction?: React.ReactNode
    children: React.ReactNode
    className?: string
    noPadding?: boolean
}

export default function DashboardCard({
    title,
    description,
    icon: Icon,
    iconColor = 'text-indigo-400',
    headerAction,
    children,
    className = '',
    noPadding = false,
}: DashboardCardProps) {
    return (
        <Card className={cn('overflow-hidden border-border/80 bg-card/95 shadow-sm transition-all duration-300 hover:shadow-md', className)}>
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/60 bg-muted/30 pb-4">
                <div className="flex items-center gap-3">
                    {Icon && (
                        <div className="rounded-lg bg-primary/10 p-2 text-primary">
                            <Icon className={`h-5 w-5 ${iconColor}`} />
                        </div>
                    )}
                    <div>
                        <CardTitle className="text-sm font-semibold text-foreground">{title}</CardTitle>
                        {description && (
                            <CardDescription className="mt-0.5 text-xs">{description}</CardDescription>
                        )}
                    </div>
                </div>
                {headerAction && <div>{headerAction}</div>}
            </CardHeader>

            <CardContent className={cn(noPadding ? 'p-0' : 'p-5 pt-5')}>{children}</CardContent>
        </Card>
    )
}
