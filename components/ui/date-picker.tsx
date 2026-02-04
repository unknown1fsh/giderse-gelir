import * as React from 'react'
import { cn } from '@/lib/utils'

const DatePicker = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    value?: Date
    onValueChange?: (value: Date | undefined) => void
  }
>(({ className, value, onValueChange, ...props }, ref) => {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(value)

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedDate(value)
    }
  }, [value])

  const handleDateChange = (newDate: Date | undefined) => {
    setSelectedDate(newDate)
    onValueChange?.(newDate)
  }

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      <input
        type="date"
        value={selectedDate ? selectedDate.toISOString().split('T')[0] : ''}
        onChange={e => {
          const date = e.target.value ? new Date(e.target.value) : undefined
          handleDateChange(date)
        }}
        className="flex min-h-[48px] sm:h-10 w-full rounded-md border border-input bg-background px-4 py-3 sm:px-3 sm:py-2 text-base sm:text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
      />
    </div>
  )
})
DatePicker.displayName = 'DatePicker'

export { DatePicker }
