import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SectionWrapperProps extends React.HTMLAttributes<HTMLElement> {
    title?: string
    description?: string
    actions?: React.ReactNode
    children: React.ReactNode
}

export function SectionWrapper({ title, description, actions, children, className, ...props }: SectionWrapperProps) {
    return (
        <section className={cn('flex flex-col gap-4 mb-8', className)} {...props}>
            {(title || actions) && (
                <div className="flex items-center justify-between pb-2">
                    <div className="space-y-1">
                        {title && <h2 className="text-lg font-semibold tracking-tight text-foreground">{title}</h2>}
                        {description && <p className="text-sm text-muted-foreground">{description}</p>}
                    </div>
                    {actions && <div className="flex items-center gap-2">{actions}</div>}
                </div>
            )}
            <div className="w-full">
                {children}
            </div>
        </section>
    )
}
