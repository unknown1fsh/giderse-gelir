import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const textareaVariants = cva(
    'flex min-h-[100px] w-full rounded-lg border bg-background px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 resize-y transition-all duration-200',
    {
        variants: {
            variant: {
                default: 'border-input focus:border-ring hover:border-accent',
                error: 'border-destructive bg-destructive/10 focus:border-destructive text-destructive placeholder:text-destructive/70 focus-visible:ring-destructive/20',
            }
        },
        defaultVariants: {
            variant: 'default'
        }
    }
)

export interface TextareaProps
    extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> { }

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, ...props }, ref) => {
        return (
            <textarea
                className={cn(textareaVariants({ variant, className }))}
                ref={ref}
                {...props}
            />
        )
    }
)
Textarea.displayName = 'Textarea'

export { Textarea }
