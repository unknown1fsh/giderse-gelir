'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Card, CardContent } from './card'
import PageHeader, { type PageHeaderProps } from './page-header'
import { ActionBar } from './action-bar'

export function AppPageShell({
    header,
    children,
    className,
}: {
    header?: PageHeaderProps
    children: ReactNode
    className?: string
}) {
    return (
        <div className={cn('space-y-6', className)}>
            {header ? <PageHeader {...header} /> : null}
            {children}
        </div>
    )
}

export function StatsGrid({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <div className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4', className)}>
            {children}
        </div>
    )
}

export function FormPageShell({
    header,
    children,
    footer,
    className,
    bodyClassName,
}: {
    header: PageHeaderProps
    children: ReactNode
    footer?: ReactNode
    className?: string
    bodyClassName?: string
}) {
    return (
        <AppPageShell header={header} className={className}>
            <div className={cn('mx-auto max-w-4xl', bodyClassName)}>{children}</div>
            {footer ? <ActionBar>{footer}</ActionBar> : null}
        </AppPageShell>
    )
}

export function AuthShell({
    hero,
    title,
    description,
    children,
    backHref = '/landing',
    backLabel = 'Geri Dön',
    className,
}: {
    hero?: ReactNode
    title: ReactNode
    description?: ReactNode
    children: ReactNode
    backHref?: string
    backLabel?: string
    className?: string
}) {
    return (
        <div className="relative flex min-h-screen min-h-[100dvh] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950 px-4 py-8 sm:px-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.22),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(168,85,247,0.18),_transparent_35%)]" />
            <div className="relative w-full max-w-2xl">
                {/* Top bar: back button left, logo center */}
                <div className="relative mb-8 flex items-center justify-center">
                    <Link
                        href={backHref}
                        className="absolute left-0 inline-flex min-h-[44px] items-center gap-1.5 text-sm text-slate-400 transition-colors hover:text-white"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        {backLabel}
                    </Link>
                    {hero ? <div>{hero}</div> : null}
                </div>
                {(title || description) ? (
                    <div className={cn('mb-8 text-center', className)}>
                        {title ? <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{title}</h1> : null}
                        {description ? <p className="mt-2 text-sm text-slate-300 sm:text-base">{description}</p> : null}
                    </div>
                ) : null}
                {children}
            </div>
        </div>
    )
}

export function AuthCardShell({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <Card className={cn('border-white/10 bg-white/10 shadow-2xl backdrop-blur-xl', className)}>
            <CardContent className="p-6 sm:p-8">{children}</CardContent>
        </Card>
    )
}

export function LegalPageShell({
    icon: Icon,
    title,
    accentClassName,
    children,
}: {
    icon: LucideIcon
    title: string
    accentClassName?: string
    children: ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-violet-950">
            <div className="border-b border-white/10">
                <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
                    <Link href="/landing">
                        <Button variant="ghost" className="mb-4 min-h-[48px] text-slate-300 hover:text-white">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Ana Sayfaya Dön
                        </Button>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className={cn('rounded-xl p-3 text-white', accentClassName ?? 'bg-gradient-to-br from-violet-500 to-fuchsia-600')}>
                            <Icon className="h-6 w-6" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white sm:text-4xl">{title}</h1>
                            <p className="mt-1 text-sm text-slate-400 sm:text-base">
                                Son Güncelleme:{' '}
                                {new Date().toLocaleDateString('tr-TR', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                <div className="space-y-6 sm:space-y-8">{children}</div>
            </div>
        </div>
    )
}

export function LegalSection({
    children,
    className,
}: {
    children: ReactNode
    className?: string
}) {
    return (
        <section className={cn('rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm sm:p-8', className)}>
            {children}
        </section>
    )
}

export function MarketingShell({
    title,
    description,
    actions,
    children,
}: {
    title: ReactNode
    description?: ReactNode
    actions?: ReactNode
    children: ReactNode
}) {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="mb-12 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl sm:p-10">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                        <div className="max-w-3xl">
                            <h1 className="text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">{title}</h1>
                            {description ? <p className="mt-4 text-base text-slate-300 sm:text-lg">{description}</p> : null}
                        </div>
                        {actions ? <div className="flex flex-col gap-3 sm:flex-row">{actions}</div> : null}
                    </div>
                </div>
                {children}
            </div>
        </div>
    )
}
