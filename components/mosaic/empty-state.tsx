import * as React from 'react'
import { FileQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title: string
    description?: string
    icon?: React.ReactNode
    action?: React.ReactNode
}

export function EmptyState({ title, description, icon, action, className, ...props }: EmptyStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-border rounded-xl bg-card/50',
                className
            )}
            {...props}
        >
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted mb-6 text-muted-foreground">
                {icon || <FileQuestion className="h-10 w-10" />}
            </div>
            <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">{title}</h3>
            {description && (
                <p className="text-base text-muted-foreground max-w-sm mb-6">{description}</p>
            )}
            {action && (
                <div>{action}</div>
            )}
        </div>
    )
}
