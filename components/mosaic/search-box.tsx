import * as React from 'react'
import { Search, X } from 'lucide-react'
import { Input, type InputProps } from './input'
import { cn } from '@/lib/utils'

export interface SearchBoxProps extends Omit<InputProps, 'onChange'> {
    onSearch?: (value: string) => void
    debounceMs?: number
}

export function SearchBox({ className, onSearch, debounceMs = 300, ...props }: SearchBoxProps) {
    const [value, setValue] = React.useState(props.value?.toString() || props.defaultValue?.toString() || '')

    // Custom debouncing inside the component if needed 
    // (In practice, handled by parent, but we provide internal controlled state for smooth UX)

    React.useEffect(() => {
        if (props.value !== undefined) {
            setValue(props.value.toString())
        }
    }, [props.value])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value)
        // Instant callback, let parent handle debouncing via a custom hook like useDebounce
        onSearch?.(e.target.value)
    }

    const handleClear = () => {
        setValue('')
        onSearch?.('')
    }

    return (
        <div className={cn("relative w-full sm:w-80 lg:w-96", className)}>
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                <Search className="h-4 w-4" />
            </div>
            <Input
                type="text"
                placeholder={props.placeholder || 'Ara...'}
                className="pl-10 pr-9 sm:pl-10 sm:pr-9"
                value={value}
                onChange={handleChange}
                {...props}
            />
            {value && (
                <button
                    type="button"
                    onClick={handleClear}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-9 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="h-4 w-4" />
                </button>
            )}
        </div>
    )
}
