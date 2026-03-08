import * as React from 'react'
import { cn } from '@/lib/utils'

export interface ActionBarProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    sticky?: boolean
}

/**
 * ActionBar is used for primary page actions, frequently placed at the bottom of long forms.
 */
export function ActionBar({ children, className, sticky = false, ...props }: ActionBarProps) {
    return (
        <div
            className={cn(
                'flex flex-col sm:flex-row items-center justify-end gap-3 p-4 bg-background border-t border-border mt-8',
                sticky && 'sticky bottom-0 z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
}
