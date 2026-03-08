import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const buttonVariants = cva(
    'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95',
    {
        variants: {
            variant: {
                default: 'bg-primary text-primary-foreground hover:bg-primary/90 shadow-md',
                destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md',
                outline:
                    'border-2 border-input bg-background hover:bg-accent hover:text-accent-foreground',
                secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm',
                ghost: 'hover:bg-accent hover:text-accent-foreground',
                link: 'text-primary underline-offset-4 hover:underline',
                premium:
                    'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-glow hover:shadow-glow-lg btn-shimmer',
                glow: 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white hover:from-indigo-700 hover:to-violet-700 shadow-glow hover:shadow-glow-lg',
                success:
                    'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700 shadow-md hover:shadow-lg',
            },
            size: {
                default: 'min-h-[44px] h-10 px-4 py-2 sm:h-10',
                sm: 'min-h-[36px] h-9 rounded-md px-3 text-xs',
                lg: 'min-h-[48px] h-12 rounded-xl px-8 text-base',
                xl: 'min-h-[52px] h-14 rounded-xl px-10 text-lg font-semibold',
                icon: 'min-h-[44px] min-w-[44px] h-10 w-10 sm:h-10 sm:w-10 sm:min-h-[40px] sm:min-w-[40px]',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    }
)

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean
    loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
        const resolvedClassName = cn(buttonVariants({ variant, size, className }))
        const isDisabled = loading || disabled

        if (asChild) {
            return (
                <Slot
                    className={resolvedClassName}
                    ref={ref}
                    aria-disabled={isDisabled}
                    data-disabled={isDisabled ? '' : undefined}
                    {...props}
                >
                    {children}
                </Slot>
            )
        }

        return (
            <button
                className={resolvedClassName}
                ref={ref}
                disabled={isDisabled}
                {...props}
            >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {children}
            </button>
        )
    }
)
Button.displayName = 'Button'

export { Button, buttonVariants }
