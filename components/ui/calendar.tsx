import * as React from 'react'
import { cn } from '@/lib/utils'

const Calendar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('p-3', className)} {...props} />
)
Calendar.displayName = 'Calendar'

const CalendarHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between pt-1', className)} {...props} />
  )
)
CalendarHeader.displayName = 'CalendarHeader'

const CalendarTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-sm font-medium', className)} {...props} />
  )
)
CalendarTitle.displayName = 'CalendarTitle'

const CalendarDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('text-xs text-muted-foreground', className)} {...props} />
  )
)
CalendarDescription.displayName = 'CalendarDescription'

const CalendarGrid = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('mt-4 grid grid-cols-7 gap-px', className)} {...props} />
  )
)
CalendarGrid.displayName = 'CalendarGrid'

const CalendarCell = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'min-h-[44px] min-w-[44px] sm:h-9 sm:w-9 h-11 w-11 text-center text-sm p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20',
        className
      )}
      {...props}
    />
  )
)
CalendarCell.displayName = 'CalendarCell'

const CalendarDay = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    isSelected?: boolean
    isToday?: boolean
  }
>(({ className, isSelected, isToday, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      'min-h-[44px] min-w-[44px] h-11 w-11 sm:h-9 sm:w-9 p-0 font-normal aria-selected:opacity-100',
      isSelected &&
        'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground',
      isToday && 'bg-accent text-accent-foreground',
      className
    )}
    {...props}
  />
))
CalendarDay.displayName = 'CalendarDay'

const CalendarWeekday = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('min-h-[44px] min-w-[44px] h-11 w-11 sm:h-9 sm:w-9 p-0 text-center text-sm font-medium text-muted-foreground', className)}
      {...props}
    />
  )
)
CalendarWeekday.displayName = 'CalendarWeekday'

const CalendarNavigation = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn('min-h-[44px] min-w-[44px] h-9 w-9 sm:h-7 sm:w-7 bg-transparent p-0 opacity-50 hover:opacity-100', className)}
    {...props}
  />
))
CalendarNavigation.displayName = 'CalendarNavigation'

export {
  Calendar,
  CalendarHeader,
  CalendarTitle,
  CalendarDescription,
  CalendarGrid,
  CalendarCell,
  CalendarDay,
  CalendarWeekday,
  CalendarNavigation,
}
