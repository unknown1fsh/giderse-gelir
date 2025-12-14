import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex h-10 w-full rounded-lg border px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border-slate-200 bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none hover:border-slate-300',
        error:
          'border-red-300 bg-red-50/50 focus:border-red-500 focus:ring-2 focus:ring-red-500/20 focus:outline-none',
        success:
          'border-green-300 bg-green-50/50 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 focus:outline-none',
        ghost:
          'border-transparent bg-slate-50 focus:bg-white focus:border-slate-200 focus:ring-2 focus:ring-slate-200 focus:outline-none',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement>,
    VariantProps<typeof inputVariants> {}

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
