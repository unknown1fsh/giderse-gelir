import { cn } from '@/lib/utils'

type Tone = 'blue' | 'cyan' | 'emerald' | 'amber' | 'rose' | 'purple' | 'slate'

const toneStyles: Record<Tone, { dot: string; text: string; fill: string }> = {
    blue: {
        dot: 'bg-blue-400',
        text: 'text-blue-300',
        fill: 'from-blue-500 to-cyan-500',
    },
    cyan: {
        dot: 'bg-cyan-400',
        text: 'text-cyan-300',
        fill: 'from-cyan-500 to-sky-500',
    },
    emerald: {
        dot: 'bg-emerald-400',
        text: 'text-emerald-300',
        fill: 'from-emerald-500 to-teal-500',
    },
    amber: {
        dot: 'bg-amber-400',
        text: 'text-amber-300',
        fill: 'from-amber-500 to-orange-500',
    },
    rose: {
        dot: 'bg-rose-400',
        text: 'text-rose-300',
        fill: 'from-rose-500 to-red-500',
    },
    purple: {
        dot: 'bg-purple-400',
        text: 'text-purple-300',
        fill: 'from-purple-500 to-fuchsia-500',
    },
    slate: {
        dot: 'bg-slate-400',
        text: 'text-slate-300',
        fill: 'from-slate-500 to-slate-700',
    },
}

interface DistributionBarProps {
    label: string
    value: string
    percentage: number
    tone?: Tone
    hint?: string
    className?: string
}

export function DistributionBar({
    label,
    value,
    percentage,
    tone = 'blue',
    hint,
    className,
}: DistributionBarProps) {
    const styles = toneStyles[tone]
    const width = Math.max(0, Math.min(100, percentage))

    return (
        <div className={cn('space-y-2', className)}>
            <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="flex items-center gap-2">
                        <span className={cn('h-2.5 w-2.5 rounded-full', styles.dot)} />
                        <span className="truncate text-sm font-medium text-foreground">{label}</span>
                    </div>
                    {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
                </div>
                <div className="text-right">
                    <p className={cn('text-sm font-semibold', styles.text)}>{value}</p>
                    <p className="text-xs text-muted-foreground">%{width.toFixed(1)}</p>
                </div>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-white/6">
                <div
                    className={cn('h-full rounded-full bg-gradient-to-r transition-all duration-500', styles.fill)}
                    style={{ width: `${width}%` }}
                />
            </div>
        </div>
    )
}
