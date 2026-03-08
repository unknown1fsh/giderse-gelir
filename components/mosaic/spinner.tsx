import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SpinnerProps extends React.HTMLAttributes<SVGSVGElement> {
    size?: 'sm' | 'md' | 'lg' | 'xl'
    variant?: 'default' | 'primary' | 'muted'
}

export function Spinner({ size = 'md', variant = 'primary', className, ...props }: SpinnerProps) {
    const sizeMap = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8',
        xl: 'h-12 w-12',
    }

    const variantMap = {
        default: 'text-foreground',
        primary: 'text-primary',
        muted: 'text-muted-foreground',
    }

    return (
        <Loader2
            className={cn(
                'animate-spin',
                sizeMap[size],
                variantMap[variant],
                className
            )}
            {...props}
        />
    )
}
