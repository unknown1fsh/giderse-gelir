import * as React from 'react'
import { cn } from '@/lib/utils'

const Drawer = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement> & {
        open?: boolean
        onOpenChange?: (open: boolean) => void
    }
>(({ className, open, onOpenChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(open || false)

    React.useEffect(() => {
        if (open !== undefined) {
            setIsOpen(open)
        }
    }, [open])

    const handleOpenChange = (newOpen: boolean) => {
        setIsOpen(newOpen)
        onOpenChange?.(newOpen)
    }

    if (!isOpen) { return null }

    return (
        <>
            <div
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={() => handleOpenChange(false)}
            />
            <div ref={ref} className={cn('fixed inset-0 z-50 pointer-events-none', className)} {...props} />
        </>
    )
})
Drawer.displayName = 'Drawer'

const DrawerContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, children, ...props }, ref) => (
        <div
            ref={ref}
            className={cn(
                'absolute inset-y-0 right-0 z-50 h-full w-full sm:w-3/4 sm:max-w-md border-l border-border bg-background p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl transition-all duration-300 ease-in-out pointer-events-auto flex flex-col overflow-hidden animate-in slide-in-from-right-full',
                className
            )}
            {...props}
        >
            {children}
        </div>
    )
)
DrawerContent.displayName = 'DrawerContent'

const DrawerHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col space-y-2 text-left shrink-0 pb-4 border-b border-border', className)}
            {...props}
        />
    )
)
DrawerHeader.displayName = 'DrawerHeader'

const DrawerTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className, ...props }, ref) => (
        <h2 ref={ref} className={cn('text-xl font-semibold text-foreground tracking-tight', className)} {...props} />
    )
)
DrawerTitle.displayName = 'DrawerTitle'

const DrawerDescription = React.forwardRef<
    HTMLParagraphElement,
    React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
    <p ref={ref} className={cn('text-sm text-muted-foreground', className)} {...props} />
))
DrawerDescription.displayName = 'DrawerDescription'

const DrawerBody = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div ref={ref} className={cn('flex-1 overflow-y-auto py-4', className)} {...props} />
    )
)
DrawerBody.displayName = 'DrawerBody'

const DrawerFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4 shrink-0 border-t border-border mt-auto', className)}
            {...props}
        />
    )
)
DrawerFooter.displayName = 'DrawerFooter'

export { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerBody, DrawerFooter }
