import * as React from 'react'
import { cn } from '@/lib/utils'
import { Label } from '@/components/mosaic'

export interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
    label?: string
    error?: string
    hint?: string
    htmlFor?: string
    required?: boolean
    children: React.ReactNode
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
    ({ label, error, hint, htmlFor, required, children, className, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('space-y-2', className)} {...props}>
                {label && (
                    <div className="flex items-center justify-between">
                        <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
                            {label}
                            {required && <span className="text-destructive ml-1">*</span>}
                        </Label>
                    </div>
                )}
                {children}
                {hint && !error && (
                    <p className="text-sm text-muted-foreground">{hint}</p>
                )}
                {error && (
                    <p className="text-sm font-medium text-destructive">{error}</p>
                )}
            </div>
        )
    }
)
FormField.displayName = 'FormField'
