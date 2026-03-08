import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'
import { ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardTitle } from './card'

type Tone = 'indigo' | 'green' | 'red' | 'amber' | 'cyan' | 'purple' | 'emerald' | 'rose' | 'slate'

const toneMap: Record<Tone, { shell: string; icon: string; accent: string }> = {
    indigo: {
        shell: 'from-indigo-500/18 via-violet-500/10 to-slate-950/40 border-indigo-500/20 hover:border-indigo-400/35',
        icon: 'from-indigo-500 to-violet-600',
        accent: 'text-indigo-300',
    },
    green: {
        shell: 'from-emerald-500/18 via-green-500/10 to-slate-950/40 border-emerald-500/20 hover:border-emerald-400/35',
        icon: 'from-emerald-500 to-green-600',
        accent: 'text-emerald-300',
    },
    red: {
        shell: 'from-rose-500/18 via-red-500/10 to-slate-950/40 border-rose-500/20 hover:border-rose-400/35',
        icon: 'from-rose-500 to-red-600',
        accent: 'text-rose-300',
    },
    amber: {
        shell: 'from-amber-500/18 via-yellow-500/10 to-slate-950/40 border-amber-500/20 hover:border-amber-400/35',
        icon: 'from-amber-500 to-orange-500',
        accent: 'text-amber-300',
    },
    cyan: {
        shell: 'from-cyan-500/18 via-sky-500/10 to-slate-950/40 border-cyan-500/20 hover:border-cyan-400/35',
        icon: 'from-cyan-500 to-sky-600',
        accent: 'text-cyan-300',
    },
    purple: {
        shell: 'from-purple-500/18 via-fuchsia-500/10 to-slate-950/40 border-purple-500/20 hover:border-purple-400/35',
        icon: 'from-purple-500 to-fuchsia-600',
        accent: 'text-purple-300',
    },
    emerald: {
        shell: 'from-emerald-500/18 via-teal-500/10 to-slate-950/40 border-emerald-500/20 hover:border-emerald-400/35',
        icon: 'from-emerald-500 to-teal-600',
        accent: 'text-emerald-300',
    },
    rose: {
        shell: 'from-rose-500/18 via-pink-500/10 to-slate-950/40 border-rose-500/20 hover:border-rose-400/35',
        icon: 'from-rose-500 to-pink-600',
        accent: 'text-rose-300',
    },
    slate: {
        shell: 'from-slate-500/16 via-slate-400/8 to-slate-950/40 border-white/10 hover:border-white/20',
        icon: 'from-slate-600 to-slate-800',
        accent: 'text-slate-300',
    },
}

interface QuickActionTileProps {
    href: string
    title: string
    description: string
    icon: LucideIcon
    tone?: Tone
    meta?: string
    className?: string
}

export function QuickActionTile({
    href,
    title,
    description,
    icon: Icon,
    tone = 'indigo',
    meta,
    className,
}: QuickActionTileProps) {
    const palette = toneMap[tone]

    return (
        <Link href={href} className="group block h-full">
            <Card
                variant="premium"
                className={cn(
                    'h-full border bg-gradient-to-br shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg',
                    palette.shell,
                    className
                )}
            >
                <CardContent className="flex h-full items-start gap-4 p-5">
                    <div className={cn('rounded-2xl bg-gradient-to-br p-3 text-white shadow-lg transition-transform duration-300 group-hover:scale-105', palette.icon)}>
                        <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                                <CardTitle className="truncate text-base text-foreground">{title}</CardTitle>
                                <CardDescription className="mt-1 line-clamp-2 text-sm">{description}</CardDescription>
                            </div>
                            <ArrowUpRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        </div>
                        {meta ? <p className={cn('mt-4 text-xs font-medium', palette.accent)}>{meta}</p> : null}
                    </div>
                </CardContent>
            </Card>
        </Link>
    )
}
