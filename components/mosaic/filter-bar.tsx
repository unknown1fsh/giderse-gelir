import * as React from 'react'
import { cn } from '@/lib/utils'

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

/**
 * FilterBar is used above data tables and lists to group search boxes and selects.
 */
export function FilterBar({ children, className, ...props }: FilterBarProps) {
    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 mb-6 bg-card border border-border rounded-xl shadow-sm',
                className
            )}
            {...props}
        >
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-1">
                {children}
            </div>
        </div>
    )
}

export interface ToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
}

/**
 * Toolbar is a simpler wrapper for a row of actions or filters without the card styling.
 */
export function Toolbar({ children, className, ...props }: ToolbarProps) {
    return (
        <div
            className={cn('flex flex-col sm:flex-row items-center gap-2 mb-4', className)}
            {...props}
        >
            {children}
        </div>
    )
}
