import * as React from 'react'
import { cn } from '@/lib/utils'

const Checkbox = React.forwardRef<
    HTMLInputElement,
    React.InputHTMLAttributes<HTMLInputElement> & {
        checked?: boolean
        onCheckedChange?: (checked: boolean) => void
    }
>(({ className, checked, onCheckedChange, ...props }, ref) => {
    const [isChecked, setIsChecked] = React.useState(checked || false)

    React.useEffect(() => {
        if (checked !== undefined) {
            setIsChecked(checked)
        }
    }, [checked])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newChecked = e.target.checked
        setIsChecked(newChecked)
        onCheckedChange?.(newChecked)
    }

    return (
        <input
            ref={ref}
            type="checkbox"
            checked={isChecked}
            onChange={handleChange}
            className={cn(
                'h-[18px] w-[18px] sm:h-4 sm:w-4 rounded border border-primary text-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer accent-primary transition-all duration-200',
                className
            )}
            {...props}
        />
    )
})
Checkbox.displayName = 'Checkbox'

export { Checkbox }
