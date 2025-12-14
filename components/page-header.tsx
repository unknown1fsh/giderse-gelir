import type { ReactNode } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

type PageHeaderAction = {
  href: string
  ariaLabel: string
  icon: ReactNode
}

export type PageHeaderProps = {
  title: ReactNode
  subtitle?: ReactNode
  onBack?: () => void
  backAriaLabel?: string
  backIcon?: ReactNode
  leadingActions?: PageHeaderAction[]
  trailing?: ReactNode
  sticky?: boolean
  className?: string
}

export default function PageHeader({
  title,
  subtitle,
  onBack,
  backAriaLabel = 'Geri',
  backIcon,
  leadingActions = [],
  trailing,
  sticky = false,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        sticky ? 'sticky top-0 z-10 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8' : '',
        className
      )}
    >
      <div
        className={cn(sticky ? 'bg-white/80 backdrop-blur-sm border-b border-slate-200/60' : '')}
      >
        <div className={cn(sticky ? 'py-4 sm:py-6' : '')}>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0 flex items-start gap-3">
              {(onBack || leadingActions.length > 0) && (
                <div className="shrink-0 flex items-center gap-2">
                  {onBack && (
                    <button
                      type="button"
                      onClick={onBack}
                      aria-label={backAriaLabel}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <span className="sr-only">{backAriaLabel}</span>
                      <span aria-hidden="true" className="inline-flex items-center justify-center">
                        {backIcon ?? <span className="text-lg leading-none">←</span>}
                      </span>
                    </button>
                  )}

                  {leadingActions.map(action => (
                    <Link
                      key={action.ariaLabel + action.href}
                      href={action.href}
                      aria-label={action.ariaLabel}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      {action.icon}
                    </Link>
                  ))}
                </div>
              )}

              <div className="min-w-0">
                <div className="min-w-0">
                  <div className="min-w-0 text-balance break-words">{title}</div>
                  {subtitle && (
                    <div className="mt-1 text-sm text-muted-foreground break-words">{subtitle}</div>
                  )}
                </div>
              </div>
            </div>

            {trailing && (
              <div className="w-full sm:w-auto">
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                  {trailing}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
