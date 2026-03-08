'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type BreadcrumbItem = {
    label: ReactNode
    href?: string
}

type HeaderActionLink = {
    href: string
    ariaLabel: string
    icon: ReactNode
}

export interface PageHeaderProps {
    title: ReactNode
    description?: ReactNode
    subtitle?: ReactNode
    breadcrumbs?: ReactNode | BreadcrumbItem[]
    actions?: ReactNode
    trailing?: ReactNode
    onBack?: () => void
    backAriaLabel?: string
    backIcon?: ReactNode
    leadingActions?: HeaderActionLink[]
    sticky?: boolean
    className?: string
}

function renderBreadcrumbs(breadcrumbs: ReactNode | BreadcrumbItem[]) {
    if (!breadcrumbs) {
        return null
    }

    if (!Array.isArray(breadcrumbs)) {
        return (
            <div className="mb-2 text-sm text-muted-foreground flex items-center">
                {breadcrumbs}
            </div>
        )
    }

    if (!breadcrumbs.length) {
        return null
    }

    return (
        <nav className="mb-2 flex items-center gap-1.5 text-sm text-muted-foreground">
            {breadcrumbs.map((crumb, idx) => (
                <span key={`${idx}-${String(crumb.label)}`} className="flex items-center gap-1.5">
                    {idx > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-70" />}
                    {crumb.href ? (
                        <Link href={crumb.href} className="transition-colors hover:text-foreground">
                            {crumb.label}
                        </Link>
                    ) : (
                        <span>{crumb.label}</span>
                    )}
                </span>
            ))}
        </nav>
    )
}

export default function PageHeader({
    title,
    description,
    subtitle,
    breadcrumbs,
    actions,
    trailing,
    onBack,
    backAriaLabel = 'Geri',
    backIcon,
    leadingActions = [],
    sticky = false,
    className,
}: PageHeaderProps) {
    const descriptionContent = description ?? subtitle
    const actionContent = actions ?? trailing

    return (
        <div
            className={cn(
                'mb-6 sm:mb-8',
                sticky ? 'sticky top-0 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8' : '',
                className
            )}
        >
            <div className={cn(sticky ? 'border-b border-border bg-background/90 backdrop-blur-sm' : '')}>
                <div className={cn(sticky ? 'py-4 sm:py-6' : '')}>
                    {renderBreadcrumbs(breadcrumbs)}

                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0 flex items-start gap-3">
                            {(onBack || leadingActions.length > 0) && (
                                <div className="flex shrink-0 items-center gap-2">
                                    {onBack && (
                                        <button
                                            type="button"
                                            onClick={onBack}
                                            aria-label={backAriaLabel}
                                            className="min-h-[44px] min-w-[44px] rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        >
                                            <span className="sr-only">{backAriaLabel}</span>
                                            <span aria-hidden="true" className="inline-flex items-center justify-center">
                                                {backIcon ?? <span className="text-lg leading-none">←</span>}
                                            </span>
                                        </button>
                                    )}

                                    {leadingActions.map(action => (
                                        <Link
                                            key={`${action.ariaLabel}-${action.href}`}
                                            href={action.href}
                                            aria-label={action.ariaLabel}
                                            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                        >
                                            {action.icon}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="min-w-0">
                                <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                                    {title}
                                </h1>
                                {descriptionContent && (
                                    <div className="mt-1 text-sm text-muted-foreground sm:text-base">
                                        {descriptionContent}
                                    </div>
                                )}
                            </div>
                        </div>

                        {actionContent && (
                            <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                                {actionContent}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
