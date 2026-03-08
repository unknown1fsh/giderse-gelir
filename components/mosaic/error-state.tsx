import * as React from 'react'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'

export interface ErrorStateProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string
    description?: string
    onRetry?: () => void
}

export function ErrorState({
    title = 'Bir şeyler ters gitti',
    description = 'Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya destek ekibi ile iletişime geçin.',
    onRetry,
    className,
    ...props
}: ErrorStateProps) {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center py-16 px-4 text-center border border-destructive/20 rounded-xl bg-destructive/10',
                className
            )}
            {...props}
        >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/20 mb-4 text-destructive">
                <AlertTriangle className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold tracking-tight text-destructive mb-2">{title}</h3>
            <p className="text-sm text-destructive/80 max-w-sm mb-6">{description}</p>

            {onRetry && (
                <Button variant="destructive" onClick={onRetry}>
                    Tekrar Dene
                </Button>
            )}
        </div>
    )
}
