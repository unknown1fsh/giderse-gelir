'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/mosaic'

interface ChartCardProps {
  title: string
  description?: string
  icon?: ReactNode
  gradient?: string
  children: ReactNode
  className?: string
}

export default function ChartCard({
  title,
  description,
  icon,
  gradient = 'text-primary bg-primary/10', // Changed to standard token
  children,
  className,
}: ChartCardProps) {
  return (
    <Card className={cn('border-0 shadow-mosaic', className)}>
      <CardHeader className="bg-muted/30 rounded-t-2xl pb-4 border-b border-border/50">
        <CardTitle className="flex items-center gap-3">
          {icon && (
            <div className={cn('p-2 rounded-xl shadow-sm', gradient)}>
              <div className="h-5 w-5">{icon}</div>
            </div>
          )}
          {title}
        </CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  )
}
