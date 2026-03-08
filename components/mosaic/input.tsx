import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
    'flex min-h-[48px] sm:h-10 w-full rounded-lg border px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
    {
        variants: {
            variant: {
                default:
                    'border-input bg-background focus:border-ring focus:ring-2 focus:ring-ring/20 focus:outline-none hover:border-accent',
                error:
                    'border-destructive bg-destructive/10 focus:border-destructive focus:ring-2 focus:ring-destructive/20 focus:outline-none text-destructive placeholder:text-destructive/70',
                success:
                    'border-green-500 bg-green-500/10 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none text-green-500 placeholder:text-green-500/70',
                ghost:
                    'border-transparent bg-muted focus:bg-background focus:border-input focus:ring-2 focus:ring-input focus:outline-none',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    }
)

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> { }

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, variant, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(inputVariants({ variant, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Input.displayName = 'Input'

export { Input, inputVariants }
